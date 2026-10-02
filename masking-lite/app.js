// SYNAPSIS Masking Lite — Masked-Piper in the browser.
// Frames are read by seeking the <video>, analysed with MediaPipe Tasks (pose, hands, face),
// rendered to a canvas and encoded with WebCodecs into an MP4. Nothing leaves the machine.
import {
    FilesetResolver, PoseLandmarker, FaceLandmarker, HandLandmarker, ImageSegmenter, DrawingUtils,
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/vision_bundle.mjs';
import { Muxer, ArrayBufferTarget } from 'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.2/+esm';
import { maskot } from './maskot.js';

const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const MODELS = new URL('models/', import.meta.url).href;
const VERSION = '0.2.1-draft';

const POSE_NAMES = ['nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye',
    'right_eye_outer', 'left_ear', 'right_ear', 'mouth_left', 'mouth_right', 'left_shoulder', 'right_shoulder',
    'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky', 'left_index',
    'right_index', 'left_thumb', 'right_thumb', 'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle',
    'right_ankle', 'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'];
const HAND_NAMES = ['wrist', 'thumb_cmc', 'thumb_mcp', 'thumb_ip', 'thumb_tip', 'index_mcp', 'index_pip',
    'index_dip', 'index_tip', 'middle_mcp', 'middle_pip', 'middle_dip', 'middle_tip', 'ring_mcp', 'ring_pip',
    'ring_dip', 'ring_tip', 'pinky_mcp', 'pinky_pip', 'pinky_dip', 'pinky_tip'];

const PRESETS = {
    classic: { hide: 'body', style: 'solid', bg: 'original', skeleton: true, hands: true, facemesh: true },
    face: { hide: 'face', style: 'blur', bg: 'original', skeleton: false, hands: false, facemesh: false },
    blur: { hide: 'body', style: 'blur', bg: 'original', skeleton: true, hands: true, facemesh: false },
    skeleton: { hide: 'none', style: 'solid', bg: 'white', skeleton: true, hands: true, facemesh: true },
};

const $ = (id) => document.getElementById(id);
const ui = {
    file: $('file'), drop: $('drop'), info: $('file-info'), src: $('src'), run: $('run'), cancel: $('cancel'),
    status: $('status'), bar: $('bar'), out: $('out'), results: $('results'), downloads: $('downloads'),
    unsupported: $('unsupported'),
    hide: $('opt-hide'), style: $('opt-style'), bg: $('opt-bg'), size: $('opt-size'), skeleton: $('opt-skeleton'),
    hands: $('opt-hands'), facemesh: $('opt-facemesh'), facedata: $('opt-facedata'), people: $('opt-people'),
    safety: $('opt-safety'), exact: $('opt-exact'), seg: $('opt-seg'), margin: $('opt-margin'), smooth: $('opt-smooth'),
};

let fileset = null;
const tasks = {};          // cached MediaPipe tasks, keyed by kind + options
let lastTs = 0;            // MediaPipe needs strictly increasing timestamps across runs
let cancelled = false;
let current = { file: null, fps: 25, duration: 0, width: 0, height: 0 };
const urls = [];

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
function settings() {
    return {
        hide: ui.hide.value, style: ui.style.value, bg: ui.bg.value, maxWidth: +ui.size.value,
        skeleton: ui.skeleton.checked, hands: ui.hands.checked, facemesh: ui.facemesh.checked,
        faceData: ui.facedata.checked, people: Math.max(1, Math.min(8, +ui.people.value || 4)),
        safety: ui.safety.checked, exact: ui.exact.checked, smooth: ui.smooth.checked,
        segmenter: ui.seg.value, margin: ui.margin.value,
    };
}
const PRESET_SLUGS = { classic: 'masked-piper-classic', face: 'hide-faces', blur: 'blur-body', skeleton: 'movement-only' };
function strategySlug(s) {
    const name = Object.keys(PRESETS).find((k) => Object.entries(PRESETS[k]).every(([o, v]) => s[o] === v));
    return name ? PRESET_SLUGS[name] : `custom-hide-${s.hide}-${s.style}`;
}
function applyPreset(name) {
    const p = PRESETS[name];
    ui.hide.value = p.hide; ui.style.value = p.style; ui.bg.value = p.bg;
    ui.skeleton.checked = p.skeleton; ui.hands.checked = p.hands; ui.facemesh.checked = p.facemesh;
    document.querySelectorAll('.preset').forEach((el) => el.classList.toggle('active', el.dataset.preset === name));
}
document.querySelectorAll('.preset').forEach((el) => el.addEventListener('click', () => applyPreset(el.dataset.preset)));
[ui.hide, ui.style, ui.bg, ui.skeleton, ui.hands, ui.facemesh].forEach((el) =>
    el.addEventListener('change', () => document.querySelectorAll('.preset').forEach((p) => p.classList.remove('active'))));

// ---------------------------------------------------------------------------
// Capability check
// ---------------------------------------------------------------------------
function checkSupport() {
    const missing = [];
    if (!('VideoEncoder' in window)) missing.push('writing video files (WebCodecs)');
    if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) missing.push('frame-accurate video reading');
    if (missing.length) {
        ui.unsupported.hidden = false;
        ui.unsupported.innerHTML = '<i class="fas fa-circle-exclamation mr-2"></i>This browser cannot do ' +
            missing.join(' or ') + '. Please use a recent <strong>Chrome</strong>, <strong>Edge</strong> or <strong>Firefox</strong>.';
        maskot.say('This browser is missing something I need to write the masked video. ' +
            'Could you open this page in a recent Chrome, Edge or Firefox?');
        return false;
    }
    return true;
}

