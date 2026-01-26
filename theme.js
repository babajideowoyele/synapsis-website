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
