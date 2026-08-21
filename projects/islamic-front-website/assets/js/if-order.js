/* ===================================================================
   Islamic Front — Canonical portal ordering (if-order.js)
   Reorders portal-card grids to ONE educational sequence everywhere,
   at runtime, without touching fragile static markup:
     Kids -> Quran -> Salah -> Seerah -> History -> Arabic -> Urdu
   Scoped strictly to known portal-card containers. Cards that are not
   one of the seven (e.g. "Duas & Adhkar", "Learn Wudu") sort after them,
   keeping their relative order. Runs once.
   =================================================================== */
(function () {
  'use strict';
  var RANK = ['kids-islam', 'learn-quran', 'learn-salah', 'seerah', 'islamic-history', 'learn-arabic', 'learn-urdu'];
  var NAME = [/kids/i, /quran/i, /salah|wudu/i, /seerah/i, /history/i, /arabic/i, /urdu/i];

  function hrefOf(el) {
    if (el.getAttribute) { var h = el.getAttribute('href'); if (h) return h; }
    var a = el.querySelector ? el.querySelector('a[href]') : null;
    return a ? a.getAttribute('href') : '';
  }
  function rankOf(el) {
    var h = hrefOf(el) || '';
    for (var i = 0; i < RANK.length; i++) { if (h.indexOf(RANK[i]) >= 0) return i; }
    var txt = (el.textContent || '') + ' ' + (el.innerHTML || '');
    for (var j = 0; j < NAME.length; j++) { if (NAME[j].test(txt)) return j; }
    return 50;
  }
  function reorder(container) {
    if (!container || container.getAttribute('data-ifo')) return;
    var kids = Array.prototype.slice.call(container.children);
    if (kids.length < 2) return;
    kids.map(function (el, idx) { return { el: el, r: rankOf(el), i: idx }; })
      .sort(function (a, b) { return a.r - b.r || a.i - b.i; })
      .forEach(function (o) { container.appendChild(o.el); });
    container.setAttribute('data-ifo', '1');
  }
  function comingLast() {
    // "All Islamic Learning Modules" must be the final section, after all
    // injected learning content (lessons, quiz, flashcards, visuals, refs).
    var coming = document.getElementById('coming');
    var footer = document.querySelector('footer.lu-footer') || document.querySelector('footer');
    if (coming && footer && footer.parentNode && coming !== footer.previousElementSibling) {
      footer.parentNode.insertBefore(coming, footer);
    }
  }
  function run() {
    document.querySelectorAll('.coming-grid, .ld-portal-list, .ifo-portals').forEach(reorder);
    comingLast();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