// ---------------------------------------------------------------------------
// Loading a video
// ---------------------------------------------------------------------------
async function loadFile(file) {
    if (!file) return;
    if (!file.type.startsWith('video/') && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(file.name)) {
        maskot.say(`"${file.name}" doesn't look like a video file. Try an MP4, MOV or WebM.`);
        return;
    }
    urls.splice(0).forEach(URL.revokeObjectURL);
    const url = URL.createObjectURL(file);
    urls.push(url);
    ui.src.src = url;
    ui.src.hidden = false;
    ui.results.hidden = true;
    ui.status.textContent = 'Reading the video…';
    try {
        await new Promise((res, rej) => {
            ui.src.onloadedmetadata = res;
            ui.src.onerror = () => rej(new Error('unreadable'));
        });
    } catch {
        ui.status.textContent = 'This browser cannot play that video.';
        maskot.say("I can't open this video in the browser. It may use a codec the browser doesn't support " +
            '(common with some camera formats). Converting it to MP4 (H.264) first usually fixes this.');
        return;
    }
    const fps = await detectFps(ui.src);
    current = { file, fps, duration: ui.src.duration, width: ui.src.videoWidth, height: ui.src.videoHeight };
    const mins = current.duration / 60;
    ui.info.hidden = false;
    ui.info.textContent = `${file.name} · ${current.width}×${current.height} · ${fps.toFixed(fps % 1 ? 2 : 0)} fps · ` +
        `${fmtTime(current.duration)} · ${(file.size / 1e6).toFixed(1)} MB`;
    ui.run.disabled = false;
    ui.status.textContent = 'Ready. Pick a style, then start.';
    maskot.onVideo(current);
    if (mins > 20) ui.size.value = '960';
}

async function detectFps(video) {
    if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) return 25;
    const times = await new Promise((resolve) => {
        const t = [];
        let done = false;
        const finish = () => { if (done) return; done = true; video.pause(); resolve(t); };
        const cb = (_now, meta) => {
            t.push(meta.mediaTime);
            if (t.length >= 16) finish(); else video.requestVideoFrameCallback(cb);
        };
        video.requestVideoFrameCallback(cb);
        video.muted = true;
        video.currentTime = 0;
        video.play().catch(finish);
        setTimeout(finish, 3000);
    });
    video.currentTime = 0;
    const d = [];
    for (let i = 1; i < times.length; i++) if (times[i] > times[i - 1]) d.push(times[i] - times[i - 1]);
    if (d.length < 3) return 25;
    d.sort((a, b) => a - b);
    const fps = 1 / d[Math.floor(d.length * 0.25)];
    const common = [23.976, 24, 25, 29.97, 30, 48, 50, 59.94, 60];
    const near = common.find((c) => Math.abs(c - fps) / c < 0.03);
    return near || Math.round(fps * 100) / 100;
}

ui.file.addEventListener('change', () => loadFile(ui.file.files[0]));
['dragenter', 'dragover'].forEach((e) => ui.drop.addEventListener(e, (ev) => { ev.preventDefault(); ui.drop.classList.add('over'); }));
['dragleave', 'drop'].forEach((e) => ui.drop.addEventListener(e, (ev) => { ev.preventDefault(); ui.drop.classList.remove('over'); }));
ui.drop.addEventListener('drop', (ev) => loadFile(ev.dataTransfer.files[0]));

