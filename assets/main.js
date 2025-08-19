import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// -------------------- UI: год в футере --------------------
document.getElementById('year').textContent = new Date().getFullYear();

// -------------------- HERO spotlight + toggle --------------------
const heroEl = document.getElementById('hero');
const overlayEl = heroEl?.querySelector('.hero-overlay');
const toggleBtn = document.getElementById('toggleLight');

function moveSpotlight(clientX, clientY) {
    if (!heroEl || !overlayEl) return;
    const rect = heroEl.getBoundingClientRect();
    const mx = ((clientX - rect.left) / rect.width) * 100;
    const my = ((clientY - rect.top) / rect.height) * 100;
    overlayEl.style.setProperty('--mx', `${mx}%`);
    overlayEl.style.setProperty('--my', `${my}%`);
}
function resetSpotlight() {
    if (!overlayEl) return;
    overlayEl.style.setProperty('--mx', `-100vw`);
    overlayEl.style.setProperty('--my', `-100vh`);
}
if (heroEl && overlayEl) {
    heroEl.addEventListener('mousemove', e => moveSpotlight(e.clientX, e.clientY));
    heroEl.addEventListener('mouseenter', e => moveSpotlight(e.clientX, e.clientY));
    heroEl.addEventListener('mouseleave', resetSpotlight);
    heroEl.addEventListener('touchmove', e => {
        const t = e.touches?.[0]; if (t) moveSpotlight(t.clientX, t.clientY);
    }, { passive: true });
}

// === ВКЛЮЧАЕМ СВЕТ ПО УМОЛЧАНИЮ ===
let lightsOn = true;
function setLights(on) {
    if (!heroEl || !toggleBtn) return;
    heroEl.classList.toggle('lights-on', on);
    toggleBtn.setAttribute('aria-pressed', String(on));
    toggleBtn.innerHTML = on
        ? '<i class="fa-solid fa-lightbulb" aria-hidden="true"></i> Turn off the lights'
        : '<i class="fa-solid fa-lightbulb" aria-hidden="true"></i> Turn on the light';
}
setLights(lightsOn);

toggleBtn?.addEventListener('click', () => {
    lightsOn = !lightsOn;
    setLights(lightsOn);
});


// -------------------- Бургер --------------------
// === БУРГЕР ===
const burgerBtn = document.querySelector('.burger, .mobile-nav-toggle');
const nav = document.querySelector('.main-nav');
const body = document.body;

function setMenu(open) {
    if (!burgerBtn || !nav) return;
    nav.classList.toggle('open', open);
    burgerBtn.setAttribute('aria-expanded', String(open));
    body.classList.toggle('no-scroll', open);
}

burgerBtn?.addEventListener('click', () => {
    const isOpen = nav?.classList.contains('open');
    setMenu(!isOpen);
});

// Закрытие по клику на ссылку меню
nav?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});

// Закрытие по Esc
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setMenu(false);
});

// Клик вне меню закрывает его
document.addEventListener('click', (e) => {
    if (
        nav?.classList.contains('open') &&
        !e.target.closest('.main-nav') &&
        !e.target.closest('.burger, .mobile-nav-toggle')
    ) {
        setMenu(false);
    }
});

// -------------------- Sparkles --------------------
const sparklesContainer = document.querySelector('.sparkles');
function createSparkle() {
    const el = document.createElement('div');
    el.className = 'sparkle';
    const size = Math.random() * 5 + 3;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.left = `${Math.random() * 100}%`;
    el.style.top = `${Math.random() * 100}%`;
    el.style.background = `hsl(${200 + Math.random() * 60}, 80%, 70%)`;
    el.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    sparklesContainer.appendChild(el);
    setTimeout(() => el.remove(), 3000);
}
setInterval(createSparkle, 160); // было 0 — слишком часто

