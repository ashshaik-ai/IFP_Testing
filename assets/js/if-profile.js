/* ===================================================================
   Islamic Front — Learner Profile, Achievements & Roadmap (if-profile.js)
   A site-wide modal (opened from the XP HUD) that aggregates everything
   the platform already tracks — XP/level, lessons completed, quizzes
   passed, streak, time estimate — plus an achievement gallery and a
   learning roadmap (per-portal completion %). No external assets.
   Reads: if-xp, if-<portal>-progress (.done or .levels array, .streak), if-quiz-* (.best).
   Portals wired via if-sublesson.js/if-portal.js write .done; portals with a
   bespoke in-page dashboard (Quran/Salah/Seerah/History/Kids) write .levels —
   doneCount() accepts either so every portal feeds this aggregator.
   =================================================================== */
(function () {
  'use strict';
  var PORTALS = [
    { k: 'kids', en: 'Kids Islam', te: 'పిల్లల ఇస్లాం', total: 6, u: 'knowledge-center/kids-islam/index.html' },
    { k: 'quran', en: 'Learn Quran', te: 'ఖురాన్', total: 6, u: 'knowledge-center/learn-quran/index.html' },
    { k: 'salah', en: 'Learn Salah', te: 'నమాజ్', total: 6, u: 'knowledge-center/learn-salah/index.html' },
    { k: 'seerah', en: 'Seerah', te: 'సీరహ్', total: 6, u: 'knowledge-center/seerah/index.html' },
    { k: 'history', en: 'Islamic History', te: 'ఇస్లామిక్ చరిత్ర', total: 10, u: 'knowledge-center/islamic-history/index.html' },
    { k: 'arabic', en: 'Learn Arabic', te: 'అరబిక్', total: 6, u: 'knowledge-center/learn-arabic/index.html' },
    { k: 'urdu', en: 'Learn Urdu', te: 'ఉర్దూ', total: 6, u: 'knowledge-center/learn-urdu/index.html' }
  ];
  var TOTAL = PORTALS.reduce(function (a, p) { return a + p.total; }, 0);
  var PRE = location.pathname.indexOf('/knowledge-center/') >= 0 ? '../../' : '';

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }

  function doneCount(k) { var s = lsGet('if-' + k + '-progress'); return (s.done || s.levels || []).length; }
  function stats() {
    var lessons = 0, maxStreak = 0;
    PORTALS.forEach(function (p) { lessons += Math.min(doneCount(p.k), p.total); var st = lsGet('if-' + p.k + '-progress').streak || 0; if (st > maxStreak) maxStreak = st; });
    var quizzes = 0;
    try { for (var i = 0; i < localStorage.length; i++) { var key = localStorage.key(i); if (key && key.indexOf('if-quiz-') === 0) { var b = lsGet(key).best || 0; if (b > 0) quizzes++; } } } catch (e) { }
    var xp = (lsGet('if-xp').xp) || 0; var level = Math.floor(xp / 100) + 1;
    var mins = lessons * 5 + quizzes * 3;
    return { lessons: lessons, quizzes: quizzes, streak: maxStreak, xp: xp, level: level, mins: mins };
  }

  function achievements(s) {
    var portalsTouched = 0; PORTALS.forEach(function (p) { if (doneCount(p.k) > 0) portalsTouched++; });
    var poly = doneCount('arabic') > 0 && doneCount('urdu') > 0;
    return [
      { i: '🌱', en: 'First Lesson', te: 'మొదటి పాఠం', on: s.lessons >= 1 },
      { i: '📚', en: 'Five Lessons', te: 'ఐదు పాఠాలు', on: s.lessons >= 5 },
      { i: '🎓', en: 'Ten Lessons', te: 'పది పాఠాలు', on: s.lessons >= 10 },
      { i: '🏅', en: '25 Lessons', te: '25 పాఠాలు', on: s.lessons >= 25 },
      { i: '🏆', en: 'All Lessons', te: 'అన్ని పాఠాలు', on: s.lessons >= TOTAL },
      { i: '✅', en: 'First Quiz', te: 'మొదటి క్విజ్', on: s.quizzes >= 1 },
      { i: '🧠', en: 'Quiz Master', te: 'క్విజ్ మాస్టర్', on: s.quizzes >= 5 },
      { i: '⭐', en: 'Level 5', te: 'స్థాయి 5', on: s.level >= 5 },
      { i: '🌟', en: 'Level 10', te: 'స్థాయి 10', on: s.level >= 10 },
      { i: '🔥', en: '7-Day Streak', te: '7 రోజుల వరుస', on: s.streak >= 7 },
      { i: '🗣️', en: 'Language Learner', te: 'భాషా అభ్యాసకుడు', on: poly },
      { i: '🧭', en: 'Explorer', te: 'అన్వేషకుడు', on: portalsTouched >= 4 }
    ];
  }

  var ov;
  function render() {
    if (!ov) return;
    var T = te(), s = stats(), pct = Math.round(s.lessons / TOTAL * 100);
    var statCards = [
      { n: s.lessons + ' / ' + TOTAL, l: T ? 'పూర్తయిన పాఠాలు' : 'Lessons completed' },
      { n: s.quizzes, l: T ? 'క్విజ్‌లు పాస్' : 'Quizzes passed' },
      { n: s.streak, l: T ? 'రోజుల వరుస' : 'Day streak' },
      { n: '~' + s.mins + (T ? ' నిమి' : ' min'), l: T ? 'సుమారు సమయం' : 'Time invested (approx)' }
    ].map(function (c) { return '<div class="ifpr-stat"><b>' + c.n + '</b><span>' + c.l + '</span></div>'; }).join('');

    var ach = achievements(s).map(function (a) {
      return '<div class="ifpr-badge' + (a.on ? '' : ' locked') + '"><span class="ifpr-bi">' + (a.on ? a.i : '🔒') + '</span><span>' + (T ? a.te : a.en) + '</span></div>';
    }).join('');

    var road = PORTALS.map(function (p) {
      var d = Math.min(doneCount(p.k), p.total), pp = Math.round(d / p.total * 100);
      return '<a class="ifpr-road" href="' + PRE + p.u + '"><div class="ifpr-road-top"><span>' + (T ? p.te : p.en) + '</span><span class="ifpr-road-pct">' + pp + '%</span></div>'
        + '<div class="ifpr-road-bar"><i style="width:' + pp + '%"></i></div><div class="ifpr-road-sub">' + d + ' / ' + p.total + '</div></a>';
    }).join('');

    var nextP = null; for (var ni = 0; ni < PORTALS.length; ni++) { if (doneCount(PORTALS[ni].k) < PORTALS[ni].total) { nextP = PORTALS[ni]; break; } }
    var rec = nextP
      ? '<a class="ifpr-rec" href="' + PRE + nextP.u + '"><span>' + (T ? 'తదుపరి సిఫార్సు' : 'Recommended next') + '</span><b>' + (T ? nextP.te : nextP.en) + ' →</b></a>'
      : '<div class="ifpr-rec done"><b>' + (T ? '🎉 అన్ని పోర్టల్‌లు పూర్తయ్యాయి!' : '🎉 All portals complete!') + '</b></div>';

    ov.querySelector('.ifpr-modal').innerHTML =
      '<div class="ifpr-head"><div><div class="ifpr-eyebrow">' + (T ? 'నా ప్రొఫైల్' : 'My Profile') + '</div>'
      + '<div class="ifpr-level">' + (T ? 'స్థాయి ' : 'Level ') + s.level + '</div>'
      + '<div class="ifpr-xp">' + s.xp + ' XP · ' + pct + (T ? '% పూర్తి' : '% complete') + '</div></div>'
      + '<button type="button" class="ifpr-x" aria-label="Close">✕</button></div>'
      + '<div class="ifpr-stats">' + statCards + '</div>' + rec
      + '<div class="ifpr-sec-h">' + (T ? 'విజయాలు' : 'Achievements') + '</div><div class="ifpr-badges">' + ach + '</div>'
      + '<div class="ifpr-sec-h">' + (T ? 'అభ్యాస మార్గం' : 'Learning roadmap') + '</div><div class="ifpr-roads">' + road + '</div>';
    ov.querySelector('.ifpr-x').addEventListener('click', close);
  }

  function build() {
    if (ov) return;
    ov = document.createElement('div'); ov.id = 'ifpr-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="ifpr-modal"></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(ov.querySelectorAll('a[href],button,input,[tabindex]:not([tabindex="-1"])'), function (el) { return el.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    document.body.appendChild(ov);
  }
  function open() { build(); render(); ov.classList.add('on'); var x = ov.querySelector('.ifpr-x'); if (x) setTimeout(function () { x.focus(); }, 30); }
  function close() { if (ov) ov.classList.remove('on'); var hud = document.getElementById('ifxp'); if (hud) hud.focus(); }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.IFProfile = { open: open, close: close };
  new MutationObserver(function () { if (ov && ov.classList.contains('on')) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
