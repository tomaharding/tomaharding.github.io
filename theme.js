// Light/dark theme. Loaded in <head> without "defer" so the saved theme
// is applied before the page paints (no flash of the wrong colours).
(function () {
  var root = document.documentElement;
  root.classList.add('js'); // lets CSS show JS-only controls, like the mobile menu button
  var COLORS = { light: '#f8f8f5', dark: '#0d1117' };

  function saved() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  function apply(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', COLORS[theme === 'dark' ? 'dark' : 'light']);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var isDark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  // Light by default; dark only if the visitor chose it before.
  if (saved() === 'dark') root.setAttribute('data-theme', 'dark');

  document.addEventListener('DOMContentLoaded', function () {
    apply(saved() === 'dark' ? 'dark' : 'light');
    var btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  });
})();
