/* ===================================================================
   Islamic Front — Seerah Visual Learning (if-seerah-visuals.js)
   Replaces the generic "coming soon" media placeholders on the Seerah
   portal with fully designed, interactive, SVG/CSS educational visuals:
     1. Hijrah route map (animated path, selectable stops)
     2. Life of the Prophet timeline (expandable nodes, era bands)
     3. Makkah vs Madinah explorer (comparison cards)
     4. Family tree   5. Major battles   6. Character map
   Bilingual (te/en), mobile-first, reduced-motion safe. Runs only on the
   Seerah portal. Also moves the "All Islamic Learning Modules" section to
   the very end of the portal. No external assets.
   =================================================================== */
(function () {
  'use strict';
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  if ((parts[parts.length - 2] || '') !== 'seerah') return;

  function lang() { return (window.IFCore && IFCore.getLang) ? IFCore.getLang() : (document.documentElement.lang === 'en' ? 'en' : 'te'); }
  function te() { return lang() === 'te'; }
  function L(en, t) { return te() ? t : en; }

  var HIJRAH = [
    { cx: 176, cy: 332, en: 'Makkah', te: 'మక్కా', ev_en: 'The journey begins. The Prophet ﷺ leaves at night; Ali (RA) sleeps in his bed to mislead the watchers.', ev_te: 'ప్రయాణం మొదలవుతుంది. ప్రవక్త ﷺ రాత్రి బయలుదేరారు; కాపలాదారులను మోసగించడానికి అలీ (ర/అ) ఆయన పడకపై పడుకున్నారు.', le_en: 'Trust in Allah and careful planning go together.', le_te: 'అల్లాహ్‌పై నమ్మకం, జాగ్రత్త ప్రణాళిక కలిసి ఉంటాయి.' },
    { cx: 206, cy: 384, en: 'Cave of Thawr', te: 'సౌర్ గుహ', ev_en: 'He and Abu Bakr (RA) hide for three nights. A spider web and a dove at the entrance conceal them.', ev_te: 'ఆయన, అబూ బక్ర్ (ర/అ) మూడు రాత్రులు దాక్కున్నారు. ద్వారం వద్ద సాలెగూడు, పావురం వారిని కప్పి ఉంచాయి.', le_en: 'Do not grieve, indeed Allah is with us. (Quran 9:40)', le_te: 'దుఃఖించకు, నిశ్చయంగా అల్లాహ్ మనతో ఉన్నాడు. (ఖురాన్ 9:40)' },
    { cx: 150, cy: 120, en: 'Quba', te: 'ఖుబా', ev_en: 'On reaching the outskirts of Madinah, the first mosque in Islam is built at Quba.', ev_te: 'మదీనా శివార్లకు చేరగానే, ఇస్లాంలో మొదటి మసీదు ఖుబాలో నిర్మించబడింది.', le_en: 'The masjid is the heart of a Muslim community.', le_te: 'మసీదు ముస్లిం సమాజానికి హృదయం.' },
    { cx: 178, cy: 68, en: 'Madinah', te: 'మదీనా', ev_en: 'The people welcome him with joy. The first Islamic community and state begin.', ev_te: 'ప్రజలు ఆయనను సంతోషంగా స్వాగతించారు. మొదటి ఇస్లామిక్ సమాజం, రాజ్యం మొదలవుతాయి.', le_en: 'Hijrah turns hardship into a new beginning.', le_te: 'హిజ్రా కష్టాన్ని కొత్త ప్రారంభంగా మారుస్తుంది.' }
  ];

  var TIMELINE = [
    { d: '570 CE', en: 'Birth', te: 'జననం', s_en: 'Born in Makkah in the Year of the Elephant; his father Abdullah had already passed away.', s_te: 'ఏనుగు సంవత్సరంలో మక్కాలో జన్మించారు; ఆయన తండ్రి అబ్దుల్లాహ్ అప్పటికే మరణించారు.', le_en: 'Greatness can rise from humble beginnings.', le_te: 'గొప్పతనం సాధారణ ప్రారంభాల నుండి పుట్టవచ్చు.', era: 'm' },
    { d: '576-582', en: 'Childhood', te: 'బాల్యం', s_en: 'His mother Aminah passes; he is raised by his grandfather, then his uncle Abu Talib.', s_te: 'తల్లి ఆమినా మరణిస్తారు; తాత, తర్వాత మామ అబూ తాలిబ్ ఆయనను పెంచుతారు.', le_en: 'Allah cares for the orphan.', le_te: 'అల్లాహ్ అనాథను చూసుకుంటాడు.', era: 'm' },
    { d: '595', en: 'Marriage to Khadijah', te: 'ఖదీజాతో వివాహం', s_en: 'Marries Khadijah (RA), a noble merchant; a marriage of love and deep support.', s_te: 'గౌరవనీయ వ్యాపారవేత్త ఖదీజా (ర/అ)ను వివాహమాడారు; ప్రేమ, దృఢమైన మద్దతుతో కూడిన వివాహం.', le_en: 'A good spouse is a source of strength.', le_te: 'మంచి జీవిత భాగస్వామి బలానికి మూలం.', era: 'm' },
    { d: '610', en: 'First Revelation', te: 'మొదటి అవతరణ', s_en: 'In the Cave of Hira, the angel Jibril brings the first word: Read.', s_te: 'హిరా గుహలో, దూత జిబ్రీల్ మొదటి పదాన్ని తెస్తారు: చదువు.', le_en: 'Knowledge is the first command of Islam.', le_te: 'జ్ఞానం ఇస్లాం మొదటి ఆజ్ఞ.', era: 'm' },
    { d: '610-613', en: 'Early Dawah', te: 'తొలి దావహ్', s_en: 'The message spreads quietly among family and close friends.', s_te: 'సందేశం కుటుంబం, సన్నిహిత మిత్రుల మధ్య నిశ్శబ్దంగా వ్యాపిస్తుంది.', le_en: 'Sincere beginnings need patience and wisdom.', le_te: 'నిజాయితీ ప్రారంభాలకు ఓర్పు, వివేకం అవసరం.', era: 'm' },
    { d: '613-619', en: 'Persecution', te: 'హింస', s_en: 'The public call brings boycott and hardship; the Year of Sorrow takes Khadijah and Abu Talib.', s_te: 'బహిరంగ పిలుపు బహిష్కరణ, కష్టాలను తెస్తుంది; దుఃఖ సంవత్సరం ఖదీజా, అబూ తాలిబ్‌లను తీసుకుంటుంది.', le_en: 'Faith is tested, and patience is rewarded.', le_te: 'విశ్వాసం పరీక్షించబడుతుంది, ఓర్పుకు ప్రతిఫలం దక్కుతుంది.', era: 'm' },
    { d: '622', en: 'Hijrah', te: 'హిజ్రా', s_en: 'Migration to Madinah; the Islamic calendar begins from this year.', s_te: 'మదీనాకు వలస; ఇస్లామిక్ క్యాలెండర్ ఈ సంవత్సరం నుండి మొదలవుతుంది.', le_en: 'Sometimes growth needs a new place.', le_te: 'కొన్నిసార్లు ఎదుగుదలకు కొత్త చోటు అవసరం.', era: 'm' },
    { d: '622+', en: 'Madinah Period', te: 'మదీనా కాలం', s_en: 'A mosque, a brotherhood, and the Constitution of Madinah unite the city.', s_te: 'ఒక మసీదు, సోదరభావం, మదీనా రాజ్యాంగం నగరాన్ని ఏకం చేస్తాయి.', le_en: 'Community is built on justice and brotherhood.', le_te: 'సమాజం న్యాయం, సోదరభావంపై నిర్మించబడుతుంది.', era: 'd' },
    { d: '624-627', en: 'Major Battles', te: 'ప్రధాన యుద్ధాలు', s_en: 'Badr, Uhud, and Khandaq defend the young community.', s_te: 'బద్ర్, ఉహుద్, ఖందఖ్ యువ సమాజాన్ని రక్షిస్తాయి.', le_en: 'Stand firm, stay disciplined, rely on Allah.', le_te: 'స్థిరంగా ఉండండి, క్రమశిక్షణతో ఉండండి, అల్లాహ్‌పై ఆధారపడండి.', era: 'd' },
    { d: '628', en: 'Treaty of Hudaybiyyah', te: 'హుదైబియ్యా ఒప్పందం', s_en: 'A ten-year peace treaty; an apparent setback that opens great good.', s_te: 'పదేళ్ల శాంతి ఒప్పందం; గొప్ప మేలును తెరిచే ఒక బాహ్య ఎదురుదెబ్బ.', le_en: 'Patience and peace can win more than war.', le_te: 'ఓర్పు, శాంతి యుద్ధం కంటే ఎక్కువ గెలవగలవు.', era: 'd' },
    { d: '630', en: 'Conquest of Makkah', te: 'మక్కా విజయం', s_en: 'Makkah is entered peacefully; the Prophet ﷺ forgives his former enemies.', s_te: 'మక్కాలోకి శాంతియుతంగా ప్రవేశిస్తారు; ప్రవక్త ﷺ తన పూర్వ శత్రువులను క్షమిస్తారు.', le_en: 'Mercy in victory is true strength.', le_te: 'విజయంలో దయ నిజమైన బలం.', era: 'd' },
    { d: '632', en: 'Farewell Pilgrimage', te: 'వీడ్కోలు హజ్', s_en: 'The Farewell Sermon proclaims equality, human rights, and the completion of the religion.', s_te: 'వీడ్కోలు ప్రసంగం సమానత్వం, మానవ హక్కులు, ధర్మం పూర్తిని ప్రకటిస్తుంది.', le_en: 'All people are equal before Allah.', le_te: 'అల్లాహ్ ముందు అందరూ సమానమే.', era: 'd' },
    { d: '632', en: 'Passing of the Prophet ﷺ', te: 'ప్రవక్త ﷺ మరణం', s_en: 'He passes in Madinah, leaving the Quran and the Sunnah as lasting guidance.', s_te: 'ఆయన మదీనాలో మరణిస్తారు, ఖురాన్, సున్నతును శాశ్వత మార్గదర్శనంగా వదిలి.', le_en: 'His example continues to guide us.', le_te: 'ఆయన ఆదర్శం మనకు మార్గనిర్దేశం చేస్తూనే ఉంది.', era: 'd' }
  ];

  var GEO = {
    m: { en: 'Makkah', te: 'మక్కా', icon: '🏔️', list: [['Mountains and a dry valley', 'పర్వతాలు, ఎండిన లోయ'], ['The Kaaba, the first house of worship', 'కాబా, మొదటి ఆరాధనా గృహం'], ['A major trade centre', 'ప్రధాన వాణిజ్య కేంద్రం'], ['Where Islam began', 'ఇస్లాం మొదలైన చోటు'], ['The years of patience and persecution', 'ఓర్పు, హింస సంవత్సరాలు']] },
    d: { en: 'Madinah', te: 'మదీనా', icon: '🌴', list: [['A green oasis with date farms', 'ఖర్జూర తోటలతో పచ్చని ఒయాసిస్'], ['The first Islamic state', 'మొదటి ఇస్లామిక్ రాజ్యం'], ['Brotherhood of Muhajirun and Ansar', 'ముహాజిరూన్, అన్సార్ సోదరభావం'], ['Masjid an-Nabawi, the Prophet mosque', 'మస్జిద్ అన్-నబవీ, ప్రవక్త మసీదు'], ['The years of growth and expansion', 'ఎదుగుదల, విస్తరణ సంవత్సరాలు']] }
  };

  var BATTLES = [
    { n_en: 'Badr', n_te: 'బద్ర్', y: '2 AH / 624', c_en: 'Quraysh aggression against the Muslims', c_te: 'ముస్లింలపై ఖురైష్ దురాక్రమణ', o_en: 'A decisive victory: about 313 believers against over 1000', o_te: 'నిర్ణాయక విజయం: 1000 పైగా వారిపై సుమారు 313 విశ్వాసులు', l_en: 'Allah aids the patient, sincere few.', l_te: 'అల్లాహ్ ఓర్పైన, నిజాయితీగల కొద్దిమందికి సహాయం చేస్తాడు.' },
    { n_en: 'Uhud', n_te: 'ఉహుద్', y: '3 AH / 625', c_en: 'Quraysh sought revenge for Badr', c_te: 'బద్ర్‌కు ఖురైష్ ప్రతీకారం', o_en: 'A painful setback after some archers left their posts', o_te: 'కొందరు విలుకాండ్రు స్థానాలు వదలడంతో బాధాకర ఎదురుదెబ్బ', l_en: 'Discipline and obeying guidance matter.', l_te: 'క్రమశిక్షణ, మార్గదర్శనానికి కట్టుబడటం ముఖ్యం.' },
    { n_en: 'Khandaq (Trench)', n_te: 'ఖందఖ్ (కందకం)', y: '5 AH / 627', c_en: 'A large confederate army besieged Madinah', c_te: 'పెద్ద సమాఖ్య సైన్యం మదీనాను ముట్టడించింది', o_en: 'A defensive trench saved the city; the siege failed', o_te: 'రక్షణ కందకం నగరాన్ని కాపాడింది; ముట్టడి విఫలమైంది', l_en: 'Strategy, unity, and steadfastness.', l_te: 'వ్యూహం, ఐక్యత, స్థిరత్వం.' },
    { n_en: 'Hunayn', n_te: 'హునైన్', y: '8 AH / 630', c_en: 'Tribes gathered after the Conquest of Makkah', c_te: 'మక్కా విజయం తర్వాత తెగలు సమకూడాయి', o_en: 'Victory after an initial scattering', o_te: 'మొదట చెదిరిన తర్వాత విజయం', l_en: 'Never rely on numbers; rely on Allah.', l_te: 'సంఖ్యలపై ఆధారపడకండి; అల్లాహ్‌పై ఆధారపడండి.' }
  ];

  var TRAITS = [
    { t_en: 'Honesty', t_te: 'నిజాయితీ', e_en: 'Known as Al-Ameen, the trustworthy, even before Islam.', e_te: 'ఇస్లాంకు ముందే అల్-అమీన్ (నమ్మకస్థుడు) అని పేరు.' },
    { t_en: 'Mercy', t_te: 'దయ', e_en: 'Forgave the people of Makkah on the day of its conquest.', e_te: 'మక్కా విజయ దినాన దాని ప్రజలను క్షమించారు.' },
    { t_en: 'Patience', t_te: 'ఓర్పు', e_en: 'Endured the boycott and the rejection at Taif without revenge.', e_te: 'బహిష్కరణ, తాయిఫ్ తిరస్కారాన్ని ప్రతీకారం లేకుండా సహించారు.' },
    { t_en: 'Leadership', t_te: 'నాయకత్వం', e_en: 'United rival tribes through the Constitution of Madinah.', e_te: 'మదీనా రాజ్యాంగం ద్వారా ప్రత్యర్థి తెగలను ఏకం చేశారు.' },
    { t_en: 'Justice', t_te: 'న్యాయం', e_en: 'Applied the law equally to the noble and the weak.', e_te: 'గొప్పవారికీ, బలహీనులకూ చట్టాన్ని సమానంగా వర్తింపజేశారు.' },
    { t_en: 'Forgiveness', t_te: 'క్షమ', e_en: 'Pardoned former enemies, even those who had harmed his family.', e_te: 'తన కుటుంబాన్ని బాధించినవారిని సైతం, పూర్వ శత్రువులను క్షమించారు.' },
    { t_en: 'Courage', t_te: 'ధైర్యం', e_en: 'Stood firm at Hunayn when others scattered.', e_te: 'ఇతరులు చెదిరినప్పుడు హునైన్‌లో స్థిరంగా నిలిచారు.' }
  ];

  var CSS = '.sv-sec{padding:var(--ifx-space-y,80px) var(--ifx-space-x,5vw);background:linear-gradient(180deg,rgba(13,59,30,.04),transparent)}'
    + '.sv-in{max-width:var(--ifx-container,1140px);margin-inline:auto}'
    + '.sv-label{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold,#c8922a);font-weight:700}'
    + '.sv-title{font-family:"Playfair Display",serif;font-size:clamp(26px,4vw,40px);color:var(--green-deep,#0d3b1e);margin:.2em 0 1em}'
    + '.sv-block{margin:34px 0}'
    + '.sv-h{display:flex;align-items:center;gap:9px;font-weight:700;color:var(--green-deep,#0d3b1e);font-size:18px;margin-bottom:4px}'
    + '.sv-sub{color:var(--text-muted,#7a6840);font-size:13px;margin:0 0 16px}'
    + '.sv-card{background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25));border-radius:var(--radius,16px);box-shadow:var(--ifx-shadow-md,0 6px 24px rgba(13,59,30,.1))}'
    /* map */
    + '.sv-maprow{display:grid;grid-template-columns:minmax(0,260px) 1fr;gap:18px;align-items:start}'
    + '.sv-mapwrap{background:linear-gradient(160deg,#fbf6e9,#f1e6c8);border-radius:16px;padding:8px;border:1px solid var(--border,rgba(200,146,42,.3))}'
    + '.sv-map{width:100%;height:auto;display:block}'
    + '.sv-route{fill:none;stroke:#c8922a;stroke-width:3;stroke-linecap:round;stroke-dasharray:8 7}'
    + '.sv-route-draw{stroke-dasharray:900;stroke-dashoffset:900;animation:sv-draw 3.5s ease forwards}'
    + '@keyframes sv-draw{to{stroke-dashoffset:0}}'
    + '.sv-stop{cursor:pointer}.sv-stop circle{transition:r .2s,fill .2s}.sv-stop:hover circle,.sv-stop.on circle{fill:#0d3b1e}'
    + '.sv-stop.on circle.sv-ring{stroke:#c8922a;stroke-width:3;fill:none}'
    + '.sv-dot{fill:#1a5c30}'
    + '.sv-mlabel{font:600 11px "DM Sans",sans-serif;fill:#0d3b1e}'
    + '.sv-mapdetail{padding:18px}'
    + '.sv-mapdetail h4{margin:0 0 4px;color:var(--green-deep,#0d3b1e);font-size:17px}'
    + '.sv-mapdetail .sv-le{margin-top:10px;padding:9px 12px;border-left:3px solid #2e8b57;background:rgba(46,139,87,.07);border-radius:8px;font-size:13px;color:var(--text-mid,#3d3018)}'
    + '.sv-dist{display:inline-block;margin-top:12px;font-size:12px;font-weight:700;color:#8a5a12;background:rgba(200,146,42,.14);padding:4px 11px;border-radius:100px}'
    /* timeline */
    + '.sv-tl{position:relative;padding-left:30px}'
    + '.sv-tl::before{content:"";position:absolute;left:9px;top:4px;bottom:4px;width:3px;background:linear-gradient(#c8922a,#2e8b57)}'
    + '.sv-node{position:relative;margin-bottom:10px}'
    + '.sv-node::before{content:"";position:absolute;left:-26px;top:14px;width:14px;height:14px;border-radius:50%;background:#fff;border:3px solid #c8922a}'
    + '.sv-node.d::before{border-color:#2e8b57}'
    + '.sv-nhead{display:flex;align-items:center;gap:10px;cursor:pointer;padding:11px 14px;border-radius:12px;background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.25))}'
    + '.sv-nhead:hover{border-color:var(--gold,#c8922a)}'
    + '.sv-ndate{font-size:11px;font-weight:700;color:#fff;background:#c8922a;padding:3px 9px;border-radius:100px;white-space:nowrap}'
    + '.sv-node.d .sv-ndate{background:#2e8b57}'
    + '.sv-ntitle{font-weight:700;color:var(--text-dark,#1a1208);flex:1;min-width:0;font-size:14px}'
    + '.sv-chev{transition:transform .25s;color:var(--text-muted,#7a6840)}'
    + '.sv-node.open .sv-chev{transform:rotate(90deg)}'
    + '.sv-ndet{max-height:0;overflow:hidden;transition:max-height .3s ease;padding:0 14px}'
    + '.sv-node.open .sv-ndet{max-height:320px;padding:10px 14px 4px}'
    + '.sv-ndet p{margin:0 0 8px;color:var(--text-mid,#3d3018);font-size:13px;line-height:1.6}'
    + '.sv-ndet .sv-le{padding:8px 11px;border-left:3px solid #2e8b57;background:rgba(46,139,87,.07);border-radius:8px;font-size:12px;color:var(--text-mid,#3d3018)}'
    + '.sv-era{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:2px 8px;border-radius:100px;margin:6px 0}'
    + '.sv-era.m{color:#8a5a12;background:rgba(200,146,42,.14)}.sv-era.d{color:#1a5c30;background:rgba(46,139,87,.14)}'
    /* geo */
    + '.sv-geo{display:grid;grid-template-columns:1fr 1fr;gap:16px}'
    + '.sv-geo-card{padding:18px}'
    + '.sv-geo-card h4{margin:0 0 10px;font-size:20px;color:var(--green-deep,#0d3b1e);display:flex;align-items:center;gap:8px}'
    + '.sv-geo-card ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:7px;color:var(--text-mid,#3d3018);font-size:13px}'
    /* family */
    + '.sv-fam{display:flex;flex-direction:column;align-items:center;gap:0;padding:18px}'
    + '.sv-frow{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}'
    + '.sv-fbox{padding:8px 14px;border-radius:10px;background:var(--white,#fff);border:1px solid var(--border,rgba(200,146,42,.3));font-size:13px;font-weight:600;color:var(--text-dark,#1a1208);text-align:center}'
    + '.sv-fbox.p{background:#0d3b1e;color:var(--gold-light,#e8b84b);border-color:#0d3b1e}'
    + '.sv-fline{width:3px;height:20px;background:#c8922a}'
    /* battles */
    + '.sv-bat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}'
    + '.sv-bat-card{padding:16px}'
    + '.sv-bat-card h4{margin:0;font-size:17px;color:var(--green-deep,#0d3b1e)}'
    + '.sv-bat-y{font-size:11px;font-weight:700;color:#8a5a12;background:rgba(200,146,42,.14);padding:3px 9px;border-radius:100px;display:inline-block;margin:6px 0 10px}'
    + '.sv-bat-card dl{margin:0;font-size:12px}.sv-bat-card dt{font-weight:700;color:var(--text-muted,#7a6840);margin-top:7px}.sv-bat-card dd{margin:0;color:var(--text-mid,#3d3018)}'
    + '.sv-bat-card .sv-le{margin-top:9px;padding:7px 10px;border-left:3px solid #2e8b57;background:rgba(46,139,87,.07);border-radius:8px;font-size:12px;color:var(--text-mid,#3d3018)}'
    /* character */
    + '.sv-char{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:18px;align-items:center}'
    + '.sv-traits{display:flex;flex-wrap:wrap;gap:9px;justify-content:center}'
    + '.sv-trait{cursor:pointer;padding:9px 15px;border-radius:100px;border:1px solid var(--border,rgba(200,146,42,.35));background:var(--white,#fff);color:var(--green-deep,#0d3b1e);font-weight:600;font-size:13px;transition:all .2s}'
    + '.sv-trait:hover{border-color:var(--gold,#c8922a)}.sv-trait.on{background:#0d3b1e;color:var(--gold-light,#e8b84b);border-color:#0d3b1e}'
    + '.sv-chardet{padding:18px;min-height:90px}.sv-chardet b{color:var(--green-deep,#0d3b1e);display:block;margin-bottom:6px}.sv-chardet p{margin:0;color:var(--text-mid,#3d3018);font-size:14px;line-height:1.6}'
    + '@media(max-width:680px){.sv-maprow{grid-template-columns:1fr}.sv-char{grid-template-columns:1fr}.sv-geo{grid-template-columns:1fr}}'
    + '@media(prefers-reduced-motion:reduce){.sv-route-draw{animation:none;stroke-dashoffset:0}.sv-mover{display:none}}';

  var root, sel = { stop: 0, trait: 0 };

  function mapHtml() {
    var t = te();
    var stops = HIJRAH.map(function (p, i) {
      return '<g class="sv-stop' + (i === sel.stop ? ' on' : '') + '" data-stop="' + i + '">'
        + '<circle class="sv-ring" cx="' + p.cx + '" cy="' + p.cy + '" r="13"></circle>'
        + '<circle cx="' + p.cx + '" cy="' + p.cy + '" r="7" fill="#c8922a"></circle>'
        + '<text class="sv-mlabel" x="' + (p.cx + 16) + '" y="' + (p.cy + 4) + '">' + (t ? p.te : p.en) + '</text></g>';
    }).join('');
    var cur = HIJRAH[sel.stop];
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg> ' + L('Hijrah Route: Makkah to Madinah', 'హిజ్రా మార్గం: మక్కా నుండి మదీనా') + '</div>'
      + '<p class="sv-sub">' + L('Tap each stop to see what happened and the lesson it teaches.', 'జరిగినదాన్ని, అది నేర్పే పాఠాన్ని చూడటానికి ప్రతి మజిలీని తాకండి.') + '</p>'
      + '<div class="sv-maprow"><div class="sv-mapwrap"><svg class="sv-map" viewBox="0 0 320 440" role="img" aria-label="Hijrah route map">'
      + '<defs><path id="sv-hpath" class="sv-route" d="M176,332 L206,384 C70,300 270,150 150,120 L178,68"></path></defs>'
      + '<use href="#sv-hpath" class="sv-route"></use><use href="#sv-hpath" class="sv-route sv-route-draw"></use>'
      + '<circle class="sv-dot sv-mover" r="5"><animateMotion dur="6s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#sv-hpath"></mpath></animateMotion></circle>'
      + stops + '</svg></div>'
      + '<div class="sv-card sv-mapdetail" id="sv-mapdetail"><h4>' + (t ? cur.te : cur.en) + '</h4><p>' + (t ? cur.ev_te : cur.ev_en) + '</p><div class="sv-le"><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.6.6 1 1.3 1 2h6c0-.7.4-1.4 1-2a6 6 0 0 0-4-10z"/></svg>' + (t ? cur.le_te : cur.le_en) + '</div>'
      + '<span class="sv-dist">' + L('Total journey: about 450 km', 'మొత్తం ప్రయాణం: సుమారు 450 కి.మీ') + '</span></div></div></div>';
  }

  function timelineHtml() {
    var t = te();
    var nodes = TIMELINE.map(function (n, i) {
      return '<div class="sv-node ' + n.era + '" data-node="' + i + '">'
        + '<div class="sv-nhead"><span class="sv-ndate">' + n.d + '</span><span class="sv-ntitle">' + (t ? n.te : n.en) + '</span>'
        + '<svg class="sv-chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"></polyline></svg></div>'
        + '<div class="sv-ndet"><span class="sv-era ' + n.era + '">' + (n.era === 'm' ? L('Makkah era', 'మక్కా యుగం') : L('Madinah era', 'మదీనా యుగం')) + '</span>'
        + '<p>' + (t ? n.s_te : n.s_en) + '</p><div class="sv-le"><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.6.6 1 1.3 1 2h6c0-.7.4-1.4 1-2a6 6 0 0 0-4-10z"/></svg> ' + (t ? n.le_te : n.le_en) + '</div></div></div>';
    }).join('');
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4l2.5 2"/></svg> ' + L('Life of the Prophet ﷺ — Timeline', 'ప్రవక్త ﷺ జీవితం — కాలక్రమం') + '</div>'
      + '<p class="sv-sub">' + L('From birth to legacy. Tap any stage to expand its story and lesson.', 'జననం నుండి వారసత్వం వరకు. కథ, పాఠాన్ని విస్తరించడానికి ఏ దశనైనా తాకండి.') + '</p>'
      + '<div class="sv-tl">' + nodes + '</div></div>';
  }

  function geoHtml() {
    var t = te();
    function card(g) {
      return '<div class="sv-card sv-geo-card"><h4>' + g.icon + ' ' + (t ? g.te : g.en) + '</h4><ul>'
        + g.list.map(function (x) { return '<li>' + (t ? x[1] : x[0]) + '</li>'; }).join('') + '</ul></div>';
    }
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/></svg> ' + L('Makkah vs Madinah', 'మక్కా vs మదీనా') + '</div>'
      + '<p class="sv-sub">' + L('Two cities, two chapters of the Seerah.', 'రెండు నగరాలు, సీరహ్‌లో రెండు అధ్యాయాలు.') + '</p>'
      + '<div class="sv-geo">' + card(GEO.m) + card(GEO.d) + '</div></div>';
  }

  function familyHtml() {
    var t = te();
    var pr = t ? 'ప్రవక్త ముహమ్మద్ ﷺ' : 'Prophet Muhammad ﷺ';
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="M12 14.5V21"/></svg> ' + L('Family Tree', 'వంశ వృక్షం') + '</div>'
      + '<div class="sv-card sv-fam">'
      + '<div class="sv-frow"><span class="sv-fbox">' + L('Abdullah', 'అబ్దుల్లాహ్') + '</span><span class="sv-fbox">' + L('Aminah', 'ఆమినా') + '</span></div><div class="sv-fline"></div>'
      + '<div class="sv-frow"><span class="sv-fbox p">' + pr + '</span><span class="sv-fbox">' + L('Khadijah (RA)', 'ఖదీజా (ర/అ)') + '</span></div><div class="sv-fline"></div>'
      + '<div class="sv-frow"><span class="sv-fbox">' + L('Fatimah (RA)', 'ఫాతిమా (ర/అ)') + '</span><span class="sv-fbox">' + L('Ali (RA)', 'అలీ (ర/అ)') + '</span></div><div class="sv-fline"></div>'
      + '<div class="sv-frow"><span class="sv-fbox">' + L('Hasan (RA)', 'హసన్ (ర/అ)') + '</span><span class="sv-fbox">' + L('Husayn (RA)', 'హుసైన్ (ర/అ)') + '</span></div></div></div>';
  }

  function battlesHtml() {
    var t = te();
    var cards = BATTLES.map(function (b) {
      return '<div class="sv-card sv-bat-card"><h4>' + (t ? b.n_te : b.n_en) + '</h4><span class="sv-bat-y">' + b.y + '</span>'
        + '<dl><dt>' + L('Cause', 'కారణం') + '</dt><dd>' + (t ? b.c_te : b.c_en) + '</dd>'
        + '<dt>' + L('Outcome', 'ఫలితం') + '</dt><dd>' + (t ? b.o_te : b.o_en) + '</dd></dl>'
        + '<div class="sv-le"><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.6.6 1 1.3 1 2h6c0-.7.4-1.4 1-2a6 6 0 0 0-4-10z"/></svg> ' + (t ? b.l_te : b.l_en) + '</div></div>';
    }).join('');
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v5c0 4.3-3 7.5-7 9-4-1.5-7-4.7-7-9V6z"/></svg> ' + L('Major Battles', 'ప్రధాన యుద్ధాలు') + '</div>'
      + '<p class="sv-sub">' + L('Year, cause, outcome, and the lesson of each.', 'ఒక్కొక్కదాని సంవత్సరం, కారణం, ఫలితం, పాఠం.') + '</p>'
      + '<div class="sv-bat">' + cards + '</div></div>';
  }

  function charHtml() {
    var t = te();
    var chips = TRAITS.map(function (tr, i) { return '<button type="button" class="sv-trait' + (i === sel.trait ? ' on' : '') + '" data-trait="' + i + '">' + (t ? tr.t_te : tr.t_en) + '</button>'; }).join('');
    var cur = TRAITS[sel.trait];
    return '<div class="sv-block"><div class="sv-h"><svg class="ifx-hic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5l2.4 6.1 6.6.4-5.1 4.2 1.7 6.4L12 17.4 6.4 21l1.7-6.4L3 10.4l6.6-.4z"/></svg> ' + L('Character Map', 'స్వభావ పటం') + '</div>'
      + '<p class="sv-sub">' + L('Tap a trait to see it in the life of the Prophet ﷺ.', 'ప్రవక్త ﷺ జీవితంలో దాన్ని చూడటానికి ఒక లక్షణాన్ని తాకండి.') + '</p>'
      + '<div class="sv-char"><div class="sv-traits">' + chips + '</div>'
      + '<div class="sv-card sv-chardet" id="sv-chardet"><b>' + (t ? cur.t_te : cur.t_en) + '</b><p>' + (t ? cur.e_te : cur.e_en) + '</p></div></div></div>';
  }

  function render() {
    if (!root) return;
    root.innerHTML = '<div class="sv-in"><div class="sv-label">' + L('Visual Learning', 'దృశ్య అభ్యాసం') + '</div>'
      + '<h2 class="sv-title">' + L('The journey, visualised', 'ప్రయాణం దృశ్యరూపంలో') + '</h2>'
      + mapHtml() + timelineHtml() + geoHtml() + familyHtml() + battlesHtml() + charHtml() + '</div>';
    bind();
  }

  function bind() {
    root.querySelectorAll('.sv-stop').forEach(function (g) {
      g.addEventListener('click', function () {
        sel.stop = +g.getAttribute('data-stop');
        root.querySelectorAll('.sv-stop').forEach(function (x) { x.classList.remove('on'); });
        g.classList.add('on');
        var c = HIJRAH[sel.stop], t = te(), d = root.querySelector('#sv-mapdetail');
        if (d) d.innerHTML = '<h4>' + (t ? c.te : c.en) + '</h4><p>' + (t ? c.ev_te : c.ev_en) + '</p><div class="sv-le"><svg class="ifx-iic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c.6.6 1 1.3 1 2h6c0-.7.4-1.4 1-2a6 6 0 0 0-4-10z"/></svg>' + (t ? c.le_te : c.le_en) + '</div><span class="sv-dist">' + L('Total journey: about 450 km', 'మొత్తం ప్రయాణం: సుమారు 450 కి.మీ') + '</span>';
      });
    });
    root.querySelectorAll('.sv-node .sv-nhead').forEach(function (h) {
      h.addEventListener('click', function () { h.parentNode.classList.toggle('open'); });
    });
    root.querySelectorAll('.sv-trait').forEach(function (b) {
      b.addEventListener('click', function () {
        sel.trait = +b.getAttribute('data-trait');
        root.querySelectorAll('.sv-trait').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        var c = TRAITS[sel.trait], t = te(), d = root.querySelector('#sv-chardet');
        if (d) d.innerHTML = '<b>' + (t ? c.t_te : c.t_en) + '</b><p>' + (t ? c.e_te : c.e_en) + '</p>';
      });
    });
  }

  function inject() {
    if (document.getElementById('if-seerah-visuals')) return;
    if (!document.getElementById('sv-style')) { var st = document.createElement('style'); st.id = 'sv-style'; st.innerHTML = CSS; document.head.appendChild(st); }
    var sec = document.createElement('section'); sec.id = 'if-seerah-visuals'; sec.className = 'sv-sec'; sec.setAttribute('aria-label', 'Seerah Visual Learning');
    var lessons = document.getElementById('if-lessons');
    if (lessons && lessons.parentNode) lessons.parentNode.insertBefore(sec, lessons.nextSibling);
    else { var f = document.querySelector('footer.lu-footer'); if (f && f.parentNode) f.parentNode.insertBefore(sec, f); else document.body.appendChild(sec); }
    root = sec; render();
    // Move the "All Islamic Learning Modules" section to the very end (before footer)
    var coming = document.getElementById('coming'), footer = document.querySelector('footer.lu-footer');
    if (coming && footer && footer.parentNode && coming !== footer.previousElementSibling) footer.parentNode.insertBefore(coming, footer);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject); else inject();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