// -------------------- Projects: tilt + reveal --------------------
(function () {
    const cards = document.querySelectorAll('.projects .project-card');
    const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('is-visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.2 });
    cards.forEach(c => io.observe(c));

    cards.forEach(card => {
        const img = card.querySelector('.project-media img');
        let rect = null;
        function move(e) {
            if (!rect) rect = card.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            const rx = py * -6;
            const ry = px * 8;
            card.style.transform =
                `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-10px) scale(1.03)`;
            if (img) img.style.transform = `translate(${px * -8}px, ${py * -8}px) scale(1.1)`;
        }
        function reset() {
            rect = null;
            card.style.transform = '';
            if (img) img.style.transform = '';
        }
        card.addEventListener('mousemove', move);
        card.addEventListener('mouseenter', move);
        card.addEventListener('mouseleave', reset);
    });
})();

// -------------------- Lightbox --------------------
document.querySelectorAll('.project-media img').forEach(img => {
    img.addEventListener('click', () => {
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = lightbox.querySelector('.lightbox-img');
        lightboxImg.src = img.src;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
    });
});
const lightbox = document.getElementById('lightbox');
const closeBtn = lightbox.querySelector('.lightbox-close');
const backdrop = lightbox.querySelector('.lightbox-backdrop');
function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
}
closeBtn.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

