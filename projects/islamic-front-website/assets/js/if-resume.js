/* ===================================================================
   Islamic Front — Homepage "Continue learning" resume card (if-resume.js)
   Additive. Reads the sitewide IFEngage visit history and, if the user
   has recently visited a learning portal, injects a one-tap resume card
   into the homepage #learning section. Bilingual (te/en) via <html lang>.
   No new CSS — reuses .ifx-card / .ifx-btn / .ifp-continue.
   =================================================================== */
(function () {
  'use strict';
  var PORTALS = [
    { m: 'kids-islam', en: 'Kids Islam', te: 'పిల్లల ఇస్లాం' },
    { m: 'learn-quran', en: 'Learn Quran', te: 'ఖురాన్ నేర్చుకోండి' },
    { m: 'learn-salah', en: 'Learn Salah', te: 'నమాజ్ నేర్చుకోండి' },
    { m: 'seerah', en: 'Seerah', te: 'సీరహ్' },
    { m: 'islamic-history', en: 'Islamic History', te: 'ఇస్లామిక్ చరిత్ర' },
    { m: 'learn-arabic', en: 'Learn Arabic', te: 'అరబిక్ నేర్చుకోండి' },
    { m: 'learn-urdu', en: 'Learn Urdu', te: 'ఉర్దూ నేర్చుకోండి' }
  ];
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'te'; }

  function findRecent() {
    if (!(window.IFEngage && IFEngage.getRecent)) return null;
    var list = IFEngage.getRecent();
    for (var i = 0; i < list.length; i++) {
      var u = list[i] && list[i].url ? list[i].url : '';
      for (var j = 0; j < PORTALS.length; j++) {
        if (u.indexOf(PORTALS[j].m) >= 0) return { portal: PORTALS[j] };
      }
    }
    return null;
  }

  var host, data;
  function render() {
    if (!host || !data) return;
    var te = lang() === 'te';
    var name = te ? data.portal.te : data.portal.en;
    var lbl = te ? 'నేర్చుకోవడం కొనసాగించండి' : 'Continue learning';
    var go = te ? 'కొనసాగించు →' : 'Resume →';
    var href = 'knowledge-center/' + data.portal.m + '/index.html';
    host.innerHTML = '<div class="ifx-card ifp-continue" style="margin:0 0 26px">'
      + '<div><span class="ifp-mini">' + lbl + '</span><b>' + name + '</b></div>'
      + '<a class="ifx-btn ifx-btn-primary" href="' + href + '">' + go + '</a></div>';
  }

  function boot() {
    data = findRecent();
    if (!data) return;
    var inner = document.querySelector('#learning .inner');
    if (!inner) return;
    var lead = inner.querySelector('.section-lead');
    host = document.createElement('div');
    host.id = 'if-resume';
    if (lead && lead.nextSibling) inner.insertBefore(host, lead.nextSibling);
    else inner.appendChild(host);
    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  new MutationObserver(function () { render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
