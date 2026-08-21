/* ==========================================================================
   Islamic Front - Structured data.
   Catalog-aware JSON-LD for breadcrumbs, courses, FAQs, and site search.
   ========================================================================== */
(function () {
  'use strict';

  var ORG = { '@type': 'Organization', name: 'Islamic Front, Mangalagiri' };
  var FALLBACK_PORTALS = {
    'learn-quran': { title_en: 'Learn Quran', desc_en: 'Read, recite with tajweed, memorise, and understand the Quran.', url: 'knowledge-center/learn-quran/index.html' },
    'learn-salah': { title_en: 'Learn Salah', desc_en: 'Learn wudu, ghusl, prayer steps, daily prayers, and khushu.', url: 'knowledge-center/learn-salah/index.html' },
    'seerah': { title_en: 'Seerah', desc_en: 'The life of Prophet Muhammad, from before prophethood to his legacy.', url: 'knowledge-center/seerah/index.html' },
    'islamic-history': { title_en: 'Islamic History', desc_en: 'A guided path through major eras of Islamic history.', url: 'knowledge-center/islamic-history/index.html' },
    'kids-islam': { title_en: 'Kids Islam', desc_en: 'Beliefs, manners, duas, prophet stories, salah, Quran basics, and leadership for children.', url: 'knowledge-center/kids-islam/index.html' },
    'learn-arabic': { title_en: 'Learn Arabic', desc_en: 'Arabic alphabet, harakat, vocabulary, grammar, Quranic Arabic, and daily Arabic.', url: 'knowledge-center/learn-arabic/index.html' },
    'learn-urdu': { title_en: 'Learn Urdu', desc_en: 'Urdu alphabet, reading, writing, everyday Urdu, Islamic Urdu, and advanced reading.', url: 'knowledge-center/learn-urdu/index.html' }
  };

  function abs(rel) {
    var C = window.IF_SITE_CATALOG;
    if (C && C.abs) return C.abs(rel);
    var a = document.createElement('a');
    a.href = rel;
    return a.href;
  }

  function samePath(a, b) {
    return (a || '').replace(/^\/+/, '').replace(/\/index\.html$/, '/index.html') ===
      (b || '').replace(/^\/+/, '').replace(/\/index\.html$/, '/index.html');
  }

  function currentCatalogRecord() {
    var C = window.IF_SITE_CATALOG;
    if (!C || !C.all) return null;
    var path = location.pathname.split('/').pop() ? location.pathname : location.pathname + 'index.html';
    path = path.replace(/^.*\/IFP_Testing\//, '').replace(/^\/+/, '');
    var records = C.all();
    for (var i = 0; i < records.length; i++) {
      if (samePath(records[i].url, path)) return records[i];
    }
    return null;
  }

  function currentPortal() {
    var rec = currentCatalogRecord();
    if (rec && rec.kind === 'portal') return rec;
    var parts = location.pathname.replace(/\/+$/, '').split('/');
    var folder = parts[parts.length - 2] || '';
    var C = window.IF_SITE_CATALOG;
    if (C && C.portalById) {
      var id = folder.replace(/^learn-/, '');
      var byId = C.portalById(id);
      if (byId) return byId;
    }
    return FALLBACK_PORTALS[folder] || null;
  }

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
    cfg.lessons.forEach(function (lesson) {
      (lesson.faqs || []).forEach(function (f) {
        if (f.q_en && f.a_en) {
          qa.push({ '@type': 'Question', name: f.q_en, acceptedAnswer: { '@type': 'Answer', text: f.a_en } });
        }
      });
    });
    return qa.length ? { '@type': 'FAQPage', mainEntity: qa.slice(0, 16) } : null;
  }

  function searchAction() {
    var C = window.IF_SITE_CATALOG;
    var home = C && C.abs ? C.abs('index.html') : abs('index.html');
    return {
      '@type': 'WebSite',
      name: 'Islamic Front, Mangalagiri',
      url: home,
      potentialAction: {
        '@type': 'SearchAction',
        target: home + '?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };
  }

  var graph = [];
  var portal = currentPortal();

  if (portal) {
    graph.push(breadcrumb([
      { name: 'Home', url: abs('index.html') },
      { name: 'Knowledge Center', url: abs('islamic-knowledge.html') },
      { name: portal.title_en || portal.en || 'Portal', url: abs(portal.url || location.href.split('#')[0]) }
    ]));
    graph.push({
      '@type': 'Course',
      name: portal.title_en || portal.en,
      description: portal.desc_en || portal.d || '',
      inLanguage: ['te', 'en'],
      isAccessibleForFree: true,
      provider: ORG,
      url: abs(portal.url || location.href.split('#')[0])
    });
    var fp = faqPage();
    if (fp) graph.push(fp);
  } else if (/islamic-knowledge\.html/.test(location.pathname)) {
    graph.push(breadcrumb([
      { name: 'Home', url: abs('index.html') },
      { name: 'Knowledge Center', url: abs('islamic-knowledge.html') }
    ]));
  }

  if (/\/(?:index\.html)?$/.test(location.pathname) || /index\.html$/.test(location.pathname)) graph.push(searchAction());

  if (graph.length) {
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
    document.head.appendChild(s);
  }
})();
