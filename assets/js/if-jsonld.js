/* ===================================================================
   Islamic Front — Structured data (if-jsonld.js)
   Injects schema.org JSON-LD per page (built with JSON.stringify, so it is
   always valid):
     • Course      — on each learning portal index (where window.IF_LESSONS
                     exists)
     • FAQPage     — from that portal's real lesson FAQs (matches the page)
     • BreadcrumbList — Home › Knowledge Center › Portal, on KC pages
   Relative URLs are resolved to absolute at runtime via an anchor element.
   Homepage already ships Organization + WebSite statically.
   =================================================================== */
(function () {
  'use strict';
  function abs(rel) { var a = document.createElement('a'); a.href = rel; return a.href; }
  var ORG = { '@type': 'Organization', name: 'Islamic Front, Mangalagiri' };

  var PORTALS = {
    'learn-quran': { en: 'Learn Quran', d: 'Read, recite with tajweed, memorise (hifz), and understand (tafseer) the Quran — a free, structured course.' },
    'learn-salah': { en: 'Learn Salah', d: 'How to pray: wudu, ghusl, the prayer step by step, the five daily prayers, and khushu.' },
    'seerah': { en: 'Seerah', d: 'The life of Prophet Muhammad ﷺ, from before prophethood to his legacy, with timeline and key events.' },
    'islamic-history': { en: 'Islamic History', d: 'From pre-Islamic Arabia through the Rashidun, Umayyad, Abbasid, Al-Andalus and Ottoman eras to the modern Muslim world.' },
    'kids-islam': { en: 'Kids Islam', d: 'Beliefs, manners, daily duas, prophet stories, salah and Quran basics, and leadership for children.' },
    'learn-arabic': { en: 'Learn Arabic', d: 'The Arabic alphabet, harakat, vocabulary, grammar, Quranic Arabic and everyday Arabic — a free, structured course.' },
    'learn-urdu': { en: 'Learn Urdu', d: 'The Urdu alphabet, reading, writing (Nastaliq), everyday Urdu, Islamic Urdu and advanced reading.' }
  };

  function breadcrumb(items) {
    return {
      '@type': 'BreadcrumbList',
      itemListElement: items.map(function (it, i) {
        var li = { '@type': 'ListItem', position: i + 1, name: it.name };
        if (it.url) li.item = it.url;
        return li;
      })
    };
  }

  function faqPage() {
    var cfg = window.IF_LESSONS;
    if (!cfg || !cfg.lessons) return null;
    var qa = [];
    cfg.lessons.forEach(function (L) {
      (L.faqs || []).forEach(function (f) {
        if (f.q_en && f.a_en) qa.push({ '@type': 'Question', name: f.q_en, acceptedAnswer: { '@type': 'Answer', text: f.a_en } });
      });
    });
    if (!qa.length) return null;
    return { '@type': 'FAQPage', mainEntity: qa.slice(0, 16) };
  }

  var parts = location.pathname.replace(/\/+$/, '').split('/');
  var folder = parts[parts.length - 2] || '';
  var graph = [];

  if (PORTALS[folder]) {
    var p = PORTALS[folder];
    graph.push(breadcrumb([
      { name: 'Home', url: abs('../../index.html') },
      { name: 'Knowledge Center', url: abs('../../islamic-knowledge.html') },
      { name: p.en, url: location.href.split('#')[0] }
    ]));
    if (window.IF_LESSONS) {
      graph.push({
        '@type': 'Course', name: p.en, description: p.d,
        inLanguage: ['te', 'en'], isAccessibleForFree: true,
        provider: ORG, url: location.href.split('#')[0]
      });
      var fp = faqPage(); if (fp) graph.push(fp);
    }
  } else if (/islamic-knowledge\.html/.test(location.pathname)) {
    graph.push(breadcrumb([
      { name: 'Home', url: abs('index.html') },
      { name: 'Knowledge Center', url: location.href.split('#')[0] }
    ]));
  }

  if (graph.length) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(s);
  }
})();
