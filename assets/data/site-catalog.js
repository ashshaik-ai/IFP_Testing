/* ===================================================================
   Islamic Front — static content graph registry.
   One source of truth for pages, portals, tools, lessons, search,
   profile roadmaps, SEO/share metadata, and audit validation.
   Works without fetch/build so file:// and GitHub Pages both stay valid.
   =================================================================== */
(function () {
  'use strict';

  var BASE_URL = 'https://ashshaik-ai.github.io/IFP_Testing/';
  var LOGO = 'assets/logo.png';

  var pages = [
    { id: 'home', kind: 'page', url: 'index.html', title_en: 'Islamic Front, Mangalagiri', title_te: 'ఇస్లామిక్ ఫ్రంట్, మంగళగిరి', desc_en: 'Community welfare, manifesto, achievements, services, and learning portals.', desc_te: 'సమాజ సేవ, మేనిఫెస్టో, విజయాలు, సేవలు మరియు అభ్యాస పోర్టల్స్.', audience: 'community', tags: ['home', 'community', 'welfare', 'manifesto', 'mangalagiri'], aliases: ['islamic front', 'ifp', 'anjuman'], share: true },
    { id: 'knowledge', kind: 'hub', url: 'islamic-knowledge.html', title_en: 'Knowledge Center', title_te: 'నాలెడ్జ్ సెంటర్', desc_en: 'Islamic tools, Zakat, prayer times, guides, and learning portals.', desc_te: 'ఇస్లామిక్ సాధనాలు, జకాత్, నమాజ్ సమయాలు, గైడ్లు మరియు అభ్యాస పోర్టల్స్.', audience: 'learners', tags: ['knowledge', 'zakat', 'salah', 'tools', 'quran'], aliases: ['islamic knowledge', 'tools'], share: true },
    { id: 'student-guidance', kind: 'hub', url: 'student-guidance.html', title_en: 'Student Guidance', title_te: 'విద్యార్థి మార్గదర్శనం', desc_en: 'Academic and career pathways for students after school and college.', desc_te: 'పాఠశాల, కళాశాల తర్వాత విద్యా మరియు కెరీర్ మార్గాలు.', audience: 'students', tags: ['career', 'education', 'mpc', 'bipc', 'commerce', 'arts'], aliases: ['careers', 'student', 'guidance'], share: true },
    { id: 'names-of-allah', kind: 'page', url: 'knowledge-center/names-of-allah/index.html', title_en: '99 Names of Allah', title_te: 'అల్లాహ్ యొక్క 99 పేర్లు', desc_en: 'Asma ul-Husna cards, categories, meanings, and memorization support.', desc_te: 'అస్మా అల్-హుస్నా కార్డులు, వర్గాలు, అర్థాలు మరియు కంఠస్థం సహాయం.', audience: 'learners', tags: ['names', 'allah', 'asma', 'memorization'], aliases: ['asma ul husna'], share: true },
    { id: 'islamic-calendar', kind: 'tool', url: 'knowledge-center/islamic-calendar/index.html', title_en: 'Islamic Calendar', title_te: 'ఇస్లామిక్ కేలండర్', desc_en: 'Hijri months, important dates, conversion, and countdowns.', desc_te: 'హిజ్రీ నెలలు, ముఖ్య తేదీలు, మార్పిడి మరియు కౌంట్‌డౌన్లు.', audience: 'community', tags: ['calendar', 'hijri', 'dates', 'ramadan', 'eid'], aliases: ['hijri calendar'], share: true },
    { id: 'hajj-umrah', kind: 'guide', url: 'knowledge-center/hajj-umrah/index.html', title_en: 'Hajj and Umrah Guide', title_te: 'హజ్ & ఉమ్రా గైడ్', desc_en: 'Step-by-step pilgrimage guide, duas, checklists, and common mistakes.', desc_te: 'దశల వారీ యాత్ర గైడ్, దుఆలు, చెక్‌లిస్ట్‌లు మరియు సాధారణ తప్పులు.', audience: 'learners', tags: ['hajj', 'umrah', 'pilgrimage', 'duas'], aliases: ['pilgrimage'], share: true },
    { id: 'special-prayers', kind: 'guide', url: 'knowledge-center/special-prayers/index.html', title_en: 'Special Prayers', title_te: 'ప్రత్యేక నమాజులు', desc_en: 'Eid, Janazah, Tahajjud, Taraweeh, Istikhara, and other prayers.', desc_te: 'ఈద్, జనాజా, తహజ్జుద్, తరావీహ్, ఇస్తిఖారా మరియు ఇతర నమాజులు.', audience: 'learners', tags: ['eid', 'janazah', 'tahajjud', 'taraweeh', 'istikhara'], aliases: ['prayers'], share: true },
    { id: 'womens-guidance', kind: 'guide', url: 'knowledge-center/womens-guidance/index.html', title_en: "Women's Islamic Guidance", title_te: 'మహిళల ఇస్లామిక్ మార్గదర్శకత్వం', desc_en: 'Taharah, ghusl, Ramadan, and practical Islamic guidance for women.', desc_te: 'తహారా, గుస్ల్, రమదాన్ మరియు మహిళల కోసం ప్రాయోగిక ఇస్లామిక్ మార్గదర్శకత్వం.', audience: 'women', tags: ['women', 'taharah', 'ghusl', 'ramadan'], aliases: ['women guidance'], share: true }
  ];

  var portals = [
    { id: 'kids', kind: 'portal', order: 1, total: 6, progressKey: 'if-kids-progress', url: 'knowledge-center/kids-islam/index.html', title_en: 'Kids Islam', title_te: 'పిల్లల ఇస్లాం', desc_en: 'Beliefs, manners, duas, prophet stories, Salah, Quran basics, and leadership for ages 5-15.', desc_te: '5-15 ఏళ్ల పిల్లలకు విశ్వాసాలు, మంచి అలవాట్లు, దుఆలు, ప్రవక్తల కథలు, నమాజ్, ఖురాన్ పునాదులు మరియు నాయకత్వం.', tags: ['kids', 'children', 'stories', 'manners', 'duas'], aliases: ['children islam'], share: true },
    { id: 'quran', kind: 'portal', order: 2, total: 6, progressKey: 'if-quran-progress', url: 'knowledge-center/learn-quran/index.html', title_en: 'Learn Quran', title_te: 'ఖురాన్ నేర్చుకోండి', desc_en: 'Reading, Tajweed, Tafseer, Hifz, Quranic character, and daily practice.', desc_te: 'పఠనం, తజ్వీద్, తఫ్సీర్, హిఫ్జ్, ఖురానిక్ స్వభావం మరియు రోజువారీ అభ్యాసం.', tags: ['quran', 'tajweed', 'hifz', 'tafseer', 'recitation'], aliases: ['learn quran'], share: true },
    { id: 'salah', kind: 'portal', order: 3, total: 6, progressKey: 'if-salah-progress', url: 'knowledge-center/learn-salah/index.html', title_en: 'Learn Salah', title_te: 'నమాజ్ నేర్చుకోండి', desc_en: 'Taharah, wudu, ghusl, prayer steps, daily prayers, khushu, and duas.', desc_te: 'తహారా, వుదూ, గుస్ల్, నమాజ్ దశలు, రోజువారీ నమాజులు, ఖుషూ మరియు దుఆలు.', tags: ['salah', 'namaz', 'wudu', 'ghusl', 'prayer'], aliases: ['learn salah', 'namaz'], share: true },
    { id: 'seerah', kind: 'portal', order: 4, total: 6, progressKey: 'if-seerah-progress', url: 'knowledge-center/seerah/index.html', title_en: 'Seerah', title_te: 'సీరహ్', desc_en: 'Life of Prophet Muhammad ﷺ through timeline, character, events, and lessons.', desc_te: 'ప్రవక్త ముహమ్మద్ ﷺ జీవితాన్ని టైమ్‌లైన్, స్వభావం, సంఘటనలు మరియు పాఠాల ద్వారా నేర్చుకోండి.', tags: ['seerah', 'prophet', 'muhammad', 'hijrah', 'madinah'], aliases: ['life of prophet'], share: true },
    { id: 'history', kind: 'portal', order: 5, total: 10, progressKey: 'if-history-progress', url: 'knowledge-center/islamic-history/index.html', title_en: 'Islamic History', title_te: 'ఇస్లామిక్ చరిత్ర', desc_en: 'Rashidun, empires, Golden Age, scholars, modern lessons, and civilization cards.', desc_te: 'ఖులఫా రాశిదూన్, సామ్రాజ్యాలు, స్వర్ణయుగం, పండితులు, ఆధునిక పాఠాలు మరియు నాగరికత కార్డులు.', tags: ['history', 'rashidun', 'abbasid', 'ottoman', 'civilization'], aliases: ['muslim history'], share: true },
    { id: 'arabic', kind: 'portal', order: 6, total: 6, progressKey: 'if-arabic-progress', srsDeck: 'arabic-letters', url: 'knowledge-center/learn-arabic/index.html', title_en: 'Learn Arabic', title_te: 'అరబిక్ నేర్చుకోండి', desc_en: 'Arabic alphabet, harakat, vocabulary, grammar, Quranic Arabic, and daily Arabic.', desc_te: 'అరబిక్ అక్షరాలు, హరకాత్, పదజాలం, వ్యాకరణం, ఖురాన్ అరబిక్ మరియు రోజువారీ అరబిక్.', tags: ['arabic', 'letters', 'harakat', 'grammar', 'quranic arabic'], aliases: ['learn arabic'], share: true },
    { id: 'urdu', kind: 'portal', order: 7, total: 6, progressKey: 'if-urdu-progress', srsDeck: 'urdu-letters', url: 'knowledge-center/learn-urdu/index.html', title_en: 'Learn Urdu', title_te: 'ఉర్దూ నేర్చుకోండి', desc_en: 'Urdu alphabet, reading, writing, daily Urdu, Islamic Urdu, and advanced reading.', desc_te: 'ఉర్దూ అక్షరాలు, చదవడం, రాయడం, రోజువారీ ఉర్దూ, ఇస్లామిక్ ఉర్దూ మరియు ఉన్నత చదువు.', tags: ['urdu', 'nastaliq', 'reading', 'writing', 'islamic urdu'], aliases: ['learn urdu'], share: true }
  ];

  var tools = [
    { id: 'zakat', kind: 'tool', url: 'islamic-knowledge.html#zakat', title_en: 'Calculate Zakat', title_te: 'జకాత్ లెక్కించండి', desc_en: 'Gold, silver, cash and business Zakat calculator using local rates.', desc_te: 'బంగారం, వెండి, నగదు మరియు వ్యాపార జకాత్ కాలిక్యులేటర్.', tags: ['zakat', 'nisab', 'gold', 'silver', 'calculator'], aliases: ['zakat calculator'], action: 'navigate' },
    { id: 'prayer-times', kind: 'tool', url: 'islamic-knowledge.html#salah', title_en: 'Prayer Times', title_te: 'నమాజ్ సమయాలు', desc_en: 'Daily Salah timings and next-prayer countdown.', desc_te: 'రోజువారీ నమాజ్ సమయాలు మరియు తదుపరి నమాజ్ కౌంట్‌డౌన్.', tags: ['salah', 'prayer', 'times', 'namaz'], aliases: ['salah timings'], action: 'navigate' },
    { id: 'student-search', kind: 'tool', url: 'student-guidance.html#career', title_en: 'Find Career Pathways', title_te: 'కెరీర్ మార్గాలు కనుగొనండి', desc_en: 'Search MPC, BiPC, Commerce, Arts, diploma, degree, and professional paths.', desc_te: 'MPC, BiPC, కామర్స్, ఆర్ట్స్, డిప్లొమా, డిగ్రీ మరియు ప్రొఫెషనల్ మార్గాలు వెతకండి.', tags: ['career', 'mpc', 'bipc', 'commerce', 'arts'], aliases: ['find mpc careers'], action: 'navigate' },
    { id: 'continue-learning', kind: 'command', url: '#continue', title_en: 'Continue Learning', title_te: 'అభ్యాసం కొనసాగించండి', desc_en: 'Resume the most recent lesson or the next incomplete portal.', desc_te: 'ఇటీవలి పాఠం లేదా తదుపరి అసంపూర్ణ పోర్టల్‌ను కొనసాగించండి.', tags: ['continue', 'resume', 'learning'], aliases: ['resume'], action: 'continue' },
    { id: 'review-due', kind: 'command', url: '#review', title_en: 'Review Due Flashcards', title_te: 'రివ్యూ కార్డులు చూడండి', desc_en: 'Jump to a flashcard deck with due review cards.', desc_te: 'రివ్యూ చేయాల్సిన ఫ్లాష్‌కార్డ్ డెక్‌కు వెళ్లండి.', tags: ['review', 'flashcards', 'srs', 'due'], aliases: ['review due'], action: 'review' },
    { id: 'profile', kind: 'command', url: '#profile', title_en: 'Open Learner Profile', title_te: 'లెర్నర్ ప్రొఫైల్ తెరవండి', desc_en: 'See XP, progress, achievements, streaks, and roadmap.', desc_te: 'XP, పురోగతి, విజయాలు, వరుసలు మరియు రోడ్‌మ్యాప్ చూడండి.', tags: ['profile', 'xp', 'progress', 'achievements'], aliases: ['dashboard'], action: 'profile' },
    { id: 'share-page', kind: 'command', url: '#share', title_en: 'Share This Page', title_te: 'ఈ పేజీని పంచుకోండి', desc_en: 'Share the current page with a clean bilingual title.', desc_te: 'ఈ పేజీని స్పష్టమైన శీర్షికతో పంచుకోండి.', tags: ['share', 'copy', 'link'], aliases: ['copy link'], action: 'share' }
  ];

  var lessons = [
    { id: 'arabic-alphabet', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/alphabet.html', title_en: 'Arabic Alphabet', title_te: 'అరబిక్ వర్ణమాల', tags: ['arabic', 'letters', 'huroof'] },
    { id: 'arabic-harakat', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/harakat.html', title_en: 'Harakat and Vowels', title_te: 'హరకాత్ మరియు అచ్చులు', tags: ['arabic', 'harakat', 'vowels'] },
    { id: 'arabic-vocabulary', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/vocabulary.html', title_en: 'Building Vocabulary', title_te: 'పదజాలం పెంచడం', tags: ['arabic', 'vocabulary', 'roots'] },
    { id: 'arabic-grammar', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/grammar.html', title_en: 'Grammar Basics', title_te: 'వ్యాకరణ ప్రాథమికాలు', tags: ['arabic', 'grammar'] },
    { id: 'arabic-quranic', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/quranic-arabic.html', title_en: 'Quranic Arabic', title_te: 'ఖురాన్ అరబిక్', tags: ['arabic', 'quranic'] },
    { id: 'arabic-daily', portal: 'arabic', kind: 'lesson', url: 'knowledge-center/learn-arabic/daily-arabic.html', title_en: 'Everyday Arabic', title_te: 'రోజువారీ అరబిక్', tags: ['arabic', 'daily', 'phrases'] },
    { id: 'urdu-alphabet', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/alphabet.html', title_en: 'Urdu Alphabet', title_te: 'ఉర్దూ వర్ణమాల', tags: ['urdu', 'letters'] },
    { id: 'urdu-reading', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/reading-basics.html', title_en: 'Reading Basics', title_te: 'చదవడం ప్రాథమికాలు', tags: ['urdu', 'reading'] },
    { id: 'urdu-writing', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/writing-skills.html', title_en: 'Writing Skills', title_te: 'రాత నైపుణ్యాలు', tags: ['urdu', 'writing', 'nastaliq'] },
    { id: 'urdu-daily', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/daily-urdu.html', title_en: 'Everyday Urdu', title_te: 'రోజువారీ ఉర్దూ', tags: ['urdu', 'daily', 'phrases'] },
    { id: 'urdu-islamic', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/islamic-urdu.html', title_en: 'Islamic Urdu', title_te: 'ఇస్లామిక్ ఉర్దూ', tags: ['urdu', 'islamic'] },
    { id: 'urdu-advanced', portal: 'urdu', kind: 'lesson', url: 'knowledge-center/learn-urdu/advanced-reading.html', title_en: 'Advanced Reading', title_te: 'ఉన్నత స్థాయి చదవడం', tags: ['urdu', 'advanced', 'reading'] }
  ];

  function all() { return pages.concat(portals, tools, lessons); }
  function byId(id) { return all().filter(function (x) { return x.id === id; })[0] || null; }
  function portalById(id) { return portals.filter(function (x) { return x.id === id; })[0] || null; }
  function abs(url) { return /^https?:/i.test(url) ? url : BASE_URL + (url || '').replace(/^\.?\//, ''); }

  function searchRecords() {
    return all().map(function (x) {
      return {
        c: x.kind === 'portal' ? 'P' : x.kind === 'lesson' ? 'L' : x.kind === 'tool' ? 'T' : x.kind === 'command' ? 'C' : x.kind === 'hub' ? 'A' : 'X',
        type: x.kind,
        id: x.id,
        action: x.action || 'navigate',
        te: x.title_te,
        en: x.title_en,
        dte: x.desc_te || '',
        den: x.desc_en || '',
        u: x.url,
        k: (x.tags || []).concat(x.aliases || []).join(' ')
      };
    });
  }

  window.IF_SITE_CATALOG = {
    version: '2026-06-21.1',
    baseUrl: BASE_URL,
    logo: LOGO,
    pages: pages,
    portals: portals,
    tools: tools,
    lessons: lessons,
    all: all,
    byId: byId,
    portalById: portalById,
    abs: abs,
    searchRecords: searchRecords
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = window.IF_SITE_CATALOG;
})();
