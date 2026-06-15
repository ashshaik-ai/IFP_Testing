/* ===================================================================
   Islamic Front — Visual Learning section (if-visuals.js)
   Reads window.IF_VISUALS_DB (keyed by portal folder) and injects a
   "Visual Learning" section after #if-lessons, filled with if-media
   placeholder slots (maps, timelines, diagrams, infographics, etc.).
   Premium placeholders now; real assets drop in via data-src later.
   Bilingual via <html lang>.
   =================================================================== */
(function () {
  'use strict';
  var DB = window.IF_VISUALS_DB;
  if (!DB) return;
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  var folder = parts[parts.length - 2] || '';
  var CFG = DB[folder];
  if (!CFG || !CFG.items || !CFG.items.length) return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  var root;

  function render() {
    if (!root) return;
    var T = te();
    var slots = CFG.items.map(function (m) {
      return '<div data-if-media="' + m.type + '"' + (m.src ? (' data-src="' + m.src + '"') : '') + ' data-label-en="' + m.en + '" data-label-te="' + m.te + '"></div>';
    }).join('');
    root.innerHTML = '<div class="ifv-inner">'
      + '<div class="ifp-label">' + (T ? 'దృశ్య అభ్యాసం' : 'Visual Learning') + '</div>'
      + '<h2 class="ifv-title">' + (T ? (CFG.title_te || 'దృశ్య అభ్యాసం') : (CFG.title_en || 'Visual Learning')) + '</h2>'
      + '<div class="ifv-grid">' + slots + '</div></div>';
    if (window.IFMedia) IFMedia.refresh();
  }

  function inject() {
    if (document.getElementById('if-visuals')) return;
    var sec = document.createElement('section');
    sec.id = 'if-visuals'; sec.className = 'ifv-sec'; sec.setAttribute('aria-label', 'Visual Learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons.nextSibling);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else { document.body.appendChild(sec); } }
    root = sec;
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
