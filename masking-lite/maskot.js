// Maskot — the Masking Lite helper: a spinning globe built from the SYNAPSIS logo network,
// with contextual tips and a readiness report the user can choose to share.
const REPORT_TO = 'babajide.owoyele@ru.nl';
const PALETTE = ['#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

let deps = { getTask: null, nextTs: null };
let speed = 0.008;
let bench = null;        // { fps, poseMs, faceMs, delegate }
let halfwaySaid = false;

// ---------------------------------------------------------------------------
// Globe
// ---------------------------------------------------------------------------
function startGlobe(cv) {
    const ctx = cv.getContext('2d');
    const S = cv.width, C = S / 2, R = S * 0.36;
    // Nodes spread over the sphere (Fibonacci lattice), coloured with the logo palette.
    const n = 16, nodes = [];
    for (let i = 0; i < n; i++) {
        const y = 1 - (i + 0.5) * 2 / n, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
        nodes.push({ x: Math.cos(phi) * r, y, z: Math.sin(phi) * r, c: PALETTE[i % PALETTE.length] });
    }
    const edges = [];
    nodes.forEach((a, i) => {
        nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2])
            .filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 2)
            .forEach(([j]) => { if (!edges.some(([p, q]) => (p === j && q === i))) edges.push([i, j]); });
    });
    const tilt = 0.4;
    let angle = 0;

    function project(p) {
        const ca = Math.cos(angle), sa = Math.sin(angle);
        const x = p.x * ca + p.z * sa, z1 = -p.x * sa + p.z * ca;
        const y = p.y * Math.cos(tilt) - z1 * Math.sin(tilt), z = p.y * Math.sin(tilt) + z1 * Math.cos(tilt);
        return { X: C + x * R, Y: C + y * R, z };
    }
    function arc(a, b, front) {
        // Draw the edge as a slightly bulged curve, like the logo's links.
        const mx = (a.X + b.X) / 2, my = (a.Y + b.Y) / 2;
        const dx = mx - C, dy = my - C, k = 0.18;
        ctx.beginPath();
        ctx.moveTo(a.X, a.Y);
        ctx.quadraticCurveTo(mx + dx * k, my + dy * k, b.X, b.Y);
        ctx.globalAlpha = front ? 0.75 : 0.18;
        ctx.stroke();
    }
    function frame() {
        ctx.clearRect(0, 0, S, S);
        const g = ctx.createRadialGradient(C - R * 0.35, C - R * 0.4, R * 0.1, C, C, R);
        g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e6e6e6');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(C, C, R, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = 2.2; ctx.strokeStyle = '#161616'; ctx.globalAlpha = 1; ctx.stroke();
        const P = nodes.map(project);
        ctx.lineWidth = 2.4;
        for (const front of [false, true]) {
            for (const [i, j] of edges) {
                if (((P[i].z + P[j].z) / 2 > 0) !== front) continue;
                ctx.strokeStyle = nodes[i].c; arc(P[i], P[j], front);
            }
        }
        P.map((p, i) => [p, nodes[i]]).sort((a, b) => a[0].z - b[0].z).forEach(([p, nd]) => {
            ctx.globalAlpha = p.z > 0 ? 1 : 0.25;
            ctx.fillStyle = nd.c;
            ctx.beginPath(); ctx.arc(p.X, p.Y, 3.2 + p.z * 2.2, 0, Math.PI * 2); ctx.fill();
        });
        ctx.globalAlpha = 1;
        // The mask: a black eye mask with white eyes, fixed facing the viewer.
        const e = S / 128;
        ctx.fillStyle = '#161616';
        ctx.beginPath();
        ctx.moveTo(C - 44 * e, C - 10 * e);
        ctx.quadraticCurveTo(C - 22 * e, C - 26 * e, C, C - 12 * e);
        ctx.quadraticCurveTo(C + 22 * e, C - 26 * e, C + 44 * e, C - 10 * e);
        ctx.lineTo(C + 40 * e, C + 8 * e);
        ctx.quadraticCurveTo(C + 20 * e, C + 20 * e, C, C + 6 * e);
        ctx.quadraticCurveTo(C - 20 * e, C + 20 * e, C - 40 * e, C + 8 * e);
        ctx.closePath(); ctx.fill();
        for (const sx of [-1, 1]) {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(C + sx * 20 * e, C - 2 * e, 8 * e, 7 * e, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#161616';
            const look = Math.sin(angle * 2) * 2 * e;
            ctx.beginPath(); ctx.arc(C + sx * 20 * e + look, C - 1 * e, 3.4 * e, 0, Math.PI * 2); ctx.fill();
        }
        ctx.strokeStyle = '#161616'; ctx.lineWidth = 3 * e; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(C, C + 18 * e, 12 * e, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
        if (!reduceMotion) { angle += speed; requestAnimationFrame(frame); }
    }
    frame();
}

// ---------------------------------------------------------------------------
// Speech bubble
// ---------------------------------------------------------------------------
const el = {};
function say(text, actions = []) {
    el.text.innerHTML = text;
    el.actions.innerHTML = '';
    for (const a of actions.concat([{ label: actions.length ? 'Not now' : 'OK', close: true }])) {
        const b = document.createElement('button');
        b.textContent = a.label;
        b.className = a.primary ? 'btn-primary' : 'btn-secondary';
        b.addEventListener('click', () => { hide(); a.onClick?.(); });
        el.actions.appendChild(b);
    }
    el.bubble.hidden = false;
    el.face.classList.remove('bounce'); void el.face.offsetWidth; el.face.classList.add('bounce');
}
function hide() { el.bubble.hidden = true; }

const minutes = (sec) => { const m = Math.max(1, Math.round(sec / 60)); return `${m} minute${m === 1 ? '' : 's'}`; };
const checkAction = { label: 'Check my computer', primary: true, onClick: () => runReport() };

// ---------------------------------------------------------------------------
// Readiness report
// ---------------------------------------------------------------------------
async function systemInfo() {
    const info = {};
    const ua = navigator.userAgent;
    try {
        if (navigator.userAgentData?.getHighEntropyValues) {
            const h = await navigator.userAgentData.getHighEntropyValues(['platform', 'platformVersion', 'architecture', 'bitness', 'fullVersionList']);
            let os = h.platform;
            if (os === 'Windows') os = parseInt(h.platformVersion) >= 13 ? 'Windows 11' : 'Windows 10';
            else if (os === 'macOS') os = `macOS ${h.platformVersion}`;
            info.os = `${os} (${h.architecture || '?'}, ${h.bitness || '?'}-bit)`;
            const brands = (h.fullVersionList || []).filter((b) => !/Not.?A.?Brand/i.test(b.brand));
            const b = brands.find((x) => x.brand !== 'Chromium') || brands[0];
            if (b) info.browser = `${b.brand} ${b.version.split('.')[0]}`;
        }
    } catch { /* fall back to the user-agent string */ }
    if (!info.os) {
        info.os = /Windows NT 10/.test(ua) ? 'Windows 10/11' : /Mac OS X ([\d_]+)/.test(ua) ? `macOS ${RegExp.$1.replace(/_/g, '.')}`
            : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS/iPadOS' : /Linux/.test(ua) ? 'Linux' : 'Unknown';
    }
    if (!info.browser) {
        const m = ua.match(/(Firefox|Edg|OPR|Chrome|Version)\/(\d+)/);
        info.browser = m ? `${{ Edg: 'Edge', OPR: 'Opera', Version: 'Safari' }[m[1]] || m[1]} ${m[2]}` : 'Unknown';
    }
    info.cpu = navigator.hardwareConcurrency || '?';
    info.memory = navigator.deviceMemory ? `about ${navigator.deviceMemory} GB (as reported by the browser)` : 'not reported by this browser';
    try {
        const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
        const ext = gl?.getExtension('WEBGL_debug_renderer_info');
        info.gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? gl.getParameter(gl.RENDERER) : 'no WebGL');
    } catch { info.gpu = 'unknown'; }
    try {
        const ad = navigator.gpu && await navigator.gpu.requestAdapter();
        info.webgpu = ad ? `available${ad.info?.vendor ? ` (${[ad.info.vendor, ad.info.architecture].filter(Boolean).join(', ')})` : ''}` : 'not available';
    } catch { info.webgpu = 'not available'; }
    info.screen = `${screen.width}×${screen.height} @${window.devicePixelRatio}x`;
    const enc = async (w, h) => {
        if (!('VideoEncoder' in window)) return false;
        for (const codec of ['avc1.640028', 'avc1.42001f', 'vp09.00.40.08']) {
            try { if ((await VideoEncoder.isConfigSupported({ codec, width: w, height: h, bitrate: 4e6, framerate: 25 })).supported) return true; } catch { /* next */ }
        }
        return false;
    };
    info.enc720 = await enc(1280, 720);
    info.enc1080 = await enc(1920, 1080);
    info.frameRead = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;
    try {
        const est = await navigator.storage?.estimate?.();
        if (est?.quota) info.storage = `${(est.quota / 1e9).toFixed(0)} GB available to the browser`;
    } catch { /* optional */ }
    return info;
}

