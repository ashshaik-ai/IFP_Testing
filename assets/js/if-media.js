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
  var ICONS = { audio: '🎧', recitation: '📖', pronunciation: '🗣️', illustration: '🖼️', infographic: '📊', timeline: '🕰️', map: '🗺️', diagram: '📐', video: '🎬', interactive: '🎮' };
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