// ---------------------------------------------------------------------------
// MediaPipe tasks
// ---------------------------------------------------------------------------
async function getFileset() {
    if (!fileset) fileset = await FilesetResolver.forVisionTasks(WASM);
    return fileset;
}
// A software-emulated GPU (no working graphics driver) is slower than the CPU path.
export function softwareGL() {
    try {
        const gl = document.createElement('canvas').getContext('webgl2');
        const ext = gl?.getExtension('WEBGL_debug_renderer_info');
        const r = gl ? gl.getParameter(ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER) : '';
        return !gl || /swiftshader|llvmpipe|softpipe|basic render|software/i.test(r);
    } catch { return true; }
}
async function createTask(Cls, model, extra) {
    const fs = await getFileset();
    let lastErr;
    for (const delegate of softwareGL() ? ['CPU'] : ['GPU', 'CPU']) {
        try {
            const t = await Cls.createFromOptions(fs, {
                baseOptions: { modelAssetPath: MODELS + model, delegate }, runningMode: 'VIDEO', ...extra,
            });
            t._delegate = delegate;
            return t;
        } catch (e) { lastErr = e; }
    }
    throw lastErr;
}
export async function getTask(kind, s) {
    const key = kind + JSON.stringify(kind === 'pose' ? [s.people, s.hide === 'body'] : kind === 'seg' ? [s.segmenter] : [s.people]);
    if (tasks[key]) return tasks[key];
    if (kind === 'pose') {
        tasks[key] = await createTask(PoseLandmarker, 'pose_landmarker_full.task', {
            numPoses: s.people, outputSegmentationMasks: s.hide === 'body',
            minPoseDetectionConfidence: 0.4, minPosePresenceConfidence: 0.4, minTrackingConfidence: 0.4,
        });
    } else if (kind === 'face') {
        tasks[key] = await createTask(FaceLandmarker, 'face_landmarker.task', {
            numFaces: s.people, minFaceDetectionConfidence: 0.4, minFacePresenceConfidence: 0.4,
        });
    } else if (kind === 'seg') {
        const multi = s.segmenter === 'multiclass';
        const t = await createTask(ImageSegmenter, multi ? 'selfie_multiclass_256x256.tflite' : 'deeplab_v3.tflite',
            { outputCategoryMask: true, outputConfidenceMasks: false });
        const labels = (t.getLabels() || []).map((l) => String(l).toLowerCase());
        if (multi) {
            const L = labels.length ? labels : ['background', 'hair', 'body-skin', 'face-skin', 'clothes', 'others'];
            t._person = L.map((l, i) => (l === 'background' ? -1 : i)).filter((i) => i >= 0);
            t._head = L.map((l, i) => (/hair|face/.test(l) ? i : -1)).filter((i) => i >= 0);
        } else {
            const i = labels.indexOf('person');
            t._person = [i >= 0 ? i : 15];   // PASCAL VOC: 15 = person
            t._head = [];
        }
        tasks[key] = t;
    } else {
        tasks[key] = await createTask(HandLandmarker, 'hand_landmarker.task', {
            numHands: s.people * 2, minHandDetectionConfidence: 0.4,
        });
    }
    return tasks[key];
}
export function nextTs(stepMs) { lastTs += Math.max(1, stepMs); return Math.round(lastTs); }

