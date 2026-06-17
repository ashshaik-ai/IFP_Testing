/* ===================================================================
   Islamic Front — Media placeholder system (if-media.js)
   Drop a slot anywhere and it renders a premium, responsive placeholder
   that matches the design language. When the real asset is ready, add a
   data-src (and for images, it just works) — no redesign needed.

   Usage:
     <div data-if-media="map" data-label-en="Hijrah route"
          data-label-te="హిజ్రా మార్గం"></div>            <- placeholder
     <div data-if-media="recitation" data-src="audio/al-fatiha.mp3"
          data-label-en="Surah Al-Fatiha"></div>           <- live audio

   Types: audio · recitation · pronunciation · illustration · infographic
          · timeline · map · diagram · video · interactive
   Bilingual via <html lang>. Call window.IFMedia.refresh() after injecting
   slots dynamically.
   =================================================================== */
(function () {
  'use strict';
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  var ICONS = {
    audio:        '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    recitation:   '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    pronunciation:'<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>',
    illustration: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    infographic:  '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    timeline:     '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>',
    map:          '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    diagram:      '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/><path d="M6 9v3a3 3 0 0 0 3 3h6"/><path d="M18 15V9a3 3 0 0 0-3-3H9"/></svg>',
    video:        '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    interactive:  '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };
  var LABELS = {
    audio: { te: 'ఆడియో', en: 'Audio' }, recitation: { te: 'ఖురాన్ పఠనం', en: 'Recitation' }, pronunciation: { te: 'ఉచ్చారణ', en: 'Pronunciation' },
    illustration: { te: 'చిత్రం', en: 'Illustration' }, infographic: { te: 'ఇన్ఫోగ్రాఫిక్', en: 'Infographic' }, timeline: { te: 'కాలక్రమం', en: 'Timeline' },
    map: { te: 'పటం', en: 'Map' }, diagram: { te: 'రేఖాచిత్రం', en: 'Diagram' }, video: { te: 'వీడియో', en: 'Video' }, interactive: { te: 'ఇంటరాక్టివ్', en: 'Interactive' }
  };
  function soon() { return lang() === 'te' ? 'త్వరలో' : 'Coming soon'; }
  function typeLabel(type) { return LABELS[type] ? (lang() === 'te' ? LABELS[type].te : LABELS[type].en) : type; }
  function caption(el) { var te = lang() === 'te'; return el.getAttribute(te ? 'data-label-te' : 'data-label-en') || el.getAttribute('data-label') || ''; }

  function renderReal(el, type, src) {
    var cap = caption(el);
    if (type === 'audio' || type === 'recitation' || type === 'pronunciation') {
      el.innerHTML = '<audio controls preload="none" src="' + src + '"></audio>' + (cap ? '<div class="ifm-cap">' + cap + '</div>' : '');
    } else if (type === 'video') {
      el.innerHTML = '<video controls preload="none" src="' + src + '" style="width:100%;border-radius:12px"></video>' + (cap ? '<div class="ifm-cap">' + cap + '</div>' : '');
    } else {
      el.innerHTML = '<img src="' + src + '" alt="' + (cap || type) + '" loading="lazy" style="width:100%;border-radius:12px;display:block">' + (cap ? '<div class="ifm-cap">' + cap + '</div>' : '');
    }
    el.classList.add('ifm-live');
  }
  function renderPlaceholder(el, type) {
    var cap = caption(el);
    el.innerHTML = '<div class="ifm-ph">'
      + '<span class="ifm-ic" aria-hidden="true">' + (ICONS[type] || '✦') + '</span>'
      + '<span class="ifm-meta"><b class="ifm-type">' + typeLabel(type) + '</b>'
      + (cap ? '<span class="ifm-lbl">' + cap + '</span>' : '') + '</span>'
      + '<span class="ifm-soon">' + soon() + '</span></div>';
  }
  function paint() {
    document.querySelectorAll('[data-if-media]').forEach(function (el) {
      var type = el.getAttribute('data-if-media');
      var src = el.getAttribute('data-src');
      el.classList.add('ifm-slot');
      if (src) renderReal(el, type, src); else renderPlaceholder(el, type);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
  new MutationObserver(paint).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.IFMedia = { refresh: paint };
})();
