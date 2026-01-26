// SYNAPSIS Interactive Features
document.addEventListener('DOMContentLoaded', function () {

    // ── Scroll Reveal ──────────────────────────────────────────
    var sections = document.querySelectorAll('section');
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(function (s) {
        var rect = s.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.75) {
            s.classList.add('reveal');
            revealObserver.observe(s);
        }
    });

    // ── Stat Counter Animation ─────────────────────────────────
    var statEl = document.querySelector('.stat-number');
    var statsSection = statEl ? statEl.closest('section') : null;

    if (statsSection) {
        var statObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    setTimeout(animateStats, 200);
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        statObserver.observe(statsSection);
    }

    function animateStats() {
        document.querySelectorAll('.stat-number').forEach(function (el) {
            var text = el.textContent.trim();
            var match = text.match(/^([^\d]*)([\d]+)([^\d]*)$/);
            if (!match) return;
            var prefix = match[1];
            var target = parseInt(match[2]);
            var suffix = match[3];
            var duration = 1500;
            var start = performance.now();

            function update(now) {
                var elapsed = now - start;
                var progress = Math.min(elapsed / duration, 1);
                var eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = prefix + Math.round(target * eased) + suffix;
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // ── Mobile Menu ────────────────────────────────────────────
    var menuBtn = document.querySelector('header button.md\\:hidden');
    var desktopNav = document.querySelector('header .hidden.md\\:flex');
    if (!menuBtn || !desktopNav) return;

    var navLinks = desktopNav.querySelectorAll('a');

    // Build overlay
    var overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';

    var top = document.createElement('div');
    top.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:2.5rem;';
    top.innerHTML =
        '<a href="index.html" style="display:flex;align-items:center;gap:0.5rem;font-size:1.25rem;font-weight:600;letter-spacing:-0.025em;color:var(--color-text);text-decoration:none;">' +
        '<img src="logo-mark.svg" alt="" style="height:1.75rem;width:auto;"> SYNAPSIS</a>' +
        '<button style="font-size:1.5rem;background:none;border:none;color:var(--color-text);cursor:pointer;" aria-label="Close menu">' +
        '<i class="fas fa-times"></i></button>';
    overlay.appendChild(top);

    var nav = document.createElement('nav');
    nav.style.cssText = 'display:flex;flex-direction:column;gap:1.5rem;';
    navLinks.forEach(function (a) {
        var link = document.createElement('a');
        link.href = a.getAttribute('href');
        link.textContent = a.textContent;
        link.style.cssText = 'font-size:1.125rem;font-weight:500;color:var(--color-text);text-decoration:none;padding:0.5rem 0;border-bottom:1px solid var(--color-border);';
        nav.appendChild(link);
    });
    overlay.appendChild(nav);
    document.body.appendChild(overlay);

    menuBtn.addEventListener('click', function () {
        overlay.classList.add('open');
    });
    top.querySelector('button').addEventListener('click', function () {
        overlay.classList.remove('open');
    });
    nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
            overlay.classList.remove('open');
        });
    });
});
