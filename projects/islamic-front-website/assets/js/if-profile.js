/* ===================================================================
   Islamic Front — Learner Profile, Achievements & Roadmap.
   Catalog-aware aggregator for XP, progress, quizzes, streaks, SRS review,
   and privacy-safe sharing. Reads existing localStorage only.
   =================================================================== */
(function () {
  'use strict';

  var FALLBACK_PORTALS = [
    { k: 'kids', en: 'Kids Islam', te: 'పిల్లల ఇస్లాం', total: 6, u: 'knowledge-center/kids-islam/index.html' },
    { k: 'quran', en: 'Learn Quran', te: 'ఖురాన్', total: 6, u: 'knowledge-center/learn-quran/index.html' },
    { k: 'salah', en: 'Learn Salah', te: 'నమాజ్', total: 6, u: 'knowledge-center/learn-salah/index.html' },
    { k: 'seerah', en: 'Seerah', te: 'సీరహ్', total: 6, u: 'knowledge-center/seerah/index.html' },
    { k: 'history', en: 'Islamic History', te: 'ఇస్లామిక్ చరిత్ర', total: 10, u: 'knowledge-center/islamic-history/index.html' },
    { k: 'arabic', en: 'Learn Arabic', te: 'అరబిక్', total: 6, u: 'knowledge-center/learn-arabic/index.html', srsDeck: 'arabic-letters' },
    { k: 'urdu', en: 'Learn Urdu', te: 'ఉర్దూ', total: 6, u: 'knowledge-center/learn-urdu/index.html', srsDeck: 'urdu-letters' }
  ];
  var PRE = location.pathname.indexOf('/knowledge-center/') >= 0 ? '../../' : '';
  var ov;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function lsGet(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } }
  function portals() {
    var C = window.IF_SITE_CATALOG;
    if (!C || !C.portals || !C.portals.length) return FALLBACK_PORTALS;
    return C.portals.map(function (p) {
      return { k: p.id, en: p.title_en, te: p.title_te, total: p.total || 0, u: p.url, progressKey: p.progressKey, srsDeck: p.srsDeck };
    });
  }
  function total(list) { return list.reduce(function (a, p) { return a + (p.total || 0); }, 0); }
  function progressStore(p) { return lsGet(p.progressKey || ('if-' + p.k + '-progress')); }
  function doneCount(p) { var s = progressStore(p); return (s.done || s.levels || []).length; }

  function stats() {
    var list = portals(), lessons = 0, maxStreak = 0;
    list.forEach(function (p) {
      lessons += Math.min(doneCount(p), p.total);
      var st = progressStore(p).streak || 0;
      if (st > maxStreak) maxStreak = st;
    });
    var quizzes = 0;
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key && key.indexOf('if-quiz-') === 0 && (lsGet(key).best || 0) > 0) quizzes++;
      }
    } catch (e) {}
    var xp = (lsGet('if-xp').xp) || 0;
    var level = Math.floor(xp / 100) + 1;
    return { lessons: lessons, quizzes: quizzes, streak: maxStreak, xp: xp, level: level, mins: lessons * 5 + quizzes * 3 };
  }

  function dueReviewUrl(list) {
    var now = Date.now();
    for (var i = 0; i < list.length; i++) {
      var deck = list[i].srsDeck;
      if (!deck) continue;
      var s = lsGet('if-srs-' + deck);
      for (var id in s) {
        if (s[id] && typeof s[id].due === 'number' && s[id].due <= now) return list[i].u + '#if-flashcards';
      }
    }
    return '';
  }
  function dueCardCount(list) {
    var now = Date.now(), total = 0;
    for (var i = 0; i < list.length; i++) {
      var deck = list[i].srsDeck;
      if (!deck) continue;
      var s = lsGet('if-srs-' + deck);
      for (var id in s) { if (s[id] && typeof s[id].due === 'number' && s[id].due <= now) total++; }
    }
    return total;
  }

  function achievements(s, list) {
    var portalsTouched = list.filter(function (p) { return doneCount(p) > 0; }).length;
    var byKey = {}; list.forEach(function (p) { byKey[p.k] = p; });
    var poly = byKey.arabic && byKey.urdu && doneCount(byKey.arabic) > 0 && doneCount(byKey.urdu) > 0;
    var all = total(list);
    var S = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
    return [
      { i: S + '<path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/></svg>', en: 'First Lesson', te: 'మొదటి పాఠం', on: s.lessons >= 1 },
      { i: S + '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/><path d="M8 7h8M8 11h5"/></svg>', en: 'Five Lessons', te: 'ఐదు పాఠాలు', on: s.lessons >= 5 },
      { i: S + '<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>', en: 'Ten Lessons', te: 'పది పాఠాలు', on: s.lessons >= 10 },
      { i: S + '<circle cx="12" cy="8" r="6"/><path d="M12 14l-4 8h8z"/></svg>', en: '25 Lessons', te: '25 పాఠాలు', on: s.lessons >= 25 },
      { i: S + '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>', en: 'All Lessons', te: 'అన్ని పాఠాలు', on: s.lessons >= all },
      { i: S + '<polyline points="20 6 9 17 4 12"/></svg>', en: 'First Quiz', te: 'మొదటి క్విజ్', on: s.quizzes >= 1 },
      { i: S + '<path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4m-6 0V9"/></svg>', en: 'Quiz Master', te: 'క్విజ్ మాస్టర్', on: s.quizzes >= 5 },
      { i: S + '<path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>', en: 'Level 10', te: 'స్థాయి 10', on: s.level >= 10 },
      { i: S + '<path d="M12 2C9 8 6 10 6 14a6 6 0 0 0 12 0c0-4-3-6-6-12z"/></svg>', en: '7-Day Streak', te: '7 రోజుల వరుస', on: s.streak >= 7 },
      { i: S + '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>', en: 'Language Learner', te: 'భాషా అభ్యాసకుడు', on: poly },
      { i: S + '<circle cx="12" cy="12" r="9"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>', en: 'Explorer', te: 'అన్వేషకుడు', on: portalsTouched >= 4 }
    ];
  }

  function render() {
    if (!ov) return;
    var T = te(), list = portals(), all = total(list), s = stats(), pct = all ? Math.round(s.lessons / all * 100) : 0;
    var statCards = [
      { n: s.lessons + ' / ' + all, l: T ? 'పూర్తయిన పాఠాలు' : 'Lessons completed' },
      { n: s.quizzes, l: T ? 'క్విజ్‌లు పాస్' : 'Quizzes passed' },
      { n: s.streak, l: T ? 'రోజుల వరుస' : 'Day streak' },
      { n: '~' + s.mins + (T ? ' నిమి' : ' min'), l: T ? 'సుమారు సమయం' : 'Time invested' }
    ].map(function (c) { return '<div class="ifpr-stat"><b>' + c.n + '</b><span>' + c.l + '</span></div>'; }).join('');

    var ach = achievements(s, list).map(function (a) {
      return '<div class="ifpr-badge' + (a.on ? '' : ' locked') + '"><span class="ifpr-bi">' + (a.on ? a.i : '🔒') + '</span><span>' + (T ? a.te : a.en) + '</span></div>';
    }).join('');

    var road = list.map(function (p) {
      var d = Math.min(doneCount(p), p.total), pp = p.total ? Math.round(d / p.total * 100) : 0;
      return '<a class="ifpr-road" href="' + PRE + p.u + '"><div class="ifpr-road-top"><span>' + (T ? p.te : p.en) + '</span><span class="ifpr-road-pct">' + pp + '%</span></div>'
        + '<div class="ifpr-road-bar"><i style="width:' + pp + '%"></i></div><div class="ifpr-road-sub">' + d + ' / ' + p.total + '</div></a>';
    }).join('');

    var nextP = null;
    for (var ni = 0; ni < list.length; ni++) if (doneCount(list[ni]) < list[ni].total) { nextP = list[ni]; break; }
    var rec = nextP
      ? '<a class="ifpr-rec" href="' + PRE + nextP.u + '"><span>' + (T ? 'తదుపరి సిఫార్సు' : 'Recommended next') + '</span><b>' + (T ? nextP.te : nextP.en) + ' →</b></a>'
      : '<div class="ifpr-rec done"><b>' + (T ? 'అన్ని పోర్టల్‌లు పూర్తయ్యాయి!' : 'All portals complete!') + '</b></div>';
    var due = dueReviewUrl(list);
    var dueN = due ? dueCardCount(list) : 0;
    var dueLabel = dueN > 0 ? (T ? dueN + ' కార్డులు సిద్ధంగా ఉన్నాయి' : dueN + ' card' + (dueN === 1 ? '' : 's') + ' due') : (T ? 'రివ్యూ సిద్ధంగా ఉంది' : 'Review ready');
    var review = due ? '<a class="ifpr-rec ifpr-review" href="' + PRE + due + '"><span>' + dueLabel + '</span><b>' + (T ? 'ఫ్లాష్‌కార్డులు చూడండి →' : 'Review flashcards →') + '</b></a>' : '';

    ov.querySelector('.ifpr-modal').innerHTML =
      '<div class="ifpr-head"><div><div class="ifpr-eyebrow">' + (T ? 'నా ప్రొఫైల్' : 'My Profile') + '</div>'
      + '<div class="ifpr-level">' + (T ? 'స్థాయి ' : 'Level ') + s.level + '</div>'
      + '<div class="ifpr-xp">' + s.xp + ' XP · ' + pct + (T ? '% పూర్తి' : '% complete') + '</div></div>'
      + '<div class="ifpr-head-actions"><button type="button" class="ifpr-share">' + (T ? 'పంచుకోండి' : 'Share') + '</button><button type="button" class="ifpr-x" aria-label="Close">×</button></div></div>'
      + '<div class="ifpr-stats">' + statCards + '</div>' + rec + review
      + '<div class="ifpr-sec-h">' + (T ? 'విజయాలు' : 'Achievements') + '</div><div class="ifpr-badges">' + ach + '</div>'
      + '<div class="ifpr-sec-h">' + (T ? 'అభ్యాస మార్గం' : 'Learning roadmap') + '</div><div class="ifpr-roads">' + road + '</div>';
    ov.querySelector('.ifpr-x').addEventListener('click', close);
    ov.querySelector('.ifpr-share').addEventListener('click', function () { if (window.IFShare) IFShare.shareProgress(s); });
  }

  function build() {
    if (ov) return;
    ov = document.createElement('div');
    ov.id = 'ifpr-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
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
  var _trigger = null;
  function open() { _trigger = document.activeElement; build(); render(); ov.classList.add('on'); var x = ov.querySelector('.ifpr-x'); if (x) setTimeout(function () { x.focus(); }, 30); }
  function close() { if (ov) ov.classList.remove('on'); var t = _trigger; _trigger = null; if (t && t.focus) { t.focus(); } else { var hud = document.getElementById('ifxp'); if (hud) hud.focus(); } }

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.IFProfile = { open: open, close: close };
  new MutationObserver(function () { if (ov && ov.classList.contains('on')) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
