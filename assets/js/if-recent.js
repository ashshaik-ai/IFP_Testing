/* ===================================================================
   Islamic Front — Continue Learning + Recently Visited strip (if-recent.js)
   Config-free. For portal index pages that use if-lesson (the model
   portals). Injects a compact strip above #if-lessons:
     • Continue learning  (resume the most recent in-portal lesson, or
       jump to lessons on a first visit)
     • Recently visited   (other in-portal pages, from IFEngage history)
   Schema-agnostic (uses IFEngage sitewide history) so it never collides
   with the existing per-portal progress dashboard. Bilingual via <html lang>.
   =================================================================== */
(function () {
  'use strict';
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  var here = location.pathname.replace(/[^/]*$/, '');
  var cur = location.pathname + location.hash;
  var root;

  function recentList() {
    if (!(window.IFEngage && IFEngage.getRecent)) return [];
    return IFEngage.getRecent().filter(function (x) { return x.url && x.url.indexOf(here) === 0 && x.url !== cur; }).slice(0, 5);
  }
  function clean(t) { return (t || '').replace(/\s*[–—|].*$/, '').trim(); }

  function render() {
    if (!root) return;
    var T = te();
    var rec = recentList();
    var cont = rec.length
      ? '<a class="ifx-btn ifx-btn-primary" href="' + rec[0].url + '">' + (T ? 'కొనసాగించు: ' : 'Continue: ') + clean(rec[0].title) + ' →</a>'
      : '<a class="ifx-btn ifx-btn-primary" href="#if-lessons">' + (T ? 'పాఠాలు ప్రారంభించండి →' : 'Start lessons →') + '</a>';
    var chips = rec.slice(1).map(function (x) { return '<a class="ifp-chip" href="' + x.url + '">' + clean(x.title) + '</a>'; }).join('');
    root.innerHTML = '<div class="ifrc-bar">'
      + '<div class="ifrc-left"><span class="ifp-mini">' + (T ? 'మీ అభ్యాసం' : 'Your learning') + '</span>' + cont + '</div>'
      + (chips ? '<div class="ifrc-recent"><span class="ifp-mini">' + (T ? 'ఇటీవల చూసినవి' : 'Recently visited') + '</span><div class="ifp-chips">' + chips + '</div></div>' : '')
      + '</div>';
  }

  function inject() {
    if (document.getElementById('if-recent')) return;
    var sec = document.createElement('section');
    sec.id = 'if-recent'; sec.className = 'ifrc-sec'; sec.setAttribute('aria-label', 'Continue learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else return; }
    root = sec;
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
