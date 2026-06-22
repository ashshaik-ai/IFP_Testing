/* ===================================================================
   Islamic Front — Shared Component Core  (if-core.js)
   Self-initialising. Zero dependencies. Does NOT touch portal JS.
   Detects language from <html lang> (set by each portal's applyLang)
   via MutationObserver, so it stays in sync with the page toggle.
   Components: Skip-link + theme-color (a11y), Audio player, Toast,
   Trusted-Sources reference panel (auto-injected per portal).
   =================================================================== */
(function () {
  'use strict';

  /* ── language ── */
  function getLang() {
    var l = document.documentElement.getAttribute('lang');
    if (l === 'te' || l === 'en') return l;
    try { return localStorage.getItem('if-lang') || 'te'; } catch (e) { return 'te'; }
  }

  /* ── toast ── */
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('if-toast');
    if (!t) { t = document.createElement('div'); t.id = 'if-toast'; t.className = 'if-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ── audio player (delegated; works on JS-rendered buttons) ── */
  var audioEl = null, curBtn = null;
  function ensureAudio() {
    if (!audioEl) {
      audioEl = new Audio();
      audioEl.addEventListener('ended', clearAudio);
      audioEl.addEventListener('pause', function () { if (curBtn) curBtn.classList.remove('if-audio-playing'); });
    }
    return audioEl;
  }
  function clearAudio() { if (curBtn) { curBtn.classList.remove('if-audio-playing'); curBtn = null; } }
  function playAudio(btn) {
    var url = btn.getAttribute('data-if-audio');
    var te = getLang() === 'te';
    if (!url || url === 'pending' || url === '#') { toast(te ? 'ఆడియో త్వరలో వస్తుంది' : 'Audio coming soon'); return; }
    var a = ensureAudio();
    if (curBtn === btn && !a.paused) { a.pause(); clearAudio(); return; }
    clearAudio();
    a.src = url;
    var p = a.play();
    if (p && p.then) {
      p.then(function () { curBtn = btn; btn.classList.add('if-audio-playing'); })
       .catch(function () { toast(te ? 'ఆడియో లోడ్ కాలేదు' : 'Could not load audio'); });
    } else { curBtn = btn; btn.classList.add('if-audio-playing'); }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-if-audio]');
    if (b) { e.preventDefault(); playAudio(b); }
  });

  /* ── accessibility + mobile baseline ── */
  function initA11y() {
    if (!document.querySelector('meta[name="theme-color"]')) {
      var m = document.createElement('meta'); m.name = 'theme-color'; m.content = '#0d3b1e'; document.head.appendChild(m);
    }
    if (!document.querySelector('.if-skip')) {
      var target = document.querySelector('header[id], main, section[id]');
      var a = document.createElement('a');
      a.className = 'if-skip';
      a.href = '#' + (target && target.id ? target.id : 'home');
      a.setAttribute('data-if-skip', '1');
      a.textContent = getLang() === 'te' ? 'ముఖ్య విషయానికి వెళ్లండి' : 'Skip to content';
      document.body.insertBefore(a, document.body.firstChild);
    }
  }

  /* ── Trusted-Sources reference library (per portal) ── */
  /* Items: {ic, url, name, den (desc EN), dte (desc TE)} */
  /* SVG icon set for reference cards */
  var IC = {
    book: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    scroll: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>',
    grad:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>',
    play:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><polygon points="10 8 16 12 10 16 10 8"/></svg>',
    star:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    flask:  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6M9 3l-3 9h12l-3-9M6 12a6 6 0 0 0 12 0"/></svg>',
    col:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="18"/><rect x="14" y="3" width="7" height="18"/><line x1="10" y1="12" x2="14" y2="12"/></svg>',
    moon:   '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    pen:    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>'
  };

  var REFS = {
    'learn-quran': [
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Read, listen, and compare translations.', dte: 'ఖురాన్ చదవండి, వినండి, అనువాదాలు పోల్చండి.' },
      { ic: IC.scroll, url: 'https://tanzil.net', name: 'Tanzil.net', den: 'Verified, accurate Quran text.', dte: 'ధృవీకరించిన, ఖచ్చితమైన ఖురాన్ పాఠం.' },
      { ic: IC.col,    url: 'https://corpus.quran.com', name: 'Quranic Arabic Corpus', den: 'Word-by-word grammar and analysis.', dte: 'పదం-వారీ వ్యాకరణం, విశ్లేషణ.' },
      { ic: IC.play,   url: 'https://bayyinah.com', name: 'Bayyinah', den: 'In-depth Quran and Arabic study.', dte: 'లోతైన ఖురాన్, అరబిక్ అధ్యయనం.' },
      { ic: IC.scroll, url: 'https://sunnah.com', name: 'Sunnah.com', den: 'Authentic Hadith collections.', dte: 'ప్రామాణిక హదీస్ సంకలనాలు.' }
    ],
    'learn-salah': [
      { ic: IC.grad,   url: 'https://seekersguidance.org', name: 'SeekersGuidance', den: 'Free, scholar-led Islamic courses.', dte: 'పండితుల నేతృత్వంలో ఉచిత ఇస్లామిక్ కోర్సులు.' },
      { ic: IC.scroll, url: 'https://sunnah.com', name: 'Sunnah.com', den: 'Hadith on prayer and purification.', dte: 'నమాజ్, పరిశుద్ధతపై హదీసులు.' },
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Quranic verses on Salah.', dte: 'నమాజ్‌పై ఖురాన్ ఆయతులు.' },
      { ic: IC.star,   url: 'https://yaqeeninstitute.org', name: 'Yaqeen Institute', den: 'Research on worship and spirituality.', dte: 'ఆరాధన, ఆధ్యాత్మికతపై పరిశోధన.' }
    ],
    'seerah': [
      { ic: IC.star,   url: 'https://yaqeeninstitute.org', name: 'Yaqeen Institute', den: 'Researched Seerah articles and series.', dte: 'పరిశోధనాత్మక సీరా వ్యాసాలు, సిరీస్‌లు.' },
      { ic: IC.grad,   url: 'https://seekersguidance.org', name: 'SeekersGuidance', den: 'Structured Seerah courses.', dte: 'నిర్మాణాత్మక సీరా కోర్సులు.' },
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Verses in their historical context.', dte: 'చారిత్రక సందర్భంలో ఆయతులు.' },
      { ic: IC.scroll, url: 'https://sunnah.com', name: 'Sunnah.com', den: 'Prophetic narrations and biography.', dte: 'ప్రవక్త వచనాలు, జీవిత చరిత్ర.' }
    ],
    'islamic-history': [
      { ic: IC.star,   url: 'https://yaqeeninstitute.org', name: 'Yaqeen Institute', den: 'Essays on Islamic history and thought.', dte: 'ఇస్లామిక్ చరిత్ర, ఆలోచనపై వ్యాసాలు.' },
      { ic: IC.flask,  url: 'https://muslimheritage.com', name: 'Muslim Heritage', den: 'Science and civilization (1001 Inventions).', dte: 'విజ్ఞానం, నాగరికత (1001 ఆవిష్కరణలు).' },
      { ic: IC.col,    url: 'https://lostislamichistory.com', name: 'Lost Islamic History', den: 'Accessible, balanced history.', dte: 'సులభమైన, సమతుల్య చరిత్ర.' },
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Stories and lessons of past nations.', dte: 'గత జాతుల కథలు, పాఠాలు.' }
    ],
    'kids-islam': [
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Read and listen to the Quran with kids.', dte: 'పిల్లలతో ఖురాన్ చదవండి, వినండి.' },
      { ic: IC.scroll, url: 'https://sunnah.com', name: 'Sunnah.com', den: 'Simple authentic Hadith.', dte: 'సరళమైన ప్రామాణిక హదీసులు.' },
      { ic: IC.grad,   url: 'https://seekersguidance.org', name: 'SeekersGuidance', den: 'Family and parenting guidance.', dte: 'కుటుంబం, పేరెంటింగ్ మార్గదర్శనం.' }
    ],
    'learn-arabic': [
      { ic: IC.moon,   url: 'https://www.madinaharabic.com', name: 'Madinah Arabic', den: 'Step-by-step Arabic lessons.', dte: 'దశలవారీ అరబిక్ పాఠాలు.' },
      { ic: IC.col,    url: 'https://corpus.quran.com', name: 'Quranic Arabic Corpus', den: 'Word-by-word Quranic grammar.', dte: 'పదం-వారీ ఖురానీ వ్యాకరణం.' },
      { ic: IC.play,   url: 'https://bayyinah.com', name: 'Bayyinah', den: 'Arabic and Quran study.', dte: 'అరబిక్, ఖురాన్ అధ్యయనం.' },
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Practise reading real Quranic text.', dte: 'నిజమైన ఖురాన్ పాఠం చదవడం అభ్యసించండి.' }
    ],
    'learn-urdu': [
      { ic: IC.pen,    url: 'https://rekhta.org', name: 'Rekhta', den: 'Urdu literature, poetry, and dictionary.', dte: 'ఉర్దూ సాహిత్యం, కవిత్వం, నిఘంటువు.' },
      { ic: IC.book,   url: 'https://quran.com', name: 'Quran.com', den: 'Quran with Urdu translation.', dte: 'ఉర్దూ అనువాదంతో ఖురాన్.' },
      { ic: IC.grad,   url: 'https://seekersguidance.org', name: 'SeekersGuidance', den: 'Islamic learning in many languages.', dte: 'అనేక భాషలలో ఇస్లామిక్ అభ్యాసం.' }
    ]
  };

  function portalKey() {
    var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
    var m = p.match(/knowledge-center\/([^\/]+)/);
    return m ? m[1] : null;
  }

  function paintRefs() {
    var sec = document.getElementById('if-refs'); if (!sec) return;
    var cfg = REFS[portalKey()]; if (!cfg) return;
    var te = getLang() === 'te';
    var cards = cfg.map(function (r) {
      return '<a class="if-ref-card" href="' + r.url + '" target="_blank" rel="noopener noreferrer">'
        + '<span class="if-ref-ic" aria-hidden="true">' + r.ic + '</span>'
        + '<span class="if-ref-tx">'
        + '<span class="if-ref-name">' + r.name + ' <span class="if-ref-ext">↗</span></span>'
        + '<span class="if-ref-desc">' + (te ? r.dte : r.den) + '</span>'
        + '</span></a>';
    }).join('');
    sec.innerHTML = '<div class="if-refs-inner">'
      + '<div class="if-refs-label">' + (te ? 'మరింత లోతుగా' : 'Go Deeper') + '</div>'
      + '<h2 class="if-refs-title">' + (te ? 'విశ్వసనీయ వనరులు' : 'Trusted Sources') + '</h2>'
      + '<p class="if-refs-sub">' + (te ? 'లోతైన అధ్యయనం కోసం ధృవీకరించిన స్వతంత్ర వనరులు.' : 'Verified independent resources for deeper study.') + '</p>'
      + '<div class="if-refs-grid">' + cards + '</div>'
      + '<p class="if-refs-note">' + (te ? 'ఈ లింకులు బయటి వెబ్‌సైట్‌లకు తీసుకెళ్తాయి.' : 'These links open external websites in a new tab.') + '</p>'
      + '</div>';
  }

  function injectRefs() {
    if (!REFS[portalKey()]) return;
    if (!document.getElementById('if-refs')) {
      var sec = document.createElement('section'); sec.id = 'if-refs'; sec.className = 'if-refs';
      sec.setAttribute('aria-label', 'Trusted external sources');
      var footer = document.querySelector('footer.lu-footer');
      if (footer && footer.parentNode) footer.parentNode.insertBefore(sec, footer);
      else document.body.appendChild(sec);
    }
    paintRefs();
  }

  /* ── Certificate — in-page modal, no popups, Canvas download ── */
  function certificate(o) {
    o = o || {}; var te = getLang() === 'te';
    var L = te
      ? { cert: 'పూర్తి ధృవీకరణ పత్రం', awarded: 'ఇది ఇచ్చబడింది', completed: 'విజయవంతంగా పూర్తి చేసినందుకు', score: 'స్కోరు', org: 'ఇస్లామిక్ ఫ్రంట్ · జ్ఞాన కేంద్రం', date: 'తేదీ', name_lbl: 'మీ పేరు', name_ph: 'మీ పేరు నమోదు చేయండి', download: 'డౌన్‌లోడ్ చేయండి (PNG)', print: 'ముద్రించండి', close: 'మూసివేయండి', default_name: 'ఒక అంకిత విద్యార్థి' }
      : { cert: 'Certificate of Completion', awarded: 'This is awarded to', completed: 'for successfully completing', score: 'Score', org: 'Islamic Front · Knowledge Center', date: 'Date', name_lbl: 'Your Name', name_ph: 'Enter your name', download: 'Download (PNG)', print: 'Print', close: 'Close', default_name: 'A dedicated learner' };
    var courseTitle = o.title || (te ? 'ఇస్లామిక్ అభ్యాసం' : 'Islamic Learning');
    var dateStr = '';
    try { dateStr = new Date().toLocaleDateString(te ? 'te-IN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch(e) { dateStr = new Date().toDateString(); }

    /* remove any existing modal */
    var old = document.getElementById('if-cert-modal');
    if (old) old.remove();

    /* inject modal styles once */
    if (!document.getElementById('if-cert-style')) {
      var s = document.createElement('style'); s.id = 'if-cert-style';
      s.textContent = '#if-cert-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;animation:certFadeIn .2s ease}'
        + '@keyframes certFadeIn{from{opacity:0}to{opacity:1}}'
        + '#if-cert-modal{background:#faf6ee;border-radius:16px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 80px rgba(0,0,0,.5);position:relative}'
        + '#if-cert-close{position:absolute;top:14px;right:16px;background:none;border:none;font-size:22px;cursor:pointer;color:#7a6840;line-height:1;padding:4px 8px;border-radius:6px}'
        + '#if-cert-close:hover{background:rgba(200,146,42,.12)}'
        + '.cert-form{padding:24px 28px 0;border-bottom:1px solid rgba(200,146,42,.2)}'
        + '.cert-form label{font-size:13px;font-weight:600;color:#3d3018;display:block;margin-bottom:6px}'
        + '.cert-form input{width:100%;box-sizing:border-box;padding:10px 14px;border:1.5px solid rgba(200,146,42,.4);border-radius:8px;font-size:16px;color:#1a1208;background:#fffdf7;outline:none}'
        + '.cert-form input:focus{border-color:#c8922a}'
        + '.cert-preview{padding:32px 36px;text-align:center;position:relative}'
        + '.cert-preview::after{content:"";position:absolute;inset:14px;border:1px solid rgba(200,146,42,.3);border-radius:8px;pointer-events:none}'
        + '.cert-seal{width:52px;height:52px;margin:0 auto 6px}'
        + '.cert-org{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c8922a;font-weight:700;margin-bottom:14px}'
        + '.cert-title{font-family:Georgia,serif;font-size:26px;color:#0d3b1e;font-weight:700;margin-bottom:16px}'
        + '.cert-lbl{font-size:12px;color:#7a6840;margin:12px 0 3px}'
        + '.cert-name{font-family:Georgia,serif;font-size:24px;color:#1a1208;font-weight:700;border-bottom:2px solid rgba(200,146,42,.35);display:inline-block;padding:0 20px 5px}'
        + '.cert-course{font-size:16px;color:#1a5c30;font-weight:600;margin:8px 0}'
        + '.cert-meta{display:flex;justify-content:space-between;margin-top:28px;font-size:12px;color:#3d3018;flex-wrap:wrap;gap:4px}'
        + '.cert-actions{display:flex;gap:10px;padding:16px 28px 24px;justify-content:flex-end;flex-wrap:wrap}'
        + '.cert-btn{padding:10px 22px;border-radius:100px;font-size:14px;font-weight:700;cursor:pointer;border:none}'
        + '.cert-btn-primary{background:#c8922a;color:#0d3b1e}'
        + '.cert-btn-secondary{background:rgba(200,146,42,.12);color:#3d3018}'
        + '@media(max-width:500px){.cert-preview{padding:24px 20px}.cert-actions{justify-content:center}}';
      document.head.appendChild(s);
    }

    /* build modal */
    var overlay = document.createElement('div'); overlay.id = 'if-cert-overlay';
    overlay.innerHTML = '<div id="if-cert-modal" role="dialog" aria-modal="true" aria-label="' + L.cert + '">'
      + '<button id="if-cert-close" aria-label="' + L.close + '">✕</button>'
      + '<div class="cert-form"><label for="if-cert-name">' + L.name_lbl + '</label>'
      + '<input id="if-cert-name" type="text" placeholder="' + L.name_ph + '" maxlength="80" autocomplete="name"></div>'
      + '<div class="cert-preview" id="if-cert-preview">'
      + '<div class="cert-seal"><svg viewBox="0 0 60 60" width="52" height="52" aria-hidden="true"><circle cx="30" cy="30" r="28" fill="none" stroke="#c8922a" stroke-width="1.5"/><path d="M38 16a13 13 0 1 0 0 26 10 10 0 1 1 0-26z" fill="#c8922a" opacity="0.8"/><circle cx="44" cy="22" r="4" fill="#c8922a" opacity="0.6"/></svg></div>'
      + '<div class="cert-org">' + L.org + '</div>'
      + '<div class="cert-title">' + L.cert + '</div>'
      + '<div class="cert-lbl">' + L.awarded + '</div>'
      + '<div class="cert-name" id="if-cert-nm">' + L.default_name + '</div>'
      + '<div class="cert-lbl">' + L.completed + '</div>'
      + '<div class="cert-course">' + courseTitle + '</div>'
      + (o.score ? '<div class="cert-lbl">' + L.score + ': <b>' + o.score + '</b></div>' : '')
      + '<div class="cert-meta"><span>' + L.date + ': ' + dateStr + '</span><span>' + L.org + '</span></div>'
      + '</div>'
      + '<div class="cert-actions">'
      + '<button class="cert-btn cert-btn-secondary" id="if-cert-print">' + L.print + '</button>'
      + '<button class="cert-btn cert-btn-primary" id="if-cert-dl">' + L.download + '</button>'
      + '</div></div>';
    document.body.appendChild(overlay);

    var nameInput = document.getElementById('if-cert-name');
    var nameDisplay = document.getElementById('if-cert-nm');

    /* live name preview */
    nameInput.addEventListener('input', function() {
      var v = nameInput.value.replace(/[<>]/g, '').trim();
      nameDisplay.textContent = v || L.default_name;
    });

    /* close handlers */
    function closeCert() { overlay.remove(); }
    document.getElementById('if-cert-close').addEventListener('click', closeCert);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeCert(); });
    document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { closeCert(); document.removeEventListener('keydown', esc); } });

    /* print */
    document.getElementById('if-cert-print').addEventListener('click', function() {
      var preview = document.getElementById('if-cert-preview');
      var printWin = window.open('', '_blank');
      if (!printWin) { toast(te ? 'ముద్రణ కోసం పాప్‌అప్‌ను అనుమతించండి' : 'Allow pop-ups to print'); return; }
      printWin.document.write('<!doctype html><html><head><meta charset="utf-8"><style>'
        + document.getElementById('if-cert-style').textContent
        + 'body{background:#fff;padding:24px;font-family:Georgia,serif}.cert-preview{border:3px solid #c8922a;border-radius:14px;max-width:680px;margin:auto}#if-cert-close,.cert-form,.cert-actions{display:none}'
        + '</style></head><body>' + preview.outerHTML + '</body></html>');
      printWin.document.close();
      printWin.focus(); printWin.print();
    });

    /* PNG download via Canvas */
    document.getElementById('if-cert-dl').addEventListener('click', function() {
      var nm = (nameInput.value.replace(/[<>]/g, '').trim()) || L.default_name;
      var W = 900, H = 620;
      var canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      var ctx = canvas.getContext('2d');
      /* background */
      ctx.fillStyle = '#faf6ee'; ctx.fillRect(0, 0, W, H);
      /* outer border */
      ctx.strokeStyle = '#c8922a'; ctx.lineWidth = 4;
      ctx.strokeRect(8, 8, W - 16, H - 16);
      /* inner border */
      ctx.strokeStyle = 'rgba(200,146,42,0.4)'; ctx.lineWidth = 1;
      ctx.strokeRect(22, 22, W - 44, H - 44);
      /* org */
      ctx.fillStyle = '#c8922a'; ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center'; ctx.letterSpacing = '3px';
      ctx.fillText(L.org.toUpperCase(), W / 2, 90);
      /* cert title */
      ctx.fillStyle = '#0d3b1e'; ctx.font = 'bold 34px Georgia, serif'; ctx.letterSpacing = '0px';
      ctx.fillText(L.cert, W / 2, 148);
      /* awarded */
      ctx.fillStyle = '#7a6840'; ctx.font = '14px sans-serif';
      ctx.fillText(L.awarded, W / 2, 200);
      /* name */
      ctx.fillStyle = '#1a1208'; ctx.font = 'bold 32px Georgia, serif';
      ctx.fillText(nm, W / 2, 250);
      /* underline */
      var nw = ctx.measureText(nm).width;
      ctx.strokeStyle = 'rgba(200,146,42,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W/2 - nw/2 - 20, 260); ctx.lineTo(W/2 + nw/2 + 20, 260); ctx.stroke();
      /* completed */
      ctx.fillStyle = '#7a6840'; ctx.font = '14px sans-serif';
      ctx.fillText(L.completed, W / 2, 298);
      /* course */
      ctx.fillStyle = '#1a5c30'; ctx.font = 'bold 22px Georgia, serif';
      ctx.fillText(courseTitle, W / 2, 336);
      /* score */
      if (o.score) { ctx.fillStyle = '#7a6840'; ctx.font = '14px sans-serif'; ctx.fillText(L.score + ': ' + o.score, W / 2, 372); }
      /* meta */
      ctx.fillStyle = '#3d3018'; ctx.font = '13px sans-serif';
      ctx.textAlign = 'left'; ctx.fillText(L.date + ': ' + dateStr, 60, H - 55);
      ctx.textAlign = 'right'; ctx.fillText(L.org, W - 60, H - 55);
      /* download */
      var link = document.createElement('a');
      link.download = 'islamic-front-certificate.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });

    /* focus name input */
    setTimeout(function() { nameInput.focus(); }, 50);
  }

  /* ── PWA: manifest + conservative service worker (skips file://) ── */
  function initPWA() {
    var sEl = document.querySelector('script[src*="if-core.js"]');
    var base = sEl ? sEl.src.replace(/assets\/js\/if-core\.js.*$/, '') : '';
    if (!document.querySelector('link[rel="manifest"]')) {
      var l = document.createElement('link'); l.rel = 'manifest'; l.href = base + 'assets/manifest.json'; document.head.appendChild(l);
    }
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      try { navigator.serviceWorker.register(base + 'sw.js', { scope: base }); } catch (e) {}
    }
  }

  /* ── Glossary (universal Islamic terms; loads on every portal, no wiring) ── */
  var GLOSSARY = [
    { t: 'Salah', en: 'The five daily ritual prayers.', te: 'ఐదు పూటల విధి నమాజ్.' },
    { t: 'Wudu', en: 'Ablution; washing before prayer.', te: 'నమాజ్‌కు ముందు చేసే పరిశుద్ధత (వుదూ).' },
    { t: 'Ghusl', en: 'The full ritual bath.', te: 'పూర్తి స్నాన పరిశుద్ధత.' },
    { t: 'Tajweed', en: 'Rules for reciting the Quran correctly.', te: 'ఖురాన్‌ను సరిగ్గా పఠించే నియమాలు.' },
    { t: 'Makharij', en: 'The articulation points of Arabic letters.', te: 'అరబిక్ అక్షరాల ఉచ్చారణ స్థానాలు.' },
    { t: 'Qalqalah', en: 'A bouncing echo on certain letters when still.', te: 'కొన్ని అక్షరాలపై వచ్చే ప్రతిధ్వని.' },
    { t: 'Ghunnah', en: 'A nasal sound held for about two counts.', te: 'సుమారు రెండు మాత్రల నాసిక ధ్వని.' },
    { t: 'Madd', en: 'Elongation of a vowel in recitation.', te: 'పఠనంలో స్వరాన్ని దీర్ఘం చేయడం.' },
    { t: 'Ayah', en: 'A verse of the Quran.', te: 'ఖురాన్ ఆయత్ (వచనం).' },
    { t: 'Surah', en: 'A chapter of the Quran.', te: 'ఖురాన్ సూరా (అధ్యాయం).' },
    { t: 'Juz', en: 'One of the thirty parts of the Quran.', te: 'ఖురాన్ ముప్పై భాగాలలో ఒకటి.' },
    { t: 'Hifz', en: 'Memorisation of the Quran.', te: 'ఖురాన్ కంఠస్థం.' },
    { t: 'Tafseer', en: 'Explanation and commentary of the Quran.', te: 'ఖురాన్ వ్యాఖ్యానం.' },
    { t: 'Hadith', en: 'A reported saying or action of the Prophet ﷺ.', te: 'ప్రవక్త ﷺ వచనం లేదా చర్య.' },
    { t: 'Sunnah', en: 'The way and practice of the Prophet ﷺ.', te: 'ప్రవక్త ﷺ ఆదర్శ మార్గం, ఆచరణ.' },
    { t: 'Sahabah', en: 'The Companions of the Prophet ﷺ.', te: 'ప్రవక్త ﷺ సహచరులు.' },
    { t: 'Hijrah', en: 'The migration to Madinah (622 CE).', te: 'మదీనాకు వలస (622 సా.శ.).' },
    { t: 'Seerah', en: 'The life and biography of the Prophet ﷺ.', te: 'ప్రవక్త ﷺ జీవిత చరిత్ర.' },
    { t: 'Khalifah', en: 'A caliph; a successor leader of the Ummah.', te: 'ఖలీఫా; ఉమ్మత్ వారసుడైన నాయకుడు.' },
    { t: 'Ummah', en: 'The global community of Muslims.', te: 'ప్రపంచ ముస్లిం సమాజం.' },
    { t: 'Qiblah', en: 'The direction of prayer (towards the Kaaba).', te: 'నమాజ్ దిశ (కాబా వైపు).' },
    { t: 'Adhan', en: 'The call to prayer.', te: 'నమాజ్ పిలుపు (అజాన్).' },
    { t: 'Rakah', en: 'One full unit of prayer.', te: 'నమాజ్ ఒక రకాత్.' },
    { t: 'Ruku', en: 'The bowing position in prayer.', te: 'నమాజ్‌లో వంగే స్థానం.' },
    { t: 'Sujood', en: 'The prostration in prayer.', te: 'నమాజ్‌లో సాష్టాంగం.' },
    { t: 'Dua', en: 'Supplication and calling upon Allah.', te: 'అల్లాహ్‌ను వేడుకోవడం (దువా).' },
    { t: 'Dhikr', en: 'Remembrance of Allah.', te: 'అల్లాహ్ స్మరణ.' },
    { t: 'Iman', en: 'Faith and belief.', te: 'విశ్వాసం (ఈమాన్).' },
    { t: 'Taqwa', en: 'God-consciousness and mindfulness of Allah.', te: 'దైవభీతి (తఖ్వా).' },
    { t: 'Akhlaq', en: 'Good character and manners.', te: 'ఉత్తమ స్వభావం, నడవడిక.' }
  ];

  function paintGlossary(filter) {
    var list = document.getElementById('ifg-list'); if (!list) return;
    var te = getLang() === 'te';
    var f = (filter || '').trim().toLowerCase();
    var rows = GLOSSARY.filter(function (g) {
      if (!f) return true;
      return (g.t + ' ' + g.en + ' ' + g.te).toLowerCase().indexOf(f) >= 0;
    }).map(function (g) {
      return '<div class="ifg-item"><div class="ifg-term">' + g.t + '</div><div class="ifg-def">' + (te ? g.te : g.en) + '</div></div>';
    }).join('');
    list.innerHTML = rows || '<div class="ifg-empty">' + (te ? 'ఫలితాలు లేవు.' : 'No matches.') + '</div>';
  }
  function injectGlossary() {
    if (document.getElementById('if-glossary')) { paintGlossary(); return; }
    var te = getLang() === 'te';
    var sec = document.createElement('section'); sec.id = 'if-glossary'; sec.className = 'ifg-sec'; sec.setAttribute('aria-label', 'Glossary of terms');
    sec.innerHTML = '<div class="ifg-inner">'
      + '<div class="ifg-label">' + (te ? 'పదకోశం' : 'Glossary') + '</div>'
      + '<h2 class="ifg-title">' + (te ? 'పదాల అర్థాలు' : 'Glossary of Terms') + '</h2>'
      + '<p class="ifg-sub">' + (te ? 'సాధారణ ఇస్లామిక్ పదాల సరళ వివరణలు. వెతకడానికి టైప్ చేయండి.' : 'Plain explanations of common Islamic terms. Type to search.') + '</p>'
      + '<input type="search" class="ifg-search" id="ifg-search" placeholder="' + (te ? 'పదం వెతకండి…' : 'Search a term…') + '" aria-label="' + (te ? 'పదం వెతకండి' : 'Search a term') + '">'
      + '<div class="ifg-list" id="ifg-list"></div>'
      + '</div>';
    var refs = document.getElementById('if-refs');
    var footer = document.querySelector('footer.lu-footer');
    var anchor = refs || footer;
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(sec, anchor);
    else document.body.appendChild(sec);
    var inp = sec.querySelector('#ifg-search');
    inp.addEventListener('input', function () { paintGlossary(inp.value); });
    paintGlossary();
  }

  /* ── boot ── */
  function syncLocalizedAttributes() {
    var suffix = getLang() === 'te' ? 'te' : 'en';
    [
      { attr: 'alt', data: 'data-alt-' },
      { attr: 'aria-label', data: 'data-aria-' },
      { attr: 'title', data: 'data-title-' }
    ].forEach(function (cfg) {
      document.querySelectorAll('[' + cfg.data + 'te][' + cfg.data + 'en]').forEach(function (el) {
        var value = el.getAttribute(cfg.data + suffix);
        if (value) el.setAttribute(cfg.attr, value);
      });
    });
  }

  function boot() { initA11y(); syncLocalizedAttributes(); injectRefs(); initPWA(); setTimeout(injectGlossary, 0); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  /* re-paint language-dependent components when the portal toggles <html lang> */
  new MutationObserver(function () {
    paintRefs();
    var gi = document.getElementById('ifg-search'); paintGlossary(gi ? gi.value : '');
    var gt = document.querySelector('#if-glossary .ifg-title'); if (gt) gt.textContent = getLang() === 'te' ? 'పదాల అర్థాలు' : 'Glossary of Terms';
    var gl = document.querySelector('#if-glossary .ifg-label'); if (gl) gl.textContent = getLang() === 'te' ? 'పదకోశం' : 'Glossary';
    var gs = document.querySelector('#if-glossary .ifg-sub'); if (gs) gs.textContent = getLang() === 'te' ? 'సాధారణ ఇస్లామిక్ పదాల సరళ వివరణలు. వెతకడానికి టైప్ చేయండి.' : 'Plain explanations of common Islamic terms. Type to search.';
    var sk = document.querySelector('.if-skip');
    if (sk) sk.textContent = getLang() === 'te' ? 'ముఖ్య విషయానికి వెళ్లండి' : 'Skip to content';
    syncLocalizedAttributes();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  /* ── Shared scroll-reveal: activates .ifx-reveal → .ifx-visible ── */
  /* Also auto-attaches .ifx-reveal to common portal card elements    */
  var PORTAL_CARD_SELS = [
    '.alf-card', '.ph-card', '.surah-card', '.qd-card',
    '.step-card', '.miss-card', '.sw-card', '.gl-card',
    '.dua-card', '.name-card', '.word-card', '.if-ref-card',
    '.rm-card', '.dashboard-card', '.timeline-card', '.era-card',
    '.char-card', '.mission-card', '.story-card', '.lesson-card',
    '.tool-card', '.feature-card', '.benefit-card', '.achievement-card'
  ];
  function attachPortalReveal() {
    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      document.querySelectorAll('.ifx-reveal,.ifx-reveal-left,.ifx-reveal-scale').forEach(function(el){
        el.classList.add('ifx-visible');
        el.style.transitionDelay = '';
      });
      return;
    }
    PORTAL_CARD_SELS.forEach(function(sel){
      document.querySelectorAll(sel).forEach(function(el, i){
        if (!el.classList.contains('ifx-reveal') && !el.classList.contains('reveal')) {
          el.classList.add('ifx-reveal');
          el.style.transitionDelay = Math.min(i, 7) * 70 + 'ms';
        }
      });
    });
  }
  function initIfxReveal() {
    attachPortalReveal();
    var noMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!('IntersectionObserver' in window) || noMotion) {
      document.querySelectorAll('.ifx-reveal,.ifx-reveal-left,.ifx-reveal-scale').forEach(function(el){ el.classList.add('ifx-visible'); });
      return;
    }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('ifx-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
    document.querySelectorAll('.ifx-reveal,.ifx-reveal-left,.ifx-reveal-scale').forEach(function(el){ io.observe(el); });
  }

  /* expose a tiny API for future components (quiz/flashcard/search) */
  window.IFCore = { toast: toast, getLang: getLang, playAudio: playAudio, certificate: certificate, initIfxReveal: initIfxReveal };

  /* run ifx reveal after DOMContentLoaded (if not already booted) */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(initIfxReveal, 0); });
  else setTimeout(initIfxReveal, 0);

  /* ── Ensure <main> landmark exists for WCAG 2.1 landmark navigation ── */
  (function ensureMain() {
    if (document.querySelector('main, [role="main"]')) return;
    var nav = document.querySelector('body > nav');
    var firstSection = nav ? nav.nextElementSibling : document.querySelector('body > section, body > div.inner, body > div[class]');
    if (firstSection) firstSection.setAttribute('role', 'main');
  })();

  /* ── Nav scroll shadow: adds .scrolled to body>nav when page scrolled ── */
  (function initNavShadow() {
    function markScroll() {
      var nav = document.querySelector('body > nav');
      if (nav) nav.classList.toggle('if-nav-scrolled', window.scrollY > 8);
    }
    window.addEventListener('scroll', markScroll, { passive: true });
    markScroll();
  })();

  /* ── aria-current sync for scroll-spy nav links ── */
  (function initAriaCurrent() {
    var sticky = document.querySelector('.al-sticky, .kc-sticky');
    if (!sticky) return;
    var links = sticky.querySelectorAll('a[data-spy]');
    if (!links.length) return;
    var mo = new MutationObserver(function(muts) {
      muts.forEach(function(m) {
        if (m.attributeName === 'class') {
          var isActive = m.target.classList.contains('spy-active');
          if (isActive) m.target.setAttribute('aria-current', 'true');
          else m.target.removeAttribute('aria-current');
        }
      });
    });
    links.forEach(function(a) { mo.observe(a, { attributes: true, attributeFilter: ['class'] }); });
  })();

  /* ── Phase 1: Mobile Navigation App Shell Injection ── */
  (function initAppShell() {
    var shellMqlBound = false;

    function isPortalPath(p) {
      return /knowledge-center\/[^\/]+\/?(index\.html)?$/.test(p);
    }

    function isHubPage() {
      var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
      if (p === '/' || (/\/index\.html$/.test(p) && p.indexOf('knowledge-center/') < 0)) return true;
      if (p.indexOf('islamic-knowledge.html') >= 0) return true;
      if (p.indexOf('student-guidance.html') >= 0) return true;
      if (isPortalPath(p)) return true;
      if (p.match(/knowledge-center\/?$/)) return true;
      return false;
    }

    function setup() {
      if (!isHubPage()) return;
      if (!document.body) return;

      var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
      var isHome = p === '/' || (/\/index\.html$/.test(p) && p.indexOf('knowledge-center/') < 0);
      var mobileMql = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
      function isMobileShell() {
        return !mobileMql || mobileMql.matches;
      }
      function removeInjectedShell() {
        ['bottom-nav', 'nav-overlay', 'nav-drawer'].forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.remove();
        });
      }
      function syncShellClasses() {
        var active = isMobileShell();
        document.body.classList.toggle('if-app-shell', active);
        document.body.classList.toggle('if-home-app', active && isHome);
        if (!active) removeInjectedShell();
      }
      syncShellClasses();
      if (mobileMql && !shellMqlBound) {
        var onShellChange = function () {
          syncShellClasses();
          if (isMobileShell()) setup();
        };
        if (mobileMql.addEventListener) mobileMql.addEventListener('change', onShellChange);
        else if (mobileMql.addListener) mobileMql.addListener(onShellChange);
        shellMqlBound = true;
      }
      if (!isMobileShell()) return;
      if (document.getElementById('bottom-nav')) return;
      var isKnowledge = (p.indexOf('islamic-knowledge.html') >= 0 || p.indexOf('knowledge-center/') >= 0) && !isHome;
      var base = (p.indexOf('knowledge-center/') >= 0) ? '../../' : '';
      var te = getLang() === 'te';
      var hash = window.location.hash || '';
      var isSchemeHash = isHome && (hash === '#scheme' || hash === '#schemes');
      var isContactHash = isHome && (hash === '#community-contact' || hash === '#contact');
      var isHomeActive = isHome && !isSchemeHash && !isContactHash;

      // Inject bottom nav bar
      var nav = document.createElement('nav');
      nav.className = 'bottom-nav';
      nav.id = 'bottom-nav';
      nav.setAttribute('aria-label', 'Page navigation');
      nav.innerHTML = 
          '<a href="' + base + 'index.html#home" class="bn-item' + (isHomeActive ? ' bn-active" aria-current="page' : '') + '">'
        + '  <svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />'
        + '    <polyline points="9 22 9 12 15 12 15 22" />'
        + '  </svg>'
        + '  <span class="bn-label" data-bn-label="home">' + (te ? 'హోమ్' : 'Home') + '</span>'
        + '</a>'
        + '<a href="' + base + 'index.html#scheme" class="bn-item' + (isSchemeHash ? ' bn-active" aria-current="page' : '') + '">'
        + '  <svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '    <path d="M4 19V8l8-4 8 4v11" /><path d="M4 19h16" /><path d="M8 19v-6h8v6" />'
        + '  </svg>'
        + '  <span class="bn-label" data-bn-label="schemes">' + (te ? 'పథకాలు' : 'Schemes') + '</span>'
        + '</a>'
        + '<a href="' + base + 'islamic-knowledge.html" class="bn-item' + (isKnowledge ? ' bn-active" aria-current="page' : '') + '">'
        + '  <svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '    <path d="M12 2C9 3 6 5.5 6 9h12c0-3.5-3-6-6-6z"/><rect x="4" y="9" width="16" height="2" rx="1"/><path d="M6 11v8h4v-5h4v5h4v-8"/><path d="M2 21h20"/>'
        + '  </svg>'
        + '  <span class="bn-label" data-bn-label="learn">' + (te ? 'అభ్యాసం' : 'Learn') + '</span>'
        + '</a>'
        + '<button type="button" class="bn-item lang-btn" id="bn-lang" aria-label="Switch language">'
        + '  <svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '    <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'
        + '  </svg>'
        + '  <span class="bn-label">' + (te ? 'English' : 'తెలుగు') + '</span>'
        + '</button>'
        + '<button type="button" class="bn-item" id="bn-more" aria-haspopup="true" aria-expanded="false" aria-controls="nav-drawer">'
        + '  <svg class="bn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        + '    <circle cx="12" cy="12" r="1" />'
        + '    <circle cx="19" cy="12" r="1" />'
        + '    <circle cx="5" cy="12" r="1" />'
        + '  </svg>'
        + '  <span class="bn-label" data-bn-label="more">' + (te ? 'మరిన్ని' : 'More') + '</span>'
        + '</button>';
      document.body.appendChild(nav);

      // Inject bottom sheet drawer and overlay if not present
      if (!document.getElementById('nav-drawer')) {
        var overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        overlay.id = 'nav-overlay';
        document.body.appendChild(overlay);

        var drawer = document.createElement('div');
        drawer.className = 'nav-drawer';
        drawer.id = 'nav-drawer';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-modal', 'true');
        drawer.setAttribute('aria-label', 'Navigation menu');
        drawer.setAttribute('aria-hidden', 'true');
        drawer.innerHTML = 
            '<div class="nav-drawer-header">'
          + '  <div class="nav-drawer-handle"></div>'
          + '  <span class="nav-drawer-brand">' + (te ? 'ఇస్లామిక్ ఫ్రంట్' : 'Islamic Front') + '</span>'
          + '  <button class="nav-drawer-close" id="nav-drawer-close" aria-label="Close menu">&#x2715;</button>'
          + '</div>'
          + '<ul class="nav-drawer-links">'
          + '  <li><a href="' + base + 'student-guidance.html">' + (te ? 'విద్యార్థి మార్గదర్శనం' : 'Student Guidance') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#victory">' + (te ? 'మా విజయం' : 'Our Victory') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#achievements">' + (te ? 'సాధనలు' : 'Achievements') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#manifesto">' + (te ? 'మేనిఫెస్టో' : 'Manifesto') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#stories">' + (te ? 'సఫలత కథలు' : 'Success Stories') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#events">' + (te ? 'కార్యక్రమాలు' : 'Events') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#volunteer">' + (te ? 'స్వచ్ఛంద సేవ' : 'Volunteer') + '</a></li>'
          + '  <li><a href="' + base + 'index.html#about">' + (te ? 'మా గురించి' : 'About Us') + '</a></li>'
          + '</ul>';
        document.body.appendChild(drawer);
      }

      // Event binding
      var navDrawer = document.getElementById('nav-drawer');
      var navOverlay = document.getElementById('nav-overlay');
      var navDrClose = document.getElementById('nav-drawer-close');
      var bnMore = document.getElementById('bn-more');

      function openDrawer() {
        navDrawer.classList.add('open-display');
        navDrawer.offsetHeight; // force reflow
        navDrawer.classList.add('open');
        navDrawer.setAttribute('aria-hidden', 'false');
        navOverlay.classList.add('open');
        if (bnMore) bnMore.setAttribute('aria-expanded', 'true');
        // iOS-safe scroll lock: position:fixed preserves scroll unlike overflow:hidden
        var scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollY + 'px';
        document.body.style.width = '100%';
        document.body.dataset.drawerScrollY = scrollY;
        var firstLink = navDrawer.querySelector('a');
        if (firstLink) setTimeout(function () { firstLink.focus(); }, 360);
      }

      function closeDrawer() {
        navDrawer.classList.remove('open');
        navDrawer.setAttribute('aria-hidden', 'true');
        navOverlay.classList.remove('open');
        if (bnMore) bnMore.setAttribute('aria-expanded', 'false');
        // Restore scroll position after unlocking body
        var scrollY = parseInt(document.body.dataset.drawerScrollY || '0', 10);
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
        setTimeout(function () {
          if (!navDrawer.classList.contains('open')) navDrawer.classList.remove('open-display');
        }, 420);
      }

      if (bnMore) bnMore.addEventListener('click', function () { navDrawer.classList.contains('open') ? closeDrawer() : openDrawer(); });
      if (navDrClose) navDrClose.addEventListener('click', closeDrawer);
      if (navOverlay) navOverlay.addEventListener('click', closeDrawer);

      // Language toggle in bottom nav
      var bnLang = document.getElementById('bn-lang');
      if (bnLang) {
        bnLang.addEventListener('click', function () {
          var cur = getLang();
          var next = cur === 'te' ? 'en' : 'te';
          if (typeof setLang === 'function') {
            setLang(next);
          } else if (typeof applyLang === 'function') {
            applyLang(next);
          } else {
            localStorage.setItem('if-lang', next);
            document.documentElement.lang = next === 'te' ? 'te-IN' : 'en';
            document.querySelectorAll('[data-te],[data-en]').forEach(function (el) {
              var txt = el.getAttribute('data-' + next);
              if (txt !== null) el.innerHTML = txt;
            });
          }
          var lbl = bnLang.querySelector('.bn-label');
          if (lbl) lbl.textContent = next === 'te' ? 'English' : 'తెలుగు';
        });
      }

      // Dismiss drawer on escape key
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && navDrawer.classList.contains('open')) closeDrawer(); });

      // Auto-update bottom nav texts when language changes
      new MutationObserver(function () {
        var isTe = getLang() === 'te';
        var copy = {
          home: { te: 'హోమ్', en: 'Home' },
          schemes: { te: 'పథకాలు', en: 'Schemes' },
          learn: { te: 'అభ్యాసం', en: 'Learn' },
          more: { te: 'మరిన్ని', en: 'More' }
        };
        document.querySelectorAll('.bottom-nav .bn-label[data-bn-label]').forEach(function (label) {
          var key = label.getAttribute('data-bn-label');
          if (copy[key]) label.textContent = isTe ? copy[key].te : copy[key].en;
        });
        if (bnLang) { var lbl2 = bnLang.querySelector('.bn-label'); if (lbl2) lbl2.textContent = isTe ? 'English' : 'తెలుగు'; }
        var db = document.querySelector('.nav-drawer-brand');
        if (db) db.textContent = isTe ? 'ఇస్లామిక్ ఫ్రంట్' : 'Islamic Front';
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  })();

  /* ── Phase 3: Mobile app-screen containment for long hub/portal pages ── */
  (function initAppScreens() {
    var screenMqlBound = false;

    var DEFAULT_TABS = [
      { id: 'overview', te: 'అవలోకనం', en: 'Overview' },
      { id: 'learn', te: 'అభ్యాసం', en: 'Learn' },
      { id: 'practice', te: 'ప్రాక్టీస్', en: 'Practice' },
      { id: 'resources', te: 'వనరులు', en: 'Resources' },
      { id: 'references', te: 'మూలాలు', en: 'References' }
    ];

    var KC_TABS = [
      { id: 'today', te: 'ఈ రోజు', en: 'Today' },
      { id: 'learn', te: 'అభ్యాసం', en: 'Learn' },
      { id: 'practice', te: 'ప్రాక్టీస్', en: 'Practice' },
      { id: 'library', te: 'లైబ్రరీ', en: 'Library' },
      { id: 'faqs', te: 'ప్రశ్నలు', en: 'FAQs' }
    ];

    var SG_TABS = [
      { id: 'start', te: 'ప్రారంభం', en: 'Start' },
      { id: 'explore', te: 'ఎంచుకోండి', en: 'Explore' },
      { id: 'compare', te: 'పోల్చండి', en: 'Compare' },
      { id: 'support', te: 'సహాయం', en: 'Support' },
      { id: 'values', te: 'విలువలు', en: 'Values' }
    ];

    var LEARNING_TABS = [
      { id: 'start', te: 'ప్రారంభం', en: 'Start' },
      { id: 'path', te: 'మార్గం', en: 'Path' },
      { id: 'lessons', te: 'పాఠాలు', en: 'Lessons' },
      { id: 'practice', te: 'ప్రాక్టీస్', en: 'Practice' },
      { id: 'more', te: 'మరిన్ని', en: 'More' }
    ];

    function isLongAppPage() {
      var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
      if (p.indexOf('student-guidance.html') >= 0) return true;
      if (p.indexOf('islamic-knowledge.html') >= 0) return true;
      return /knowledge-center\/[^\/]+\/?(index\.html)?$/.test(p);
    }

    function isKnowledgeCenterPage() {
      return (location.pathname || '').replace(/\\/g, '/').toLowerCase().indexOf('islamic-knowledge.html') >= 0;
    }

    function isStudentGuidancePage() {
      return (location.pathname || '').replace(/\\/g, '/').toLowerCase().indexOf('student-guidance.html') >= 0;
    }

    function isLearningPortalPage() {
      var p = (location.pathname || '').replace(/\\/g, '/').toLowerCase();
      return /knowledge-center\/[^\/]+\/?(index\.html)?$/.test(p);
    }

    function screenForKnowledgeCenter(section) {
      var id = (section.id || '').toLowerCase();
      if (/^(salah|zakat|lang-portals)$/.test(id)) return 'today';
      if (/^(basics|pillars|learn-arabic|learn-urdu)$/.test(id)) return 'learn';
      if (/^(wudu|salah-guide|guides)$/.test(id)) return 'practice';
      if (/^(quran|hadith|akhlaq|modern-life|quran-science)$/.test(id)) return 'library';
      if (id === 'faqs') return 'faqs';
      return 'library';
    }

    function screenForStudentGuidance(section) {
      var id = (section.id || '').toLowerCase();
      var cls = (section.className || '').toString().toLowerCase();
      if (cls.indexOf('sg-tools') >= 0) return 'explore';
      if (/^(career|before)$/.test(id)) return 'start';
      if (/^(after10|mpc|bipc|commerce|arts)$/.test(id)) return 'explore';
      if (/^(exams|govt|reality|passion)$/.test(id)) return 'compare';
      if (id === 'scholarships') return 'support';
      if (/^(islamic|stories)$/.test(id) || cls.indexOf('sg-final') >= 0) return 'values';
      return 'explore';
    }

    function screenForLearningPortal(section, index) {
      var id = (section.id || '').toLowerCase();
      var cls = (section.className || '').toString().toLowerCase();
      var text = (id + ' ' + cls).toLowerCase();
      if (/^(knowledge|coming|if-refs|resources|references|faq|faqs)$/.test(id) || /(knowledge|coming|resource|reference|source|faq|footer|contact)/.test(text)) return 'more';
      if (/^(roadmap|journey|path|timeline)$/.test(id) || /(roadmap|journey|path|timeline|stage)/.test(text)) return 'path';
      if (/^(levels|lessons|lesson|modules|curriculum|pillars|foundations?)$/.test(id) || /(level|lesson|module|curriculum|reading|foundation|pillar)/.test(text)) return 'lessons';
      if (/^(alphabet|word|phrases|practice|challenge|quiz|surahs|guide|steps|wudu|duas|names|stories|character|personalities|civilization|mistakes)$/.test(id)) return 'practice';
      if (/(alphabet|word|phrase|practice|challenge|quiz|surah|guide|step|dua|name|story|character|personalit|civilization|mistake|tracker|simulator)/.test(text)) return 'practice';
      if (index === 0 || /^(why|intro|overview|purpose|benefits?|about)$/.test(id)) return 'start';
      return index < 2 ? 'start' : 'more';
    }

    function screenFor(section, index) {
      if (isKnowledgeCenterPage()) return screenForKnowledgeCenter(section);
      if (isStudentGuidancePage()) return screenForStudentGuidance(section);
      if (isLearningPortalPage()) return screenForLearningPortal(section, index);
      var id = (section.id || '').toLowerCase();
      var cls = (section.className || '').toString().toLowerCase();
      var text = (id + ' ' + cls).toLowerCase();
      if (index === 0 || /(why|pillar|intro|about|overview|purpose|benefit)/.test(text)) return 'overview';
      if (/(level|lesson|learn|roadmap|journey|module|curriculum|alphabet|reading|foundation|guide|portal|path)/.test(text)) return 'learn';
      if (/(practice|challenge|quiz|word|phrase|progress|dua|surah|tajweed|step|mistake|timeline|story|character|names)/.test(text)) return 'practice';
      if (/(resource|knowledge|faq|article|coming|tool|calculator|prayer|zakat|link|download)/.test(text)) return 'resources';
      if (/(source|reference|ref|hadith|quran|footer|contact)/.test(text)) return 'references';
      return index < 2 ? 'overview' : 'resources';
    }

    function syncLanguage(tabs) {
      var te = getLang() === 'te';
      tabs.forEach(function(btn){
        btn.textContent = btn.getAttribute(te ? 'data-te' : 'data-en');
      });
    }

    function findFirstId(ids) {
      for (var i = 0; i < ids.length; i += 1) {
        if (document.getElementById(ids[i])) return ids[i];
      }
      return '';
    }

    function injectLearningDashboard(anchorNode) {
      if (!isLearningPortalPage() || document.getElementById('if-learning-dashboard')) return [];
      var actions = [
        {
          target: findFirstId(['roadmap', 'journey', 'timeline']),
          te: 'పాఠ్య మార్గం',
          en: 'Learning Path',
          subTe: 'ఏ క్రమంలో నేర్చుకోవాలో చూడండి',
          subEn: 'See the recommended order'
        },
        {
          target: findFirstId(['levels', 'lessons', 'modules']),
          te: 'పాఠాలు',
          en: 'Lessons',
          subTe: 'స్థాయిలు, మాడ్యూల్స్ ప్రారంభించండి',
          subEn: 'Start levels and modules'
        },
        {
          target: findFirstId(['alphabet', 'word', 'phrases', 'surahs', 'guide', 'steps', 'quiz', 'challenge', 'stories', 'names', 'duas']),
          te: 'ప్రాక్టీస్',
          en: 'Practice',
          subTe: 'కార్డులు, ప్రశ్నలు, గైడ్‌లు',
          subEn: 'Cards, quizzes, and guides'
        },
        {
          target: findFirstId(['coming', 'knowledge', 'if-refs', 'resources']),
          te: 'మరిన్ని',
          en: 'More',
          subTe: 'మాడ్యూల్స్, వనరులు, మూలాలు',
          subEn: 'Modules, resources, sources'
        }
      ].filter(function(action){ return action.target; });
      if (!actions.length) return [];

      var dash = document.createElement('nav');
      dash.className = 'if-learning-dashboard';
      dash.id = 'if-learning-dashboard';
      dash.setAttribute('aria-label', 'Learning quick actions');
      dash.innerHTML = actions.map(function(action){
        var title = getLang() === 'te' ? action.te : action.en;
        var sub = getLang() === 'te' ? action.subTe : action.subEn;
        return '<a class="if-learning-action" href="#' + action.target + '"><strong data-te="' + action.te + '" data-en="' + action.en + '">' + title + '</strong><span data-te="' + action.subTe + '" data-en="' + action.subEn + '">' + sub + '</span></a>';
      }).join('');
      anchorNode.insertAdjacentElement('afterend', dash);
      return Array.prototype.slice.call(dash.querySelectorAll('.if-learning-action'));
    }

    function syncLearningDashboard(actions) {
      var te = getLang() === 'te';
      actions.forEach(function(action){
        var title = action.querySelector('strong');
        var sub = action.querySelector('span');
        if (title) title.textContent = title.getAttribute(te ? 'data-te' : 'data-en');
        if (sub) sub.textContent = sub.getAttribute(te ? 'data-te' : 'data-en');
      });
    }

    function setup() {
      if (!isLongAppPage() || !document.body) return;
      var mobileMql = window.matchMedia ? window.matchMedia('(max-width: 768px)') : null;
      function mobileAppActive() {
        return !mobileMql || mobileMql.matches;
      }
      function syncAppScreenClasses() {
        var active = mobileAppActive();
        document.body.classList.toggle('if-app-shell', active);
        document.body.classList.toggle('if-kc-app', active && isKnowledgeCenterPage());
        document.body.classList.toggle('if-sg-app', active && isStudentGuidancePage());
        document.body.classList.toggle('if-learning-app', active && isLearningPortalPage());
        if (!active) {
          ['if-app-tabs', 'if-learning-dashboard'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.remove();
          });
        }
        if (active && document.querySelector('.if-screen-active')) document.body.classList.add('if-app-screen-ready');
        if (!active) document.body.classList.remove('if-app-screen-ready');
      }
      syncAppScreenClasses();
      if (mobileMql && !screenMqlBound) {
        var onScreenChange = function () {
          syncAppScreenClasses();
          if (mobileAppActive()) setup();
        };
        if (mobileMql.addEventListener) mobileMql.addEventListener('change', onScreenChange);
        else if (mobileMql.addListener) mobileMql.addListener(onScreenChange);
        screenMqlBound = true;
      }
      if (!mobileAppActive()) return;
      var main = document.querySelector('main') || document.body;
      var hero = (isStudentGuidancePage() ? document.querySelector('.sg-hero') : null) || main.querySelector('header[id], .al-hero, .lu-hero, .kc-hero, .hero');
      if (!hero || document.getElementById('if-app-tabs')) return;
      var sections = Array.prototype.slice.call(main.querySelectorAll(isStudentGuidancePage() ? '.sg-tools, section[id], .sg-final' : 'section[id]'));
      if (sections.length < 3) return;
      var tabsDef = isStudentGuidancePage() ? SG_TABS : (isKnowledgeCenterPage() ? KC_TABS : (isLearningPortalPage() ? LEARNING_TABS : DEFAULT_TABS));
      var initialScreen = isStudentGuidancePage() ? 'start' : (isKnowledgeCenterPage() ? 'today' : (isLearningPortalPage() ? 'start' : 'overview'));

      sections.forEach(function(section, index){
        section.classList.add('if-app-screen');
        section.setAttribute('data-app-screen', screenFor(section, index));
      });

      var tabs = document.createElement('nav');
      tabs.className = 'if-app-tabs';
      tabs.id = 'if-app-tabs';
      tabs.setAttribute('aria-label', 'App sections');
      tabs.innerHTML = tabsDef.map(function(tab, index){
        return '<button type="button" class="if-app-tab' + (index === 0 ? ' is-active' : '') + '" data-screen="' + tab.id + '" data-te="' + tab.te + '" data-en="' + tab.en + '" aria-pressed="' + (index === 0 ? 'true' : 'false') + '">' + (getLang() === 'te' ? tab.te : tab.en) + '</button>';
      }).join('');
      hero.insertAdjacentElement('afterend', tabs);
      var learningActions = injectLearningDashboard(tabs);

      var buttons = Array.prototype.slice.call(tabs.querySelectorAll('.if-app-tab'));
      function activate(screen, shouldScroll) {
        var hasSection = false;
        sections.forEach(function(section){
          var match = section.getAttribute('data-app-screen') === screen;
          section.classList.toggle('if-screen-active', match);
          if (match) hasSection = true;
        });
        if (!hasSection) {
          sections.forEach(function(section, index){
            section.classList.toggle('if-screen-active', index === 0);
          });
        }
        buttons.forEach(function(btn){
          var active = btn.getAttribute('data-screen') === screen;
          btn.classList.toggle('is-active', active);
          btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        if (mobileAppActive()) document.body.classList.add('if-app-screen-ready');
        else document.body.classList.remove('if-app-screen-ready');
        if (shouldScroll) tabs.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      function activateForHash(hash) {
        if (!hash || hash.charAt(0) !== '#') return false;
        var target = document.getElementById(hash.slice(1));
        if (!target || !target.classList.contains('if-app-screen')) return false;
        var screen = target.getAttribute('data-app-screen');
        if (!screen) return false;
        activate(screen, false);
        try { history.pushState(null, '', hash); } catch (e) {}
        setTimeout(function(){
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 30);
        return true;
      }

      buttons.forEach(function(btn){
        btn.addEventListener('click', function(){
          activate(btn.getAttribute('data-screen'), true);
        });
      });
      document.addEventListener('click', function(e){
        if (!window.matchMedia || !window.matchMedia('(max-width: 768px)').matches) return;
        var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        if (activateForHash(a.getAttribute('href'))) e.preventDefault();
      });
      if (location.hash && activateForHash(location.hash)) {
        if (mobileAppActive()) document.body.classList.add('if-app-screen-ready');
      } else {
        activate(initialScreen, false);
      }

      new MutationObserver(function(){
        syncLanguage(buttons);
        syncLearningDashboard(learningActions);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
    else setup();
  })();

  /* ── Hide Header Navbar on scroll down on mobile ── */
  (function initScrollHide() {
    var lastScrollY = window.scrollY;
    var threshold = 80;
    window.addEventListener('scroll', function () {
      var cur = window.scrollY;
      if (window.innerWidth <= 768) {
        if (cur > threshold && cur > lastScrollY) {
          document.body.classList.add('nav-hidden');
        } else if (cur < lastScrollY || cur <= threshold) {
          document.body.classList.remove('nav-hidden');
        }
      } else {
        document.body.classList.remove('nav-hidden');
      }
      lastScrollY = cur;
    }, { passive: true });
  })();
})();
