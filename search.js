// SYNAPSIS Site Search
(function () {
    var searchIndex = null;
    var overlay = null;
    var input = null;
    var resultsContainer = null;
    var isOpen = false;
    var selectedIdx = -1;
    var debounceTimer = null;

    // Detect base path for pages in subdirectories
    var basePath = window.location.pathname.indexOf('/survey/') !== -1 ? '../' : '';

    function loadIndex(cb) {
        if (searchIndex) { cb(); return; }
        fetch(basePath + 'search-index.json')
            .then(function (r) { return r.json(); })
            .then(function (data) { searchIndex = data; cb(); })
            .catch(function (err) { console.error('Search index load failed:', err); });
    }

    function search(query) {
        if (!searchIndex || !query.trim()) return [];
        var terms = query.toLowerCase().trim().split(/\s+/);
        var results = [];

        searchIndex.forEach(function (page) {
            page.sections.forEach(function (section) {
                var hay = [page.title, section.heading, section.description, section.keywords.join(' ')].join(' ').toLowerCase();
                var allMatch = terms.every(function (t) { return hay.indexOf(t) !== -1; });
                if (!allMatch) return;

                var score = 0;
                terms.forEach(function (t) {
                    if (section.heading.toLowerCase().indexOf(t) !== -1) score += 10;
                    if (section.keywords.join(' ').toLowerCase().indexOf(t) !== -1) score += 5;
                    if (page.title.toLowerCase().indexOf(t) !== -1) score += 3;
                    if (section.description.toLowerCase().indexOf(t) !== -1) score += 2;
                });

                results.push({
                    page: page.title,
                    url: basePath + page.page + section.anchor,
                    heading: section.heading,
                    description: section.description,
                    score: score
                });
            });
        });

        results.sort(function (a, b) { return b.score - a.score; });
        return results.slice(0, 8);
    }

    function buildModal() {
        overlay = document.createElement('div');
        overlay.className = 'search-overlay';

        var dialog = document.createElement('div');
        dialog.className = 'search-dialog';

        // Header
        var header = document.createElement('div');
        header.className = 'search-header';
        header.innerHTML = '<i class="fas fa-search"></i>';
        input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search SYNAPSIS\u2026';
        header.appendChild(input);
        var kbd = document.createElement('kbd');
        kbd.textContent = 'ESC';
        header.appendChild(kbd);
        dialog.appendChild(header);

        // Results
        resultsContainer = document.createElement('div');
        resultsContainer.className = 'search-results';
        dialog.appendChild(resultsContainer);

        // Footer
        var footer = document.createElement('div');
        footer.className = 'search-footer';
        footer.innerHTML =
            '<span><kbd>\u2191\u2193</kbd> Navigate</span>' +
            '<span><kbd>\u21B5</kbd> Open</span>' +
            '<span><kbd>Esc</kbd> Close</span>';
        dialog.appendChild(footer);

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Events
        input.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                selectedIdx = -1;
                renderResults(search(input.value));
            }, 150);
        });

        input.addEventListener('keydown', function (e) {
            var items = resultsContainer.querySelectorAll('.search-result');
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
                updateActive(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIdx = Math.max(selectedIdx - 1, 0);
                updateActive(items);
            } else if (e.key === 'Enter' && selectedIdx >= 0 && items[selectedIdx]) {
                e.preventDefault();
                items[selectedIdx].click();
            }
        });

        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeSearch();
        });
    }

    function updateActive(items) {
        for (var i = 0; i < items.length; i++) {
            items[i].classList.toggle('active', i === selectedIdx);
        }
        if (items[selectedIdx]) {
            items[selectedIdx].scrollIntoView({ block: 'nearest' });
        }
    }

    function renderResults(results) {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = '';

        if (!input.value.trim()) {
            resultsContainer.innerHTML = '<div class="search-empty">Start typing to search across all pages</div>';
            return;
        }
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-empty">No results found</div>';
            return;
        }

        results.forEach(function (r) {
            var a = document.createElement('a');
            a.href = r.url;
            a.className = 'search-result';
            a.innerHTML =
                '<div class="search-result-page">' + r.page + '</div>' +
                '<div class="search-result-heading">' + escapeHtml(r.heading) + '</div>' +
                '<div class="search-result-excerpt">' + escapeHtml(r.description) + '</div>';
            a.addEventListener('click', function () { closeSearch(); });
            resultsContainer.appendChild(a);
        });
    }

    function escapeHtml(str) {
        var d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function openSearch() {
        if (!overlay) buildModal();
        loadIndex(function () {
            overlay.classList.add('open');
            isOpen = true;
            input.value = '';
            selectedIdx = -1;
            renderResults([]);
            input.focus();
            document.body.style.overflow = 'hidden';
        });
    }

    function closeSearch() {
        if (!overlay) return;
        overlay.classList.remove('open');
        isOpen = false;
        document.body.style.overflow = '';
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
            return;
        }
        if (e.key === '/' && !isInputFocused()) {
            e.preventDefault();
            openSearch();
            return;
        }
        if (e.key === 'Escape' && isOpen) {
            closeSearch();
        }
    });

    function isInputFocused() {
        var el = document.activeElement;
        return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    }

    window.openSearch = openSearch;
})();
