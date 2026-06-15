/* ===================================================================
   Islamic Front — Quiz engine  (if-quiz.js)
   Reusable, additive. A portal opts in by defining window.IF_QUIZ
   BEFORE this (deferred) script runs:
     window.IF_QUIZ = {
       deck:'seerah',
       title_en, title_te, sub_en, sub_te,
       questions:[ { q_en, q_te, opts:[{en,te},...], ans:1,
                     citeUrl:'https://quran.com/1', citeLabel:'Quran 1' }, ... ]
     };
   Graded, scored, best-score persisted (if-quiz-<deck>). Bilingual via
   window.IFCore.getLang(). Injects a section before #if-refs / footer.
   =================================================================== */
(function () {
  'use strict';
  var CFG = window.IF_QUIZ;
  if (!CFG || !CFG.questions || !CFG.questions.length) return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  var KEY = 'if-quiz-' + CFG.deck;
  var idx = 0, answered = false, points = 0, celebrated = false;
  function loadBest() { try { return (JSON.parse(localStorage.getItem(KEY)) || {}).best || 0; } catch (e) { return 0; } }
  function saveBest(b) { try { localStorage.setItem(KEY, JSON.stringify({ best: b })); } catch (e) {} }

  var root;
  var LETTERS = ['A', 'B', 'C', 'D', 'E'];

  function paint() {
    if (!root) return;
    var te = lang() === 'te';
    var T = te
      ? { label: 'ఆడుతూ నేర్చుకోండి', q: 'ప్రశ్న', of: '/', pts: 'పాయింట్లు', best: 'అత్యుత్తమం', next: 'తదుపరి', restart: 'మళ్ళీ మొదలుపెట్టండి', ok: '🎉 సరైనది! +10', no: '💡 సరైన సమాధానం ఆకుపచ్చలో ఉంది', src: 'మూలం', done: 'పూర్తయింది!' }
      : { label: 'Play & Learn', q: 'Question', of: 'of', pts: 'Points', best: 'Best', next: 'Next', restart: 'Restart', ok: '🎉 Correct! +10', no: '💡 The correct answer is shown in green', src: 'Source', done: 'Quiz complete!' };
    var total = CFG.questions.length;

    if (idx >= total) {
      var certLbl = te ? 'సర్టిఫికెట్ 🎓' : 'Certificate 🎓';
      root.innerHTML = '<div class="ifq-bar"><span>' + T.pts + ': <b>' + points + '</b></span><span>' + T.best + ': <b>' + loadBest() + '</b></span></div>'
        + '<div class="ifq-done">' + T.done + ' <b>' + points + ' / ' + (total * 10) + '</b></div>'
        + '<div style="text-align:center;display:flex;gap:10px;justify-content:center;flex-wrap:wrap">'
        + '<button type="button" class="ifq-next show" id="ifq-cert">' + certLbl + '</button>'
        + '<button type="button" class="ifq-next show" id="ifq-restart">' + T.restart + '</button></div>';
      if (!celebrated && points >= total * 6) { celebrated = true; if (window.IFXP) IFXP.awardOnce('Q:' + CFG.deck, 15); if (window.IFEngage) IFEngage.celebrate({ count: points >= total * 10 ? 120 : 70 }); }
      root.querySelector('#ifq-restart').addEventListener('click', function () { idx = 0; points = 0; answered = false; celebrated = false; paint(); });
      var cb = root.querySelector('#ifq-cert');
      if (cb && window.IFCore && IFCore.certificate) cb.addEventListener('click', function () {
        IFCore.certificate({ title: (te ? CFG.title_te : CFG.title_en), score: points + ' / ' + (total * 10) });
      });
      return;
    }

    var qq = CFG.questions[idx];
    var opts = qq.opts.map(function (o, i) {
      return '<button type="button" class="ifq-opt" data-i="' + i + '"><span class="ifq-letter">' + LETTERS[i] + '</span><span>' + (te ? o.te : o.en) + '</span></button>';
    }).join('');
    root.innerHTML =
      '<div class="ifq-bar"><span>' + T.q + ' ' + (idx + 1) + ' ' + T.of + ' ' + total + '</span>'
      + '<span>' + T.pts + ': <b>' + points + '</b> · ' + T.best + ': <b>' + loadBest() + '</b></span></div>'
      + '<div class="ifq-q">' + (te ? qq.q_te : qq.q_en) + '</div>'
      + '<div class="ifq-opts">' + opts + '</div>'
      + '<div class="ifq-fb" id="ifq-fb" role="status" aria-live="polite"></div>'
      + '<div class="ifq-cite" id="ifq-cite"></div>'
      + '<div style="text-align:center"><button type="button" class="ifq-next" id="ifq-next">' + T.next + ' →</button></div>';
    answered = false;
    root.querySelectorAll('.ifq-opt').forEach(function (b) {
      b.addEventListener('click', function () { answer(parseInt(b.getAttribute('data-i'), 10), T); });
    });
    root.querySelector('#ifq-next').addEventListener('click', function () { idx++; paint(); });
  }

  function answer(i, T) {
    if (answered) return; answered = true;
    var qq = CFG.questions[idx];
    root.querySelectorAll('.ifq-opt').forEach(function (b, j) {
      b.setAttribute('disabled', '');
      if (j === qq.ans) b.classList.add('correct');
      if (j === i && i !== qq.ans) b.classList.add('wrong');
    });
    var fb = root.querySelector('#ifq-fb');
    if (i === qq.ans) { points += 10; if (points > loadBest()) saveBest(points); fb.textContent = T.ok; fb.className = 'ifq-fb ok'; var cbtn = root.querySelector('.ifq-opt.correct'); if (cbtn && window.IFEngage && !IFEngage.reducedMotion) cbtn.classList.add('ifx-ok'); }
    else { fb.textContent = T.no; fb.className = 'ifq-fb no'; }
    if (qq.citeUrl) {
      root.querySelector('#ifq-cite').innerHTML = '<a href="' + qq.citeUrl + '" target="_blank" rel="noopener noreferrer">' + T.src + ': ' + (qq.citeLabel || qq.citeUrl) + ' ↗</a>';
    }
    root.querySelector('#ifq-next').classList.add('show');
  }

  function paintShell() {
    if (!document.getElementById('if-quiz')) return;
    var te = lang() === 'te';
    var lab = document.querySelector('#if-quiz .ifq-label'); if (lab) lab.textContent = te ? 'ఆడుతూ నేర్చుకోండి' : 'Play & Learn';
    var ti = document.querySelector('#if-quiz .ifq-title'); if (ti) ti.textContent = te ? (CFG.title_te || 'క్విజ్') : (CFG.title_en || 'Quiz');
    var su = document.querySelector('#if-quiz .ifq-sub'); if (su) su.textContent = te ? (CFG.sub_te || '') : (CFG.sub_en || '');
  }

  function inject() {
    if (document.getElementById('if-quiz')) return;
    var te = lang() === 'te';
    var sec = document.createElement('section'); sec.id = 'if-quiz'; sec.className = 'ifq-sec'; sec.setAttribute('aria-label', 'Quiz');
    sec.innerHTML = '<div class="ifq-inner">'
      + '<div class="ifq-label">' + (te ? 'ఆడుతూ నేర్చుకోండి' : 'Play & Learn') + '</div>'
      + '<h2 class="ifq-title">' + (te ? (CFG.title_te || 'క్విజ్') : (CFG.title_en || 'Quiz')) + '</h2>'
      + '<p class="ifq-sub">' + (te ? (CFG.sub_te || '') : (CFG.sub_en || '')) + '</p>'
      + '<div class="ifq-card" id="ifq-stage"></div>'
      + '</div>';
    var refs = document.getElementById('if-refs');
    var fc = document.getElementById('if-flashcards');
    var footer = document.querySelector('footer.lu-footer');
    var anchor = refs || footer; // place after flashcards, before refs/footer
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else document.body.appendChild(sec);
    root = sec.querySelector('#ifq-stage');
    paint();
  }

  function boot() { inject(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  new MutationObserver(function () { paint(); paintShell(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
