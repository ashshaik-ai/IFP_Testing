/* ===================================================================
   Islamic Front — Visual Guide (diagrams & schematic maps)  if-diagrams.js
   Reusable, additive, static-friendly (inline SVG, no external assets).
   Opt-in via window.IF_DIAGRAMS (set before this deferred script):
     window.IF_DIAGRAMS = {
       title_en, title_te, sub_en, sub_te,
       items:[ { cap_en, cap_te, svg:'<svg ...>...</svg>' }, ... ]
     };
   Bilingual captions; injects a "Visual Guide" section near the lessons.
   Maps are intentionally schematic (educational aids, not to scale).
   =================================================================== */
(function () {
  'use strict';
  var CFG = window.IF_DIAGRAMS;
  if (!CFG || !CFG.items || !CFG.items.length) return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }

  function paint() {
    var grid = document.getElementById('ifd-grid'); if (!grid) return;
    var te = lang() === 'te';
    grid.innerHTML = CFG.items.map(function (d) {
      return '<figure class="ifd-fig">' + d.svg + '<figcaption class="ifd-cap">' + (te ? d.cap_te : d.cap_en) + '</figcaption></figure>';
    }).join('');
  }
  function paintShell() {
    var te = lang() === 'te';
    var t = document.querySelector('#if-diagrams .ifd-title'); if (t) t.textContent = te ? (CFG.title_te || 'దృశ్య మార్గదర్శిని') : (CFG.title_en || 'Visual Guide');
    var l = document.querySelector('#if-diagrams .ifd-label'); if (l) l.textContent = te ? 'దృశ్య మార్గదర్శిని' : 'Visual Guide';
    var s = document.querySelector('#if-diagrams .ifd-sub'); if (s) s.textContent = te ? (CFG.sub_te || '') : (CFG.sub_en || '');
  }

  function inject() {
    if (document.getElementById('if-diagrams')) { paint(); return; }
    var te = lang() === 'te';
    var sec = document.createElement('section'); sec.id = 'if-diagrams'; sec.className = 'ifd-sec'; sec.setAttribute('aria-label', 'Visual guide');
    sec.innerHTML = '<div class="ifd-inner">'
      + '<div class="ifd-label">' + (te ? 'దృశ్య మార్గదర్శిని' : 'Visual Guide') + '</div>'
      + '<h2 class="ifd-title">' + (te ? (CFG.title_te || 'దృశ్య మార్గదర్శిని') : (CFG.title_en || 'Visual Guide')) + '</h2>'
      + '<p class="ifd-sub">' + (te ? (CFG.sub_te || '') : (CFG.sub_en || '')) + '</p>'
      + '<div class="ifd-grid" id="ifd-grid"></div></div>';
    var anchor = document.getElementById('if-lessons') || document.getElementById('if-quiz') || document.getElementById('if-flashcards') || document.getElementById('if-refs') || document.querySelector('footer.lu-footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor); else document.body.appendChild(sec);
    paint();
  }

  function boot() { inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(function () { paint(); paintShell(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