async function benchmark(setVerdict) {
    const { getTask, nextTs } = deps;
    const s = { people: 2, hide: 'body' };
    setVerdict('Loading the masking model…');
    const pose = await getTask('pose', s);
    const face = await getTask('face', s);
    const hands = await getTask('hands', s);
    const W = 1280, H = 720;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');
    // A real frame with a person in it, from the site's demo clips.
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.src = new URL('../demos/masked-piper-talk.mp4', import.meta.url).href;
    try {
        await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = rej; setTimeout(rej, 8000); });
        v.currentTime = 2;
        await new Promise((res) => { v.onseeked = res; setTimeout(res, 3000); });
        ctx.drawImage(v, 0, 0, W, H);
    } catch {
        ctx.fillStyle = '#888'; ctx.fillRect(0, 0, W, H);
    }
    setVerdict('Running a short speed test…');
    const time = (task, runs) => {
        for (let i = 0; i < 3; i++) { const r = task.detectForVideo(cv, nextTs(40)); r.segmentationMasks?.forEach((m) => m.close()); }
        const t0 = performance.now();
        for (let i = 0; i < runs; i++) { const r = task.detectForVideo(cv, nextTs(40)); r.segmentationMasks?.forEach((m) => m.close()); }
        return (performance.now() - t0) / runs;
    };
    const poseMs = time(pose, 12), faceMs = time(face, 12), handsMs = time(hands, 12);
    // On top of the models: waiting for the next video frame (~1 frame at 30 fps), drawing and encoding.
    const fps = 1000 / (poseMs + faceMs + handsMs + 45);
    return { fps, poseMs, faceMs, handsMs, delegate: pose._delegate };
}