// ---------------------------------------------------------------------------
// Smoothing: a One Euro filter per landmark (Casiez et al., 2012) steadies small jitter but
// follows fast movement. Each detected person/hand/face is matched to the nearest track from
// the previous frame. Only the drawing is smoothed; the CSV files keep the raw values.
// ---------------------------------------------------------------------------
function makeSmoother(W, H, { minCutoff = 1.2, beta = 0.015, dCutoff = 1.0 } = {}) {
    const alpha = (cut, dt) => 1 / (1 + 1 / (2 * Math.PI * cut * dt));
    const tracks = {};   // kind -> [{ cx, cy, x: Float64Array, y, dx, dy, t }]
    function centroid(lm) {
        let x = 0, y = 0;
        for (const q of lm) { x += q.x; y += q.y; }
        return [x / lm.length * W, y / lm.length * H];
    }
    return function smooth(kind, list, t) {
        const prev = tracks[kind] || [];
        const used = new Set();
        const next = [];
        const out = (list || []).map((lm) => {
            const [cx, cy] = centroid(lm);
            let best = -1, bd = Infinity;
            prev.forEach((tr, i) => {
                if (used.has(i) || tr.x.length !== lm.length) return;
                const d = Math.hypot(tr.cx - cx, tr.cy - cy);
                if (d < bd) { bd = d; best = i; }
            });
            let tr = best >= 0 && bd < W * 0.15 ? prev[best] : null;
            if (tr) used.add(best);
            const n = lm.length;
            if (!tr || t <= tr.t) {
                tr = { x: new Float64Array(n), y: new Float64Array(n), dx: new Float64Array(n), dy: new Float64Array(n), t };
                lm.forEach((q, k) => { tr.x[k] = q.x * W; tr.y[k] = q.y * H; });
            } else {
                const dt = t - tr.t, ad = alpha(dCutoff, dt);
                lm.forEach((q, k) => {
                    const X = q.x * W, Y = q.y * H;
                    tr.dx[k] += ad * ((X - tr.x[k]) / dt - tr.dx[k]);
                    tr.dy[k] += ad * ((Y - tr.y[k]) / dt - tr.dy[k]);
                    tr.x[k] += alpha(minCutoff + beta * Math.abs(tr.dx[k]), dt) * (X - tr.x[k]);
                    tr.y[k] += alpha(minCutoff + beta * Math.abs(tr.dy[k]), dt) * (Y - tr.y[k]);
                });
                tr.t = t;
            }
            tr.cx = cx; tr.cy = cy;
            next.push(tr);
            return lm.map((q, k) => ({ ...q, x: tr.x[k] / W, y: tr.y[k] / H }));
        });
        tracks[kind] = next;
        return out;
    };
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

function makeRenderer(W, H, s) {
    const work = canvas(W, H), wctx = work.getContext('2d', { willReadFrequently: true });
    const out = ui.out; out.width = W; out.height = H;
    const octx = out.getContext('2d');
    const layer = canvas(W, H), lctx = layer.getContext('2d');
    // Masks are combined and grown at a reduced size (fast), then scaled up when applied.
    const Ws = Math.min(W, 320), Hs = Math.round(H * Ws / W);
    const mask = canvas(Ws, Hs), mctx = mask.getContext('2d');
    const hold = canvas(Ws, Hs), hctx = hold.getContext('2d');
    const prev = canvas(Ws, Hs), pctx = prev.getContext('2d');
    const smooth = s.smooth ? makeSmoother(W, H) : (_k, list) => list || [];
    const smalls = [];
    const draw = new DrawingUtils(octx);
    const lw = Math.max(1, W / 640);
    const onWhite = s.bg === 'white';
    const col = {
        bone: onWhite ? '#161616' : '#ffffff', joint: '#ff4d4d', hand: '#ffb000',
        mesh: onWhite ? 'rgba(0,120,200,.55)' : 'rgba(127,219,255,.6)',
    };
    const dilate = Math.max(3, Math.round(W / 120 * ({ tight: 0.6, normal: 1, wide: 1.8 }[s.margin] || 1)));

    // Turn a mask (confidences or class labels) into an alpha canvas.
    function toCanvas(n, w, h, fill) {
        if (!smalls[n] || smalls[n].width !== w || smalls[n].height !== h) smalls[n] = canvas(w, h);
        const c = smalls[n], x = c.getContext('2d');
        const img = x.createImageData(w, h);
        const count = fill(img.data);
        x.putImageData(img, 0, 0);
        return { c, count };
    }
    function personFromSeg(seg, classes, slot) {
        const cm = seg?.categoryMask;
        if (!cm) return null;
        const set = new Uint8Array(256);
        classes.forEach((k) => { set[k] = 1; });
        const u = cm.getAsUint8Array();
        return toCanvas(slot, cm.width, cm.height, (a) => {
            let n = 0;
            for (let i = 0; i < u.length; i++) if (set[u[i]]) { a[i * 4 + 3] = 255; n++; }
            return n;
        });
    }
    // Union of all sources, grown a little so edges don't leak, plus the previous frame's
    // mask, so a one-frame dropout never shows a person.
    function compose(sources) {
        const grow = Math.max(1, dilate * Ws / W);
        mctx.clearRect(0, 0, Ws, Hs);
        mctx.filter = `blur(${grow}px)`;
        for (const src of sources) for (let k = 0; k < 3; k++) mctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, Ws, Hs);
        mctx.filter = 'none';
        for (const src of sources) mctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, Ws, Hs);
        pctx.clearRect(0, 0, Ws, Hs); pctx.drawImage(mask, 0, 0);
        mctx.drawImage(hold, 0, 0);
        hctx.clearRect(0, 0, Ws, Hs); hctx.drawImage(prev, 0, 0);
    }

    function bodyMask(pose, seg, task) {
        const sources = [];
        let share = 0;
        const masks = pose?.segmentationMasks || [];
        if (masks.length) {
            const w = masks[0].width, h = masks[0].height;
            const fs = masks.map((m) => m.getAsFloat32Array());
            const r = toCanvas(0, w, h, (a) => {
                let n = 0;
                for (const f of fs) for (let i = 0; i < f.length; i++) if (f[i] > 0.3 && !a[i * 4 + 3]) { a[i * 4 + 3] = 255; n++; }
                return n;
            });
            sources.push(r.c); share += r.count / (w * h);
        }
        const p = task ? personFromSeg(seg, task._person, 1) : null;
        if (p && p.count) { sources.push(p.c); share += p.count / (p.c.width * p.c.height); }
        compose(sources);
        return share > 0.0005;
    }

    function hull(pts) {
        pts = pts.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
        const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
        const lo = [], up = [];
        for (const p of pts) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
        for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
        return lo.slice(0, -1).concat(up.slice(0, -1));
    }

    const faceCanvas = canvas(W, H), fctx = faceCanvas.getContext('2d');
    let prevFound = false;
    function faceMask(face, pose, seg, task) {
        const mctx = fctx;
        mctx.clearRect(0, 0, W, H);
        mctx.fillStyle = '#000';
        const boxes = [];
        for (const lm of face?.faceLandmarks || []) {
            const pts = lm.map((p) => [p.x * W, p.y * H]);
            const h = hull(pts);
            const cx = h.reduce((s, p) => s + p[0], 0) / h.length, cy = h.reduce((s, p) => s + p[1], 0) / h.length;
            mctx.beginPath();
            h.forEach(([x, y], i) => {
                const X = cx + (x - cx) * 1.25, Y = cy + (y - cy) * 1.3 - (y < cy ? (cy - y) * 0.15 : 0);
                i ? mctx.lineTo(X, Y) : mctx.moveTo(X, Y);
            });
            mctx.closePath(); mctx.fill();
            const xs = h.map((p) => p[0]), ys = h.map((p) => p[1]);
            boxes.push([Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
        }
        // Safety net: heads the face model missed, found from the body pose.
        for (const lm of pose?.landmarks || []) {
            const nose = lm[0];
            if (!nose || (nose.visibility ?? 1) < 0.3) continue;
            const nx = nose.x * W, ny = nose.y * H;
            if (boxes.some(([x0, y0, x1, y1]) => nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1)) continue;
            const d = Math.max(Math.hypot((lm[7].x - lm[8].x) * W, (lm[7].y - lm[8].y) * H),
                Math.hypot((lm[11].x - lm[12].x) * W, (lm[11].y - lm[12].y) * H) * 0.45, W * 0.02);
            mctx.beginPath();
            mctx.ellipse(nx, ny - d * 0.15, d * 0.85, d * 1.15, 0, 0, Math.PI * 2);
            mctx.fill();
        }
        const sources = [faceCanvas];
        const head = task?._head?.length ? personFromSeg(seg, task._head, 2) : null;
        if (head && head.count) sources.push(head.c);
        compose(sources);
        return boxes.length > 0 || (pose?.landmarks?.length || 0) > 0 || !!head?.count;
    }

    function applyMask() {
        lctx.clearRect(0, 0, W, H);
        if (s.style === 'blur') {
            lctx.filter = `blur(${Math.max(8, Math.round(W / 45))}px)`;
            lctx.drawImage(work, 0, 0);
            lctx.filter = 'none';
        } else {
            lctx.fillStyle = s.bg === 'black' ? '#3a3a3a' : '#1f1f1f';
            lctx.fillRect(0, 0, W, H);
        }
        lctx.globalCompositeOperation = 'destination-in';
        lctx.drawImage(mask, 0, 0, Ws, Hs, 0, 0, W, H);
        lctx.globalCompositeOperation = 'source-over';
        octx.drawImage(layer, 0, 0);
    }

    return {
        work, wctx,
        render(pose, face, hands, seg, segTask, t) {
            // Build the mask first: segmentation + pose outline (+ previous frame's mask).
            let found = true;
            if (s.hide === 'body') found = bodyMask(pose, seg, segTask);
            else if (s.hide === 'face') found = faceMask(face, pose, seg, segTask);
            // Safety net: nobody found -> blur the whole frame. A single missed frame is already
            // covered by the previous frame's mask, so only blur from the second miss in a row
            // (or when there is no previous mask). This avoids blur flashing on and off.
            const blurAll = !found && !prevFound;
            prevFound = found;
            if (s.safety && s.bg === 'original' && blurAll) {
                octx.filter = `blur(${Math.max(12, Math.round(W / 30))}px)`;
                octx.drawImage(work, 0, 0);
                octx.filter = 'none';
                return 'blurred';
            }
            if (s.bg === 'original') octx.drawImage(work, 0, 0);
            else { octx.fillStyle = s.bg === 'white' ? '#fff' : '#000'; octx.fillRect(0, 0, W, H); }
            if (s.hide !== 'none') applyMask();
            if (s.facemesh) for (const lm of smooth('face', face?.faceLandmarks, t))
                draw.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, { color: col.mesh, lineWidth: lw * 0.5 });
            if (s.skeleton) for (const lm of smooth('pose', pose?.landmarks, t)) {
                draw.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: col.bone, lineWidth: lw * 2 });
                draw.drawLandmarks(lm, { color: col.joint, radius: lw * 2.2, lineWidth: 0 });
            }
            if (s.hands) for (const lm of smooth('hands', hands?.landmarks, t)) {
                draw.drawConnectors(lm, HandLandmarker.HAND_CONNECTIONS, { color: col.hand, lineWidth: lw * 1.5 });
                draw.drawLandmarks(lm, { color: col.hand, radius: lw * 1.2, lineWidth: 0 });
            }
            return 'masked';
        },
    };
}

