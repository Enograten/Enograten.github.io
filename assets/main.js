
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
    heroEl.addEventListener(
        'touchmove',
        e => {
            const t = e.touches?.[0];
            if (t) moveSpotlight(t.clientX, t.clientY);
        },
        { passive: true }
    );
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
    if (!sparklesContainer) return;

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

if (sparklesContainer) {
    setInterval(createSparkle, 160);
}

// -------------------- Projects: tilt + reveal --------------------
(function () {
    const cards = document.querySelectorAll('.projects .project-card');
    if (!cards.length) return;

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
        if (!lightbox) return;

        const lightboxImg = lightbox.querySelector('.lightbox-img');
        if (lightboxImg) lightboxImg.src = img.src;

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
    });
});

const lightbox = document.getElementById('lightbox');
const closeBtn = lightbox?.querySelector('.lightbox-close');
const backdrop = lightbox?.querySelector('.lightbox-backdrop');

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
}

closeBtn?.addEventListener('click', closeLightbox);
backdrop?.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

// -------------------- Skills: show 4 + toggle --------------------
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('skillsGrid');
    const btn = document.querySelector('.skills-toggle');

    if (!grid || !btn) return;

    const items = grid.querySelectorAll('.skill');
    if (items.length <= 4) {
        btn.style.display = 'none';
        return;
    }

    const setExpanded = (expanded) => {
        grid.classList.toggle('is-expanded', expanded);
        btn.setAttribute('aria-expanded', String(expanded));

        btn.innerHTML = expanded
            ? '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i> Hide skills'
            : '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i> View all skills';
    };

    btn.addEventListener('click', () => {
        const expanded = grid.classList.contains('is-expanded');
        setExpanded(!expanded);
    });
});
