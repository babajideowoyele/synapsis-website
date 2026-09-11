// SYNAPSIS Dark Mode Toggle
(function() {
    // Apply saved theme immediately to prevent flash
    if (localStorage.getItem('synapsis-theme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
})();

function toggleTheme() {
    document.documentElement.classList.toggle('dark');
    var isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('synapsis-theme', isDark ? 'dark' : 'light');
}

// Mobile navigation
function toggleMobileMenu() {
    var menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

// Auto-close mobile menu when window resizes to desktop (Tailwind md = 768px)
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        var menu = document.getElementById('mobile-menu');
        if (menu && !menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    }
});

// Reading progress bar — injected dynamically so it works on every page
document.addEventListener('DOMContentLoaded', function() {
    var bar = document.createElement('div');
    bar.setAttribute('aria-hidden', 'true');
    bar.className = 'reading-progress-bar';
    document.body.insertBefore(bar, document.body.firstChild);
    function update() {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
});

// Header transparency — only on pages with class "has-hero" on <body>
document.addEventListener('DOMContentLoaded', function() {
    var header = document.querySelector('header');
    if (!header || !document.body.classList.contains('has-hero')) return;
    header.classList.add('header-transparent');
    function onScroll() {
        if (window.scrollY > 50) {
            header.classList.remove('header-transparent');
            header.classList.add('header-solid');
        } else {
            header.classList.add('header-transparent');
            header.classList.remove('header-solid');
        }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
});

// Stats counter — counts up when scrolled into view
document.addEventListener('DOMContentLoaded', function() {
    var counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var target = parseInt(el.dataset.count, 10);
            var prefix = el.dataset.prefix || '';
            var suffix = el.dataset.suffix || '';
            var duration = 1000;
            var start = performance.now();
            function tick(now) {
                var p = Math.min((now - start) / duration, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = prefix + Math.round(eased * target) + suffix;
                if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            io.unobserve(el);
        });
    }, { threshold: 0.6 });
    counters.forEach(function(el) { io.observe(el); });
});

// Scroll reveal via IntersectionObserver
document.addEventListener('DOMContentLoaded', function() {
    var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
            if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(function(el) { io.observe(el); });
});

// Inline logo SVGs so SMIL animations play (blocked in <img> tags)
document.addEventListener('DOMContentLoaded', function() {
    var imgs = document.querySelectorAll('img[src$="logo-mark.svg"]');
    if (!imgs.length) return;
    fetch(imgs[0].src)
        .then(function(r) { return r.text(); })
        .then(function(svgText) {
            var parser = new DOMParser();
            imgs.forEach(function(img) {
                var doc = parser.parseFromString(svgText, 'image/svg+xml');
                var svg = doc.querySelector('svg');
                if (!svg) return;
                svg.setAttribute('class', img.className);
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                img.parentNode.replaceChild(svg, img);
            });
        });
});