// ---------------------------------------------------------------------------
// Encoding
// ---------------------------------------------------------------------------
async function makeEncoder(W, H, fps) {
    const big = W * H > 1920 * 1088;
    const candidates = [
        ['avc', big ? 'avc1.640033' : 'avc1.640028'], ['avc', big ? 'avc1.4d0033' : 'avc1.4d0028'],
        ['avc', 'avc1.42001f'], ['vp9', 'vp09.00.40.08'],
    ];
    for (const [muxCodec, codec] of candidates) {
        const cfg = { codec, width: W, height: H, bitrate: Math.round(W * H * fps * 0.12), framerate: fps };
        if (muxCodec === 'avc') cfg.avc = { format: 'avc' };
        let ok = false;
        try { ok = (await VideoEncoder.isConfigSupported(cfg)).supported; } catch { ok = false; }
        if (!ok) continue;
        const target = new ArrayBufferTarget();
        const muxer = new Muxer({ target, video: { codec: muxCodec, width: W, height: H }, fastStart: 'in-memory' });
        let error = null;
        const enc = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: (e) => { error = e; } });
        enc.configure(cfg);
        return {
            codec,
            async add(canvasEl, i) {
                if (error) throw error;
                while (enc.encodeQueueSize > 4) await new Promise((r) => setTimeout(r, 4));
                const frame = new VideoFrame(canvasEl, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
                enc.encode(frame, { keyFrame: i % Math.round(fps * 2) === 0 });
                frame.close();
            },
            async finish() {
                await enc.flush();
                if (error) throw error;
                enc.close();
                muxer.finalize();
                return new Blob([target.buffer], { type: 'video/mp4' });
            },
            abort() { try { enc.close(); } catch { /* already closed */ } },
        };
    }
    throw new Error('No supported video encoder in this browser.');
}

