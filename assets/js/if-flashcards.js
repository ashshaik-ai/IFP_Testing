/* ===================================================================
   Islamic Front — Flashcard / Spaced-Repetition engine (if-flashcards.js)
   Reusable, additive. A portal opts in by defining window.IF_FLASHCARDS
   BEFORE this (deferred) script runs, e.g.:
     window.IF_FLASHCARDS = {
       deck:'arabic-letters',
       title_en:'Letter Flashcards', title_te:'అక్షర ఫ్లాష్ కార్డులు',
       sub_en:'...', sub_te:'...',
       cards:[ {id:'alif', front:'ا', back_en:'Alif — a/aa', back_te:'అలిఫ్ — అ/ఆ', audio:''}, ... ]
     };
   Leitner-lite SRS persisted in localStorage (if-srs-<deck>). Bilingual
   via window.IFCore.getLang(). Injects a section before #if-refs / footer.
   =================================================================== */
(function () {
  'use strict';
  var CFG = window.IF_FLASHCARDS;
  if (!CFG || !CFG.cards || !CFG.cards.length) return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  var KEY = 'if-srs-' + CFG.deck;
  var BOX_DAYS = [0, 1, 3, 7, 16, 35]; // index by box level 1..5

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function now() { return Date.now(); }

  var state = load();
  var order = [];          // working order of card indices for this session
  var pos = 0;
  var flipped = false;

  function dueList() {
    var due = [], later = [];
    CFG.cards.forEach(function (c, i) {
      var s = state[c.id];
      if (!s || s.due <= now()) due.push(i); else later.push(i);
    });
    return due.length ? due : later; // if nothing due, allow free review
  }
  function mastered() { return CFG.cards.filter(function (c) { var s = state[c.id]; return s && s.box >= 5; }).length; }

  function rate(good) {
    var c = CFG.cards[order[pos]]; if (!c) return;
    var s = state[c.id] || { box: 0 };
    s.box = good ? Math.min(5, (s.box || 0) + 1) : 1;
    s.due = now() + BOX_DAYS[s.box] * 86400000;
    state[c.id] = s; save(state);
    pos++; flipped = false;
    if (pos >= order.length) { order = dueList(); pos = 0; }
    paint();
  }

  var root;
  function paint() {
    if (!root) return;
    var te = lang() === 'te';
    var T = te
      ? { flip: 'తిప్పి చూడండి', again: 'మళ్ళీ', got: 'వచ్చింది ✓', done: 'మాస్టర్', of: '/', tap: 'సమాధానం చూడటానికి నొక్కండి' }
      : { flip: 'Flip', again: 'Again', got: 'Got it ✓', done: 'Mastered', of: 'of', tap: 'Tap to reveal' };
    if (!order.length) order = dueList();
    var c = CFG.cards[order[pos]] || CFG.cards[0];
    var back = te ? c.back_te : c.back_en;
    var audioBtn = c.audio ? '<button type="button" class="iffc-audio" data-if-audio="' + c.audio + '" aria-label="audio"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg></button>' : '';
    root.innerHTML =
      '<div class="iffc-bar"><span>' + T.done + ': <b>' + mastered() + '</b> ' + T.of + ' ' + CFG.cards.length + '</span>'
      + '<span class="iffc-count">' + (pos + 1) + ' / ' + order.length + '</span></div>'
      + '<div class="iffc-card' + (flipped ? ' flipped' : '') + '" tabindex="0" role="button" aria-label="' + T.tap + '">'
      + '<div class="iffc-front">' + (c.ar ? '<span lang="ar" dir="rtl">' + c.ar + '</span>' : c.front) + audioBtn + '</div>'
      + '<div class="iffc-back">' + back + '</div>'
      + '<div class="iffc-hint">' + (flipped ? '' : T.tap) + '</div>'
      + '</div>'
      + '<div class="iffc-actions">'
      + '<button type="button" class="iffc-btn iffc-again">' + T.again + '</button>'
      + '<button type="button" class="iffc-btn iffc-flip">' + T.flip + '</button>'
      + '<button type="button" class="iffc-btn iffc-got">' + T.got + '</button>'
      + '</div>';
    var card = root.querySelector('.iffc-card');
    function doFlip(e) { if (e && e.target.closest && e.target.closest('.iffc-audio')) return; flipped = !flipped; paint(); }
    card.addEventListener('click', doFlip);
    card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doFlip(e); } });
    root.querySelector('.iffc-flip').addEventListener('click', function () { flipped = !flipped; paint(); });
    root.querySelector('.iffc-again').addEventListener('click', function () { rate(false); });
    root.querySelector('.iffc-got').addEventListener('click', function () { rate(true); });
  }

  function inject() {
    if (document.getElementById('if-flashcards')) return;
    var te = lang() === 'te';
    var sec = document.createElement('section');
    sec.id = 'if-flashcards';
    sec.className = 'iffc-sec';
    sec.setAttribute('aria-label', 'Flashcards');
    sec.innerHTML = '<div class="iffc-inner">'
      + '<div class="iffc-label">' + (te ? 'అభ్యాసం' : 'Practice') + '</div>'
      + '<h2 class="iffc-title">' + (te ? (CFG.title_te || 'ఫ్లాష్ కార్డులు') : (CFG.title_en || 'Flashcards')) + '</h2>'
      + '<p class="iffc-sub">' + (te ? (CFG.sub_te || '') : (CFG.sub_en || '')) + '</p>'
      + '<div class="iffc-stage" id="iffc-stage"></div>'
      + '</div>';
    var refs = document.getElementById('if-refs');
    var footer = document.querySelector('footer.lu-footer');
    var anchor = refs || footer;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else document.body.appendChild(sec);
    root = sec.querySelector('#iffc-stage');
    order = dueList(); pos = 0; flipped = false;
    paint();
  }

  function paintShell() {
    if (!document.getElementById('if-flashcards')) return;
    var te = lang() === 'te';
    var lab = document.querySelector('#if-flashcards .iffc-label'); if (lab) lab.textContent = te ? 'అభ్యాసం' : 'Practice';
    var ti = document.querySelector('#if-flashcards .iffc-title'); if (ti) ti.textContent = te ? (CFG.title_te || 'ఫ్లాష్ కార్డులు') : (CFG.title_en || 'Flashcards');
    var su = document.querySelector('#if-flashcards .iffc-sub'); if (su) su.textContent = te ? (CFG.sub_te || '') : (CFG.sub_en || '');
  }
  function boot() { inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(function () { paint(); paintShell(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
