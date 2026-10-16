// SYNAPSIS Masking Lite — sound: decoding, voice masking and resampling, all in the browser.
//
// Voice masking uses the McAdams coefficient (Patino, Tomashenko, Todisco, Nautsch & Evans,
// 2021, Interspeech; arXiv:2011.01130), the lightweight VoicePrivacy baseline: per 20 ms frame
// the LPC poles' angles are raised to a power alpha, which shifts the formants and with them
// how the speaker sounds — alpha < 1 moves the voice higher, alpha > 1 deeper. The words stay
// intelligible; the voice is disguised, not anonymised against a determined attacker.

// Decode the audio track of a media file to `sampleRate`, as up to `maxChannels` channels.
// Returns an array of Float32Array, or null when there is no readable audio.
export async function decodeAudio(file, sampleRate, maxChannels) {
    let buf;
    try {
        const ctx = new OfflineAudioContext(1, 1, sampleRate);
        buf = await ctx.decodeAudioData(await file.arrayBuffer());
    } catch { return null; }
    if (!buf?.numberOfChannels || !buf.length) return null;
    if (maxChannels === 1 && buf.numberOfChannels > 1) {
        const mono = new Float32Array(buf.length);
        for (let c = 0; c < buf.numberOfChannels; c++) {
            const d = buf.getChannelData(c);
            for (let n = 0; n < d.length; n++) mono[n] += d[n] / buf.numberOfChannels;
        }
        return [mono];
    }
    return Array.from({ length: Math.min(maxChannels, buf.numberOfChannels) }, (_, c) => buf.getChannelData(c));
}

export async function resampleTo(channels, fromRate, toRate) {
    if (fromRate === toRate) return channels;
    const len = channels[0].length;
    const ctx = new OfflineAudioContext(channels.length, Math.ceil(len * toRate / fromRate), toRate);
    const buf = ctx.createBuffer(channels.length, len, fromRate);
    channels.forEach((d, c) => buf.copyToChannel(d, c));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
    const out = await ctx.startRendering();
    return Array.from({ length: out.numberOfChannels }, (_, c) => out.getChannelData(c));
}

// Linear prediction coefficients (Levinson–Durbin). Returns [1, a1 … ap] or null for silence.
function lpc(x, p) {
    const r = new Float64Array(p + 1);
    for (let k = 0; k <= p; k++) {
        let s = 0;
        for (let n = k; n < x.length; n++) s += x[n] * x[n - k];
        r[k] = s;
    }
    if (r[0] < 1e-9) return null;
    const a = new Float64Array(p + 1), tmp = new Float64Array(p + 1);
    a[0] = 1;
    let e = r[0];
    for (let i = 1; i <= p; i++) {
        let acc = r[i];
        for (let j = 1; j < i; j++) acc += a[j] * r[i - j];
        const k = -acc / e;
        tmp.set(a);
        for (let j = 1; j < i; j++) a[j] = tmp[j] + k * tmp[i - j];
        a[i] = k;
        e *= 1 - k * k;
        if (e <= 0) return null;
    }
    return a;
}

// Roots of a monic polynomial (coefficients highest power first) by Durand–Kerner iteration.
function makeRootFinder(degree) {
    const re = new Float64Array(degree), im = new Float64Array(degree);
    return function roots(c) {
        let x = 1, y = 0;
        for (let i = 0; i < degree; i++) {
            const nx = x * 0.4 - y * 0.9, ny = x * 0.9 + y * 0.4;
            x = nx; y = ny; re[i] = x; im[i] = y;
        }
        for (let it = 0; it < 120; it++) {
            let moved = 0;
            for (let i = 0; i < degree; i++) {
                let pr = 1, pi = 0;                               // evaluate p(z_i) by Horner
                for (let k = 1; k <= degree; k++) {
                    const t = pr * re[i] - pi * im[i] + c[k];
                    pi = pr * im[i] + pi * re[i];
                    pr = t;
                }
                let dr = 1, di = 0;                               // ∏ (z_i − z_j)
                for (let j = 0; j < degree; j++) {
                    if (j === i) continue;
                    const ax = re[i] - re[j], ay = im[i] - im[j];
                    const t = dr * ax - di * ay;
                    di = dr * ay + di * ax;
                    dr = t;
                }
                const d2 = dr * dr + di * di;
                if (d2 < 1e-30) continue;
                const qr = (pr * dr + pi * di) / d2, qi = (pi * dr - pr * di) / d2;
                re[i] -= qr; im[i] -= qi;
                moved = Math.max(moved, Math.abs(qr) + Math.abs(qi));
            }
            if (!Number.isFinite(moved)) return null;
            if (moved < 1e-9) return { re, im };
        }
        return null;
    };
}

