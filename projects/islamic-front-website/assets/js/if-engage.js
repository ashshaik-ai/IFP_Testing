/* ==========================================================================
   if-engage.js — Phase A shared engagement infrastructure.
   Standalone (no dependency on if-core). Self-initialising. Reduced-motion safe.
   Exposes window.IFEngage. This pass ships the FOUNDATION/API + passive
   "recently visited" tracking; per-feature wiring happens in Phase B.
   API:
     IFEngage.celebrate({count})          -> confetti burst (skipped if reduced-motion)
     IFEngage.progressRing(el, pct)        -> paint a .ifx-ring (0-100)
     IFEngage.badge(el, {icon, locked})    -> render an achievement badge
     IFEngage.markVisited()                -> record current page (auto on load)
     IFEngage.getRecent()                  -> [{title,url,t}] most-recent first
     IFEngage.setContinue(o)/getContinue() -> {title,url,portal,lesson} resume point
     IFEngage.reducedMotion                -> boolean
   Storage keys: if-recent, if-continue (localStorage; tolerant of file://).
   ========================================================================== */
(function () {
  'use strict';
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var CONFETTI_COLORS = ['#c8922a', '#e8b84b', '#2e8b57', '#1a5c30', '#f5e6c0'];

  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  /* ---- recently visited ---- */
  function markVisited() {
    var title = (document.title || '').replace(/\s+/g, ' ').trim();
    if (!title) return;
    var url = location.pathname + location.hash;
    var list = lsGet('if-recent', []);
    list = list.filter(function (x) { return x && x.url !== url; });
    list.unshift({ title: title, url: url, t: Date.now() });
    lsSet('if-recent', list.slice(0, 8));
  }
  function getRecent() { return lsGet('if-recent', []); }

  /* ---- continue learning ---- */
  function setContinue(o) { if (o && o.url) lsSet('if-continue', o); }
  function getContinue() { return lsGet('if-continue', null); }

  /* ---- celebration ---- */
  function celebrate(opts) {
    if (RM) return;
    opts = opts || {};
    var n = opts.count || 80;
    var host = document.createElement('div');
    host.className = 'ifx-confetti';
    for (var i = 0; i < n; i++) {
      var p = document.createElement('i');
      p.style.left = (Math.random() * 100) + '%';
      p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
      p.style.animationDelay = (Math.random() * 0.35) + 's';
      p.style.animationDuration = (2 + Math.random() * 1.6) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      host.appendChild(p);
    }
    document.body.appendChild(host);
    setTimeout(function () { if (host.parentNode) host.parentNode.removeChild(host); }, 4200);
  }

  /* ---- progress ring ---- */
  function progressRing(el, pct) {
    if (!el) return;
    pct = Math.max(0, Math.min(100, +pct || 0));
    el.classList.add('ifx-ring');
    el.setAttribute('data-pct', Math.round(pct));
    if (RM) { el.style.setProperty('--pct', pct); return; }
    // animate the fill from current to target
    var from = parseFloat(el.getAttribute('data-from') || 0), start = null;
    function step(ts) {
      if (start === null) start = ts;
      var k = Math.min(1, (ts - start) / 700);
      var cur = from + (pct - from) * k;
      el.style.setProperty('--pct', cur);
      el.setAttribute('data-pct', Math.round(cur));
      if (k < 1) requestAnimationFrame(step); else el.setAttribute('data-from', pct);
    }
    requestAnimationFrame(step);
  }

  /* ---- achievement badge ---- */
  function badge(el, opts) {
    if (!el) return;
    opts = opts || {};
    el.classList.add('ifx-badge');
    if (opts.locked) el.classList.add('locked'); else el.classList.remove('locked');
    el.textContent = opts.icon || (opts.locked ? '🔒' : '★');
    if (!opts.locked && !RM) { el.classList.remove('ifx-pop'); void el.offsetWidth; el.classList.add('ifx-pop'); }
  }

  window.IFEngage = {
    celebrate: celebrate,
    progressRing: progressRing,
    badge: badge,
    markVisited: markVisited,
    getRecent: getRecent,
    setContinue: setContinue,
    getContinue: getContinue,
    reducedMotion: RM
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markVisited);
  } else {
    markVisited();
  }
})();
