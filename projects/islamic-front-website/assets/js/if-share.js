/* ===================================================================
   Islamic Front — privacy-safe sharing helpers.
   Uses Web Share API when available; otherwise copies the URL. No backend.
   =================================================================== */
(function () {
  'use strict';
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function toast(msg) {
    if (window.IFCore && IFCore.toast) { IFCore.toast(msg); return; }
    var t = document.createElement('div');
    t.className = 'ifshare-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('on'); }, 20);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
  }
  function currentCatalogItem() {
    var C = window.IF_SITE_CATALOG;
    if (!C || !C.all) return null;
    var path = location.pathname.replace(/^.*\/IFP_Testing\//, '').replace(/^\/+/, '') || 'index.html';
    if (/\/$/.test(path)) path += 'index.html';
    return C.all().filter(function (x) { return x.url === path; })[0] || null;
  }
  function shareData(extra) {
    var item = currentCatalogItem();
    var title = item ? (te() ? item.title_te : item.title_en) : document.title;
    var text = item ? (te() ? item.desc_te : item.desc_en) : '';
    return Object.assign({ title: title, text: text || title, url: location.href.split('#')[0] + location.hash }, extra || {});
  }
  function copyUrl(url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(url);
    }
    var ta = document.createElement('textarea');
    ta.value = url;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }
  function share(extra) {
    var data = shareData(extra);
    if (navigator.share) {
      return navigator.share(data).catch(function () {});
    }
    return copyUrl(data.url).then(function () {
      toast(te() ? 'లింక్ కాపీ అయింది' : 'Link copied');
    });
  }
  function shareProgress(stats) {
    var C = window.IF_SITE_CATALOG;
    var title = te() ? 'నా ఇస్లామిక్ ఫ్రంట్ అభ్యాస పురోగతి' : 'My Islamic Front learning progress';
    var text = stats
      ? (te() ? (stats.lessons + ' పాఠాలు పూర్తి చేశాను · స్థాయి ' + stats.level) : ('I completed ' + stats.lessons + ' lessons · Level ' + stats.level))
      : title;
    return share({ title: title, text: text, url: (C && C.baseUrl ? C.baseUrl : location.origin + '/') });
  }
  window.IFShare = { share: share, sharePage: share, shareProgress: shareProgress, data: shareData };
})();
