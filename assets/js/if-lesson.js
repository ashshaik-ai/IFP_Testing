/* ===================================================================
   Islamic Front — Lesson engine  (if-lesson.js)
   Renders complete, multi-block lessons. Opt-in via window.IF_LESSONS
   (set before this deferred script). Bilingual; accordion.

   Lesson schema (all blocks optional except title):
     { id, title_en, title_te,
       intro:{en,te},                                   // lead paragraph
       sections:[{h_en,h_te,b_en,b_te, ar?}],           // lesson content
       timeline:[{date, ev_en, ev_te}],                 // visual timeline
       mindmap:{c_en,c_te, branches:[{en,te}]},         // visual mind map
       people:[{n_en,n_te,d_en,d_te}],                  // key personalities
       didyouknow:[{en,te}],                            // Did You Know?
       takeaways:[{en,te}],                             // lessons learned
       reflect:[{en,te}],                               // reflection questions
       quiz:[{q_en,q_te,opts:[{en,te}],ans}],           // quick check
       summary:{en,te},                                 // level summary
       reading:[{label,url}], refs:[{label,url}], cite:{label,url} }
   =================================================================== */
(function () {
  'use strict';
  var CFG = window.IF_LESSONS;
  if (!CFG || !CFG.lessons || !CFG.lessons.length) return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  var openId = null;

  // Uniform completion tracking: derive the portal key from the URL folder and
  // persist completed lesson ids to if-<key>-progress.done (the same store the
  // dashboards/profile read), so every portal feeds one progress + XP system.
  var PKEY = (function () {
    var p = location.pathname.replace(/\/+$/, '').split('/'); var f = p[p.length - 2] || '';
    var m = { 'learn-quran': 'quran', 'learn-salah': 'salah', 'learn-arabic': 'arabic', 'learn-urdu': 'urdu', 'islamic-history': 'history', 'kids-islam': 'kids', 'seerah': 'seerah' };
    return m[f] || f.replace('learn-', '');
  })();
  function pLoad() { try { return JSON.parse(localStorage.getItem('if-' + PKEY + '-progress')) || {}; } catch (e) { return {}; } }
  function pSave(s) { try { localStorage.setItem('if-' + PKEY + '-progress', JSON.stringify(s)); } catch (e) { } }
  function isDone(id) { var s = pLoad(); return (s.done || []).indexOf(id) >= 0; }
  function setDone(id, on) { var s = pLoad(); s.done = s.done || []; var i = s.done.indexOf(id); if (on && i < 0) s.done.push(id); if (!on && i >= 0) s.done.splice(i, 1); pSave(s); }

  // Premium thin-line icon set (replaces emoji in section labels; inherits .ifl-ic colour, not gold).
  function ic(p) { return '<svg class="ifl-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg> '; }
  var IC = {
    tl: ic('<circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/>'),
    mind: ic('<circle cx="6" cy="12" r="2.2"/><circle cx="17.5" cy="6.5" r="2.2"/><circle cx="17.5" cy="17.5" r="2.2"/><path d="M8 11 15.5 7M8 13l7.5 4"/>'),
    people: ic('<circle cx="12" cy="8" r="3.2"/><path d="M5.5 19a6.5 6.5 0 0 1 13 0"/>'),
    dyk: ic('<path d="M9.5 18h5M10.5 21h3"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.4.3.5.7.5 1.1v.5h6v-.5c0-.4.1-.8.5-1.1A6 6 0 0 0 12 3z"/>'),
    learned: ic('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.4 2.4 4.6-5"/>'),
    reflect: ic('<path d="M4.5 5.5h15v10H9l-4.5 4z"/>'),
    quiz: ic('<circle cx="12" cy="12" r="9"/><path d="M9.4 9.3a2.7 2.7 0 0 1 5.2 1.1c0 1.8-2.6 2-2.6 3.6"/><path d="M12 17h.01"/>'),
    summary: ic('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h5M9.5 15.5h5"/>'),
    reading: ic('<path d="M12 6v14M12 6a4 4 0 0 0-4-3H4v13h4a4 4 0 0 1 4 2M12 6a4 4 0 0 1 4-3h4v13h-4a4 4 0 0 0-4 2"/>'),
    refs: ic('<path d="M9.5 13a3.5 3.5 0 0 0 5 .4l2.3-2.3a3.5 3.5 0 0 0-5-5L10.5 7.4"/><path d="M14.5 11a3.5 3.5 0 0 0-5-.4L7.2 12.9a3.5 3.5 0 0 0 5 5L13.5 16.6"/>'),
    apply: ic('<path d="M14.7 6.3a3.5 3.5 0 0 0-4.6 4.6L4 17l3 3 6.1-6.1a3.5 3.5 0 0 0 4.6-4.6l-2.3 2.3-2.1-2.1z"/>'),
    mistakes: ic('<path d="M12 4 2.8 20h18.4z"/><path d="M12 10v4.5M12 17.5h.01"/>'),
    revision: ic('<rect x="6.5" y="4" width="11" height="17" rx="2"/><path d="M9.5 4V3h5v1"/><path d="M9.5 10h5M9.5 13.5h3.5"/>')
  };

  function block(label, inner) { return '<div class="ifl-s"><div class="ifl-s-h">' + label + '</div>' + inner + '</div>'; }

  function lessonInner(L, te) {
    var T = te
      ? { tl: IC.tl + 'కాలక్రమం', mind: IC.mind + 'మైండ్ మ్యాప్', people: IC.people + 'ముఖ్య వ్యక్తులు', dyk: IC.dyk + 'మీకు తెలుసా?', learned: IC.learned + 'నేర్చుకున్న పాఠాలు', reflect: IC.reflect + 'ఆలోచనా ప్రశ్నలు', quiz: IC.quiz + 'చిన్న పరీక్ష', summary: IC.summary + 'స్థాయి సారాంశం', reading: IC.reading + 'మరింత చదవడానికి', refs: IC.refs + 'ఆధారాలు', apply: IC.apply + 'ఆచరణలో పెట్టండి', mistakes: IC.mistakes + 'సాధారణ తప్పులు', faqs: IC.quiz + 'తరచూ అడిగే ప్రశ్నలు', revision: IC.revision + 'మననం నోట్స్' }
      : { tl: IC.tl + 'Timeline', mind: IC.mind + 'Mind Map', people: IC.people + 'Key People', dyk: IC.dyk + 'Did You Know?', learned: IC.learned + 'Lessons Learned', reflect: IC.reflect + 'Reflection Questions', quiz: IC.quiz + 'Quick Check', summary: IC.summary + 'Level Summary', reading: IC.reading + 'Further Reading', refs: IC.refs + 'Authentic References', apply: IC.apply + 'Apply It', mistakes: IC.mistakes + 'Common Mistakes', faqs: IC.quiz + 'FAQ', revision: IC.revision + 'Revision Notes' };
    var html = '';
    if (L.reviewed) html += '<div class="ifl-reviewed"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg> '
      + (te ? 'పండితునిచే సమీక్షించబడింది' : 'Scholar-reviewed')
      + (L.reviewed.by ? ' · ' + L.reviewed.by : '') + (L.reviewed.date ? ' · ' + L.reviewed.date : '') + '</div>';
    if (L.intro) html += '<p class="ifl-intro">' + (te ? L.intro.te : L.intro.en) + '</p>';
    // Visual-first: show the mind map and timeline before the detailed reading.
    if (L.mindmap) html += block(T.mind, '<div class="ifl-mind"><div class="ifl-mind-c">' + (te ? L.mindmap.c_te : L.mindmap.c_en) + '</div><div class="ifl-mind-b">'
      + L.mindmap.branches.map(function (b) { return '<span>' + (te ? b.te : b.en) + '</span>'; }).join('') + '</div></div>');
    if (L.timeline && L.timeline.length) html += block(T.tl, '<div class="ifl-timeline">' + L.timeline.map(function (t) {
      return '<div class="ifl-tl"><div class="ifl-tl-d">' + t.date + '</div><div class="ifl-tl-e">' + (te ? t.ev_te : t.ev_en) + '</div></div>';
    }).join('') + '</div>');
    if (L.sections) html += L.sections.map(function (s) {
      var chk = '';
      if (s.check && s.check.opts) {
        chk = '<div class="ifl-check"><span class="ifl-check-lbl">' + (te ? '✓ చిన్న తనిఖీ' : '✓ Quick check') + '</span>'
          + '<div class="ifl-quiz"><div class="ifl-q">' + (te ? s.check.q_te : s.check.q_en) + '</div><div class="ifl-opts">'
          + s.check.opts.map(function (o, oi) { return '<button type="button" class="ifl-opt" data-o="' + oi + '" data-a="' + s.check.ans + '">' + (te ? o.te : o.en) + '</button>'; }).join('')
          + '</div></div></div>';
      }
      return '<div class="ifl-s"><div class="ifl-s-h">' + (te ? s.h_te : s.h_en) + '</div>'
        + (s.ar ? '<div class="ifl-ar" lang="ar" dir="rtl">' + s.ar + '</div>' : '')
        + '<div class="ifl-s-b">' + (te ? s.b_te : s.b_en) + '</div>' + chk + '</div>';
    }).join('');
    /* mind map + timeline render above (visual-first), before the reading sections */
    if (L.people && L.people.length) html += block(T.people, '<div class="ifl-people">' + L.people.map(function (p) {
      return '<div class="ifl-person"><b>' + (te ? p.n_te : p.n_en) + '</b><span>' + (te ? p.d_te : p.d_en) + '</span></div>';
    }).join('') + '</div>');
    if (L.didyouknow && L.didyouknow.length) html += block(T.dyk, '<ul class="ifl-dyk">' + L.didyouknow.map(function (d) { return '<li>' + (te ? d.te : d.en) + '</li>'; }).join('') + '</ul>');
    if (L.takeaways && L.takeaways.length) html += block(T.learned, '<ul class="ifl-ul">' + L.takeaways.map(function (t) { return '<li>' + (te ? t.te : t.en) + '</li>'; }).join('') + '</ul>');
    if (L.apply) html += block(T.apply, '<div class="ifl-apply">' + (te ? L.apply.te : L.apply.en) + '</div>');
    if (L.mistakes && L.mistakes.length) html += block(T.mistakes, '<ul class="ifl-mistakes">' + L.mistakes.map(function (m) { return '<li>' + (te ? m.te : m.en) + '</li>'; }).join('') + '</ul>');
    if (L.reflect && L.reflect.length) html += block(T.reflect, '<ul class="ifl-ul ifl-reflect">' + L.reflect.map(function (r) { return '<li>' + (te ? r.te : r.en) + '</li>'; }).join('') + '</ul>');
    if (L.faqs && L.faqs.length) html += block(T.faqs, '<div class="ifl-faq">' + L.faqs.map(function (f) { return '<details><summary>' + (te ? f.q_te : f.q_en) + '</summary><p>' + (te ? f.a_te : f.a_en) + '</p></details>'; }).join('') + '</div>');
    if (L.quiz && L.quiz.length) html += block(T.quiz, L.quiz.map(function (q) {
      var opts = q.opts.map(function (o, oi) { return '<button type="button" class="ifl-opt" data-o="' + oi + '" data-a="' + q.ans + '">' + (te ? o.te : o.en) + '</button>'; }).join('');
      return '<div class="ifl-quiz"><div class="ifl-q">' + (te ? q.q_te : q.q_en) + '</div><div class="ifl-opts">' + opts + '</div></div>';
    }).join(''));
    if (L.summary) html += '<div class="ifl-summary"><strong>' + T.summary + '</strong><p>' + (te ? L.summary.te : L.summary.en) + '</p></div>';
    if (L.revision && L.revision.length) html += block(T.revision, '<ul class="ifl-revision">' + L.revision.map(function (r) { return '<li>' + (te ? r.te : r.en) + '</li>'; }).join('') + '</ul>');
    if (L.reading && L.reading.length) html += block(T.reading, '<div class="ifl-links">' + L.reading.map(function (r) { return '<a href="' + r.url + '" target="_blank" rel="noopener noreferrer">' + r.label + ' ↗</a>'; }).join('') + '</div>');
    var refs = L.refs ? L.refs.slice() : []; if (L.cite) refs.push(L.cite);
    if (refs.length) html += block(T.refs, '<div class="ifl-links">' + refs.map(function (r) { return '<a href="' + r.url + '" target="_blank" rel="noopener noreferrer">' + r.label + ' ↗</a>'; }).join('') + '</div>');
    var dn = isDone(L.id);
    html += '<div class="ifl-complete"><button type="button" class="ifl-done-btn' + (dn ? ' done' : '') + '" data-id="' + L.id + '">' + (dn ? (te ? 'పూర్తయింది ✓' : 'Completed ✓') : (te ? 'పాఠం పూర్తి చేయి ✓' : 'Mark lesson complete ✓')) + '</button></div>';
    return html;
  }

  function render() {
    var host = document.getElementById('ifl-list'); if (!host) return;
    var te = lang() === 'te';
    var TIERS = te ? ['ప్రారంభ', 'మధ్యమ', 'ఉన్నత', 'నిపుణ'] : ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    var N = CFG.lessons.length, doneCount = 0, firstInc = -1;
    CFG.lessons.forEach(function (L, i) { if (isDone(L.id)) doneCount++; else if (firstInc < 0) firstInc = i; });
    var pct = N ? Math.round(doneCount / N * 100) : 0;
    var bar = '<div class="ifl-progress"><div class="ifl-progress-top"><span>' + (te ? 'మీ పురోగతి' : 'Your progress') + '</span><b>' + doneCount + ' / ' + N + ' · ' + pct + '%</b></div><div class="ifl-progress-bar"><i style="width:' + pct + '%"></i></div></div>';
    host.innerHTML = bar + CFG.lessons.map(function (L, i) {
      var open = openId === L.id, d = isDone(L.id);
      var state = d ? 'done' : (i === firstInc || firstInc < 0 ? 'current' : (i > firstInc ? 'locked' : 'current'));
      var badge = d ? '✓' : (state === 'current' ? '▶' : '🔒');
      var tier = TIERS[Math.min(3, Math.floor(i * 4 / N))];
      return '<div class="ifl-item ifl-' + state + (open ? ' open' : '') + '" data-id="' + L.id + '">'
        + '<div class="ifl-head" role="button" tabindex="0" aria-expanded="' + open + '"><span class="ifl-num">' + badge + '</span>'
        + '<span class="ifl-h">' + (te ? L.title_te : L.title_en) + '<span class="ifl-tier">' + tier + '</span></span>'
        + '<svg class="ifl-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></div>'
        + '<div class="ifl-body"><div class="ifl-inner-body">' + lessonInner(L, te) + '</div></div></div>';
    }).join('');
    host.querySelectorAll('.ifl-item .ifl-head').forEach(function (h) {
      function tog() { var id = h.parentNode.getAttribute('data-id'); openId = (openId === id) ? null : id; render(); }
      h.addEventListener('click', tog);
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
    });
    host.querySelectorAll('.ifl-quiz').forEach(function (qz) {
      qz.querySelectorAll('.ifl-opt').forEach(function (b) {
        b.addEventListener('click', function () {
          var ans = +b.getAttribute('data-a'), sel = +b.getAttribute('data-o');
          qz.querySelectorAll('.ifl-opt').forEach(function (x) {
            x.disabled = true; var oi = +x.getAttribute('data-o');
            if (oi === ans) { x.classList.add('correct'); if (window.IFEngage && !IFEngage.reducedMotion) x.classList.add('ifx-ok'); } else if (oi === sel) x.classList.add('wrong');
          });
        });
      });
    });
    host.querySelectorAll('.ifl-done-btn').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = b.getAttribute('data-id'), was = isDone(id);
        setDone(id, !was);
        if (!was) { if (window.IFXP) IFXP.awardOnce('L:' + PKEY + ':' + id, 20); if (window.IFEngage) IFEngage.celebrate({ count: 90 }); }
        render();
      });
    });
  }

  function paintShell() {
    var te = lang() === 'te';
    var t = document.querySelector('#if-lessons .ifl-title'); if (t) t.textContent = te ? (CFG.title_te || 'పాఠాలు') : (CFG.title_en || 'Lessons');
    var l = document.querySelector('#if-lessons .ifl-label'); if (l) l.textContent = te ? 'పూర్తి పాఠాలు' : 'Full Lessons';
  }

  function inject() {
    if (document.getElementById('if-lessons')) { render(); return; }
    var te = lang() === 'te';
    var sec = document.createElement('section'); sec.id = 'if-lessons'; sec.className = 'ifl-sec'; sec.setAttribute('aria-label', 'Lessons');
    sec.innerHTML = '<div class="ifl-inner">'
      + '<div class="ifl-label">' + (te ? 'పూర్తి పాఠాలు' : 'Full Lessons') + '</div>'
      + '<h2 class="ifl-title">' + (te ? (CFG.title_te || 'పాఠాలు') : (CFG.title_en || 'Lessons')) + '</h2>'
      + '<div id="ifl-list"></div></div>';
    var anchor = document.getElementById('if-quiz') || document.getElementById('if-flashcards') || document.getElementById('if-refs') || document.querySelector('footer.lu-footer');
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor); else document.body.appendChild(sec);
    render();
  }

  function boot() { inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(function () { render(); paintShell(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
