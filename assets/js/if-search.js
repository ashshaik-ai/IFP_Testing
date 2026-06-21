/* ===================================================================
   Islamic Front — Site-wide search (if-search.js)
   Self-contained, no network (embedded index → works on file://).
   Floating launcher + "/" keyboard shortcut + Esc to close. Mobile-first
   modal. Bilingual (te/en). Paths are root-relative; a prefix is added
   per page depth so the one file works on every page.
   =================================================================== */
(function () {
  'use strict';
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  var PRE = location.pathname.indexOf('/knowledge-center/') >= 0 ? '../../' : '';

  // cat: P=portal L=lesson T=tool A=article G=term X=page
  var IX = [
    { c: 'X', te: 'హోమ్ — ఇస్లామిక్ ఫ్రంట్', en: 'Home — Islamic Front', u: 'index.html', k: 'home community welfare' },
    { c: 'A', te: 'నాలెడ్జ్ సెంటర్', en: 'Knowledge Center', u: 'islamic-knowledge.html', k: 'tools guides' },
    { c: 'A', te: 'విద్యార్థి మార్గదర్శనం', en: 'Student Guidance', u: 'student-guidance.html', k: 'career education' },
    { c: 'T', te: 'జకాత్ కాలిక్యులేటర్', en: 'Zakat Calculator', u: 'islamic-knowledge.html#zakat', k: 'gold silver nisab' },
    { c: 'T', te: 'నమాజ్ సమయాలు', en: 'Prayer Times', u: 'islamic-knowledge.html#salah', k: 'salah timings' },
    { c: 'A', te: 'ఇస్లాం మూలాలు', en: 'Basics of Islam', u: 'islamic-knowledge.html#basics', k: 'iman shahada' },
    { c: 'A', te: 'ఐదు స్తంభాలు', en: 'Five Pillars', u: 'islamic-knowledge.html#pillars', k: 'arkan' },
    { c: 'A', te: 'వుదూ', en: 'Wudu (Ablution)', u: 'islamic-knowledge.html#wudu', k: 'purity ablution' },
    { c: 'A', te: 'హదీస్', en: 'Hadith', u: 'islamic-knowledge.html#hadith', k: 'sunnah' },
    { c: 'A', te: 'అఖ్లాఖ్ (నడవడిక)', en: 'Akhlaq (Manners)', u: 'islamic-knowledge.html#akhlaq', k: 'character' },
    { c: 'A', te: 'ఆధునిక జీవితం', en: 'Modern Life', u: 'islamic-knowledge.html#modern-life', k: 'contemporary' },
    { c: 'A', te: 'ఖురాన్ & విజ్ఞానం', en: 'Quran and Science', u: 'islamic-knowledge.html#quran-science', k: 'science' },
    { c: 'A', te: 'తరచూ అడిగే ప్రశ్నలు', en: 'FAQs', u: 'islamic-knowledge.html#faqs', k: 'questions' },

    { c: 'P', te: 'పిల్లల ఇస్లాం', en: 'Kids Islam', u: 'knowledge-center/kids-islam/index.html', k: 'children stories beginners' },
    { c: 'P', te: 'అల్లాహ్ యొక్క 99 పేర్లు', en: '99 Names of Allah', u: 'knowledge-center/names-of-allah/index.html', k: 'asma ul husna names memorization' },
    { c: 'P', te: 'ఇస్లామిక్ కేలండర్', en: 'Islamic Calendar', u: 'knowledge-center/islamic-calendar/index.html', k: 'hijri gregorian dates events' },
    { c: 'P', te: 'హజ్ & ఉమ్రా గైడ్', en: 'Hajj and Umrah Guide', u: 'knowledge-center/hajj-umrah/index.html', k: 'pilgrimage duas checklist' },
    { c: 'P', te: 'ప్రత్యేక నమాజులు', en: 'Special Prayers', u: 'knowledge-center/special-prayers/index.html', k: 'eid janazah tahajjud taraweeh istikhara' },
    { c: 'P', te: 'మహిళల ఇస్లామిక్ మార్గదర్శకత్వం', en: "Women's Islamic Guidance", u: 'knowledge-center/womens-guidance/index.html', k: 'women taharah ghusl ramadan' },
    { c: 'P', te: 'అరబిక్ నేర్చుకోండి', en: 'Learn Arabic', u: 'knowledge-center/learn-arabic/index.html', k: 'arabic language' },
    { c: 'L', te: 'అరబిక్ వర్ణమాల', en: 'The Arabic Alphabet', u: 'knowledge-center/learn-arabic/alphabet.html', k: 'letters huroof' },
    { c: 'L', te: 'హరకాత్, అచ్చులు', en: 'Harakat and Vowels', u: 'knowledge-center/learn-arabic/harakat.html', k: 'fatha kasra damma' },
    { c: 'L', te: 'పదజాలం పెంచడం', en: 'Building Vocabulary', u: 'knowledge-center/learn-arabic/vocabulary.html', k: 'roots words' },
    { c: 'L', te: 'వ్యాకరణ ప్రాథమికాలు', en: 'Grammar Basics', u: 'knowledge-center/learn-arabic/grammar.html', k: 'noun verb' },
    { c: 'L', te: 'ఖురాన్ అరబిక్', en: 'Quranic Arabic', u: 'knowledge-center/learn-arabic/quranic-arabic.html', k: 'fusha classical' },
    { c: 'L', te: 'రోజువారీ అరబిక్', en: 'Everyday Arabic', u: 'knowledge-center/learn-arabic/daily-arabic.html', k: 'greetings phrases' },

    { c: 'P', te: 'ఉర్దూ నేర్చుకోండి', en: 'Learn Urdu', u: 'knowledge-center/learn-urdu/index.html', k: 'urdu language' },
    { c: 'L', te: 'ఉర్దూ వర్ణమాల', en: 'The Urdu Alphabet', u: 'knowledge-center/learn-urdu/alphabet.html', k: 'letters' },
    { c: 'L', te: 'చదవడం ప్రాథమికాలు', en: 'Reading Basics', u: 'knowledge-center/learn-urdu/reading-basics.html', k: 'joining vowel marks' },
    { c: 'L', te: 'రాత నైపుణ్యాలు', en: 'Writing Skills', u: 'knowledge-center/learn-urdu/writing-skills.html', k: 'nastaliq' },
    { c: 'L', te: 'రోజువారీ ఉర్దూ', en: 'Everyday Urdu', u: 'knowledge-center/learn-urdu/daily-urdu.html', k: 'greetings' },
    { c: 'L', te: 'ఇస్లామిక్ ఉర్దూ', en: 'Islamic Urdu', u: 'knowledge-center/learn-urdu/islamic-urdu.html', k: 'namaz roza' },
    { c: 'L', te: 'ఉన్నత స్థాయి చదవడం', en: 'Advanced Reading', u: 'knowledge-center/learn-urdu/advanced-reading.html', k: 'poetry ghazal' },

    { c: 'P', te: 'ఖురాన్ నేర్చుకోండి', en: 'Learn Quran', u: 'knowledge-center/learn-quran/index.html', k: 'quran tajweed hifz tafseer' },
    { c: 'P', te: 'నమాజ్ నేర్చుకోండి', en: 'Learn Salah', u: 'knowledge-center/learn-salah/index.html', k: 'prayer wudu ghusl' },
    { c: 'P', te: 'సీరహ్', en: 'Seerah', u: 'knowledge-center/seerah/index.html', k: 'prophet muhammad life' },
    { c: 'P', te: 'ఇస్లామిక్ చరిత్ర', en: 'Islamic History', u: 'knowledge-center/islamic-history/index.html', k: 'rashidun umayyad abbasid' },

    { c: 'G', te: 'జకాత్', en: 'Zakat', u: 'islamic-knowledge.html#zakat', k: 'charity alms' },
    { c: 'G', te: 'సలాహ్ / నమాజ్', en: 'Salah', u: 'knowledge-center/learn-salah/index.html', k: 'prayer' },
    { c: 'G', te: 'వుదూ', en: 'Wudu', u: 'knowledge-center/learn-salah/index.html', k: 'ablution' },
    { c: 'G', te: 'తజ్వీద్', en: 'Tajweed', u: 'knowledge-center/learn-quran/index.html', k: 'recitation rules' },
    { c: 'G', te: 'హిఫ్జ్', en: 'Hifz', u: 'knowledge-center/learn-quran/index.html', k: 'memorisation' },
    { c: 'G', te: 'తఫ్సీర్', en: 'Tafseer', u: 'knowledge-center/learn-quran/index.html', k: 'explanation' },
    { c: 'G', te: 'సీరహ్', en: 'Seerah', u: 'knowledge-center/seerah/index.html', k: 'biography' },
    { c: 'G', te: 'హిజ్రా', en: 'Hijrah', u: 'knowledge-center/seerah/index.html', k: 'migration madinah' },
    { c: 'G', te: 'ఖిబ్లా', en: 'Qiblah', u: 'knowledge-center/learn-salah/index.html', k: 'direction kaaba' },
    { c: 'G', te: 'నస్తలీఖ్', en: 'Nastaliq', u: 'knowledge-center/learn-urdu/writing-skills.html', k: 'calligraphy' },
    { c: 'G', te: 'ఫుస్‌హా', en: 'Fus-ha', u: 'knowledge-center/learn-arabic/quranic-arabic.html', k: 'classical arabic' }
  ];

  var CAT = {
    P: { te: 'పోర్టల్', en: 'Portal' }, L: { te: 'పాఠం', en: 'Lesson' }, T: { te: 'సాధనం', en: 'Tool' },
    A: { te: 'వ్యాసం', en: 'Article' }, G: { te: 'పదం', en: 'Term' }, X: { te: 'పేజీ', en: 'Page' }
  };

  var ov, input, results, built = false;

  function hasNavbarSearchHost() {
    return !!document.querySelector('.nav-right');
  }

  function build() {
    if (built) return; built = true;
    var fab = document.createElement('button');
    fab.id = 'ifsr-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Search');
    fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg>';
    fab.addEventListener('click', open);
    if (!hasNavbarSearchHost()) {
      document.body.appendChild(fab);
    }

    ov = document.createElement('div'); ov.id = 'ifsr-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="ifsr-modal"><div class="ifsr-bar"><span class="ifsr-ic"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/></svg></span>'
      + '<input id="ifsr-in" type="search" autocomplete="off" aria-label="Search" placeholder="వెతకండి..." />'
      + '<button id="ifsr-x" type="button" aria-label="Close">✕</button></div>'
      + '<div class="ifsr-results" id="ifsr-res"></div>'
      + '<div class="ifsr-tip" id="ifsr-tip"></div></div>';
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
    input = ov.querySelector('#ifsr-in');
    results = ov.querySelector('#ifsr-res');
    ov.querySelector('#ifsr-x').addEventListener('click', close);
    input.addEventListener('input', run);
    paintChrome();
  }

  function paintChrome() {
    var te = lang() === 'te';
    if (input) input.setAttribute('placeholder', te ? 'పాఠాలు, పోర్టల్‌లు, పదాలు వెతకండి…' : 'Search lessons, portals, terms…');
    var tip = ov && ov.querySelector('#ifsr-tip');
    if (tip) tip.textContent = te ? 'వెతకడానికి "/" నొక్కండి · మూసివేయడానికి Esc' : 'Press "/" to search · Esc to close';
  }

  function run() {
    var te = lang() === 'te';
    var q = (input.value || '').trim().toLowerCase();
    if (!q) { results.innerHTML = ''; return; }
    var hits = IX.filter(function (e) {
      return (e.en + ' ' + e.te + ' ' + (e.k || '')).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 14);
    if (!hits.length) { results.innerHTML = '<div class="ifsr-none">' + (te ? 'ఫలితాలు లేవు' : 'No results') + '</div>'; return; }
    results.innerHTML = hits.map(function (e) {
      return '<a class="ifsr-item" href="' + PRE + e.u + '"><span class="ifsr-cat ifsr-' + e.c + '">' + (te ? CAT[e.c].te : CAT[e.c].en) + '</span>'
        + '<span class="ifsr-t">' + (te ? e.te : e.en) + '</span></a>';
    }).join('');
  }

  function open() { if (!ov) return; ov.classList.add('on'); paintChrome(); setTimeout(function () { input.focus(); }, 30); }
  function openWithQuery(q) {
    open();
    if (!input || !q) return;
    input.value = q;
    run();
  }
  function close() {
    if (ov) ov.classList.remove('on');
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
    var q = '';
    try { q = new URLSearchParams(location.search).get('q') || ''; } catch (e) {}
    if (q) setTimeout(function () { openWithQuery(q); }, 60);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { build(); openInitialQuery(); });
  else { build(); openInitialQuery(); }
  new MutationObserver(paintChrome).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('open-search', function (e) { openWithQuery(e && e.detail && e.detail.query); });
  
  // Add navbar search icon on desktop if .nav-right is present
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
      
      navSearch.addEventListener('mouseenter', function() {
        navSearch.style.background = 'rgba(200, 146, 42, 0.12)';
        navSearch.style.color = '#ffffff';
      });
      navSearch.addEventListener('mouseleave', function() {
        navSearch.style.background = 'none';
        navSearch.style.color = 'var(--gold-light, #e8b84b)';
      });

      var langBtn = document.getElementById('lang-btn');
      if (langBtn) {
        navRight.insertBefore(navSearch, langBtn);
      } else {
        navRight.appendChild(navSearch);
      }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addNavbarSearch); else addNavbarSearch();
})();