function verdictFor(info, b) {
    if (!info.enc720 || !info.frameRead) return ['Not ready: this browser cannot write the masked video', 'bad'];
    if (!b) return ['Could not run the speed test', 'bad'];
    if (b.fps >= 12) return [`Ready: fast (about ${b.fps.toFixed(0)} frames per second)`, 'good'];
    if (b.fps >= 4) return [`Ready, but slow for long videos (about ${b.fps.toFixed(1)} frames per second)`, 'ok'];
    return [`Struggling: about ${b.fps.toFixed(1)} frames per second`, 'bad'];
}

function recommendation(info, b, level) {
    const r = [];
    const nvidia = /nvidia|geforce|rtx|quadro/i.test(info.gpu);
    if (level === 'good') r.push('Masking Lite in this browser will work well, also for recordings of 10 to 30 minutes.');
    if (level === 'ok') r.push('Masking Lite works; for long recordings, start it and let it run, or use a department server.');
    if (!info.enc720) r.push('Open this page in a recent Chrome, Edge or Firefox.');
    else if (level === 'bad') r.push('This computer is slow for browser masking. A department server or hosted MaskAnyone will be quicker.');
    if (nvidia) r.push('This computer has an NVIDIA graphics card, so it could also run MaskAnyone locally for precision (SAM2) masking.');
    else r.push('Precision (SAM2) masking with MaskAnyone needs an NVIDIA GPU; use a server installation for that.');
    if (b && b.delegate === 'CPU') r.push('The graphics card could not be used by the browser, so the test ran on the processor. Updating the browser or graphics driver may speed things up.');
    return r;
}

async function runReport() {
    const dlg = document.getElementById('report-dialog');
    const verdictEl = document.getElementById('report-verdict');
    const text = document.getElementById('report-text');
    text.value = '';
    verdictEl.textContent = 'Checking your computer…';
    dlg.showModal();
    speed = 0.03;
    const info = await systemInfo();
    let b = null, err = null;
    try { b = await benchmark((t) => { verdictEl.textContent = t; }); } catch (e) { err = e.message; }
    bench = b;
    speed = 0.008;
    const [verdict, level] = verdictFor(info, b);
    verdictEl.textContent = verdict;
    const tenMin = b ? (600 * 25) / b.fps : null;
    const lines = [
        'SYNAPSIS Masking Lite: readiness report',
        `Date: ${new Date().toLocaleString()}`,
        `Verdict: ${verdict}`,
        '',
        'Computer',
        `  Operating system: ${info.os}`,
        `  Browser: ${info.browser}`,
        `  Processor threads: ${info.cpu}`,
        `  Memory: ${info.memory}`,
        `  Graphics: ${info.gpu}`,
        `  WebGPU: ${info.webgpu}`,
        `  Screen: ${info.screen}`,
        info.storage ? `  Storage: ${info.storage}` : null,
        '',
        'Masking Lite checks',
        `  Write MP4 video: 720p ${info.enc720 ? 'yes' : 'NO'}, 1080p ${info.enc1080 ? 'yes' : 'NO'}`,
        `  Frame-accurate video reading: ${info.frameRead ? 'yes' : 'NO'}`,
        b ? `  Models run on: ${b.delegate === 'GPU' ? 'graphics card (GPU)' : 'processor (CPU)'}` : null,
        b ? `  Speed test (1280 px): body ${b.poseMs.toFixed(0)} ms, face ${b.faceMs.toFixed(0)} ms, hands ${b.handsMs.toFixed(0)} ms per frame` : `  Speed test failed: ${err}`,
        tenMin ? `  A 10-minute video at 25 fps would take about ${Math.round(tenMin / 60)} minutes.` : null,
        '',
        'Recommendation',
        ...recommendation(info, b, level).map((x) => `  - ${x}`),
        '',
        'This report contains no name, files, IP address or location.',
    ].filter((l) => l !== null);
    text.value = lines.join('\n');
    const subject = `Masking Lite readiness report (${info.os.split(' (')[0]}, ${info.browser})`;
    document.getElementById('report-copy').onclick = async (ev) => {
        await navigator.clipboard.writeText(text.value); ev.currentTarget.textContent = 'Copied';
    };
    document.getElementById('report-download').onclick = () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text.value], { type: 'text/plain' }));
        a.download = 'masking-lite-readiness-report.txt'; a.click();
    };
    document.getElementById('report-email').onclick = () => {
        location.href = `mailto:${REPORT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text.value)}`;
    };
    window.__maskotReport = { info, bench: b, verdict, level };   // for automated checks
    return window.__maskotReport;
}