// ---------------------------------------------------------------------------
// Main run
// ---------------------------------------------------------------------------
function seek(video, t) {
    return new Promise((res) => {
        const done = () => { video.removeEventListener('seeked', done); res(); };
        video.addEventListener('seeked', done);
        video.currentTime = t;
    });
}
async function* seekFrames(video, fps, N, duration) {
    for (let i = 0; i < N; i++) { await seek(video, Math.min((i + 0.5) / fps, duration - 0.001)); yield i; }
}
// Play the video and pause on every presented frame: the decoder runs forward instead of
// re-decoding from a keyframe for each seek, which is several times faster.
async function* playFrames(video, fps, N) {
    await seek(video, 0);
    yield 0;
    video.playbackRate = 1;
    let ended = false, wake = null;
    const onEnd = () => { ended = true; wake?.(); };
    video.addEventListener('ended', onEnd);
    try {
        while (!ended) {
            const meta = await new Promise((res) => {
                wake = () => res(null);
                video.requestVideoFrameCallback((_now, m) => { video.pause(); res(m); });
                video.play().catch(() => res(null));
            });
            if (!meta) break;
            yield Math.min(N - 1, Math.round(meta.mediaTime * fps));
        }
    } finally {
        video.removeEventListener('ended', onEnd);
        video.pause();
    }
}
const fmtTime = (s) => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };
const r4 = (v) => (v == null ? '' : Math.round(v * 1e4) / 1e4);

