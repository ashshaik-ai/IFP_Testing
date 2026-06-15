/* ===================================================================
   Islamic Front — Portal platform (if-portal.js)
   Reusable learning-dashboard that brings any portal to feature parity:
   progress ring, completion tracking, streak, daily challenge,
   continue-learning, recommended-next, recently-visited, achievement
   badges, and an all-complete celebration + certificate.
   Opt in by defining window.IF_PORTAL BEFORE this deferred script:
     window.IF_PORTAL = {
       key:'arabic', name_en, name_te,
       lessons:[ {id:'alphabet', en:'The Arabic Alphabet', te:'...'} , ... ],
       challenges:[ {en, te}, ... ],            // optional, rotated daily
       badges:[ {id, en, te, icon, need?, streak?} ]  // optional (defaults provided)
     };
   Uses window.IFEngage (rings/celebrate/badge/recent) + window.IFCore
   (lang/certificate). Persists to localStorage if-<key>-progress.
   Renders ABOVE #if-lessons (load this AFTER if-lesson.js).
   =================================================================== */
(function () {
  'use strict';
  var CFG = window.IF_PORTAL;
  if (!CFG || !CFG.lessons || !CFG.lessons.length) return;

  var KEY = 'if-' + CFG.key + '-progress';
  var N = CFG.lessons.length;
  var E = window.IFEngage || null;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function dayNum() { var d = new Date(); return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 864e5); }
  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var state = load();
  state.done = state.done || [];
  state.done = state.done.filter(function (id) { return CFG.lessons.some(function (l) { return l.id === id; }); });
  (function streak() {
    var t = today();
    if (state.lastDay !== t) {
      var y = new Date(); y.setDate(y.getDate() - 1);
      var ys = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
      state.streak = (state.lastDay === ys) ? (state.streak || 0) + 1 : 1;
      state.lastDay = t; save(state);
    } else { state.streak = state.streak || 1; }
  })();

  var DEFAULT_BADGES = [
    { id: 'first', en: 'First Lesson', te: 'మొదటి పాఠం', icon: '🌱', need: 1 },
    { id: 'half', en: 'Halfway There', te: 'సగం పూర్తి', icon: '📚', need: Math.ceil(N / 2) },
    { id: 'all', en: 'All Lessons', te: 'అన్ని పాఠాలు', icon: '🏆', need: N },
    { id: 's3', en: '3-Day Streak', te: '3 రోజుల వరుస', icon: '🔥', streak: 3 },
    { id: 's7', en: '7-Day Streak', te: '7 రోజుల వరుస', icon: '⭐', streak: 7 }
  ];
  var BADGES = CFG.badges && CFG.badges.length ? CFG.badges : DEFAULT_BADGES;
  function unlocked(b) { return (b.need ? state.done.length >= b.need : false) || (b.streak ? (state.streak || 0) >= b.streak : false); }

  function pct() { return Math.round(state.done.length / N * 100); }
  function nextLesson() { for (var i = 0; i < N; i++) { if (state.done.indexOf(CFG.lessons[i].id) < 0) return CFG.lessons[i]; } return null; }
  function title(l) { return te() ? (l.te || l.en) : (l.en || l.te); }

  var root;

  function recentHtml() {
    if (!E || !E.getRecent) return '';
    var here = location.pathname.replace(/[^/]*$/, '');
    var cur = location.pathname + location.hash;
    var list = E.getRecent().filter(function (x) { return x.url && x.url.indexOf(here) === 0 && x.url !== cur; }).slice(0, 4);
    if (!list.length) return '';
    var chips = list.map(function (x) { return '<a class="ifp-chip" href="' + esc(x.url) + '">' + esc(x.title.replace(/\s*[–—|].*$/, '')) + '</a>'; }).join('');
    return '<div class="ifp-block"><div class="ifp-h">' + (te() ? 'ఇటీవల చూసినవి' : 'Recently visited') + '</div><div class="ifp-chips">' + chips + '</div></div>';
  }

  function render() {
    if (!root) return;
    var T = te();
    var nx = nextLesson();
    var allDone = state.done.length >= N;
    var ch = (CFG.challenges && CFG.challenges.length) ? CFG.challenges[dayNum() % CFG.challenges.length] : null;

    var head = '<div class="ifp-inner">'
      + '<div class="ifp-label">' + (T ? 'అభ్యాస డాష్‌బోర్డ్' : 'Learning Dashboard') + '</div>'
      + '<h2 class="ifp-title">' + esc(T ? (CFG.name_te || 'పోర్టల్') : (CFG.name_en || 'Portal')) + '</h2>';

    var stats = '<div class="ifp-grid">'
      + '<div class="ifp-card ifp-stat"><div class="ifp-ring-host" id="ifp-ring"></div>'
      + '<div class="ifp-stat-meta"><b>' + state.done.length + ' / ' + N + '</b><span>' + (T ? 'పూర్తయిన పాఠాలు' : 'Lessons complete') + '</span></div></div>'
      + '<div class="ifp-card ifp-stat"><div class="ifp-flame">🔥</div>'
      + '<div class="ifp-stat-meta"><b>' + (state.streak || 1) + '</b><span>' + (T ? 'రోజుల వరుస' : 'Day streak') + '</span></div></div>';

    var contInner = allDone
      ? '<b>' + (T ? '🎉 అన్ని పాఠాలు పూర్తయ్యాయి!' : '🎉 All lessons complete!') + '</b>'
        + '<button type="button" class="ifx-btn ifx-btn-primary" id="ifp-cert">' + (T ? 'సర్టిఫికెట్ పొందండి 🎓' : 'Get certificate 🎓') + '</button>'
      : '<div><span class="ifp-mini">' + (T ? 'తదుపరి సిఫార్సు' : 'Recommended next') + '</span><b>' + esc(nx ? title(nx) : '') + '</b></div>'
        + '<a class="ifx-btn ifx-btn-primary" href="#if-lessons">' + (T ? 'కొనసాగించండి →' : 'Continue →') + '</a>';
    var cont = '<div class="ifp-card ifp-continue">' + contInner + '</div>';

    stats += cont + '</div>';

    var challenge = ch ? '<div class="ifp-block ifp-challenge"><div class="ifp-h">' + (T ? 'రోజువారీ సవాలు' : 'Daily Challenge') + '</div><p>' + esc(T ? ch.te : ch.en) + '</p></div>' : '';

    var badges = '<div class="ifp-block"><div class="ifp-h">' + (T ? 'విజయాలు' : 'Achievements') + '</div><div class="ifp-badges">'
      + BADGES.map(function (b, i) {
        return '<div class="ifp-badge-wrap"><span class="ifp-badge-el" data-icon="' + esc(b.icon || '★') + '" data-locked="' + (unlocked(b) ? '0' : '1') + '"></span>'
          + '<span class="ifp-badge-lbl">' + esc(T ? b.te : b.en) + '</span></div>';
      }).join('') + '</div></div>';

    var list = '<div class="ifp-block"><div class="ifp-h">' + (T ? 'మీ పాఠాలు' : 'Your lessons') + '</div><ul class="ifp-list">'
      + CFG.lessons.map(function (l, i) {
        var done = state.done.indexOf(l.id) >= 0;
        return '<li class="ifp-li' + (done ? ' done' : '') + '"><span class="ifp-num">' + (i + 1) + '</span>'
          + '<span class="ifp-li-title">' + esc(title(l)) + '</span>'
          + '<button type="button" class="ifp-toggle" data-id="' + esc(l.id) + '">'
          + (done ? (T ? 'పూర్తయింది ✓' : 'Completed ✓') : (T ? 'పూర్తి చేయి' : 'Mark complete')) + '</button></li>';
      }).join('') + '</ul></div>';

    root.innerHTML = head + stats + recentHtml() + challenge + badges + list + '</div>';

    // progress ring
    var ring = root.querySelector('#ifp-ring');
    if (ring) { if (E && E.progressRing) E.progressRing(ring, pct()); else { ring.className = 'ifx-ring'; ring.setAttribute('data-pct', pct()); ring.style.setProperty('--pct', pct()); } }
    // badges
    root.querySelectorAll('.ifp-badge-el').forEach(function (el) {
      var locked = el.getAttribute('data-locked') === '1';
      if (E && E.badge) E.badge(el, { icon: el.getAttribute('data-icon'), locked: locked });
      else { el.className = 'ifx-badge' + (locked ? ' locked' : ''); el.textContent = el.getAttribute('data-icon'); }
    });
    // toggle complete
    root.querySelectorAll('.ifp-toggle').forEach(function (b) {
      b.addEventListener('click', function () { toggle(b.getAttribute('data-id')); });
    });
    // certificate
    var cb = root.querySelector('#ifp-cert');
    if (cb && window.IFCore && IFCore.certificate) cb.addEventListener('click', function () {
      IFCore.certificate({ title: (te() ? CFG.name_te : CFG.name_en), score: state.done.length + ' / ' + N });
    });
  }

  function toggle(id) {
    var i = state.done.indexOf(id), was = state.done.length;
    if (i < 0) state.done.push(id); else state.done.splice(i, 1);
    save(state);
    var now = state.done.length;
    render();
    if (now > was) {
      if (window.IFXP) IFXP.awardOnce('L:' + CFG.key + ':' + id, 20);
      if (E) {
        if (now === N) E.celebrate({ count: 130 });
        else if (now === Math.ceil(N / 2)) E.celebrate({ count: 70 });
      }
    }
  }

  function inject() {
    if (document.getElementById('if-portal')) return;
    var sec = document.createElement('section');
    sec.id = 'if-portal'; sec.className = 'ifp-sec'; sec.setAttribute('aria-label', 'Learning Dashboard');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else document.body.appendChild(sec); }
    root = sec;
    render();
  }

  function boot() { inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(function () { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