window.addEventListener('DOMContentLoaded', async () => {
    const host = document.getElementById('modelHost');
    if (!host) return;

    // ====== сцена/камера/рендер ======
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 5000);
    camera.position.set(0, 1.2, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(renderer.domElement);
    renderer.physicallyCorrectLights = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    // ====== свет (без включения hero-света) ======
    scene.traverse(n => { if (n.isLight) scene.remove(n); });

    // Небо/земля — мягкая базовая засветка
    const hemi = new THREE.HemisphereLight(0xddeeff, 0x0b1020, 0.45);
    scene.add(hemi);

    // Ключевой (как от большого софтбокса справа-сверху-спереди)
    const key = new THREE.DirectionalLight(0xffffff, 1.35);
    key.position.set(2.2, 2.6, 3.6);      // направление на модель
    key.target.position.set(0, 0.35, 0);   // «смотрит» чуть выше центра
    scene.add(key);
    scene.add(key.target);

    // Заполняющий слева (слабее и «холоднее»)
    const fill = new THREE.DirectionalLight(0xbfdcff, 0.45);
    fill.position.set(-2.0, 1.6, 2.2);
    fill.target.position.set(0, 0.3, 0);
    scene.add(fill, fill.target);

    // Контровой сзади для обводки
    const rim = new THREE.DirectionalLight(0xa8ecff, 0.55);
    rim.position.set(-1.4, 2.2, -2.8);
    rim.target.position.set(0, 0.2, 0);
    scene.add(rim, rim.target);


    // ====== контролы ======
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 0);

    // ====== ресайз ======
    function resize() {
        const w = host.clientWidth || 400;
        const h = host.clientHeight || 300;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    }
    resize();
    new ResizeObserver(resize).observe(host);
    addEventListener('resize', resize);

    // ====== загрузка модели ======
    const MODEL_BASE = 'assets/models/head/';
    const GLB_NAME = 'royale_wild_chest_v2_clash_royale.glb';
    const placeholderEl = host.querySelector('.model-placeholder');

    function withTimeout(promise, ms, label = 'load') {
        let id;
        const t = new Promise((_, rej) => id = setTimeout(() => rej(new Error(`[3D] ${label} timeout ${ms}ms`)), ms));
        return Promise.race([promise, t]).finally(() => clearTimeout(id));
    }

    function makeGLTFLoader() {
        const loader = new GLTFLoader();
        const draco = new DRACOLoader();
        draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
        loader.setDRACOLoader(draco);
        loader.setMeshoptDecoder(MeshoptDecoder);
        return loader;
    }

    function loadGLB(url) {
        const loader = makeGLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, (e) => {
                if (e.total) console.log(`[3D] ${Math.round(e.loaded / e.total * 100)}%`);
            }, reject);
        });
    }

    async function prefetchAndParse(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`[3D] HTTP ${res.status} for ${url}`);
        const buf = await res.arrayBuffer();
        const blobUrl = URL.createObjectURL(new Blob([buf], { type: 'model/gltf-binary' }));
        try { return await loadGLB(blobUrl); }
        finally { URL.revokeObjectURL(blobUrl); }
    }

    try {
        const url = MODEL_BASE + GLB_NAME;
        let gltf;
        try {
            gltf = await withTimeout(loadGLB(url), 15000, 'GLB load');
        } catch (e1) {
            console.warn('[3D] direct load failed:', e1?.message || e1);
            gltf = await withTimeout(prefetchAndParse(url), 15000, 'prefetch+parse');
        }

        const object3d = gltf.scene;

        // ====== нормализация, центрирование, ориентация ======
        const box = new THREE.Box3().setFromObject(object3d);
        const size = new THREE.Vector3();
        const center = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(center);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        recenterLights(sphere.radius);
        function recenterLights(r) {
            // все таргеты смотрят ровно в центр модели
            key.target.position.set(0, 0, 0);
            fill.target.position.set(0, 0, 0);
            rim.target.position.set(0, 0, 0);

            // позиции масштабируются от размера модели и симметрично её «обнимают»
            key.position.set(1.2 * r, 1.3 * r, 1.6 * r);   // правый верх спереди
            fill.position.set(-1.1 * r, 0.7 * r, 1.2 * r);  // левый заполняющий спереди
            rim.position.set(-0.8 * r, 1.1 * r, -1.5 * r);   // контровой сзади

            key.updateMatrixWorld();
            fill.updateMatrixWorld();
            rim.updateMatrixWorld();
        }
        // pivot в (0,0,0), модель сдвигаем так, чтобы центр стал в нуле
        const pivot = new THREE.Group();
        scene.add(pivot);
        pivot.add(object3d);

        // масштаб — диагональ вписываем в ~4 юнита
        const diag = Math.max(size.length(), 1e-6);
        object3d.scale.setScalar(4.0 / diag);

        // «лицом к камере»
        const FRONT_Y_DEG = 0; // при необходимости: 90, 180, -90
        object3d.rotation.set(0, THREE.MathUtils.degToRad(FRONT_Y_DEG), 0);

        // материалы читаемые с обеих сторон
        object3d.traverse(n => { if (n.isMesh) n.material.side = THREE.DoubleSide; });

        // камера: аккуратное кадрирование по размерам
        function frameObject(cam, objSize, target = new THREE.Vector3(0, 0, 0)) {
            const fov = THREE.MathUtils.degToRad(cam.fov);

            const FIT_MARGIN = 0.24; // было 0.55 → 0.42 → теперь ещё ближе
            const fitH = (objSize.y * FIT_MARGIN) / Math.tan(fov / 2);
            const fitW = (objSize.x * FIT_MARGIN) / (Math.tan(fov / 2) * cam.aspect);
            let dist = Math.max(fitH, fitW);

            const ZOOM = 0.72; // < 1.0 = ближе к объекту; попробуй 0.68…0.8
            dist *= ZOOM;

            cam.position.set(-2, 2, dist); // центр строго по вертикали
            cam.lookAt(target);

            controls.target.copy(target);
            controls.minDistance = dist * 0.4; // чтобы колесо мыши не «влетало» в модель
            controls.maxDistance = dist * 3.0;
            controls.update();
        }
        frameObject(camera, size);

        scene.add(pivot);
        placeholderEl?.remove();
        controls.target.y += 0.05 * size.y;
        camera.lookAt(controls.target);
        controls.update();
        // ====== рендер-цикл ======
        let last = performance.now();
        (function tick(t) {
            const dt = (t - last) / 1000; last = t;
            pivot.rotation.y += dt * 0.1; // лёгкое вращение всей группы
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(tick);
        })(last);

    } catch (err) {
        console.error('[3D] load error:', err);
        if (placeholderEl) placeholderEl.textContent = 'Load error';
    }
});