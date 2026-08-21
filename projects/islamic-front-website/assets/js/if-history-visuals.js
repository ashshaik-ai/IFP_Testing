/* ===================================================================
   Islamic Front — Islamic History Visual Learning (if-history-visuals.js)
   Replaces the generic media placeholders on the Islamic History portal
   with fully designed, interactive SVG/CSS visuals:
     1. Dynasty timeline (Rashidun -> Ottoman, expandable nodes)
     2. Map of Muslim civilisations (selectable regions)
     3. Golden Age scholars (cards)
     4. Era comparison (Rashidun / Umayyad / Abbasid / Ottoman)
   Bilingual (te/en), mobile-first, reduced-motion safe. Runs only on the
   islamic-history portal. No external assets.
   =================================================================== */
(function () {
  'use strict';
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  if ((parts[parts.length - 2] || '') !== 'islamic-history') return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function L(en, t) { return te() ? t : en; }

  var DYN = [
    { n_en: 'Rashidun Caliphate', n_te: 'రాషిదూన్ ఖిలాఫత్', d: '632–661', cap_en: 'Madinah', cap_te: 'మదీనా', s_en: 'The four Rightly-Guided Caliphs led with justice and consultation (shura), expanded the state, and preserved the Quran in one standard text.', s_te: 'నలుగురు సన్మార్గ ఖలీఫాలు న్యాయం, సంప్రదింపు (షూరా)తో నడిపించి, రాజ్యాన్ని విస్తరించి, ఖురాన్‌ను ఒక ప్రామాణిక పాఠంలో సంరక్షించారు.' },
    { n_en: 'Umayyad Caliphate', n_te: 'ఉమయ్యద్ ఖిలాఫత్', d: '661–750', cap_en: 'Damascus', cap_te: 'డమాస్కస్', s_en: 'The first hereditary caliphate built a vast empire from Spain to the Indus, with Arabic as the shared language of administration.', s_te: 'మొదటి వంశపారంపర్య ఖిలాఫత్ స్పెయిన్ నుండి సింధు వరకు విశాల సామ్రాజ్యాన్ని, అరబిక్‌ను ఉమ్మడి పరిపాలన భాషగా నిర్మించింది.' },
    { n_en: 'Abbasid Golden Age', n_te: 'అబ్బాసీద్ స్వర్ణయుగం', d: '750–1258', cap_en: 'Baghdad', cap_te: 'బాగ్దాద్', s_en: 'Centred on Baghdad and the House of Wisdom, this golden age preserved world knowledge and advanced science, medicine, and mathematics.', s_te: 'బాగ్దాద్, బైతుల్ హిక్మా కేంద్రంగా, ఈ స్వర్ణయుగం ప్రపంచ జ్ఞానాన్ని సంరక్షించి విజ్ఞానం, వైద్యం, గణితాన్ని ముందుకు తీసుకెళ్లింది.' },
    { n_en: 'Al-Andalus', n_te: 'అల్-అందలూస్', d: '711–1492', cap_en: 'Cordoba', cap_te: 'కార్డోబా', s_en: 'Islamic Spain was a centre of science, libraries, and coexistence that helped enlighten medieval Europe, until internal division ended it.', s_te: 'ముస్లిం స్పెయిన్ విజ్ఞానం, గ్రంథాలయాలు, సహజీవన కేంద్రం; మధ్యయుగ ఐరోపాను జ్ఞానోదయం చేసింది, అంతర్గత విభజన దాన్ని ముగించేవరకు.' },
    { n_en: 'Ottoman Empire', n_te: 'ఉస్మానీయ సామ్రాజ్యం', d: '1299–1924', cap_en: 'Istanbul', cap_te: 'ఇస్తాంబుల్', s_en: 'Spanning three continents for over six centuries and peaking with Mehmed II and Suleiman, it was the last caliphate, ending in 1924.', s_te: 'ఆరు శతాబ్దాలకు పైగా మూడు ఖండాలలో విస్తరించి, మెహ్మెద్ II, సులైమాన్‌తో శిఖరాగ్రం; చివరి ఖిలాఫత్, 1924లో ముగిసింది.' }
  ];

  var REGIONS = [
    { x: 168, y: 132, en: 'Arabia', te: 'అరేబియా', d_en: 'The birthplace of Islam (610+) and the heart of the Rashidun Caliphate.', d_te: 'ఇస్లాం జన్మస్థలం (610+), రాషిదూన్ ఖిలాఫత్ హృదయం.' },
    { x: 196, y: 120, en: 'Levant & Iraq', te: 'లెవంట్, ఇరాక్', d_en: 'Damascus (Umayyad) and Baghdad (Abbasid) — capitals of two great caliphates.', d_te: 'డమాస్కస్ (ఉమయ్యద్), బాగ్దాద్ (అబ్బాసీద్) — రెండు గొప్ప ఖిలాఫత్‌ల రాజధానులు.' },
    { x: 70, y: 138, en: 'North Africa & Spain', te: 'ఉత్తర ఆఫ్రికా, స్పెయిన్', d_en: 'Reached by 711; Al-Andalus and Cordoba became centres of learning.', d_te: '711 నాటికి చేరింది; అల్-అందలూస్, కార్డోబా అభ్యాస కేంద్రాలయ్యాయి.' },
    { x: 250, y: 128, en: 'Persia & India', te: 'పర్షియా, భారతదేశం', d_en: 'Reached east to the Indus; rich centres of science and culture.', d_te: 'తూర్పున సింధు వరకు చేరింది; విజ్ఞానం, సంస్కృతి సుసంపన్న కేంద్రాలు.' },
    { x: 150, y: 96, en: 'Anatolia & Balkans', te: 'అనటోలియా, బాల్కన్‌లు', d_en: 'Heart of the Ottoman Empire, centred on Istanbul.', d_te: 'ఉస్మానీయ సామ్రాజ్య హృదయం, ఇస్తాంబుల్ కేంద్రంగా.' }
  ];

  var SCHOLARS = [
    { n_en: 'Al-Khwarizmi', n_te: 'అల్-ఖ్వారిజ్మీ', f_en: 'Mathematics', f_te: 'గణితం', c_en: 'Father of algebra; the word algorithm comes from his name.', c_te: 'బీజగణిత పితామహుడు; algorithm అనే పదం ఆయన పేరు నుండి వచ్చింది.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>' },
    { n_en: 'Ibn Sina', n_te: 'ఇబ్న్ సీనా', f_en: 'Medicine', f_te: 'వైద్యం', c_en: 'The Canon of Medicine was a standard medical text for centuries.', c_te: 'ది కేనన్ ఆఫ్ మెడిసిన్ శతాబ్దాలపాటు ప్రామాణిక వైద్య గ్రంథం.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>' },
    { n_en: 'Ibn al-Haytham', n_te: 'ఇబ్న్ అల్-హైతమ్', f_en: 'Optics & Method', f_te: 'దృష్టిశాస్త్రం, పద్ధతి', c_en: 'A pioneer of the scientific method and the study of light.', c_te: 'శాస్త్రీయ పద్ధతి, కాంతి అధ్యయనానికి మార్గదర్శి.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6M8 11h6"/></svg>' },
    { n_en: 'Al-Biruni', n_te: 'అల్-బిరూనీ', f_en: 'Astronomy', f_te: 'ఖగోళశాస్త్రం', c_en: 'Measured the Earth and studied many sciences and cultures.', c_te: 'భూమిని కొలిచి, ఎన్నో శాస్త్రాలు, సంస్కృతులను అధ్యయనం చేశారు.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>' },
    { n_en: 'Jabir ibn Hayyan', n_te: 'జాబిర్ ఇబ్న్ హయ్యాన్', f_en: 'Chemistry', f_te: 'రసాయనశాస్త్రం', c_en: 'An early founder of experimental chemistry.', c_te: 'ప్రయోగాత్మక రసాయనశాస్త్ర తొలి స్థాపకుడు.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 3h6M9 3l-3 9h12l-3-9M6 12a6 6 0 0 0 12 0"/></svg>' },
    { n_en: 'Fatima al-Fihri', n_te: 'ఫాతిమా అల్-ఫిహ్రీ', f_en: 'Education', f_te: 'విద్య', c_en: 'Founded al-Qarawiyyin, one of the oldest universities in the world.', c_te: 'ప్రపంచంలో అత్యంత పురాతన విశ్వవిద్యాలయాల్లో ఒకటైన అల్-ఖరావియ్యీన్‌ను స్థాపించారు.', i: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>' }
  ];

  var ERAS = [
    { e_en: 'Rashidun', e_te: 'రాషిదూన్', span: '632–661', cap_en: 'Madinah', cap_te: 'మదీనా', k_en: 'Justice & the standard Quran', k_te: 'న్యాయం, ప్రామాణిక ఖురాన్' },
    { e_en: 'Umayyad', e_te: 'ఉమయ్యద్', span: '661–750', cap_en: 'Damascus', cap_te: 'డమాస్కస్', k_en: 'Vast expansion', k_te: 'విశాల విస్తరణ' },
    { e_en: 'Abbasid', e_te: 'అబ్బాసీద్', span: '750–1258', cap_en: 'Baghdad', cap_te: 'బాగ్దాద్', k_en: 'Golden Age of science', k_te: 'విజ్ఞాన స్వర్ణయుగం' },
    { e_en: 'Ottoman', e_te: 'ఉస్మానీయ', span: '1299–1924', cap_en: 'Istanbul', cap_te: 'ఇస్తాంబుల్', k_en: 'Last caliphate', k_te: 'చివరి ఖిలాఫత్' }
  ];

  var CSS = '.hv-sec{padding:var(--ifx-space-y,80px) var(--ifx-space-x,5vw);background:linear-gradient(180deg,rgba(13,59,30,.04),transparent)}'
    + '.hv-in{max-width:var(--ifx-container,1140px);margin-inline:auto}'
    + '.hv-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold,#c8922a);font-weight:700}'
    + '.hv-title{font-family:"Playfair Display",serif;font-size:clamp(26px,4vw,40px);color:var(--green-deep,#0d3b1e);margin:.2em 0 1em}'
    + '.hv-block{margin:34px 0}.hv-h{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--green-deep,#0d3b1e);font-size:18px;margin-bottom:4px}'
    + '.hv-sub{color:var(--text-muted,#7a6840);font-size:13px;margin:0 0 16px}'
    + '.hv-card{background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25));border-radius:var(--radius,16px);box-shadow:var(--ifx-shadow-md,0 6px 24px rgba(13,59,30,.1))}'
    /* timeline */
    + '.hv-tl{position:relative;padding-left:30px}.hv-tl::before{content:"";position:absolute;left:9px;top:4px;bottom:4px;width:3px;background:linear-gradient(#c8922a,#2e8b57)}'
    + '.hv-node{position:relative;margin-bottom:10px}.hv-node::before{content:"";position:absolute;left:-26px;top:14px;width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #c8922a}'
    + '.hv-nhead{display:flex;align-items:center;gap:10px;cursor:pointer;padding:11px 14px;border-radius:12px;background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25))}'
    + '.hv-nhead:hover{border-color:var(--gold,#c8922a)}.hv-ndate{font-size:11px;font-weight:700;color:#fff;background:#2e8b57;padding:3px 9px;border-radius:100px;white-space:nowrap}'
    + '.hv-ntitle{font-weight:700;color:var(--text-dark,#1a1208);flex:1;min-width:0;font-size:14px}.hv-cap{font-size:11px;color:var(--text-muted,#7a6840);white-space:nowrap}'
    + '.hv-chev{transition:transform .25s;color:var(--text-muted,#7a6840)}.hv-node.open .hv-chev{transform:rotate(90deg)}'
    + '.hv-ndet{max-height:0;overflow:hidden;transition:max-height .3s ease;padding:0 14px}.hv-node.open .hv-ndet{max-height:240px;padding:10px 14px 4px}'
    + '.hv-ndet p{margin:0 0 8px;color:var(--text-mid,#3d3018);font-size:13px;line-height:1.6}'
    /* map */
    + '.hv-maprow{display:grid;grid-template-columns:minmax(0,1.3fr) 1fr;gap:18px;align-items:start}'
    + '.hv-mapwrap{background:linear-gradient(160deg,#eef4ec,#dfead7);border-radius:16px;padding:8px;border:1px solid var(--border,rgba(200,146,42,.3))}'
    + '.hv-map{width:100%;height:auto;display:block}'
    + '.hv-region{cursor:pointer}.hv-region circle{transition:r .2s,fill .2s}.hv-region:hover circle,.hv-region.on circle{fill:#0d3b1e}'
    + '.hv-rlabel{font:600 9px "DM Sans",sans-serif;fill:#0d3b1e}'
    + '.hv-mapdetail{padding:18px}.hv-mapdetail h4{margin:0 0 6px;color:var(--green-deep,#0d3b1e);font-size:17px}.hv-mapdetail p{margin:0;color:var(--text-mid,#3d3018);font-size:14px;line-height:1.6}'
    /* scholars */
    + '.hv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}'
    + '.hv-sch{padding:16px}.hv-sch-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}.hv-sch-ic{font-size:26px}'
    + '.hv-sch h4{margin:0;font-size:16px;color:var(--green-deep,#0d3b1e)}.hv-sch-f{font-size:11px;font-weight:700;color:#8a5a12;background:rgba(200,146,42,.14);padding:2px 8px;border-radius:100px;display:inline-block}'
    + '.hv-sch p{margin:8px 0 0;font-size:13px;color:var(--text-mid,#3d3018);line-height:1.6}'
    /* era comparison table */
    + '.hv-tbl{width:100%;border-collapse:collapse;font-size:13px;overflow:hidden;border-radius:12px}'
    + '.hv-tbl th{background:var(--green-deep,#0d3b1e);color:var(--gold-light,#e8b84b);padding:10px 12px;text-align:left;font-size:12px}'
    + '.hv-tbl td{padding:10px 12px;border-top:1px solid var(--border,rgba(200,146,42,.2));color:var(--text-mid,#3d3018)}'
    + '.hv-tbl tr:nth-child(even) td,.hv-tbl tbody tr:nth-child(even){background:rgba(200,146,42,.05)}'
    + '.hv-tbl b{color:var(--green-deep,#0d3b1e)}'
    + '.hv-scroll{overflow-x:auto}'
    + '@media(max-width:680px){.hv-maprow{grid-template-columns:1fr}}';

  var root, sel = 0;

  function timelineHtml() {
    var t = te();
    var nodes = DYN.map(function (n, i) {
      return '<div class="hv-node" data-node="' + i + '"><div class="hv-nhead"><span class="hv-ndate">' + n.d + '</span>'
        + '<span class="hv-ntitle">' + (t ? n.n_te : n.n_en) + '</span><span class="hv-cap">' + (t ? n.cap_te : n.cap_en) + '</span>'
        + '<svg class="hv-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg></div>'
        + '<div class="hv-ndet"><p>' + (t ? n.s_te : n.s_en) + '</p></div></div>';
    }).join('');
    return '<div class="hv-block"><div class="hv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/></svg> ' + L('Dynasty Timeline', 'రాజవంశ కాలక్రమం') + '</div>'
      + '<p class="hv-sub">' + L('From the Rashidun to the Ottomans. Tap an era to expand it.', 'రాషిదూన్ నుండి ఉస్మానీయుల వరకు. విస్తరించడానికి ఒక యుగాన్ని తాకండి.') + '</p>'
      + '<div class="hv-tl">' + nodes + '</div></div>';
  }

  function mapHtml() {
    var t = te();
    var pts = REGIONS.map(function (r, i) {
      return '<g class="hv-region' + (i === sel ? ' on' : '') + '" data-region="' + i + '"><circle cx="' + r.x + '" cy="' + r.y + '" r="7" fill="#c8922a"></circle>'
        + '<text class="hv-rlabel" x="' + r.x + '" y="' + (r.y - 11) + '" text-anchor="middle">' + (t ? r.te : r.en) + '</text></g>';
    }).join('');
    var c = REGIONS[sel];
    return '<div class="hv-block"><div class="hv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg> ' + L('Map of Muslim Civilisations', 'ముస్లిం నాగరికతల పటం') + '</div>'
      + '<p class="hv-sub">' + L('A schematic of how far Islam spread. Tap a region to learn more.', 'ఇస్లాం ఎంత దూరం వ్యాపించిందో సూచనాత్మకంగా. మరింత తెలుసుకోవడానికి ఒక ప్రాంతాన్ని తాకండి.') + '</p>'
      + '<div class="hv-maprow"><div class="hv-mapwrap"><svg class="hv-map" viewBox="0 0 320 200" role="img" aria-label="Map of Muslim civilisations">'
      + '<path d="M30,150 Q90,90 168,110 Q240,90 300,140" fill="none" stroke="#c8922a" stroke-width="2" stroke-dasharray="5 5" opacity=".55"></path>'
      + pts + '</svg></div>'
      + '<div class="hv-card hv-mapdetail" id="hv-mapdetail"><h4>' + (t ? c.te : c.en) + '</h4><p>' + (t ? c.d_te : c.d_en) + '</p></div></div></div>';
  }

  function scholarsHtml() {
    var t = te();
    var cards = SCHOLARS.map(function (s) {
      return '<div class="hv-card hv-sch"><div class="hv-sch-top"><span class="hv-sch-ic">' + s.i + '</span><div><h4>' + (t ? s.n_te : s.n_en) + '</h4><span class="hv-sch-f">' + (t ? s.f_te : s.f_en) + '</span></div></div><p>' + (t ? s.c_te : s.c_en) + '</p></div>';
    }).join('');
    return '<div class="hv-block"><div class="hv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.4 6.1 6.6.4-5.1 4.2 1.7 6.4L12 17.4 6.4 21l1.7-6.4L3 10.4l6.6-.4z"/></svg> ' + L('Golden Age Scholars', 'స్వర్ణయుగ పండితులు') + '</div>'
      + '<p class="hv-sub">' + L('A few of the great Muslim scientists and thinkers.', 'కొందరు గొప్ప ముస్లిం శాస్త్రవేత్తలు, ఆలోచనాపరులు.') + '</p>'
      + '<div class="hv-grid">' + cards + '</div></div>';
  }

  function eraHtml() {
    var t = te();
    var rows = ERAS.map(function (e) {
      return '<tr><td><b>' + (t ? e.e_te : e.e_en) + '</b></td><td>' + e.span + '</td><td>' + (t ? e.cap_te : e.cap_en) + '</td><td>' + (t ? e.k_te : e.k_en) + '</td></tr>';
    }).join('');
    return '<div class="hv-block"><div class="hv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-7"/></svg> ' + L('Era Comparison', 'యుగాల పోలిక') + '</div>'
      + '<div class="hv-scroll"><table class="hv-tbl"><thead><tr><th>' + L('Era', 'యుగం') + '</th><th>' + L('Span', 'కాలం') + '</th><th>' + L('Capital', 'రాజధాని') + '</th><th>' + L('Known for', 'దేనికి ప్రసిద్ధి') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function render() {
    if (!root) return;
    root.innerHTML = '<div class="hv-in"><div class="hv-label">' + L('Visual Learning', 'దృశ్య అభ్యాసం') + '</div>'
      + '<h2 class="hv-title">' + L('History you can see', 'చూడగలిగే చరిత్ర') + '</h2>'
      + timelineHtml() + mapHtml() + scholarsHtml() + eraHtml() + '</div>';
    bind();
  }

  function bind() {
    root.querySelectorAll('.hv-node .hv-nhead').forEach(function (h) { h.addEventListener('click', function () { h.parentNode.classList.toggle('open'); }); });
    root.querySelectorAll('.hv-region').forEach(function (g) {
      g.addEventListener('click', function () {
        sel = +g.getAttribute('data-region');
        root.querySelectorAll('.hv-region').forEach(function (x) { x.classList.remove('on'); });
        g.classList.add('on');
        var c = REGIONS[sel], t = te(), d = root.querySelector('#hv-mapdetail');
        if (d) d.innerHTML = '<h4>' + (t ? c.te : c.en) + '</h4><p>' + (t ? c.d_te : c.d_en) + '</p>';
      });
    });
  }

  function inject() {
    if (document.getElementById('if-history-visuals')) return;
    if (!document.getElementById('hv-style')) { var st = document.createElement('style'); st.id = 'hv-style'; st.innerHTML = CSS; document.head.appendChild(st); }
    var sec = document.createElement('section'); sec.id = 'if-history-visuals'; sec.className = 'hv-sec'; sec.setAttribute('aria-label', 'Islamic History Visual Learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons.nextSibling);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else document.body.appendChild(sec); }
    root = sec; render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
