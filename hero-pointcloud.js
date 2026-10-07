/* Reactive point-cloud hero for the SYNAPSIS landing page.
 *
 * A synthetic figure sampled as points. Scrolling masks it: the face dissolves
 * first and completely, the surface scatters, and the skeleton fades in
 * underneath. Scrolling back up reverses it. The pointer orbits the camera
 * slightly. Everything is damped, so it settles rather than tracking exactly.
 *
 * Drops into the slot .hero-network-bg already occupies, so the hero keeps its
 * natural height and nothing else on the page moves. The masking is driven by
 * page scroll position, not by a tall sticky hero.
 *
 * The motion is generated here, in the browser. No participant recording is
 * used, shipped or referenced.
 *
 * Falls back silently to the existing logo-mark background when WebGL is
 * unavailable, and renders a single still frame under prefers-reduced-motion.
 */
import * as THREE from 'three';

const host = document.querySelector('[data-hero-pointcloud]');
if (host) init(host);

function init(host) {
    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ANCHOR = 0.8;        // 0 = left edge of the hero, 1 = right edge
    const OPACITY = 0.34;      // this sits behind headline copy, so it stays back

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'absolute', inset: '0', width: '100%', height: '100%',
        display: 'block', pointerEvents: 'none',
    });

    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
        return;   // no WebGL: the logo-mark background stays as it is
    }
    host.appendChild(canvas);
    // .hero-network-bg (the drifting logo mark at 6%) is the no-WebGL fallback.
    // We only reach this line once a context exists, so retire it here.
    const fallback = document.querySelector('.hero-network-bg');
    if (fallback) fallback.style.display = 'none';

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);

    /* ---- rig: coarse on purpose, this is the detail pose estimation gives ---- */
    const BONES = [['head','neck'],['neck','chest'],['chest','pelvis'],
                   ['neck','shoulderL'],['shoulderL','elbowL'],['elbowL','wristL'],
                   ['neck','shoulderR'],['shoulderR','elbowR'],['elbowR','wristR'],
                   ['pelvis','hipL'],['hipL','kneeL'],['kneeL','ankleL'],
                   ['pelvis','hipR'],['hipR','kneeR'],['kneeR','ankleR']];

    function pose(t) {
        const p = {}, sway = Math.sin(t * 0.9) * 0.05, bob = Math.sin(t * 1.8) * 0.018;
        p.pelvis=[sway,0.95+bob,0];                 p.chest=[sway*1.4,1.35+bob,0.01];
        p.neck=[sway*1.6,1.55+bob,0.02];            p.head=[sway*1.7,1.73+bob,0.03];
        p.hipL=[sway+0.10,0.92+bob,0];              p.hipR=[sway-0.10,0.92+bob,0];
        p.kneeL=[0.11,0.52,0.02];                   p.kneeR=[-0.11,0.52,0.02];
        p.ankleL=[0.11,0.08,0];                     p.ankleR=[-0.11,0.08,0];
        p.shoulderL=[sway*1.6+0.20,1.50+bob,0.02];  p.shoulderR=[sway*1.6-0.20,1.50+bob,0.02];
        const aL=t*1.25, aR=t*1.25+2.1;
        p.elbowL=[0.33+Math.sin(aL)*0.07,1.20+Math.cos(aL)*0.09,0.10+Math.sin(aL*0.7)*0.06];
        p.wristL=[0.42+Math.sin(aL+0.9)*0.16,1.08+Math.cos(aL+0.6)*0.20,0.26+Math.sin(aL)*0.12];
        p.elbowR=[-0.33+Math.sin(aR)*0.07,1.20+Math.cos(aR)*0.09,0.10+Math.sin(aR*0.7)*0.06];
        p.wristR=[-0.42+Math.sin(aR+0.9)*0.16,1.08+Math.cos(aR+0.6)*0.20,0.26+Math.sin(aR)*0.12];
        return p;
    }

    /* ---- body surface as points; each remembers its segment, how far along it
            rides, and its offset in that segment's own frame ---- */
    const PER_BONE = 150, N = BONES.length * PER_BONE;
    const along = new Float32Array(N);
    const radialU = new Float32Array(N), radialW = new Float32Array(N);
    const scatter = new Float32Array(N * 3);
    const isHead = new Uint8Array(N);
    const GIRTH = { 'neck-chest': 1.9, 'chest-pelvis': 2.2, 'head-neck': 1.2 };

    for (let i = 0; i < N; i++) {
        const b = Math.floor(i / PER_BONE);
        along[i] = Math.random();
        const g = GIRTH[BONES[b].join('-')] || 1;
        const ang = Math.random() * Math.PI * 2, r = (0.028 + Math.random() * 0.016) * g;
        radialU[i] = Math.cos(ang) * r;
        radialW[i] = Math.sin(ang) * r;
        const s = 0.5 + Math.random() * 0.9;
        scatter[i*3]   = (Math.random() - 0.5) * s;
        scatter[i*3+1] = (Math.random() - 0.5) * s * 0.6;
        scatter[i*3+2] = (Math.random() - 0.5) * s;
        isHead[i] = (BONES[b][0] === 'head' || BONES[b][1] === 'head') ? 1 : 0;
    }

    const positions = new Float32Array(N * 3);
    const alphas = new Float32Array(N);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    const uColor = { value: new THREE.Color(0x161616) };
    const uOpacity = { value: OPACITY };   // scaled by `fade` each frame
    const points = new THREE.Points(geo, new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uSize: { value: 2.6 * Math.min(devicePixelRatio, 2) }, uColor, uOpacity },
        vertexShader: `
            attribute float aAlpha; varying float vA; uniform float uSize;
            void main(){ vA = aAlpha;
                vec4 mv = modelViewMatrix * vec4(position,1.0);
                gl_PointSize = uSize * (3.2 / -mv.z);
                gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `
            varying float vA; uniform vec3 uColor; uniform float uOpacity;
            void main(){
                vec2 d = gl_PointCoord - vec2(0.5);
                if (dot(d,d) > 0.25) discard;
                gl_FragColor = vec4(uColor, vA * uOpacity); }`,
    }));

    const lineGeo = new THREE.BufferGeometry();
    const linePos = new Float32Array(BONES.length * 6);
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const lineMat = new THREE.LineBasicMaterial({ color: 0x161616, transparent: true, opacity: 0 });
    const lines = new THREE.LineSegments(lineGeo, lineMat);

    const rig = new THREE.Group();
    rig.add(points); rig.add(lines);
    scene.add(rig);

    /* ---- follow the site's dark mode ---- */
    function syncTheme() {
        const dark = document.documentElement.classList.contains('dark');
        uColor.value.setHex(dark ? 0xf4f4f4 : 0x161616);
        lineMat.color.setHex(dark ? 0xf4f4f4 : 0x161616);
    }
    syncTheme();
    new MutationObserver(syncTheme).observe(document.documentElement,
        { attributes: true, attributeFilter: ['class'] });

    /* ---- reactive inputs ----
       Masking tracks how far the hero has scrolled out of view, so scrolling
       down masks and scrolling back up restores. No sticky section needed. */
    let mask = 0, maskTarget = 0, ptrX = 0, ptrY = 0, pX = 0, pY = 0;

    // The layer is fixed, so there is no element rect to track. Masking runs off
    // page scroll instead: fully unmasked at the top, fully masked about 1.6
    // screens down, and it reverses on the way back up.
    let fade = 1;
    function readScroll() {
        const y = scrollY || document.documentElement.scrollTop || 0;
        maskTarget = Math.min(1, Math.max(0, y / (innerHeight * 1.6)));
        // Two fades multiplied: step back once the hero is behind you so body copy
        // stays legible, then take it out entirely towards the foot of the page.
        const docEnd = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const prog = Math.min(1, Math.max(0, y / docEnd));
        const near = 1 - 0.45 * Math.min(1, y / (innerHeight * 1.2));
        const out = 1 - Math.min(1, Math.max(0, (prog - 0.42) / 0.46));
        fade = near * out;
    }
    readScroll();
    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('resize', readScroll, { passive: true });
    addEventListener('pointermove', e => {
        ptrX = (e.clientX / innerWidth - 0.5) * 2;
        ptrY = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });

    const a = new THREE.Vector3(), b = new THREE.Vector3(), v = new THREE.Vector3();
    const dir = new THREE.Vector3(), up = new THREE.Vector3();
    const u = new THREE.Vector3(), w = new THREE.Vector3();

    function update(t) {
        const p = pose(t);

        BONES.forEach(([j1, j2], i) => {
            linePos[i*6+0]=p[j1][0]; linePos[i*6+1]=p[j1][1]; linePos[i*6+2]=p[j1][2];
            linePos[i*6+3]=p[j2][0]; linePos[i*6+4]=p[j2][1]; linePos[i*6+5]=p[j2][2];
        });
        lineGeo.attributes.position.needsUpdate = true;
        lineMat.opacity = Math.min(0.85, Math.max(0, (mask - 0.18) * 1.5)) * OPACITY * 2.2 * fade;

        const inflate = 1 + mask * 1.4;
        for (let bi = 0; bi < BONES.length; bi++) {
            const [j1, j2] = BONES[bi];
            a.fromArray(p[j1]); b.fromArray(p[j2]);
            dir.subVectors(b, a).normalize();
            up.set(Math.abs(dir.y) > 0.9 ? 1 : 0, Math.abs(dir.y) > 0.9 ? 0 : 1, 0);
            u.crossVectors(dir, up).normalize();
            w.crossVectors(dir, u).normalize();

            for (let n = 0; n < PER_BONE; n++) {
                const i = bi * PER_BONE + n, k = i * 3;
                v.lerpVectors(a, b, along[i]);
                const ru = radialU[i] * inflate, rw = radialW[i] * inflate;
                // the face goes first and goes completely — that is the whole point
                const m = Math.min(1, mask * (isHead[i] ? 2.6 : 1.0)), m2 = m * m;
                positions[k]   = v.x + u.x * ru + w.x * rw + scatter[k]   * m2;
                positions[k+1] = v.y + u.y * ru + w.y * rw + scatter[k+1] * m2;
                positions[k+2] = v.z + u.z * ru + w.z * rw + scatter[k+2] * m2;
                alphas[i] = isHead[i] ? Math.max(0, 0.9 - m * 1.3)
                                      : Math.max(0.05, 0.75 - m * 0.55);
            }
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.aAlpha.needsUpdate = true;
    }

    function resize() {
        const wpx = host.clientWidth, hpx = host.clientHeight;
        if (!wpx || !hpx) return 1;
        if (canvas.width !== Math.floor(wpx * renderer.getPixelRatio())) {
            renderer.setSize(wpx, hpx, false);
        }
        camera.aspect = wpx / hpx;
        camera.updateProjectionMatrix();
        return camera.aspect;
    }

    function place(aspect) {
        const yaw = 0.35 + pX * 0.42, pitch = 0.08 - pY * 0.18, dist = 3.6 + mask * 0.7;
        // solve the offset from the frustum so the figure lands at the same
        // fraction of the width whatever the viewport shape
        const halfW = Math.tan(camera.fov * Math.PI / 360) * dist * aspect;
        rig.position.x = (ANCHOR * 2 - 1) * halfW;
        camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist,
                            1.15 + Math.sin(pitch) * dist,
                            Math.cos(yaw) * Math.cos(pitch) * dist);
        camera.lookAt(0, 1.05, 0);
    }

    let t = 0, last = performance.now(), visible = !document.hidden, blanked = false;
    // the layer is fixed, so it is always on screen — idle on tab switch instead
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

    if (REDUCED) {
        mask = maskTarget = 0.7;
        place(resize()); update(0);
        renderer.render(scene, camera);
        return;
    }

    (function frame(now) {
        requestAnimationFrame(frame);
        if (!visible) { last = now; return; }      // idle while scrolled away
        const dt = Math.min(0.05, (now - last) / 1000); last = now;
        t += dt;
        mask += (maskTarget - mask) * Math.min(1, dt * 6);
        pX += (ptrX - pX) * Math.min(1, dt * 3);
        pY += (ptrY - pY) * Math.min(1, dt * 3);
        uOpacity.value = OPACITY * fade;
        if (fade < 0.012) {
            // fully faded at the foot of the page: blank the canvas once, then idle.
            // Without the explicit clear the last frame would stay frozen on screen.
            if (!blanked) { renderer.clear(); blanked = true; }
            return;
        }
        blanked = false;
        place(resize());
        update(t);
        renderer.render(scene, camera);
    })(performance.now());
}
