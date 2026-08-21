/* ===================================================================
   Islamic Front — Learn Quran Visual Learning (if-quran-visuals.js)
   Rich interactive visuals (real SVG/CSS, no placeholders), runs only on
   the learn-quran portal. Complements the on-page Tajweed Academy:
     1. Tajweed rules at a glance (selectable)
     2. Makki vs Madani comparison
     3. Revelation & compilation timeline (expandable)
     4. How the Quran is organised (structure stats)
   Bilingual (te/en), mobile-first, reduced-motion safe.
   =================================================================== */
(function () {
  'use strict';
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  if ((parts[parts.length - 2] || '') !== 'learn-quran') return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function L(en, t) { return te() ? t : en; }

  var TAJWEED = [
    { n_en: 'Ghunnah', n_te: 'గున్నా', ar: 'نّ مّ', d_en: 'A nasal sound held for about two counts on noon and meem that carry a shadda.', d_te: 'షద్దా గల నూన్, మీమ్‌పై సుమారు రెండు మాత్రల పాటు ఉంచే నాసిక శబ్దం.' },
    { n_en: 'Qalqalah', n_te: 'ఖల్‌ఖలా', ar: 'ق ط ب ج د', d_en: 'A slight echo or bounce on the letters qaf, ta, ba, jim, dal when they carry sukun.', d_te: 'ఖాఫ్, తా, బా, జీమ్, దాల్ అక్షరాలకు సుకూన్ ఉన్నప్పుడు వచ్చే చిన్న ప్రతిధ్వని/గెంతు.' },
    { n_en: 'Madd', n_te: 'మద్ద్', ar: 'ا و ي', d_en: 'Elongation of a long vowel for a set number of counts.', d_te: 'దీర్ఘ అచ్చును నిర్దిష్ట మాత్రల పాటు పొడిగించడం.' },
    { n_en: 'Idgham', n_te: 'ఇద్గామ్', ar: 'ي ر م ل و ن', d_en: 'Merging a noon sakinah or tanween into the next letter.', d_te: 'నూన్ సాకినా లేదా తన్వీన్‌ను తరువాతి అక్షరంలో కలపడం.' },
    { n_en: 'Ikhfa', n_te: 'ఇఖ్ఫా', ar: 'ت ث ج د ...', d_en: 'A light, hidden nasal sound before certain letters.', d_te: 'కొన్ని అక్షరాల ముందు తేలికైన, దాగిన నాసిక శబ్దం.' }
  ];

  var MAKKI = { list_en: ['Revealed in Makkah, before the Hijrah', 'Themes: Tawheed, the afterlife, stories of the prophets', 'Often shorter, rhythmic verses', 'Calls all people to faith'], list_te: ['హిజ్రాకు ముందు మక్కాలో అవతరించాయి', 'విషయాలు: తౌహీద్, పరలోకం, ప్రవక్తల కథలు', 'తరచూ చిన్న, లయబద్ధ వాక్యాలు', 'అందరినీ విశ్వాసం వైపు పిలుస్తాయి'] };
  var MADANI = { list_en: ['Revealed in Madinah, after the Hijrah', 'Themes: law, worship, community and dealings', 'Often longer, detailed verses', 'Guides the new Muslim society'], list_te: ['హిజ్రా తర్వాత మదీనాలో అవతరించాయి', 'విషయాలు: ధర్మశాసనం, ఆరాధన, సమాజం, వ్యవహారాలు', 'తరచూ పొడవైన, వివరణాత్మక వాక్యాలు', 'కొత్త ముస్లిం సమాజాన్ని నడిపిస్తాయి'] };

  var TL = [
    { d: '610 CE', en: 'First revelation', te: 'మొదటి అవతరణ', s_en: 'The command Iqra (Read) is revealed in the Cave of Hira.', s_te: 'హిరా గుహలో ఇఖ్రా (చదువు) అనే ఆజ్ఞ అవతరించింది.' },
    { d: '610–622', en: 'Makkan period', te: 'మక్కా కాలం', s_en: 'Revelations focus on faith, Tawheed, and the afterlife.', s_te: 'అవతరణలు విశ్వాసం, తౌహీద్, పరలోకంపై దృష్టి పెడతాయి.' },
    { d: '622–632', en: 'Madinan period', te: 'మదీనా కాలం', s_en: 'Revelations bring law, worship, and community guidance.', s_te: 'అవతరణలు ధర్మశాసనం, ఆరాధన, సమాజ మార్గదర్శనం తెస్తాయి.' },
    { d: '~632–634', en: 'First compilation', te: 'మొదటి సంకలనం', s_en: 'The written Quran is gathered into one volume under Abu Bakr (RA).', s_te: 'అబూ బక్ర్ (ర/అ) ఆధ్వర్యంలో రాసిన ఖురాన్ ఒక సంపుటంగా సేకరించబడింది.' },
    { d: '~650', en: 'Standard text', te: 'ప్రామాణిక పాఠం', s_en: 'A single standard copy is distributed under Uthman (RA).', s_te: 'ఉస్మాన్ (ర/అ) ఆధ్వర్యంలో ఒకే ప్రామాణిక ప్రతి పంపిణీ చేయబడింది.' }
  ];

  var STATS = [
    { n: '114', en: 'Surahs (chapters)', te: 'సూరాలు (అధ్యాయాలు)' },
    { n: '30', en: 'Ajza (parts / juz)', te: 'అజ్జా (భాగాలు / జుజ్)' },
    { n: '1', en: 'Al-Fatihah opens it', te: 'అల్-ఫాతిహా దాన్ని ప్రారంభిస్తుంది' },
    { n: '23', en: 'Years of revelation', te: 'అవతరణ సంవత్సరాలు' }
  ];

  var CSS = '.qv-sec{padding:var(--ifx-space-y,80px) var(--ifx-space-x,5vw);background:linear-gradient(180deg,rgba(46,139,87,.05),transparent)}'
    + '.qv-in{max-width:var(--ifx-container,1140px);margin-inline:auto}'
    + '.qv-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold,#c8922a);font-weight:700}'
    + '.qv-title{font-family:"Playfair Display",serif;font-size:clamp(26px,4vw,40px);color:var(--green-deep,#0d3b1e);margin:.2em 0 1em}'
    + '.qv-block{margin:34px 0}.qv-h{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--green-deep,#0d3b1e);font-size:18px;margin-bottom:4px}'
    + '.qv-sub{color:var(--text-muted,#7a6840);font-size:13px;margin:0 0 16px}'
    + '.qv-card{background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25));border-radius:var(--radius,16px);box-shadow:var(--ifx-shadow-md,0 6px 24px rgba(13,59,30,.1))}'
    /* tajweed */
    + '.qv-taj{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:18px;align-items:start}'
    + '.qv-chips{display:flex;flex-wrap:wrap;gap:9px}'
    + '.qv-chip{cursor:pointer;padding:9px 15px;border-radius:100px;border:1px solid var(--border,rgba(200,146,42,.35));background:var(--white,#fff);color:var(--green-deep,#0d3b1e);font-weight:600;font-size:13px;transition:all .2s}'
    + '.qv-chip:hover{border-color:var(--gold,#c8922a)}.qv-chip.on{background:#0d3b1e;color:var(--gold-light,#e8b84b);border-color:#0d3b1e}'
    + '.qv-tdet{padding:18px;min-height:110px}.qv-tdet h4{margin:0;color:var(--green-deep,#0d3b1e);font-size:18px}'
    + '.qv-tar{font-family:"Amiri",serif;direction:rtl;font-size:26px;color:var(--gold,#c8922a);margin:6px 0}'
    + '.qv-tdet p{margin:0;color:var(--text-mid,#3d3018);font-size:14px;line-height:1.6}'
    /* makki/madani */
    + '.qv-mm{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    + '.qv-mm-card{padding:18px}.qv-mm-card h4{margin:0 0 10px;font-size:18px;color:var(--green-deep,#0d3b1e);display:flex;align-items:center;gap:8px}'
    + '.qv-mm-card ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;color:var(--text-mid,#3d3018);font-size:13px}'
    /* timeline */
    + '.qv-tl{position:relative;padding-left:30px}.qv-tl::before{content:"";position:absolute;left:9px;top:4px;bottom:4px;width:3px;background:linear-gradient(#c8922a,#2e8b57)}'
    + '.qv-node{position:relative;margin-bottom:10px}.qv-node::before{content:"";position:absolute;left:-26px;top:14px;width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #2e8b57}'
    + '.qv-nhead{display:flex;align-items:center;gap:10px;cursor:pointer;padding:11px 14px;border-radius:12px;background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25))}'
    + '.qv-nhead:hover{border-color:var(--gold,#c8922a)}.qv-ndate{font-size:11px;font-weight:700;color:#fff;background:#2e8b57;padding:3px 9px;border-radius:100px;white-space:nowrap}'
    + '.qv-ntitle{font-weight:700;color:var(--text-dark,#1a1208);flex:1;min-width:0;font-size:14px}'
    + '.qv-chev{transition:transform .25s;color:var(--text-muted,#7a6840)}.qv-node.open .qv-chev{transform:rotate(90deg)}'
    + '.qv-ndet{max-height:0;overflow:hidden;transition:max-height .3s ease;padding:0 14px}.qv-node.open .qv-ndet{max-height:200px;padding:10px 14px 4px}'
    + '.qv-ndet p{margin:0;color:var(--text-mid,#3d3018);font-size:13px;line-height:1.6}'
    /* stats */
    + '.qv-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px}'
    + '.qv-stat{padding:18px;text-align:center}.qv-stat b{display:block;font-family:"Playfair Display",serif;font-size:34px;color:var(--gold,#c8922a);line-height:1}'
    + '.qv-stat span{font-size:12px;color:var(--text-muted,#7a6840);display:block;margin-top:6px}'
    + '@media(max-width:680px){.qv-taj{grid-template-columns:1fr}.qv-mm{grid-template-columns:1fr}}';

  var root, selTaj = 0;

  function tajHtml() {
    var t = te();
    var chips = TAJWEED.map(function (r, i) { return '<button type="button" class="qv-chip' + (i === selTaj ? ' on' : '') + '" data-taj="' + i + '">' + (t ? r.n_te : r.n_en) + '</button>'; }).join('');
    var c = TAJWEED[selTaj];
    return '<div class="qv-block"><div class="qv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="2.6"/><circle cx="16" cy="16" r="2.6"/></svg> ' + L('Tajweed Rules at a Glance', 'తజ్వీద్ నియమాలు ఒక్క చూపులో') + '</div>'
      + '<p class="qv-sub">' + L('Tap a rule to see what it means and its letters.', 'అర్థం, దాని అక్షరాలు చూడటానికి ఒక నియమాన్ని తాకండి.') + '</p>'
      + '<div class="qv-taj"><div class="qv-chips">' + chips + '</div>'
      + '<div class="qv-card qv-tdet" id="qv-tdet"><h4>' + (t ? c.n_te : c.n_en) + '</h4><div class="qv-tar" lang="ar" dir="rtl">' + c.ar + '</div><p>' + (t ? c.d_te : c.d_en) + '</p></div></div></div>';
  }

  function mmHtml() {
    var t = te();
    function card(icon, name, data) {
      return '<div class="qv-card qv-mm-card"><h4>' + icon + ' ' + name + '</h4><ul>' + (t ? data.list_te : data.list_en).map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div>';
    }
    return '<div class="qv-block"><div class="qv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="7" width="12" height="11" rx="1"/><path d="M6 11h12"/></svg> ' + L('Makki vs Madani Surahs', 'మక్కీ, మదనీ సూరాలు') + '</div>'
      + '<p class="qv-sub">' + L('Where a surah was revealed shapes its themes.', 'సూరా ఎక్కడ అవతరించిందో దాని విషయాలను తీర్చిదిద్దుతుంది.') + '</p>'
      + '<div class="qv-mm">' + card('🕋', L('Makki', 'మక్కీ'), MAKKI) + card('🌴', L('Madani', 'మదనీ'), MADANI) + '</div></div>';
  }

  function tlHtml() {
    var t = te();
    var nodes = TL.map(function (n) {
      return '<div class="qv-node"><div class="qv-nhead"><span class="qv-ndate">' + n.d + '</span><span class="qv-ntitle">' + (t ? n.te : n.en) + '</span>'
        + '<svg class="qv-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg></div>'
        + '<div class="qv-ndet"><p>' + (t ? n.s_te : n.s_en) + '</p></div></div>';
    }).join('');
    return '<div class="qv-block"><div class="qv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/></svg> ' + L('Revelation & Compilation Timeline', 'అవతరణ, సంకలన కాలక్రమం') + '</div>'
      + '<p class="qv-sub">' + L('How the Quran was revealed and preserved. Tap a stage.', 'ఖురాన్ ఎలా అవతరించి సంరక్షించబడింది. ఒక దశను తాకండి.') + '</p>'
      + '<div class="qv-tl">' + nodes + '</div></div>';
  }

  function statsHtml() {
    var t = te();
    var cards = STATS.map(function (s) { return '<div class="qv-card qv-stat"><b>' + s.n + '</b><span>' + (t ? s.te : s.en) + '</span></div>'; }).join('');
    return '<div class="qv-block"><div class="qv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-7"/></svg> ' + L('How the Quran is Organised', 'ఖురాన్ ఎలా అమర్చబడింది') + '</div>'
      + '<div class="qv-stats">' + cards + '</div></div>';
  }

  function render() {
    if (!root) return;
    root.innerHTML = '<div class="qv-in"><div class="qv-label">' + L('Visual Learning', 'దృశ్య అభ్యాసం') + '</div>'
      + '<h2 class="qv-title">' + L('See it before you read it', 'చదవడానికి ముందు దృశ్యంగా చూడండి') + '</h2>'
      + tajHtml() + mmHtml() + tlHtml() + statsHtml() + '</div>';
    bind();
  }

  function bind() {
    root.querySelectorAll('.qv-chip').forEach(function (b) {
      b.addEventListener('click', function () {
        selTaj = +b.getAttribute('data-taj');
        root.querySelectorAll('.qv-chip').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var c = TAJWEED[selTaj], t = te(), d = root.querySelector('#qv-tdet');
        if (d) d.innerHTML = '<h4>' + (t ? c.n_te : c.n_en) + '</h4><div class="qv-tar" lang="ar" dir="rtl">' + c.ar + '</div><p>' + (t ? c.d_te : c.d_en) + '</p>';
      });
    });
    root.querySelectorAll('.qv-node .qv-nhead').forEach(function (h) { h.addEventListener('click', function () { h.parentNode.classList.toggle('open'); }); });
  }

  function inject() {
    if (document.getElementById('if-quran-visuals')) return;
    if (!document.getElementById('qv-style')) { var st = document.createElement('style'); st.id = 'qv-style'; st.innerHTML = CSS; document.head.appendChild(st); }
    var sec = document.createElement('section'); sec.id = 'if-quran-visuals'; sec.className = 'qv-sec'; sec.setAttribute('aria-label', 'Quran Visual Learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons.nextSibling);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else document.body.appendChild(sec); }
    root = sec; render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
