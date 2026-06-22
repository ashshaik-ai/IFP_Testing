/* ===================================================================
   Islamic Front — Site-wide command search.
   Catalog-backed when assets/data/site-catalog.js is loaded; fallback-safe
   for older pages. No network, no AI calls, works from file://.
   =================================================================== */
(function () {
  'use strict';

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  var PRE = location.pathname.indexOf('/knowledge-center/') >= 0 ? '../../' : '';
  var ov, input, results, typeBar, built = false, activeType = 'all';

  var FALLBACK = [
    { c: 'X', type: 'page', id: 'home', te: 'హోమ్ — ఇస్లామిక్ ఫ్రంట్', en: 'Home — Islamic Front', u: 'index.html', k: 'home community welfare' },
    { c: 'A', type: 'hub', id: 'knowledge', te: 'నాలెడ్జ్ సెంటర్', en: 'Knowledge Center', u: 'islamic-knowledge.html', k: 'tools guides zakat salah' },
    { c: 'A', type: 'hub', id: 'student-guidance', te: 'విద్యార్థి మార్గదర్శనం', en: 'Student Guidance', u: 'student-guidance.html', k: 'career education mpc bipc' },
    { c: 'T', type: 'tool', id: 'zakat', te: 'జకాత్ లెక్కించండి', en: 'Calculate Zakat', u: 'islamic-knowledge.html#zakat', k: 'zakat calculator gold silver' },
    { c: 'T', type: 'tool', id: 'prayer-times', te: 'నమాజ్ సమయాలు', en: 'Prayer Times', u: 'islamic-knowledge.html#salah', k: 'salah namaz timings' },
    { c: 'P', type: 'portal', id: 'quran', te: 'ఖురాన్ నేర్చుకోండి', en: 'Learn Quran', u: 'knowledge-center/learn-quran/index.html', k: 'quran tajweed hifz' },
    { c: 'P', type: 'portal', id: 'salah', te: 'నమాజ్ నేర్చుకోండి', en: 'Learn Salah', u: 'knowledge-center/learn-salah/index.html', k: 'salah wudu prayer' },
    { c: 'P', type: 'portal', id: 'arabic', te: 'అరబిక్ నేర్చుకోండి', en: 'Learn Arabic', u: 'knowledge-center/learn-arabic/index.html', k: 'arabic letters' },
    { c: 'C', type: 'command', id: 'share-page', action: 'share', te: 'ఈ పేజీని పంచుకోండి', en: 'Share This Page', u: '#share', k: 'share copy link' }
  ];

  var CAT = {
    P: { te: 'పోర్టల్', en: 'Portal' }, L: { te: 'పాఠం', en: 'Lesson' }, T: { te: 'సాధనం', en: 'Tool' },
    A: { te: 'విభాగం', en: 'Hub' }, G: { te: 'పదం', en: 'Term' }, X: { te: 'పేజీ', en: 'Page' }, C: { te: 'చర్య', en: 'Action' }
  };

  var TYPES = [
    { id: 'all', te: 'అన్నీ', en: 'All' },
    { id: 'tool', te: 'సాధనాలు', en: 'Tools' },
    { id: 'portal', te: 'పోర్టల్స్', en: 'Portals' },
    { id: 'lesson', te: 'పాఠాలు', en: 'Lessons' },
    { id: 'career', te: 'కెరీర్', en: 'Careers' },
    { id: 'command', te: 'చర్యలు', en: 'Actions' }
  ];

  function catalog() { return window.IF_SITE_CATALOG || null; }
  function hasNavbarSearchHost() { return !!document.querySelector('.nav-right'); }
  function prefixUrl(u) {
    if (!u || u.charAt(0) === '#' || /^https?:|^mailto:|^tel:/i.test(u)) return u || '#';
    return PRE + u;
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function cleanTitle(t) { return (t || '').replace(/\s*[–—|].*$/, '').trim(); }

  function firstIncompletePortal() {
    var C = catalog(), portals = C && C.portals ? C.portals : [];
    for (var i = 0; i < portals.length; i++) {
      var p = portals[i], state = lsGet(p.progressKey || ('if-' + p.id + '-progress'), {});
      var done = (state.done || state.levels || []).length;
      if (done < (p.total || 0)) return p.url;
    }
    return portals[0] && portals[0].url;
  }

  function continueUrl() {
    var rec = lsGet('if-recent', []);
    if (rec && rec[0] && rec[0].url) return rec[0].url.replace(/^\/+/, '');
    return firstIncompletePortal() || 'islamic-knowledge.html#lang-portals';
  }

  function dueReviewUrl() {
    var C = catalog(), portals = C && C.portals ? C.portals : [];
    var now = Date.now();
    for (var i = 0; i < portals.length; i++) {
      var deck = portals[i].srsDeck;
      if (!deck) continue;
      var s = lsGet('if-srs-' + deck, null);
      if (!s) continue;
      for (var id in s) {
        if (s[id] && typeof s[id].due === 'number' && s[id].due <= now) return portals[i].url + '#if-flashcards';
      }
    }
    for (var j = 0; j < portals.length; j++) if (portals[j].srsDeck) return portals[j].url + '#if-flashcards';
    return 'knowledge-center/learn-arabic/index.html#if-flashcards';
  }

  function dynamicRecords() {
    var T = te();
    return [
      { c: 'C', type: 'command', id: 'continue-learning', action: 'continue', te: 'అభ్యాసం కొనసాగించండి', en: 'Continue Learning', dte: 'మీ ఇటీవలి లేదా తదుపరి పాఠానికి వెళ్లండి', den: 'Resume your recent or next lesson', u: continueUrl(), k: 'continue resume recent learning' },
      { c: 'C', type: 'command', id: 'review-due', action: 'review', te: 'రివ్యూ కార్డులు చూడండి', en: 'Review Due Flashcards', dte: 'స్పేస్డ్ రిపిటిషన్ ఫ్లాష్‌కార్డులు', den: 'Spaced-repetition flashcards', u: dueReviewUrl(), k: 'review due flashcards srs' },
      { c: 'C', type: 'command', id: 'profile', action: 'profile', te: 'లెర్నర్ ప్రొఫైల్ తెరవండి', en: 'Open Learner Profile', dte: 'XP, పురోగతి, విజయాలు చూడండి', den: 'View XP, progress, achievements', u: '#profile', k: 'profile xp progress dashboard' },
      { c: 'C', type: 'command', id: 'share-page', action: 'share', te: 'ఈ పేజీని పంచుకోండి', en: 'Share This Page', dte: 'లింక్‌ను పంచుకోండి లేదా కాపీ చేయండి', den: 'Share or copy this link', u: '#share', k: 'share copy link viral' },
      { c: 'T', type: 'career', id: 'find-mpc', te: 'MPC కెరీర్లు కనుగొనండి', en: 'Find MPC Careers', dte: 'ఇంజినీరింగ్, డిఫెన్స్, డేటా మరియు టెక్ మార్గాలు', den: 'Engineering, defence, data, and tech pathways', u: 'student-guidance.html#mpc', k: 'mpc careers engineering student' }
    ].filter(function (r, idx, arr) {
      if (T) return true;
      return arr.findIndex(function (x) { return x.id === r.id; }) === idx;
    });
  }

  function baseRecords() {
    var C = catalog();
    var records = C && C.searchRecords ? C.searchRecords() : FALLBACK;
    var byId = {};
    records.concat(dynamicRecords()).forEach(function (r) { byId[r.id || (r.en + r.u)] = r; });
    return Object.keys(byId).map(function (k) { return byId[k]; });
  }

  function typeMatches(r) {
    if (activeType === 'all') return true;
    if (activeType === 'career') return r.type === 'career' || /career|mpc|bipc|commerce|arts|student/i.test(r.k || '');
    return r.type === activeType || (activeType === 'tool' && r.c === 'T') || (activeType === 'portal' && r.c === 'P') || (activeType === 'lesson' && r.c === 'L') || (activeType === 'command' && r.c === 'C');
  }

  function scoreRecord(r, q) {
    if (!q) return r.c === 'C' ? 6 : r.c === 'T' ? 5 : r.c === 'P' ? 4 : 1;
    var hay = (r.en + ' ' + r.te + ' ' + (r.den || '') + ' ' + (r.dte || '') + ' ' + (r.k || '')).toLowerCase();
    if (hay.indexOf(q) < 0) return -1;
    var title = (r.en + ' ' + r.te).toLowerCase();
    return title.indexOf(q) >= 0 ? 10 : (r.k || '').toLowerCase().indexOf(q) >= 0 ? 7 : 4;
  }

  function paintTypes() {
    if (!typeBar) return;
    var T = te();
    typeBar.innerHTML = TYPES.map(function (t) {
      return '<button type="button" class="ifsr-type' + (activeType === t.id ? ' on' : '') + '" data-type="' + t.id + '">' + (T ? t.te : t.en) + '</button>';
    }).join('');
  }

  function build() {
    if (built) return; built = true;
    var fab = document.createElement('button');
    fab.id = 'ifsr-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Search');
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
    fab.addEventListener('click', open);
    if (!hasNavbarSearchHost()) document.body.appendChild(fab);

    ov = document.createElement('div'); ov.id = 'ifsr-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="ifsr-modal"><div class="ifsr-bar"><span class="ifsr-ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg></span>'
      + '<input id="ifsr-in" type="search" autocomplete="off" aria-label="Search" />'
      + '<button id="ifsr-x" type="button" aria-label="Close">×</button></div>'
      + '<div class="ifsr-types" id="ifsr-types"></div><div class="ifsr-results" id="ifsr-res"></div>'
      + '<div class="ifsr-tip" id="ifsr-tip"></div></div>';
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    document.body.appendChild(ov);
    input = ov.querySelector('#ifsr-in');
    results = ov.querySelector('#ifsr-res');
    typeBar = ov.querySelector('#ifsr-types');
    ov.querySelector('#ifsr-x').addEventListener('click', close);
    input.addEventListener('input', run);
    typeBar.addEventListener('click', function (e) {
      var btn = e.target.closest && e.target.closest('[data-type]');
      if (!btn) return;
      activeType = btn.getAttribute('data-type') || 'all';
      paintTypes(); run();
    });
    results.addEventListener('click', handleResultClick);
    paintChrome();
  }

  function paintChrome() {
    var T = te();
    if (input) input.setAttribute('placeholder', T ? 'సాధనాలు, పాఠాలు, పోర్టల్స్, చర్యలు వెతకండి...' : 'Search tools, lessons, portals, actions...');
    var tip = ov && ov.querySelector('#ifsr-tip');
    if (tip) tip.textContent = T ? '"/" నొక్కి వెతకండి · Esc మూసివేయండి' : 'Press "/" to search · Esc to close';
    paintTypes();
    run();
  }

  function run() {
    if (!results) return;
    var q = ((input && input.value) || '').trim().toLowerCase();
    var hits = baseRecords().map(function (r) { return { r: r, s: scoreRecord(r, q) }; })
      .filter(function (x) { return x.s >= 0 && typeMatches(x.r); })
      .sort(function (a, b) { return b.s - a.s || (a.r.en || '').localeCompare(b.r.en || ''); })
      .slice(0, q ? 14 : 10)
      .map(function (x) { return x.r; });
    if (!hits.length) {
      results.innerHTML = '<div class="ifsr-none">' + (te() ? 'ఫలితాలు లేవు' : 'No results') + '</div>';
      return;
    }
    results.innerHTML = hits.map(renderItem).join('');
  }

  function renderItem(r) {
    var T = te(), title = T ? r.te : r.en, desc = T ? (r.dte || '') : (r.den || '');
    var cat = CAT[r.c] || CAT.X;
    var attr = r.action && r.action !== 'navigate' ? ' data-action="' + r.action + '"' : '';
    var href = prefixUrl(r.u);
    return '<a class="ifsr-item" href="' + href + '" data-id="' + (r.id || '') + '"' + attr + '><span class="ifsr-cat ifsr-' + r.c + '">' + (T ? cat.te : cat.en) + '</span>'
      + '<span class="ifsr-copy"><span class="ifsr-t">' + title + '</span>' + (desc ? '<span class="ifsr-d">' + desc + '</span>' : '') + '</span></a>';
  }

  function handleResultClick(e) {
    var item = e.target.closest && e.target.closest('.ifsr-item[data-action]');
    if (!item) return;
    var action = item.getAttribute('data-action');
    if (action === 'profile') { e.preventDefault(); close(); if (window.IFProfile) IFProfile.open(); }
    if (action === 'share') { e.preventDefault(); close(); if (window.IFShare) IFShare.sharePage(); }
  }

  var _trigger = null;
  function open() { if (!ov) return; _trigger = document.activeElement; ov.classList.add('on'); paintChrome(); setTimeout(function () { if (input) input.focus(); }, 30); }
  function openWithQuery(q, type) {
    open();
    if (type) activeType = type;
    paintTypes();
    if (!input || !q) return;
    input.value = q;
    run();
  }
  function close() {
    if (ov) ov.classList.remove('on');
    var t = _trigger; _trigger = null;
    if (t && t.focus && t !== input) { t.focus(); return; }
    var navSearch = document.querySelector('.nav-search-btn');
    var fab = document.getElementById('ifsr-fab');
    if (navSearch) navSearch.focus();
    else if (fab) fab.focus();
  }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); open(); }
    else if (e.key === 'Escape') close();
  });

  function openInitialQuery() {
    var q = '', type = '';
    try { var p = new URLSearchParams(location.search); q = p.get('q') || ''; type = p.get('type') || ''; } catch (e) {}
    if (q || type) setTimeout(function () { openWithQuery(q, type); }, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { build(); openInitialQuery(); });
  else { build(); openInitialQuery(); }
  new MutationObserver(paintChrome).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('open-search', function (e) {
    var d = (e && e.detail) || {};
    openWithQuery(d.query, d.type);
  });

  function addNavbarSearch() {
    var navRight = document.querySelector('.nav-right');
    if (navRight && !document.querySelector('.nav-search-btn')) {
      var navSearch = document.createElement('button');
      navSearch.className = 'nav-search-btn';
      navSearch.type = 'button';
      navSearch.setAttribute('aria-label', 'Search');
      navSearch.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
      navSearch.addEventListener('click', open);
      navSearch.style.background = 'none';
      navSearch.style.border = 'none';
      navSearch.style.color = 'var(--gold-light, #e8b84b)';
      navSearch.style.cursor = 'pointer';
      navSearch.style.display = 'inline-flex';
      navSearch.style.alignItems = 'center';
      navSearch.style.justifyContent = 'center';
      navSearch.style.padding = '8px';
      navSearch.style.borderRadius = '50%';
      navSearch.style.transition = 'background 0.2s, color 0.2s';
      navSearch.style.minHeight = '44px';
      navSearch.style.minWidth = '44px';
      navSearch.style.marginRight = '8px';
      navSearch.style.verticalAlign = 'middle';
      navSearch.addEventListener('mouseenter', function () { navSearch.style.background = 'rgba(200, 146, 42, 0.12)'; navSearch.style.color = '#ffffff'; });
      navSearch.addEventListener('mouseleave', function () { navSearch.style.background = 'none'; navSearch.style.color = 'var(--gold-light, #e8b84b)'; });
      var langBtn = document.getElementById('lang-btn');
      if (langBtn) navRight.insertBefore(navSearch, langBtn);
      else navRight.appendChild(navSearch);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addNavbarSearch); else addNavbarSearch();
})();
