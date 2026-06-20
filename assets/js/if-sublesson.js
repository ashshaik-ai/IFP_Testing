/* ===================================================================
   Islamic Front — Sub-lesson interactivity (if-sublesson.js)
   Turns a read-only sub-lesson page into an interactive lesson:
   Knowledge Check quiz, Reflection, "Mark complete" (writes to the
   shared if-<portal>-progress so the portal dashboard lights up),
   Recommended-next link, and a completion celebration.
   Reads its config from window.IF_SUBLESSON_DB, auto-keyed by URL
   (<folder>/<filename-without-ext>). Bilingual via <html lang> /
   IFCore. Reduced-motion safe via IFEngage. Injects before the footer.
   =================================================================== */
(function () {
  'use strict';
  var DB = window.IF_SUBLESSON_DB;
  if (!DB) return;

  var parts = location.pathname.replace(/\/+$/, '').split('/');
  var file = (parts[parts.length - 1] || '').replace(/\.html?$/i, '');
  var folder = parts[parts.length - 2] || '';
  var CFG = DB[folder + '/' + file];
  if (!CFG) return;

  var PKEY = 'if-' + CFG.portal + '-progress';
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function load() { try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(PKEY, JSON.stringify(s)); } catch (e) { } }
  function isDone() { var s = load(); return (s.done || []).indexOf(CFG.pid) >= 0; }
  function markDone() {
    var s = load(); s.done = s.done || [];
    if (s.done.indexOf(CFG.pid) < 0) s.done.push(CFG.pid);
    save(s);
  }

  var LETTERS = ['A', 'B', 'C', 'D'];
  var root, qi = 0, qAns = false, qScore = 0;

  function initScrollHide() {
    var lastY = window.scrollY || 0;
    var threshold = 72;
    window.addEventListener('scroll', function () {
      var y = window.scrollY || 0;
      if (window.innerWidth <= 768) {
        if (y > threshold && y > lastY) document.body.classList.add('nav-hidden');
        else if (y < lastY || y <= threshold) document.body.classList.remove('nav-hidden');
      } else {
        document.body.classList.remove('nav-hidden');
      }
      lastY = y;
    }, { passive: true });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) document.body.classList.remove('nav-hidden');
    }, { passive: true });
  }

  function T() {
    return te()
      ? { kc: 'నాలెడ్జ్ చెక్', kcs: 'మీరు నేర్చుకున్నది పరీక్షించుకోండి', q: 'ప్రశ్న', of: '/', ok: '✓ సరైనది!', no: '→ సరైన సమాధానం ఆకుపచ్చలో', next: 'తదుపరి →', refl: 'ఆలోచించండి', mark: 'పాఠం పూర్తి చేయండి ✓', done: 'పూర్తయింది ✓', cont: 'తర్వాత', go: 'కొనసాగించు →', score: 'స్కోరు', retry: 'మళ్ళీ ప్రయత్నించండి' }
      : { kc: 'Knowledge Check', kcs: 'Check what you learned on this page', q: 'Question', of: 'of', ok: '✓ Correct!', no: '→ Correct answer in green', next: 'Next →', refl: 'Reflect', mark: 'Mark lesson complete ✓', done: 'Completed ✓', cont: 'Up next', go: 'Continue →', score: 'Score', retry: 'Try again' };
  }

  function quizHtml(t) {
    var qz = CFG.quiz || [];
    if (!qz.length) return '';
    if (qi >= qz.length) {
      return '<div class="ifs-qdone">' + t.score + ': <b>' + qScore + ' / ' + qz.length + '</b>'
        + ' <button type="button" class="ifs-mini" id="ifs-qretry">' + t.retry + '</button></div>';
    }
    var q = qz[qi];
    var opts = q.opts.map(function (o, i) {
      return '<button type="button" class="ifs-opt" data-i="' + i + '"><span class="ifs-l">' + LETTERS[i] + '</span>' + (te() ? o.te : o.en) + '</button>';
    }).join('');
    return '<div class="ifs-qbar">' + t.q + ' ' + (qi + 1) + ' ' + t.of + ' ' + qz.length + '</div>'
      + '<div class="ifs-q">' + (te() ? q.q_te : q.q_en) + '</div>'
      + '<div class="ifs-opts">' + opts + '</div>'
      + '<div class="ifs-fb" id="ifs-fb" role="status" aria-live="polite"></div>'
      + '<div style="text-align:center"><button type="button" class="ifs-mini show-none" id="ifs-qnext">' + t.next + '</button></div>';
  }

  function render() {
    if (!root) return;
    var t = T(), done = isDone();
    var refl = (CFG.reflect || []).map(function (r) { return '<li>' + (te() ? r.te : r.en) + '</li>'; }).join('');
    var media = (CFG.media || []).map(function (m) { return '<div data-if-media="' + m.type + '"' + (m.src ? (' data-src="' + m.src + '"') : '') + ' data-label-en="' + m.en + '" data-label-te="' + m.te + '"></div>'; }).join('');
    var nx = CFG.next ? '<div class="ifs-next"><span class="ifs-mini-lbl">' + t.cont + '</span>'
      + '<a class="ifx-btn ifx-btn-primary" href="' + CFG.next.href + '">' + (te() ? CFG.next.te : CFG.next.en) + ' ' + (te() ? '→' : '→') + '</a></div>' : '';

    root.innerHTML = '<div class="ifs-inner">'
      + '<div class="ifs-card ifs-kc"><div class="ifs-h">' + t.kc + '</div><p class="ifs-sub">' + t.kcs + '</p><div id="ifs-quiz">' + quizHtml(t) + '</div></div>'
      + (refl ? '<div class="ifs-card"><div class="ifs-h">' + t.refl + '</div><ul class="ifs-refl">' + refl + '</ul></div>' : '')
      + (media ? '<div class="ifs-card"><div class="ifs-h">' + (te() ? 'మీడియా' : 'Media') + '</div>' + media + '</div>' : '')
      + '<div class="ifs-complete">'
      + '<button type="button" class="ifx-btn ' + (done ? 'ifx-btn-secondary' : 'ifx-btn-primary') + '" id="ifs-mark">' + (done ? t.done : t.mark) + '</button>'
      + nx + '</div></div>';

    bindQuiz(t);
    if (window.IFMedia) IFMedia.refresh();
    var mk = root.querySelector('#ifs-mark');
    if (mk) mk.addEventListener('click', function () {
      var wasDone = isDone();
      markDone(); render();
      if (!wasDone) { if (window.IFXP) IFXP.awardOnce('L:' + CFG.portal + ':' + CFG.pid, 20); if (window.IFEngage) IFEngage.celebrate({ count: 110 }); }
    });
  }

  function bindQuiz(t) {
    var fb = root.querySelector('#ifs-fb');
    root.querySelectorAll('.ifs-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        if (qAns) return; qAns = true;
        var q = CFG.quiz[qi], pick = parseInt(b.getAttribute('data-i'), 10);
        root.querySelectorAll('.ifs-opt').forEach(function (x, j) {
          x.setAttribute('disabled', '');
          if (j === q.ans) x.classList.add('correct');
          if (j === pick && pick !== q.ans) x.classList.add('wrong');
        });
        if (pick === q.ans) { qScore++; if (fb) { fb.textContent = t.ok; fb.className = 'ifs-fb ok'; } var c = root.querySelector('.ifs-opt.correct'); if (c && window.IFEngage && !IFEngage.reducedMotion) c.classList.add('ifx-ok'); }
        else if (fb) { fb.textContent = t.no; fb.className = 'ifs-fb no'; }
        var nb = root.querySelector('#ifs-qnext'); if (nb) nb.classList.remove('show-none');
      });
    });
    var nx = root.querySelector('#ifs-qnext');
    if (nx) nx.addEventListener('click', function () { qi++; qAns = false; root.querySelector('#ifs-quiz').innerHTML = quizHtml(t); bindQuiz(t); });
    var rt = root.querySelector('#ifs-qretry');
    if (rt) rt.addEventListener('click', function () { qi = 0; qAns = false; qScore = 0; root.querySelector('#ifs-quiz').innerHTML = quizHtml(t); bindQuiz(t); });
  }

  function inject() {
    if (document.getElementById('if-sublesson')) return;
    var sec = document.createElement('section');
    sec.id = 'if-sublesson'; sec.className = 'ifs-sec'; sec.setAttribute('aria-label', 'Lesson activities');
    var footer = document.querySelector('footer.lu-footer') || document.querySelector('footer');
    if (footer && footer.parentNode) footer.parentNode.insertBefore(sec, footer);
    else document.body.appendChild(sec);
    root = sec;
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initScrollHide(); inject(); });
  } else {
    initScrollHide();
    inject();
  }
  new MutationObserver(function () { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