async function run() {
    const s = settings();
    const { fps, duration, width, height, file } = current;
    const scale = Math.min(1, s.maxWidth / width);
    const W = Math.round(width * scale / 2) * 2, H = Math.round(height * scale / 2) * 2;
    const N = Math.max(1, Math.floor(duration * fps));
    cancelled = false;
    ui.run.disabled = true; ui.cancel.hidden = false; ui.bar.hidden = false; ui.out.hidden = false; ui.results.hidden = true;
    const bar = ui.bar.firstElementChild;
    ui.status.textContent = 'Loading the masking models (first time only)…';
    maskot.onStart(s);

    let pose, face, hands, seg, enc;
    try {
        pose = await getTask('pose', s);
        face = (s.hide === 'face' || s.facemesh || s.faceData) ? await getTask('face', s) : null;
        hands = s.hands ? await getTask('hands', s) : null;
        seg = s.segmenter !== 'off' && (s.hide === 'body' || (s.hide === 'face' && s.segmenter === 'multiclass'))
            ? await getTask('seg', s) : null;
        enc = await makeEncoder(W, H, fps);
    } catch (e) {
        ui.status.textContent = 'Could not start: ' + e.message;
        maskot.say('Something went wrong while loading the masking models: ' + e.message +
            '. Check your internet connection (needed once, to load the models) and try again.');
        ui.run.disabled = false; ui.cancel.hidden = true;
        return;
    }

    const R = makeRenderer(W, H, s);
    if (!('requestVideoFrameCallback' in HTMLVideoElement.prototype)) s.exact = true;
    const poseRows = ['frame,time_s,person,landmark,x,y,z,visibility'];
    const handRows = ['frame,time_s,hand,side,landmark,x,y,z'];
    const faceRows = s.faceData ? ['frame,time_s,face,landmark,x,y,z'] : null;
    let framesWithPerson = 0, framesWithFace = 0, framesBlurred = 0;
    const timing = { read: 0, pose: 0, face: 0, hands: 0, seg: 0, render: 0, encode: 0 };
    const t0 = performance.now();
    const started = new Date();
    const step = 1000 / fps;
    const video = ui.src;
    video.pause();
    const source = s.exact ? seekFrames(video, fps, N, duration) : playFrames(video, fps, N);
    let nextOut = 0, prevIdx = -1, analysed = 0, framesRepeated = 0;
    let tA = performance.now();

    for await (const idx of source) {
        if (cancelled) break;
        if (idx < nextOut) continue;
        R.wctx.drawImage(video, 0, 0, W, H);
        let tB = performance.now(); timing.read += tB - tA;
        const ts = nextTs(step * Math.max(1, idx - prevIdx)); prevIdx = idx;
        const pr = pose.detectForVideo(R.work, ts);
        tA = performance.now(); timing.pose += tA - tB;
        const fr = face ? face.detectForVideo(R.work, ts) : null;
        tB = performance.now(); timing.face += tB - tA;
        const hr = hands ? hands.detectForVideo(R.work, ts) : null;
        tA = performance.now(); timing.hands += tA - tB;
        const sr = seg ? seg.segmentForVideo(R.work, ts) : null;
        tB = performance.now(); timing.seg += tB - tA; tA = tB;
        if (R.render(pr, fr, hr, sr, seg, idx / fps) === 'blurred') framesBlurred++;
        tB = performance.now(); timing.render += tB - tA;
        // Frames the player skipped get this masked frame again, so nothing is ever shown unmasked.
        for (let k = nextOut; k <= idx; k++) await enc.add(ui.out, k);
        framesRepeated += idx - nextOut;
        nextOut = idx + 1;
        analysed++;
        timing.encode += performance.now() - tB;

        const t = r4(idx / fps);
        if (pr.landmarks.length) framesWithPerson++;
        if (fr?.faceLandmarks.length) framesWithFace++;
        pr.landmarks.forEach((lm, p) => lm.forEach((q, k) =>
            poseRows.push(`${idx},${t},${p},${POSE_NAMES[k]},${r4(q.x)},${r4(q.y)},${r4(q.z)},${r4(q.visibility)}`)));
        hr?.landmarks.forEach((lm, h) => {
            const side = hr.handedness?.[h]?.[0]?.categoryName || '';
            lm.forEach((q, k) => handRows.push(`${idx},${t},${h},${side},${HAND_NAMES[k]},${r4(q.x)},${r4(q.y)},${r4(q.z)}`));
        });
        if (faceRows) fr?.faceLandmarks.forEach((lm, f) => lm.forEach((q, k) =>
            faceRows.push(`${idx},${t},${f},${k},${r4(q.x)},${r4(q.y)},${r4(q.z)}`)));
        pr.segmentationMasks?.forEach((m) => m.close());
        sr?.close?.();

        if (analysed % 5 === 0) {
            const el = (performance.now() - t0) / 1000;
            const eta = el / nextOut * (N - nextOut);
            bar.style.width = `${(nextOut / N * 100).toFixed(1)}%`;
            ui.status.textContent = `Frame ${nextOut} of ${N} · ${(nextOut / el).toFixed(1)} frames/s · about ${fmtTime(eta)} left`;
            maskot.onProgress(nextOut / N, eta);
        }
        tA = performance.now();
    }
    if (!cancelled && analysed) {
        framesRepeated += Math.max(0, N - nextOut);
        for (let k = nextOut; k < N; k++) await enc.add(ui.out, k);
        bar.style.width = '100%';
    }

    ui.cancel.hidden = true;
    ui.run.disabled = false;
    if (cancelled) {
        enc.abort();
        ui.status.textContent = 'Cancelled.';
        bar.style.width = '0';
        return;
    }
    ui.status.textContent = 'Finishing the video file…';
    const videoBlob = await enc.finish();
    const secs = (performance.now() - t0) / 1000;
    // File names: <video>_<strategy>_<timestamp>_<content>, the same stem for every file of a run.
    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^\w.-]+/g, '-').replace(/^-+|-+$/g, '') || 'video';
    const strategy = strategySlug(s);
    const pad = (n) => String(n).padStart(2, '0');
    const stamp = `${started.getFullYear()}${pad(started.getMonth() + 1)}${pad(started.getDate())}-` +
        `${pad(started.getHours())}${pad(started.getMinutes())}${pad(started.getSeconds())}`;
    const stem = `${base}_${strategy}_${stamp}`;
    const stats = {
        frames: N, frames_analysed: analysed, frames_repeated: framesRepeated,
        frames_with_person: framesWithPerson, frames_with_face: framesWithFace,
        person_rate: +(framesWithPerson / Math.max(1, analysed)).toFixed(3), frames_fully_blurred: framesBlurred,
        processing_seconds: +secs.toFixed(1),
        ms_per_frame: Object.fromEntries(Object.entries(timing).map(([k, v]) => [k, +(v / Math.max(1, analysed)).toFixed(1)])),
    };
    const meta = {
        tool: 'SYNAPSIS Masking Lite', version: VERSION, run_id: stem, strategy,
        started: started.toISOString(), finished: new Date().toISOString(),
        source: { name: file.name, width, height, fps, duration_s: +duration.toFixed(3) },
        output: { width: W, height: H, fps, codec: enc.codec, audio: 'removed' },
        settings: s,
        models: { library: '@mediapipe/tasks-vision 1.0.1', pose: 'pose_landmarker_full (float16, v1)',
            segmenter: seg ? (s.segmenter === 'multiclass' ? 'selfie_multiclass_256x256 (float32)' : 'deeplab_v3 (float32)') : null,
            face: face ? 'face_landmarker (float16, v1)' : null, hands: hands ? 'hand_landmarker (float16, v1)' : null,
            delegate: pose._delegate },
        stats,
        method: 'Masked-Piper (Owoyele, Trujillo, de Melo & Pouw, 2022, SoftwareX, doi:10.1016/j.softx.2022.101236)',
    };
    const files = [
        [`${stem}_masked.mp4`, videoBlob, 'fa-film', 'Masked video'],
        [`${stem}_pose.csv`, new Blob([poseRows.join('\n')], { type: 'text/csv' }), 'fa-person', 'Body pose (CSV)'],
    ];
    if (hands) files.push([`${stem}_hands.csv`, new Blob([handRows.join('\n')], { type: 'text/csv' }), 'fa-hand', 'Hands (CSV)']);
    if (faceRows) files.push([`${stem}_face.csv`, new Blob([faceRows.join('\n')], { type: 'text/csv' }), 'fa-face-smile', 'Face (CSV)']);
    files.push([`${stem}_settings.json`, new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' }), 'fa-file-code', 'Settings (JSON)']);

    meta.output_files = files.map(([name]) => name);
    files[files.length - 1][1] = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    ui.downloads.innerHTML = '';
    for (const [name, blob, icon, label] of files) {
        const u = URL.createObjectURL(blob); urls.push(u);
        const a = document.createElement('a');
        a.href = u; a.download = name;
        a.className = (icon === 'fa-film' ? 'btn-primary' : 'btn-secondary') + ' px-4 py-2 text-sm inline-block';
        a.innerHTML = `<i class="fas ${icon} mr-2"></i>${label} <span class="opacity-60">${(blob.size / 1e6).toFixed(1)} MB</span>`;
        ui.downloads.appendChild(a);
    }
    ui.results.hidden = false;
    ui.status.textContent = `Done: ${N} frames in ${fmtTime(secs)}.`;
    window.__maskingLiteResult = { meta, videoBytes: videoBlob.size };   // for automated checks
    maskot.onDone(stats, s);
}

ui.run.addEventListener('click', () => run().catch((e) => {
    ui.status.textContent = 'Error: ' + e.message;
    ui.run.disabled = false; ui.cancel.hidden = true;
    maskot.say('Sorry, something broke: ' + e.message + '. A readiness report (click me) helps us fix it.');
}));
ui.cancel.addEventListener('click', () => { cancelled = true; });
$('theme-toggle')?.addEventListener('click', () => window.toggleTheme?.());

applyPreset('classic');
maskot.init({ supported: checkSupport(), getTask, nextTs });