// ---------------------------------------------------------------------------
// Event hooks used by app.js
// ---------------------------------------------------------------------------
export const maskot = {
    say,
    runReport,
    init({ supported, getTask, nextTs }) {
        deps = { getTask, nextTs };
        el.bubble = document.getElementById('maskot-bubble');
        el.text = document.getElementById('maskot-text');
        el.actions = document.getElementById('maskot-actions');
        el.face = document.getElementById('maskot-face');
        startGlobe(el.face);
        const toggle = () => (el.bubble.hidden
            ? say('Need a hand? I can check whether this computer is ready for masking, and make a short report you can send to the SYNAPSIS team.', [checkAction])
            : hide());
        el.face.addEventListener('click', toggle);
        el.face.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        document.getElementById('report-close').addEventListener('click', () => document.getElementById('report-dialog').close());
        if (supported) {
            setTimeout(() => say("Hi, I'm <strong>Maskot</strong>! I help you mask people in videos, right here in your browser. " +
                'Your video never leaves this computer. Shall I first check whether this computer is up to it?', [checkAction]), 900);
        }
    },
    onVideo(v) {
        const mins = v.duration / 60;
        const est = bench ? (v.duration * v.fps) / bench.fps : null;
        const estTxt = est ? ` On this computer that takes about <strong>${minutes(est)}</strong>.` : '';
        if (Math.min(v.width, v.height) < 360) {
            say(`This video is quite small (${v.width}×${v.height}). Masking works best when people are clearly visible; ` +
                'very small people may be missed, and those frames will be blurred instead.' + estTxt);
        } else if (mins > 20) {
            say(`That's a long recording (${Math.round(mins)} minutes). I've switched to the faster working size.${estTxt} ` +
                'Tip: keep this tab open and in front while it runs.');
        } else {
            say(`Got it: ${Math.round(v.duration)} seconds of video.${estTxt} Pick a look (<em>Masked-Piper classic</em> is a good start) and press <strong>Start masking</strong>.`);
        }
    },
    onStart() {
        speed = 0.03; halfwaySaid = false;
        say('Working on it! Keep this tab open and in front: browsers slow down tabs in the background.');
    },
    onProgress(frac) {
        if (frac >= 0.5 && !halfwaySaid) { halfwaySaid = true; say('Halfway there.'); }
    },
    onDone(stats, s) {
        speed = 0.008;
        const pct = Math.round(stats.person_rate * 100);
        const blurred = stats.frames_fully_blurred;
        const gaps = stats.frames_repeated > stats.frames * 0.03 && !s.exact
            ? ` Note: this computer couldn't keep up with every frame, so ${stats.frames_repeated} frames repeat the one before ` +
              '(the video is still fully masked, but it may stutter and the movement data has gaps). Tick <em>Read every frame exactly</em> for a steady, gap-free result.'
            : '';
        if (s.hide !== 'none' && pct < 80) {
            say(`Done, but please look carefully: I found a person in only <strong>${pct}%</strong> of frames. ` +
                (blurred ? `I blurred the ${blurred} frames where I found nobody. ` : 'Frames where I found nobody are <strong>not masked</strong>. ') +
                'Better light, or a closer shot, helps. Always watch the result before sharing.' + gaps);
        } else {
            say(`All done! I found a person in ${pct}% of frames${blurred ? `, and blurred the ${blurred} frames where I didn't` : ''}. ` +
                'Please watch the masked video once before sharing it. I removed the sound: voices identify people too.' + gaps);
        }
    },
};
