/* ===================================================================
   Islamic Front — XP, Levels & daily streak HUD (if-xp.js)
   Universal gamification across all portals (Duolingo/Brilliant style).
   Other modules call window.IFXP.award(points) on real achievements:
     • complete a lesson / sub-lesson  -> 20 XP
     • finish a quiz with a good score  -> 15 XP
     • first visit each day (auto)      ->  5 XP
   Persists to localStorage if-xp. Shows a compact level + XP-bar HUD,
   celebrates level-ups (reduced-motion safe via IFEngage). Bilingual.
   =================================================================== */
(function () {
  'use strict';
  var KEY = 'if-xp', PER = 100; // XP per level
  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { } }
  function today() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function levelOf(xp) { return Math.floor(xp / PER) + 1; }

  var s = load(); s.xp = s.xp || 0;
  var hud;

  function toast(msg) {
    if (window.IFCore && IFCore.toast) { IFCore.toast(msg); return; }
    var t = document.createElement('div'); t.className = 'ifxp-toast'; t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.classList.add('on'); }, 10);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 2600);
  }

  function award(points) {
    points = +points || 0; if (!points) return;
    var before = levelOf(s.xp);
    s.xp += points; save();
    var after = levelOf(s.xp);
    render();
    if (hud) { hud.classList.remove('ifx-pop'); void hud.offsetWidth; if (!(window.IFEngage && IFEngage.reducedMotion)) hud.classList.add('ifx-pop'); }
    if (after > before) {
      if (window.IFEngage) IFEngage.celebrate({ count: 90 });
      toast((te() ? 'స్థాయి పెరిగింది! స్థాయి ' : 'Level up! Level ') + after);
    }
  }

  function render() {
    if (!hud) return;
    var lvl = levelOf(s.xp), inLvl = s.xp % PER;
    hud.querySelector('.ifxp-lvl').textContent = (te() ? 'స్థాయి ' : 'Lvl ') + lvl;
    hud.querySelector('.ifxp-xp').textContent = s.xp + ' XP';
    hud.querySelector('.ifxp-bar > i').style.width = (inLvl) + '%';
    hud.setAttribute('title', (te() ? 'తదుపరి స్థాయికి ' : 'To next level: ') + (PER - inLvl) + ' XP');
  }

  function inject() {
    if (document.getElementById('ifxp')) return;
    hud = document.createElement('div'); hud.id = 'ifxp'; hud.setAttribute('aria-label', 'Experience points');
    hud.innerHTML = '<span class="ifxp-spark" aria-hidden="true">✦</span><span class="ifxp-lvl"></span>'
      + '<span class="ifxp-bar"><i></i></span><span class="ifxp-xp"></span>';
    hud.setAttribute('role', 'button'); hud.setAttribute('tabindex', '0');
    hud.addEventListener('click', function () { if (window.IFProfile) IFProfile.open(); });
    hud.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && window.IFProfile) { e.preventDefault(); IFProfile.open(); } });
    document.body.appendChild(hud);
    render();
    // Lift the back-to-top button above the XP HUD so they don't overlap at the same corner.
    var btt = document.getElementById('btt');
    if (btt) btt.style.bottom = '76px';
  }

  // daily visit bonus (once per calendar day)
  (function daily() { var t = today(); if (s.lastDay !== t) { s.lastDay = t; s.xp += 5; save(); } })();

  // Award XP at most once per unique key (e.g. a lesson or quiz). The awarded
  // ledger persists, so un-completing then re-completing never grants XP twice.
  function awardOnce(key, points) {
    if (!key) return false;
    s.awarded = s.awarded || {};
    if (s.awarded[key]) return false;
    s.awarded[key] = 1; save();
    award(points);
    return true;
  }
  // Check portal badge array against current counts; toast each newly-unlocked badge once.
  // badges: [{type:'lessons'|'streak', n, en, te}]  counts: {lessons, streak}
  function checkBadges(badges, counts, pkey) {
    if (!badges || !badges.length) return;
    var nkey = 'ifxp-badges-' + (pkey || 'x');
    var noted; try { noted = JSON.parse(localStorage.getItem(nkey)) || {}; } catch (e) { noted = {}; }
    var changed = false;
    badges.forEach(function (b) {
      var count = counts[b.type] || 0;
      var k = b.type + ':' + b.n;
      if (count >= b.n && !noted[k]) {
        noted[k] = 1; changed = true;
        var label = te() ? b.te : b.en;
        setTimeout(function () { toast('🏅 ' + (te() ? 'బ్యాడ్జ్ అన్‌లాక్: ' : 'Badge unlocked: ') + label); }, 600);
      }
    });
    if (changed) try { localStorage.setItem(nkey, JSON.stringify(noted)); } catch (e) { }
  }

  window.IFXP = { award: award, awardOnce: awardOnce, checkBadges: checkBadges, level: function () { return levelOf(s.xp); }, xp: function () { return s.xp; } };

  // Inject a compact XP chip into bespoke portal dashboards (those with #dash-body)
  // so inline portals (Quran/Salah/Seerah/Kids/History) surface the global XP level.
  function injectDashChip() {
    var db = document.getElementById('dash-body');
    if (!db || document.getElementById('ifxp-dash-chip')) return;
    var chip = document.createElement('div'); chip.id = 'ifxp-dash-chip';
    var lvl = levelOf(s.xp), inLvl = s.xp % PER;
    var label = te() ? ('✦ స్థాయి ' + lvl + ' · ' + s.xp + ' XP') : ('✦ Lvl ' + lvl + ' · ' + s.xp + ' XP');
    chip.innerHTML = '<button type="button" class="ifxp-dash-btn" aria-label="Open learner profile">'
      + label + '<span class="ifxp-dash-bar"><i style="width:' + inLvl + '%"></i></span></button>';
    chip.querySelector('.ifxp-dash-btn').addEventListener('click', function () { if (window.IFProfile) IFProfile.open(); });
    db.appendChild(chip);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  // Also run injectDashChip after DOM is ready (portal dashboards render after DOMContentLoaded).
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(injectDashChip, 200); });
  else setTimeout(injectDashChip, 200);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