// Monic polynomial (real part of the coefficients) from complex roots, highest power first.
function polyFromRoots(re, im) {
    const n = re.length;
    const cr = new Float64Array(n + 1), ci = new Float64Array(n + 1);
    cr[0] = 1;
    for (let k = 0; k < n; k++) {
        for (let j = k + 1; j >= 1; j--) {
            const pr = cr[j - 1], pi = ci[j - 1];
            cr[j] -= re[k] * pr - im[k] * pi;
            ci[j] -= re[k] * pi + im[k] * pr;
        }
    }
    return cr;
}

// Mask the voice in mono samples at `sr` by raising each LPC pole angle to the power `alpha`.
// Frames that cannot be processed (silence, non-converged roots, unstable filter) pass unchanged.
export async function maskVoice(x, sr, alpha = 0.8, onProgress = null) {
    const p = Math.round(sr / 1000) + 4;
    const wlen = Math.round(sr * 0.01) * 2;                       // 20 ms, even
    const hop = wlen / 2;
    const win = new Float64Array(wlen);
    for (let n = 0; n < wlen; n++) win[n] = 0.5 * (1 - Math.cos(2 * Math.PI * n / wlen));
    const out = new Float64Array(x.length), wsum = new Float64Array(x.length);
    const frame = new Float64Array(wlen), res = new Float64Array(wlen), y = new Float64Array(wlen);
    const roots = makeRootFinder(p);
    const nFrames = Math.ceil(x.length / hop);
    for (let m = 0; m < nFrames; m++) {
        const st = m * hop;
        for (let n = 0; n < wlen; n++) frame[n] = (x[st + n] || 0) * win[n];
        let done = false;
        const a = lpc(frame, p);
        const r = a && roots(a);
        if (r) {
            for (let n = 0; n < wlen; n++) {                      // residual e = frame * A(z)
                let s = frame[n];
                for (let k = 1; k <= p && k <= n; k++) s += a[k] * frame[n - k];
                res[n] = s;
            }
            for (let i = 0; i < p; i++) {                         // move the pole angles
                if (Math.abs(r.im[i]) < 1e-8) continue;
                const rad = Math.min(Math.hypot(r.re[i], r.im[i]), 0.995);   // keep 1/A(z) stable
                let phi = Math.atan2(r.im[i], r.re[i]);
                phi = Math.sign(phi) * Math.min(Math.PI - 1e-3, Math.abs(phi) ** alpha);
                r.re[i] = rad * Math.cos(phi);
                r.im[i] = rad * Math.sin(phi);
            }
            const a2 = polyFromRoots(r.re, r.im);
            let ok = true;
            for (let n = 0; n < wlen; n++) {                      // resynthesise through 1/A'(z)
                let s = res[n];
                for (let k = 1; k <= p && k <= n; k++) s -= a2[k] * y[n - k];
                if (!Number.isFinite(s) || Math.abs(s) > 1e3) { ok = false; break; }
                y[n] = s;
            }
            if (ok) {
                for (let n = 0; n < wlen && st + n < x.length; n++) {
                    out[st + n] += y[n] * win[n];
                    wsum[st + n] += win[n] * win[n];
                }
                done = true;
            }
        }
        if (!done) {
            for (let n = 0; n < wlen && st + n < x.length; n++) {
                out[st + n] += frame[n] * win[n];
                wsum[st + n] += win[n] * win[n];
            }
        }
        if (m % 500 === 499) {
            onProgress?.(m / nFrames);
            await new Promise((res2) => setTimeout(res2));        // keep the page responsive
        }
    }
    let inPeak = 0, outPeak = 0;
    for (let n = 0; n < x.length; n++) {
        if (Math.abs(x[n]) > inPeak) inPeak = Math.abs(x[n]);
        out[n] = wsum[n] > 1e-6 ? out[n] / wsum[n] : 0;
        if (Math.abs(out[n]) > outPeak) outPeak = Math.abs(out[n]);
    }
    const g = outPeak > 0 ? Math.min(Math.max(inPeak / outPeak, 0.1), 10) : 1;
    const result = new Float32Array(x.length);
    for (let n = 0; n < x.length; n++) result[n] = Math.max(-1, Math.min(1, out[n] * g));
    return result;
}
