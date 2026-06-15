/* ===================================================================
   Islamic Front — Learn Salah Visual Learning (if-salah-visuals.js)
   Rich interactive visuals (real SVG/CSS), runs only on the learn-salah
   portal. Complements the on-page Salah Simulator:
     1. Prayer flow (selectable postures, what to say)
     2. Wudu steps (numbered process)
     3. The five daily prayers (table)
     4. Common mistakes quick-reference (cards)
   Bilingual (te/en), mobile-first, reduced-motion safe.
   =================================================================== */
(function () {
  'use strict';
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  if ((parts[parts.length - 2] || '') !== 'learn-salah') return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function L(en, t) { return te() ? t : en; }

  var FLOW = [
    { n_en: 'Takbir', n_te: 'తక్బీర్', ar: 'الله أكبر', d_en: 'Raise the hands and say Allahu Akbar to begin the prayer.', d_te: 'చేతులు ఎత్తి, నమాజ్ ప్రారంభించడానికి అల్లాహు అక్బర్ అనండి.' },
    { n_en: 'Qiyam', n_te: 'ఖియామ్', ar: 'الفاتحة', d_en: 'Stand and recite Surah Al-Fatihah, then another short surah.', d_te: 'నిలబడి సూరా అల్-ఫాతిహా, తర్వాత మరో చిన్న సూరా పఠించండి.' },
    { n_en: 'Ruku', n_te: 'రుకూ', ar: 'سبحان ربي العظيم', d_en: 'Bow with a straight back, glorifying Allah, the Most Great.', d_te: 'వీపు నిటారుగా వంగి, మహోన్నతుడైన అల్లాహ్‌ను స్తుతించండి.' },
    { n_en: 'Sujood', n_te: 'సజ్దా', ar: 'سبحان ربي الأعلى', d_en: 'Prostrate with the forehead to the ground, glorifying Allah, the Most High.', d_te: 'నుదురు నేలకు ఆనించి సాష్టాంగం చేస్తూ, అత్యున్నతుడైన అల్లాహ్‌ను స్తుతించండి.' },
    { n_en: 'Tashahhud', n_te: 'తషహ్హుద్', ar: 'التحيات لله', d_en: 'Sit and recite the tashahhud, sending peace upon the Prophet ﷺ.', d_te: 'కూర్చుని తషహ్హుద్ పఠించి, ప్రవక్త ﷺపై శాంతి పంపండి.' },
    { n_en: 'Salam', n_te: 'సలామ్', ar: 'السلام عليكم', d_en: 'Turn the head right then left, saying As-salaamu alaykum, to end.', d_te: 'తల కుడి వైపు, తర్వాత ఎడమ వైపు తిప్పి, అస్-సలాము అలైకుమ్ అని ముగించండి.' }
  ];

  var WUDU = [
    { en: 'Intention (niyyah) and Bismillah', te: 'సంకల్పం (నియ్యత్), బిస్మిల్లాహ్' },
    { en: 'Wash the hands three times', te: 'చేతులు మూడుసార్లు కడగండి' },
    { en: 'Rinse the mouth three times', te: 'నోరు మూడుసార్లు పుక్కిలించండి' },
    { en: 'Rinse the nose three times', te: 'ముక్కు మూడుసార్లు శుభ్రం చేయండి' },
    { en: 'Wash the face three times', te: 'ముఖం మూడుసార్లు కడగండి' },
    { en: 'Wash the arms to the elbows', te: 'మోచేతుల వరకు చేతులు కడగండి' },
    { en: 'Wipe the head and ears', te: 'తల, చెవులు తుడవండి' },
    { en: 'Wash the feet to the ankles', te: 'చీలమండల వరకు పాదాలు కడగండి' }
  ];

  var PRAYERS = [
    { p_en: 'Fajr', p_te: 'ఫజ్ర్', t_en: 'Dawn', t_te: 'తెల్లవారు', r: '2' },
    { p_en: 'Dhuhr', p_te: 'జుహ్ర్', t_en: 'Midday', t_te: 'మధ్యాహ్నం', r: '4' },
    { p_en: 'Asr', p_te: 'అస్ర్', t_en: 'Afternoon', t_te: 'సాయంత్రం', r: '4' },
    { p_en: 'Maghrib', p_te: 'మగ్రిబ్', t_en: 'Sunset', t_te: 'సూర్యాస్తమయం', r: '3' },
    { p_en: 'Isha', p_te: 'ఇషా', t_en: 'Night', t_te: 'రాత్రి', r: '4' }
  ];

  var MISTAKES = [
    { m_en: 'Rushing without stillness', m_te: 'స్థిరత్వం లేకుండా తొందరపడటం', f_en: 'Pause and be still in each position.', f_te: 'ప్రతి భంగిమలో ఆగి స్థిరంగా ఉండండి.' },
    { m_en: 'A dry spot in wudu', m_te: 'వుదూలో పొడి భాగం', f_en: 'Make sure water reaches the whole of each part.', f_te: 'ప్రతి భాగమంతటికీ నీరు చేరేలా చూడండి.' },
    { m_en: 'Praying before the time', m_te: 'సమయానికి ముందు నమాజ్', f_en: 'Confirm the prayer time has entered.', f_te: 'నమాజ్ సమయం వచ్చిందని నిర్ధారించుకోండి.' },
    { m_en: 'Not facing the qiblah', m_te: 'ఖిబ్లా వైపు తిరగకపోవడం', f_en: 'Face the Kaaba as best you can.', f_te: 'మీకు చేతనైనంత కాబా వైపు తిరగండి.' }
  ];

  var CSS = '.pv-sec{padding:var(--ifx-space-y,80px) var(--ifx-space-x,5vw);background:linear-gradient(180deg,rgba(46,139,87,.05),transparent)}'
    + '.pv-in{max-width:var(--ifx-container,1140px);margin-inline:auto}'
    + '.pv-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold,#c8922a);font-weight:700}'
    + '.pv-title{font-family:"Playfair Display",serif;font-size:clamp(26px,4vw,40px);color:var(--green-deep,#0d3b1e);margin:.2em 0 1em}'
    + '.pv-block{margin:34px 0}.pv-h{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--green-deep,#0d3b1e);font-size:18px;margin-bottom:4px}'
    + '.pv-sub{color:var(--text-muted,#7a6840);font-size:13px;margin:0 0 16px}'
    + '.pv-card{background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25));border-radius:var(--radius,16px);box-shadow:var(--ifx-shadow-md,0 6px 24px rgba(13,59,30,.1))}'
    /* flow */
    + '.pv-flow{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:18px;align-items:start}'
    + '.pv-steps{display:flex;flex-direction:column;gap:8px}'
    + '.pv-step{display:flex;align-items:center;gap:12px;cursor:pointer;padding:11px 14px;border-radius:12px;border:1px solid var(--border,rgba(200,146,42,.3));background:var(--white,#fff);transition:all .2s}'
    + '.pv-step:hover{border-color:var(--gold,#c8922a)}.pv-step.on{background:#0d3b1e;border-color:#0d3b1e}'
    + '.pv-step.on .pv-step-n,.pv-step.on .pv-step-t{color:var(--gold-light,#e8b84b)}'
    + '.pv-step-n{width:26px;height:26px;flex:0 0 26px;border-radius:50%;background:#2e8b57;color:#fff;display:grid;place-items:center;font-size:13px;font-weight:700}'
    + '.pv-step-t{font-weight:700;color:var(--text-dark,#1a1208);font-size:14px}'
    + '.pv-det{padding:18px;min-height:120px}.pv-det h4{margin:0;color:var(--green-deep,#0d3b1e);font-size:18px}'
    + '.pv-ar{font-family:"Amiri",serif;direction:rtl;font-size:26px;color:var(--gold,#c8922a);margin:8px 0}'
    + '.pv-det p{margin:0;color:var(--text-mid,#3d3018);font-size:14px;line-height:1.6}'
    /* wudu numbered */
    + '.pv-wudu{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;counter-reset:wu}'
    + '.pv-wu{display:flex;align-items:center;gap:12px;padding:12px 14px;border:1px solid var(--border,rgba(200,146,42,.25));border-radius:12px;background:var(--white,#fff)}'
    + '.pv-wu-n{width:26px;height:26px;flex:0 0 26px;border-radius:50%;background:var(--green-deep,#0d3b1e);color:var(--gold-light,#e8b84b);display:grid;place-items:center;font-size:13px;font-weight:700}'
    + '.pv-wu span{font-size:13px;color:var(--text-mid,#3d3018)}'
    /* prayers table */
    + '.pv-scroll{overflow-x:auto}.pv-tbl{width:100%;border-collapse:collapse;font-size:13px;border-radius:12px;overflow:hidden}'
    + '.pv-tbl th{background:var(--green-deep,#0d3b1e);color:var(--gold-light,#e8b84b);padding:10px 12px;text-align:left;font-size:12px}'
    + '.pv-tbl td{padding:10px 12px;border-top:1px solid var(--border,rgba(200,146,42,.2));color:var(--text-mid,#3d3018)}.pv-tbl b{color:var(--green-deep,#0d3b1e)}'
    + '.pv-tbl tr:nth-child(even) td{background:rgba(200,146,42,.05)}'
    /* mistakes */
    + '.pv-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px}'
    + '.pv-mis{padding:14px 16px;border-left:3px solid #c0392b;background:rgba(192,57,43,.05);border:1px solid var(--border,rgba(200,146,42,.2));border-left:3px solid #c0392b;border-radius:10px}'
    + '.pv-mis b{color:#b03326;font-size:14px}.pv-mis .pv-fix{display:block;margin-top:6px;font-size:13px;color:var(--text-mid,#3d3018)}'
    + '@media(max-width:680px){.pv-flow{grid-template-columns:1fr}}';

  var root, sel = 0;

  function flowHtml() {
    var t = te();
    var steps = FLOW.map(function (s, i) {
      return '<div class="pv-step' + (i === sel ? ' on' : '') + '" data-step="' + i + '"><span class="pv-step-n">' + (i + 1) + '</span><span class="pv-step-t">' + (t ? s.n_te : s.n_en) + '</span></div>';
    }).join('');
    var c = FLOW[sel];
    return '<div class="pv-block"><div class="pv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20v-7a8 8 0 0 1 16 0v7"/><path d="M10 20v-4a2 2 0 0 1 4 0v4"/></svg> ' + L('The Prayer, Step by Step', 'నమాజ్, దశలవారీగా') + '</div>'
      + '<p class="pv-sub">' + L('Tap a position to see what to do and say. Try the Salah Simulator above to practise.', 'ఏం చేయాలో, చెప్పాలో చూడటానికి ఒక భంగిమను తాకండి. అభ్యాసానికి పైన నమాజ్ సిమ్యులేటర్‌ను చూడండి.') + '</p>'
      + '<div class="pv-flow"><div class="pv-steps">' + steps + '</div>'
      + '<div class="pv-card pv-det" id="pv-det"><h4>' + (t ? c.n_te : c.n_en) + '</h4><div class="pv-ar" lang="ar" dir="rtl">' + c.ar + '</div><p>' + (t ? c.d_te : c.d_en) + '</p></div></div></div>';
  }

  function wuduHtml() {
    var t = te();
    var items = WUDU.map(function (w, i) { return '<div class="pv-wu"><span class="pv-wu-n">' + (i + 1) + '</span><span>' + (t ? w.te : w.en) + '</span></div>'; }).join('');
    return '<div class="pv-block"><div class="pv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg> ' + L('Wudu, Step by Step', 'వుదూ, దశలవారీగా') + '</div>'
      + '<p class="pv-sub">' + L('The ablution before prayer, in order.', 'నమాజ్‌కు ముందు ప్రక్షాళన, క్రమంలో.') + '</p>'
      + '<div class="pv-wudu">' + items + '</div></div>';
  }

  function prayersHtml() {
    var t = te();
    var rows = PRAYERS.map(function (p) { return '<tr><td><b>' + (t ? p.p_te : p.p_en) + '</b></td><td>' + (t ? p.t_te : p.t_en) + '</td><td>' + p.r + '</td></tr>'; }).join('');
    return '<div class="pv-block"><div class="pv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/></svg> ' + L('The Five Daily Prayers', 'ఐదు పూటల నమాజులు') + '</div>'
      + '<div class="pv-scroll"><table class="pv-tbl"><thead><tr><th>' + L('Prayer', 'నమాజ్') + '</th><th>' + L('Time', 'సమయం') + '</th><th>' + L('Obligatory rakahs', 'విధి రకాతులు') + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>';
  }

  function mistakesHtml() {
    var t = te();
    var cards = MISTAKES.map(function (m) { return '<div class="pv-mis"><b><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4 2 20h20z"/><path d="M12 10v4M12 17h.01"/></svg> ' + (t ? m.m_te : m.m_en) + '</b><span class="pv-fix"><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"></path></svg>' + (t ? m.f_te : m.f_en) + '</span></div>'; }).join('');
    return '<div class="pv-block"><div class="pv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6.5" y="4" width="11" height="17" rx="2"/><path d="M9.5 4V3h5v1"/><path d="M9.5 10h5M9.5 13.5h3.5"/></svg> ' + L('Common Mistakes — Quick Fixes', 'సాధారణ తప్పులు — త్వరిత పరిష్కారాలు') + '</div>'
      + '<div class="pv-grid">' + cards + '</div></div>';
  }

  function render() {
    if (!root) return;
    root.innerHTML = '<div class="pv-in"><div class="pv-label">' + L('Visual Learning', 'దృశ్య అభ్యాసం') + '</div>'
      + '<h2 class="pv-title">' + L('The prayer at a glance', 'నమాజ్ ఒక్క చూపులో') + '</h2>'
      + flowHtml() + wuduHtml() + prayersHtml() + mistakesHtml() + '</div>';
    bind();
  }

  function bind() {
    root.querySelectorAll('.pv-step').forEach(function (b) {
      b.addEventListener('click', function () {
        sel = +b.getAttribute('data-step');
        root.querySelectorAll('.pv-step').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var c = FLOW[sel], t = te(), d = root.querySelector('#pv-det');
        if (d) d.innerHTML = '<h4>' + (t ? c.n_te : c.n_en) + '</h4><div class="pv-ar" lang="ar" dir="rtl">' + c.ar + '</div><p>' + (t ? c.d_te : c.d_en) + '</p>';
      });
    });
  }

  function inject() {
    if (document.getElementById('if-salah-visuals')) return;
    if (!document.getElementById('pv-style')) { var st = document.createElement('style'); st.id = 'pv-style'; st.innerHTML = CSS; document.head.appendChild(st); }
    var sec = document.createElement('section'); sec.id = 'if-salah-visuals'; sec.className = 'pv-sec'; sec.setAttribute('aria-label', 'Salah Visual Learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons.nextSibling);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else document.body.appendChild(sec); }
    root = sec; render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
