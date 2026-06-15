/* Islamic Front — Learn Salah lessons (world-class). Consumed by if-lesson.js.
   Bilingual (en/te). Loaded deferred BEFORE if-lesson.js so it populates window.IF_LESSONS.
   Broadly-agreed basics; some details differ between schools of law (madhahib). */
window.IF_LESSONS = {
  title_en: 'Learn Salah — Complete Lessons',
  title_te: 'నమాజ్ నేర్చుకోండి — పూర్తి పాఠాలు',
  lessons: [
  {
    id: 'why', title_en: 'Level 1 — Why We Pray', title_te: 'స్థాయి 1 — మనం ఎందుకు నమాజ్ చేస్తాం',
    intro: { en: 'Salah is the second pillar of Islam and the daily connection between a servant and Allah — five appointments with our Lord every day.', te: 'నమాజ్ ఇస్లాం రెండవ స్తంభం; బానిసకు, అల్లాహ్‌కు మధ్య రోజువారీ అనుబంధం — ప్రతిరోజూ మన ప్రభువుతో ఐదు భేటీలు.' },
    sections: [
      { check: { q_en: 'Salah is which pillar of Islam?', q_te: 'నమాజ్ ఇస్లాం ఏ స్తంభం?', opts: [{ en: 'The second', te: 'రెండవ' }, { en: 'The first', te: 'మొదటి' }, { en: 'The fifth', te: 'ఐదవ' }], ans: 0 }, h_en: 'The second pillar', h_te: 'రెండవ స్తంభం', ar: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا', b_en: 'After faith, prayer is the first practical pillar of Islam. It is also the first deed we will be asked about on the Day of Judgement.', b_te: 'విశ్వాసం తర్వాత నమాజ్ ఇస్లాం మొదటి ఆచరణాత్మక స్తంభం. ప్రళయదినాన మనం మొదట ప్రశ్నించబడే కర్మ కూడా ఇదే.' },
      { h_en: 'A direct connection', h_te: 'నేరుగా అనుబంధం', b_en: 'Five times a day the worshipper speaks directly with their Lord. Prayer brings peace to the heart and strength to the soul.', b_te: 'రోజుకు ఐదుసార్లు ఆరాధకుడు తన ప్రభువుతో నేరుగా మాట్లాడతాడు. నమాజ్ హృదయానికి శాంతి, ఆత్మకు బలం ఇస్తుంది.' },
      { h_en: 'It shapes the day', h_te: 'అది రోజును తీర్చిదిద్దుతుంది', b_en: 'Salah restrains from wrongdoing, structures the day around the remembrance of Allah, and builds real discipline.', b_te: 'నమాజ్ చెడు నుండి ఆపుతుంది, రోజును అల్లాహ్ స్మరణ చుట్టూ క్రమబద్ధం చేస్తుంది, నిజమైన క్రమశిక్షణను పెంచుతుంది.' }
    ],
    mindmap: { c_en: 'Why We Pray', c_te: 'ఎందుకు నమాజ్', branches: [{ en: 'Second pillar', te: 'రెండవ స్తంభం' }, { en: 'Connection with Allah', te: 'అల్లాహ్‌తో అనుబంధం' }, { en: 'Five times daily', te: 'రోజుకు ఐదుసార్లు' }, { en: 'Discipline', te: 'క్రమశిక్షణ' }, { en: 'Peace of heart', te: 'హృదయ శాంతి' }] },
    didyouknow: [
      { en: 'The first deed a servant will be questioned about on the Day of Judgement is the prayer.', te: 'ప్రళయదినాన బానిస మొదట ప్రశ్నించబడే కర్మ నమాజ్.' },
      { en: 'The Prophet ﷺ called prayer the coolness of his eyes.', te: 'ప్రవక్త ﷺ నమాజ్‌ను తన కంటి చల్లదనం అని పిలిచారు.' }
    ],
    takeaways: [
      { en: 'Salah is the believer daily lifeline to Allah.', te: 'నమాజ్ విశ్వాసికి అల్లాహ్‌తో రోజువారీ ప్రాణాధారం.' },
      { en: 'Consistency matters more than quantity.', te: 'పరిమాణం కంటే స్థిరత్వం ముఖ్యం.' }
    ],
    reflect: [{ en: 'How can I pray with more love, rather than as a routine?', te: 'యాంత్రికంగా కాక మరింత ప్రేమతో నేను ఎలా నమాజ్ చేయగలను?' }],
    quiz: [
      { q_en: 'Salah is which pillar of Islam?', q_te: 'నమాజ్ ఇస్లాం ఏ స్తంభం?', opts: [{ en: 'The first', te: 'మొదటి' }, { en: 'The second', te: 'రెండవ' }, { en: 'The fifth', te: 'ఐదవ' }], ans: 1 },
      { q_en: 'How many times a day do Muslims pray?', q_te: 'ముస్లింలు రోజుకు ఎన్నిసార్లు నమాజ్ చేస్తారు?', opts: [{ en: 'Three', te: 'మూడు' }, { en: 'Five', te: 'ఐదు' }, { en: 'Seven', te: 'ఏడు' }], ans: 1 }
    ],
    mistakes: [{ en: 'Treating prayer as a rushed habit rather than a meeting with Allah.', te: 'నమాజ్‌ను అల్లాహ్‌తో కలయికగా కాక హడావిడి అలవాటుగా భావించడం.' }, { en: 'Delaying prayer until its time almost ends without a valid reason.', te: 'సరైన కారణం లేకుండా సమయం దాదాపు ముగిసే వరకు నమాజ్‌ను వాయిదా వేయడం.' }],
    faqs: [{ q_en: 'Why pray five times a day?', q_te: 'రోజుకు ఐదుసార్లు ఎందుకు నమాజ్ చేయాలి?', a_en: 'The five prayers keep the heart connected to Allah throughout the day and are obligatory on every adult Muslim.', a_te: 'ఐదు నమాజులు రోజంతా హృదయాన్ని అల్లాహ్‌తో అనుసంధానంగా ఉంచుతాయి; ప్రతి వయోజన ముస్లింపై విధి.' }, { q_en: 'Does Allah need our prayer?', q_te: 'అల్లాహ్‌కు మన నమాజ్ అవసరమా?', a_en: 'No. Prayer benefits us with peace, gratitude and discipline; Allah is free of all need.', a_te: 'కాదు. నమాజ్ మనకే శాంతి, కృతజ్ఞత, క్రమశిక్షణ ఇస్తుంది; అల్లాహ్ అన్ని అవసరాల నుండి అతీతుడు.' }],
    revision: [{ en: 'Salah is the second pillar of Islam.', te: 'నమాజ్ ఇస్లాం రెండవ స్తంభం.' }, { en: 'There are five obligatory prayers each day, each a direct link to Allah.', te: 'రోజుకు ఐదు విధి నమాజులు, ఒక్కొక్కటి అల్లాహ్‌తో నేరుగా అనుబంధం.' }],
    summary: { en: 'Salah is the second pillar of Islam and a direct, five-times-daily connection with Allah that brings peace and discipline to the believer life.', te: 'నమాజ్ ఇస్లాం రెండవ స్తంభం; అల్లాహ్‌తో రోజుకు ఐదుసార్ల నేరుగా అనుబంధం — విశ్వాసి జీవితానికి శాంతి, క్రమశిక్షణను తెస్తుంది.' },
    apply: { en: 'Apply it: before one prayer today, pause for ten seconds and remember you are about to stand before Allah. Notice how that pause changes your focus.', te: 'ఆచరణ: నేడు ఒక నమాజ్‌కు ముందు పది క్షణాలు ఆగి, మీరు అల్లాహ్ ముందు నిలబడబోతున్నారని గుర్తుచేసుకోండి. ఆ విరామం మీ ఏకాగ్రతను ఎలా మారుస్తుందో గమనించండి.' },
    reading: [{ label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Quran 4:103', url: 'https://quran.com/4/103' }, { label: 'Sunnah.com', url: 'https://sunnah.com' }]
  },
  {
    id: 'wudu', title_en: 'Level 2 — Purity and Wudu', title_te: 'స్థాయి 2 — పరిశుద్ధత, వుదూ',
    intro: { en: 'Prayer requires purity. Wudu is the ablution that prepares the body and heart to stand before Allah.', te: 'నమాజ్‌కు పరిశుద్ధత అవసరం. అల్లాహ్ ముందు నిలబడటానికి శరీరాన్ని, హృదయాన్ని సిద్ధం చేసే ప్రక్షాళనే వుదూ.' },
    sections: [
      { check: { q_en: 'Wudu is done to be...?', q_te: 'వుదూ దేనికోసం చేస్తారు?', opts: [{ en: 'Pure for prayer', te: 'నమాజ్‌కు పరిశుద్ధత' }, { en: 'A full bath', te: 'పూర్తి స్నానం' }, { en: 'Dressed up', te: 'దుస్తులు' }], ans: 0 }, h_en: 'What is Wudu', h_te: 'వుదూ అంటే ఏమిటి', ar: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قُمْتُمْ إِلَى الصَّلَاةِ فَاغْسِلُوا وُجُوهَكُمْ', b_en: 'Wudu is the ablution a Muslim performs to be in a state of purity before prayer. Allah commands it in the Quran before standing for Salah.', b_te: 'వుదూ అంటే నమాజ్‌కు ముందు పరిశుద్ధ స్థితిలో ఉండటానికి ముస్లిం చేసే ప్రక్షాళన. నమాజ్‌కు నిలబడే ముందు దీన్ని అల్లాహ్ ఖురాన్‌లో ఆదేశించాడు.' },
      { h_en: 'The obligatory acts', h_te: 'విధి చర్యలు', b_en: 'Four are named in the Quran: wash the face, wash the arms up to the elbows, wipe over the head, and wash the feet up to the ankles.', b_te: 'ఖురాన్‌లో నాలుగు పేర్కొనబడ్డాయి: ముఖాన్ని కడగడం, మోచేతుల వరకు చేతులను కడగడం, తలను తుడవడం, మడమల వరకు పాదాలను కడగడం.' },
      { h_en: 'Step by step', h_te: 'దశలవారీగా', b_en: 'Make the intention; say Bismillah; wash the hands, rinse the mouth and nose; wash the face; wash the right then left arm to the elbow; wipe the head and ears; wash the right then left foot to the ankle.', b_te: 'సంకల్పం చేయండి; బిస్మిల్లాహ్ అనండి; చేతులను కడగండి, నోరు, ముక్కును శుభ్రం చేయండి; ముఖాన్ని కడగండి; కుడి తర్వాత ఎడమ చేతిని మోచేతి వరకు; తల, చెవులను తుడవండి; కుడి తర్వాత ఎడమ పాదాన్ని మడమ వరకు కడగండి.' }
    ],
    mindmap: { c_en: 'Wudu', c_te: 'వుదూ', branches: [{ en: 'Intention', te: 'సంకల్పం' }, { en: 'Face', te: 'ముఖం' }, { en: 'Arms to elbows', te: 'మోచేతుల వరకు చేతులు' }, { en: 'Wipe head', te: 'తల తుడవడం' }, { en: 'Feet to ankles', te: 'మడమల వరకు పాదాలు' }] },
    didyouknow: [
      { en: 'The Prophet ﷺ said that with each washing in wudu, small sins are wiped away.', te: 'వుదూలో ప్రతి కడగడంతో చిన్న పాపాలు తొలగిపోతాయని ప్రవక్త ﷺ చెప్పారు.' },
      { en: 'Things like using the toilet, passing wind, and deep sleep break the wudu.', te: 'మరుగుదొడ్డి వాడటం, గాలి విడుదల, గాఢ నిద్ర వంటివి వుదూను భంగపరుస్తాయి.' }
    ],
    takeaways: [
      { en: 'Purity of body supports focus and reverence in prayer.', te: 'శరీర పరిశుద్ధత నమాజ్‌లో ఏకాగ్రత, భక్తికి తోడ్పడుతుంది.' },
      { en: 'Make sure water reaches every part, and do not waste it.', te: 'ప్రతి భాగానికి నీరు చేరేలా చూసుకోండి, దాన్ని వృథా చేయకండి.' }
    ],
    reflect: [{ en: 'Do I perform wudu carefully, or rush through it?', te: 'నేను వుదూను శ్రద్ధగా చేస్తానా, లేక తొందరగా ముగిస్తానా?' }],
    quiz: [
      { q_en: 'How many obligatory acts of wudu are named in the Quran?', q_te: 'ఖురాన్‌లో వుదూ ఎన్ని విధి చర్యలు పేర్కొనబడ్డాయి?', opts: [{ en: 'Three', te: 'మూడు' }, { en: 'Four', te: 'నాలుగు' }, { en: 'Five', te: 'ఐదు' }], ans: 1 },
      { q_en: 'Which of these breaks wudu?', q_te: 'వీటిలో ఏది వుదూను భంగపరుస్తుంది?', opts: [{ en: 'Smiling', te: 'నవ్వడం' }, { en: 'Deep sleep', te: 'గాఢ నిద్ర' }, { en: 'Walking', te: 'నడవడం' }], ans: 1 }
    ],
    mistakes: [{ en: 'Leaving a dry spot on the feet or arms so the limb is not fully washed.', te: 'పాదాలు లేదా చేతులపై పొడి భాగం వదిలి, అవయవం పూర్తిగా కడగకపోవడం.' }, { en: 'Rushing without intention, or forgetting to wipe the head.', te: 'సంకల్పం లేకుండా తొందరపడటం, లేదా తల తుడవడం మరచిపోవడం.' }],
    faqs: [{ q_en: 'What breaks wudu?', q_te: 'వుదూ దేనివల్ల చెడుతుంది?', a_en: 'Using the toilet, passing wind, and deep sleep break wudu — ordinary touching of objects does not.', a_te: 'మరుగుదొడ్డి వాడటం, గాలి వదలడం, గాఢ నిద్ర వుదూను చెడగొడతాయి — సాధారణ వస్తువులను తాకడం కాదు.' }, { q_en: 'Can one wudu cover several prayers?', q_te: 'ఒక వుదూ అనేక నమాజులకు సరిపోతుందా?', a_en: 'Yes — one wudu is valid for as many prayers as you wish until it is broken.', a_te: 'అవును — వుదూ చెడే వరకు ఎన్ని నమాజులకైనా ఒకే వుదూ చెల్లుతుంది.' }],
    revision: [{ en: 'Order: face, arms to elbows, wipe head, feet to ankles.', te: 'క్రమం: ముఖం, మోచేతుల వరకు చేతులు, తల తుడవడం, చీలమండల వరకు పాదాలు.' }, { en: 'Begin with intention and Bismillah; water must reach the whole of each part.', te: 'సంకల్పం, బిస్మిల్లాహ్‌తో ప్రారంభించండి; ప్రతి భాగమంతటికీ నీరు చేరాలి.' }],
    summary: { en: 'Wudu is the ablution required before prayer: with intention and Bismillah, wash the face, arms, wipe the head, and wash the feet — keeping body and heart pure.', te: 'వుదూ నమాజ్‌కు ముందు అవసరమైన ప్రక్షాళన: సంకల్పం, బిస్మిల్లాహ్‌తో ముఖం, చేతులు కడిగి, తల తుడిచి, పాదాలు కడగడం — శరీరం, హృదయం పరిశుద్ధంగా ఉంచడం.' },
    apply: { en: 'Apply it: make wudu slowly once today, naming each step aloud as you do it — face, arms, head, feet — and end with the shahadah.', te: 'ఆచరణ: నేడు ఒకసారి వుదూను నెమ్మదిగా చేయండి, ప్రతి దశను చేస్తూ బిగ్గరగా పేరు చెప్పండి — ముఖం, చేతులు, తల, పాదాలు — చివర్లో షహాదా చెప్పండి.' },
    reading: [{ label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Quran 5:6', url: 'https://quran.com/5/6' }, { label: 'Sunnah.com', url: 'https://sunnah.com' }]
  },
  {
    id: 'ghusl', title_en: 'Level 3 — Ghusl (The Full Wash)', title_te: 'స్థాయి 3 — గుస్ల్ (పూర్తి స్నానం)',
    intro: { en: 'Ghusl is the complete ritual washing of the body that restores full purity after major impurity.', te: 'గుస్ల్ అంటే పెద్ద అపరిశుద్ధత తర్వాత పూర్తి పరిశుద్ధతను పునరుద్ధరించే శరీరమంతటి సంపూర్ణ ప్రక్షాళన.' },
    sections: [
      { check: { q_en: 'Ghusl is a...?', q_te: 'గుస్ల్ అంటే...?', opts: [{ en: 'Full-body purification', te: 'శరీరమంతటి పరిశుద్ధత' }, { en: 'Hand wash', te: 'చేతులు కడగడం' }, { en: 'Prayer', te: 'నమాజ్' }], ans: 0 }, h_en: 'What is Ghusl', h_te: 'గుస్ల్ అంటే ఏమిటి', b_en: 'Ghusl is the full ritual washing of the whole body to return to a state of purity after major impurity.', b_te: 'గుస్ల్ అంటే పెద్ద అపరిశుద్ధత తర్వాత పరిశుద్ధ స్థితికి తిరిగి రావడానికి శరీరమంతటినీ కడిగే పూర్తి స్నానం.' },
      { h_en: 'When it is required', h_te: 'ఎప్పుడు తప్పనిసరి', b_en: 'After marital relations or seminal discharge, and at the end of menstruation and postnatal bleeding. It is also recommended before Jumuah and the two Eids.', b_te: 'దాంపత్య సంబంధాలు లేదా వీర్యస్ఖలనం తర్వాత, రుతుస్రావం, ప్రసవానంతర రక్తస్రావం ముగిసిన తర్వాత. జుమా, రెండు ఈద్‌లకు ముందు కూడా సిఫారసు చేయబడింది.' },
      { h_en: 'Step by step', h_te: 'దశలవారీగా', b_en: 'Make the intention; wash the hands and private parts; perform a complete wudu; pour water over the head; then pour water over the whole body, rubbing the skin so no part is left dry.', b_te: 'సంకల్పం చేయండి; చేతులు, మర్మాంగాలను శుభ్రం చేయండి; పూర్తి వుదూ చేయండి; తలపై నీరు పోయండి; తర్వాత శరీరమంతటిపై నీరు పోసి, ఏ భాగం తడవకుండా ఉండకుండా చర్మాన్ని రుద్దండి.' }
    ],
    mindmap: { c_en: 'Ghusl', c_te: 'గుస్ల్', branches: [{ en: 'Intention', te: 'సంకల్పం' }, { en: 'Wudu first', te: 'ముందు వుదూ' }, { en: 'Whole body', te: 'శరీరమంతా' }, { en: 'Right then left', te: 'కుడి తర్వాత ఎడమ' }, { en: 'When required', te: 'ఎప్పుడు అవసరం' }] },
    didyouknow: [
      { en: 'Cleanliness is described as half of faith.', te: 'పరిశుభ్రత విశ్వాసంలో సగం అని వర్ణించబడింది.' },
      { en: 'A ghusl is recommended (mustahabb) before Friday prayer.', te: 'శుక్రవార నమాజ్‌కు ముందు గుస్ల్ సిఫారసు (ముస్తహబ్) చేయబడింది.' }
    ],
    takeaways: [
      { en: 'Ghusl restores full purity after major impurity.', te: 'పెద్ద అపరిశుద్ధత తర్వాత గుస్ల్ పూర్తి పరిశుద్ధతను పునరుద్ధరిస్తుంది.' },
      { en: 'Cleanliness is a valued part of faith.', te: 'పరిశుభ్రత విశ్వాసంలో విలువైన భాగం.' }
    ],
    reflect: [{ en: 'How does being clean help me feel ready to worship?', te: 'శుభ్రంగా ఉండటం ఆరాధనకు సిద్ధంగా ఉన్న భావనను ఎలా కలిగిస్తుంది?' }],
    quiz: [
      { q_en: 'Ghusl washes...?', q_te: 'గుస్ల్ దేన్ని కడుగుతుంది?', opts: [{ en: 'only the hands', te: 'చేతులను మాత్రమే' }, { en: 'the whole body', te: 'శరీరమంతటినీ' }, { en: 'only the face', te: 'ముఖాన్ని మాత్రమే' }], ans: 1 },
      { q_en: 'Ghusl is recommended before...?', q_te: 'గుస్ల్ దేనికి ముందు సిఫారసు చేయబడింది?', opts: [{ en: 'shopping', te: 'షాపింగ్' }, { en: 'Jumuah and the two Eids', te: 'జుమా, రెండు ఈద్‌లు' }, { en: 'sleeping', te: 'నిద్ర' }], ans: 1 }
    ],
    mistakes: [{ en: 'Missing the rinsing of the mouth and nose, or leaving the hair roots dry.', te: 'నోరు, ముక్కు శుభ్రం చేయడం వదిలేయడం, లేదా జుట్టు మొదళ్లను పొడిగా వదలడం.' }, { en: 'Thinking a quick splash is enough instead of water over the whole body.', te: 'శరీరమంతటిపై నీరు బదులు ఒక్క చిలకరింపు చాలనుకోవడం.' }],
    faqs: [{ q_en: 'When is ghusl required?', q_te: 'గుస్ల్ ఎప్పుడు అవసరం?', a_en: 'After major impurity such as marital relations, and for women after menstruation and post-natal bleeding.', a_te: 'దాంపత్య సంబంధాల వంటి పెద్ద అపరిశుద్ధత తర్వాత, స్త్రీలకు రుతుస్రావం, ప్రసవానంతర రక్తస్రావం తర్వాత.' }, { q_en: 'Is a separate wudu needed in ghusl?', q_te: 'గుస్ల్‌లో వేరే వుదూ అవసరమా?', a_en: 'A complete ghusl already includes the washing of wudu; many also perform wudu as part of it.', a_te: 'పూర్తి గుస్ల్‌లో వుదూ ప్రక్షాళన కూడా ఉంటుంది; చాలామంది దానిలో భాగంగా వుదూ చేస్తారు.' }],
    revision: [{ en: 'Ghusl is a full-body purification after major impurity.', te: 'గుస్ల్ పెద్ద అపరిశుద్ధత తర్వాత శరీరమంతటి పరిశుద్ధత.' }, { en: 'Start with intention, then ensure water reaches every part of the body.', te: 'సంకల్పంతో మొదలుపెట్టి, శరీరమంతటికీ నీరు చేరేలా చూడండి.' }],
    summary: { en: 'Ghusl is the full-body ritual wash that restores purity after major impurity, performed with intention, a complete wudu, and water reaching every part of the body.', te: 'గుస్ల్ పెద్ద అపరిశుద్ధత తర్వాత పరిశుద్ధతను పునరుద్ధరించే శరీరమంతటి ప్రక్షాళన; సంకల్పం, పూర్తి వుదూ, శరీరమంతటికీ నీరు చేరడంతో చేయబడుతుంది.' },
    apply: { en: 'Apply it: from memory, list the steps of ghusl in order — intention, wash the hands, wash private parts, a full wudu, then water over the whole body. Check any you missed.', te: 'ఆచరణ: జ్ఞాపకం నుండి గుస్ల్ దశలను క్రమంలో రాయండి — సంకల్పం, చేతులు కడగడం, మర్మాంగాలు కడగడం, పూర్తి వుదూ, తర్వాత శరీరమంతటిపై నీరు. వదిలేసినవి ఏవైనా ఉంటే సరిచూసుకోండి.' },
    reading: [{ label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Sunnah.com', url: 'https://sunnah.com' }, { label: 'Quran.com', url: 'https://quran.com' }]
  },
  {
    id: 'howtopray', title_en: 'Level 4 — How to Pray, Step by Step', title_te: 'స్థాయి 4 — నమాజ్ ఎలా చేయాలి, దశలవారీగా',
    intro: { en: 'Every prayer moves through the same beautiful positions, from the opening Takbir to the closing Salam. The Salah Simulator on this portal lets you walk through each one.', te: 'ప్రతి నమాజ్ తెరిచే తక్బీర్ నుండి ముగించే సలామ్ వరకు అదే అందమైన భంగిమల గుండా సాగుతుంది. ఈ పోర్టల్‌లోని నమాజ్ సిమ్యులేటర్ ప్రతిదాన్నీ అడుగడుగునా చూపుతుంది.' },
    sections: [
      { check: { q_en: 'What begins the prayer?', q_te: 'నమాజ్‌ను ఏది ప్రారంభిస్తుంది?', opts: [{ en: 'Takbir (Allahu Akbar)', te: 'తక్బీర్ (అల్లాహు అక్బర్)' }, { en: 'Salam', te: 'సలామ్' }, { en: 'Ruku', te: 'రుకూ' }], ans: 0 }, h_en: 'The positions', h_te: 'భంగిమలు', ar: 'اللَّهُ أَكْبَر', b_en: 'A unit of prayer flows through: Takbir, standing (Qiyam) with Al-Fatihah, bowing (Ruku), standing again, prostration (Sujood), sitting, a second Sujood, the Tashahhud, and the closing Salam.', b_te: 'నమాజ్ ఒక రకాత్ ఇలా సాగుతుంది: తక్బీర్, ఫాతిహాతో నిలబడటం (ఖియామ్), వంగడం (రుకూ), మళ్ళీ నిలబడటం, సాష్టాంగం (సజ్దా), కూర్చోవడం, రెండవ సజ్దా, తషహ్హుద్, ముగించే సలామ్.' },
      { h_en: 'What to say', h_te: 'ఏం చెప్పాలి', b_en: 'In ruku say Subhana Rabbiyal-Azim; in sujood say Subhana Rabbiyal-Ala. Al-Fatihah is recited standing in every unit.', b_te: 'రుకూలో సుబ్‌హాన రబ్బియల్-అజీమ్; సజ్దాలో సుబ్‌హాన రబ్బియల్-అలా అనండి. ప్రతి రకాత్‌లో నిలబడి ఫాతిహా పఠిస్తారు.' },
      { h_en: 'Stillness (Tumaninah)', h_te: 'స్థిరత్వం (తుమానీనా)', b_en: 'Pause and let the body settle in each position before moving to the next. Rushing breaks the calm and the validity of the prayer.', b_te: 'తదుపరి దానికి వెళ్లకముందు ప్రతి భంగిమలో శరీరం స్థిరపడనివ్వండి. తొందరపడటం ప్రశాంతతను, నమాజ్ చెల్లుబాటును దెబ్బతీస్తుంది.' }
    ],
    mindmap: { c_en: 'How to Pray', c_te: 'నమాజ్ ఎలా', branches: [{ en: 'Takbir', te: 'తక్బీర్' }, { en: 'Qiyam + Fatiha', te: 'ఖియామ్ + ఫాతిహా' }, { en: 'Ruku', te: 'రుకూ' }, { en: 'Sujood', te: 'సజ్దా' }, { en: 'Tashahhud', te: 'తషహ్హుద్' }, { en: 'Salam', te: 'సలామ్' }] },
    didyouknow: [
      { en: 'Sujood is the position in which a servant is closest to Allah; the Prophet ﷺ encouraged much dua in it.', te: 'సజ్దా బానిస అల్లాహ్‌కు అత్యంత దగ్గరగా ఉండే భంగిమ; అందులో ఎక్కువ దుఆ చేయమని ప్రవక్త ﷺ ప్రోత్సహించారు.' },
      { en: 'The prayer begins with Allahu Akbar and ends by turning the head with the Salam.', te: 'నమాజ్ అల్లాహు అక్బర్‌తో మొదలై, సలామ్‌తో తలను తిప్పడంతో ముగుస్తుంది.' }
    ],
    takeaways: [
      { en: 'Move calmly and let each position settle.', te: 'ప్రశాంతంగా కదలండి, ప్రతి భంగిమను స్థిరపడనివ్వండి.' },
      { en: 'Know the meaning of the short phrases you say.', te: 'మీరు చెప్పే చిన్న వాక్యాల అర్థాన్ని తెలుసుకోండి.' }
    ],
    reflect: [{ en: 'Am I present and unhurried in each position of my prayer?', te: 'నా నమాజ్‌లోని ప్రతి భంగిమలో నేను ఏకాగ్రతతో, తొందరలేకుండా ఉన్నానా?' }],
    quiz: [
      { q_en: 'How does the prayer begin?', q_te: 'నమాజ్ ఎలా మొదలవుతుంది?', opts: [{ en: 'With the Takbir (Allahu Akbar)', te: 'తక్బీర్‌తో (అల్లాహు అక్బర్)' }, { en: 'With sujood', te: 'సజ్దాతో' }, { en: 'With the Salam', te: 'సలామ్‌తో' }], ans: 0 },
      { q_en: 'Which position is closest to Allah?', q_te: 'ఏ భంగిమ అల్లాహ్‌కు అత్యంత దగ్గర?', opts: [{ en: 'Standing', te: 'నిలబడటం' }, { en: 'Sujood (prostration)', te: 'సజ్దా' }, { en: 'Sitting', te: 'కూర్చోవడం' }], ans: 1 }
    ],
    mistakes: [{ en: 'Moving to the next position before the body is still in ruku or sujood.', te: 'రుకూ లేదా సజ్దాలో శరీరం స్థిరపడకముందే తదుపరి భంగిమకు వెళ్లడం.' }, { en: 'Reciting too fast to understand, or rushing the prostration.', te: 'అర్థం కానంత వేగంగా పఠించడం, లేదా సాష్టాంగాన్ని తొందరపెట్టడం.' }],
    faqs: [{ q_en: 'What if I forget a step?', q_te: 'ఒక దశ మరచిపోతే?', a_en: 'Minor forgetfulness is corrected with the prostration of forgetfulness (sujood as-sahw) at the end of the prayer.', a_te: 'చిన్న మరపును నమాజ్ చివర మరపు సాష్టాంగం (సుజూద్ అస్-సహ్వ్)తో సరిచేస్తారు.' }, { q_en: 'Must I face the qiblah exactly?', q_te: 'ఖచ్చితంగా ఖిబ్లా వైపే ఉండాలా?', a_en: 'Face the direction of the Kaaba as best you can; a reasonable estimate is accepted when you are unsure.', a_te: 'మీకు చేతనైనంత కాబా దిశ వైపు తిరగండి; తెలియనప్పుడు సహేతుకమైన అంచనా అంగీకరించబడుతుంది.' }],
    revision: [{ en: 'Order: Takbir, Qiyam, Ruku, Sujood, Tashahhud, Salam.', te: 'క్రమం: తక్బీర్, ఖియామ్, రుకూ, సజ్దా, తషహ్హుద్, సలామ్.' }, { en: 'Stay calm and still in every position.', te: 'ప్రతి భంగిమలో ప్రశాంతంగా, స్థిరంగా ఉండండి.' }],
    summary: { en: 'A prayer flows from Takbir through Qiyam, Ruku, Sujood, Tashahhud and Salam, performed calmly with stillness in each position — try the Salah Simulator to practise.', te: 'నమాజ్ తక్బీర్ నుండి ఖియామ్, రుకూ, సజ్దా, తషహ్హుద్, సలామ్ వరకు సాగుతుంది; ప్రతి భంగిమలో స్థిరత్వంతో ప్రశాంతంగా చేయాలి — అభ్యాసానికి నమాజ్ సిమ్యులేటర్‌ను చూడండి.' },
    apply: { en: 'Apply it: open the Salah Simulator on this page and move through one full rakah slowly, pausing in each position before moving to the next.', te: 'ఆచరణ: ఈ పేజీలోని నమాజ్ సిమ్యులేటర్‌ను తెరిచి, ఒక పూర్తి రకాతును నెమ్మదిగా చేయండి; తదుపరి భంగిమకు వెళ్లే ముందు ప్రతి భంగిమలో ఆగండి.' },
    reading: [{ label: 'Salah Simulator (this portal)', url: '#simulator' }, { label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Sunnah.com', url: 'https://sunnah.com' }, { label: 'Quran.com', url: 'https://quran.com' }]
  },
  {
    id: 'fiveprayers', title_en: 'Level 5 — The Five Daily Prayers', title_te: 'స్థాయి 5 — ఐదు పూటల నమాజులు',
    intro: { en: 'Islam sets five prayers across the day and night, each at its own time, so the heart returns to Allah again and again.', te: 'ఇస్లాం పగలు, రాత్రి అంతటా ఐదు నమాజులను, ఒక్కొక్కటి దాని సమయంలో నిర్దేశిస్తుంది; తద్వారా హృదయం మళ్ళీ మళ్ళీ అల్లాహ్ వైపు మరలుతుంది.' },
    sections: [
      { check: { q_en: 'How many obligatory prayers are there daily?', q_te: 'రోజుకు ఎన్ని విధి నమాజులు?', opts: [{ en: 'Five', te: 'ఐదు' }, { en: 'Three', te: 'మూడు' }, { en: 'Seven', te: 'ఏడు' }], ans: 0 }, h_en: 'The five prayers', h_te: 'ఐదు నమాజులు', b_en: 'Fajr (dawn), Dhuhr (after midday), Asr (afternoon), Maghrib (just after sunset), and Isha (night).', b_te: 'ఫజ్ర్ (తెల్లవారుజాము), జుహ్ర్ (మధ్యాహ్నం తర్వాత), అస్ర్ (సాయంకాలం), మగ్రిబ్ (సూర్యాస్తమయం తర్వాత), ఇషా (రాత్రి).' },
      { h_en: '⏰ Their times', h_te: '⏰ వాటి సమయాలు', b_en: 'Each prayer has its own time window. It is best to pray early, at the start of its time.', b_te: 'ప్రతి నమాజ్‌కు దాని సొంత సమయ విండో ఉంది. దాని సమయం మొదట్లోనే త్వరగా చేయడం మేలు.' },
      { h_en: 'Obligatory units (Rakats)', h_te: 'విధి రకాతులు', b_en: 'The fard units are: Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, and Isha 4.', b_te: 'ఫర్జ్ రకాతులు: ఫజ్ర్ 2, జుహ్ర్ 4, అస్ర్ 4, మగ్రిబ్ 3, ఇషా 4.' }
    ],
    mindmap: { c_en: 'Five Daily Prayers', c_te: 'ఐదు పూటల నమాజులు', branches: [{ en: 'Fajr (2)', te: 'ఫజ్ర్ (2)' }, { en: 'Dhuhr (4)', te: 'జుహ్ర్ (4)' }, { en: 'Asr (4)', te: 'అస్ర్ (4)' }, { en: 'Maghrib (3)', te: 'మగ్రిబ్ (3)' }, { en: 'Isha (4)', te: 'ఇషా (4)' }] },
    didyouknow: [
      { en: 'Praying Isha and Fajr in congregation is described as a great reward, like standing much of the night in prayer.', te: 'ఇషా, ఫజ్ర్‌లను జమాఅత్‌లో చేయడం రాత్రి చాలాసేపు నమాజ్‌లో నిలబడటంతో సమానమైన గొప్ప ప్రతిఫలంగా వర్ణించబడింది.' },
      { en: 'The middle prayer (often understood as Asr) is given special emphasis in the Quran.', te: 'మధ్య నమాజ్ (తరచుగా అస్ర్‌గా అర్థం) ఖురాన్‌లో ప్రత్యేకంగా నొక్కిచెప్పబడింది.' }
    ],
    takeaways: [
      { en: 'Praying on time keeps the whole day connected to Allah.', te: 'సమయానికి నమాజ్ చేయడం రోజంతా అల్లాహ్‌తో అనుసంధానంగా ఉంచుతుంది.' },
      { en: 'Each prayer is a fresh chance to return and renew.', te: 'ప్రతి నమాజ్ మరలి, తాజాగా మారడానికి కొత్త అవకాశం.' }
    ],
    reflect: [{ en: 'Which prayer is hardest for me to keep on time, and how can I improve it?', te: 'ఏ నమాజ్‌ను సమయానికి చేయడం నాకు కష్టం, దాన్ని ఎలా మెరుగుపరచగలను?' }],
    quiz: [
      { q_en: 'How many obligatory (fard) rakats does Maghrib have?', q_te: 'మగ్రిబ్‌కు ఎన్ని విధి (ఫర్జ్) రకాతులు?', opts: [{ en: 'Two', te: 'రెండు' }, { en: 'Three', te: 'మూడు' }, { en: 'Four', te: 'నాలుగు' }], ans: 1 },
      { q_en: 'Which prayer is at dawn?', q_te: 'తెల్లవారుజామున ఏ నమాజ్?', opts: [{ en: 'Fajr', te: 'ఫజ్ర్' }, { en: 'Isha', te: 'ఇషా' }, { en: 'Asr', te: 'అస్ర్' }], ans: 0 }
    ],
    mistakes: [{ en: 'Mixing up the number of units (rakahs) for each prayer.', te: 'ప్రతి నమాజుకు రకాతుల సంఖ్యను తికమక చేయడం.' }, { en: 'Letting a prayer time close without praying or making it up.', te: 'నమాజ్ చేయకుండా లేదా దాన్ని తీర్చకుండా సమయం ముగియనివ్వడం.' }],
    faqs: [{ q_en: 'How many obligatory rakahs in each prayer?', q_te: 'ప్రతి నమాజులో ఎన్ని విధి రకాతులు?', a_en: 'Fajr 2, Dhuhr 4, Asr 4, Maghrib 3, and Isha 4 obligatory units.', a_te: 'ఫజ్ర్ 2, జుహ్ర్ 4, అస్ర్ 4, మగ్రిబ్ 3, ఇషా 4 విధి రకాతులు.' }, { q_en: 'What if I miss a prayer?', q_te: 'ఒక నమాజ్ తప్పిపోతే?', a_en: 'Pray it as soon as you remember; sincere repentance and making it up is the way back.', a_te: 'గుర్తొచ్చిన వెంటనే చేయండి; నిజాయితీగా పశ్చాత్తాపం, తీర్చడం తిరిగి వచ్చే మార్గం.' }],
    revision: [{ en: 'Five prayers: Fajr, Dhuhr, Asr, Maghrib, Isha.', te: 'ఐదు నమాజులు: ఫజ్ర్, జుహ్ర్, అస్ర్, మగ్రిబ్, ఇషా.' }, { en: 'Each has its own time window and number of rakahs.', te: 'ఒక్కొక్కదానికి దాని సమయ విండో, రకాతుల సంఖ్య ఉంటాయి.' }],
    summary: { en: 'The five daily prayers — Fajr, Dhuhr, Asr, Maghrib, and Isha — each have their own time and number of units, keeping the believer connected to Allah throughout the day.', te: 'ఐదు పూటల నమాజులు — ఫజ్ర్, జుహ్ర్, అస్ర్, మగ్రిబ్, ఇషా — ఒక్కొక్కటి దాని సమయం, రకాతుల సంఖ్యతో, విశ్వాసిని రోజంతా అల్లాహ్‌తో అనుసంధానంగా ఉంచుతాయి.' },
    apply: { en: 'Apply it: write the five prayer names in order with a rough time for each today, then set a reminder for the next prayer that is due.', te: 'ఆచరణ: నేడు ఐదు నమాజుల పేర్లను క్రమంలో, ఒక్కొక్కదానికి సుమారు సమయంతో రాయండి, తర్వాత రాబోయే నమాజ్‌కు ఒక రిమైండర్ పెట్టుకోండి.' },
    reading: [{ label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Quran 2:238', url: 'https://quran.com/2/238' }, { label: 'Sunnah.com', url: 'https://sunnah.com' }]
  },
  {
    id: 'khushu', title_en: 'Level 6 — Khushu: Praying with Presence', title_te: 'స్థాయి 6 — ఖుషూ: ఏకాగ్రతతో నమాజ్',
    intro: { en: 'Khushu is the heart and soul of prayer — heartfelt focus and humility that turns salah from a routine into a living conversation with Allah.', te: 'ఖుషూ నమాజ్ హృదయం, ఆత్మ — నమాజ్‌ను యాంత్రిక అలవాటు నుండి అల్లాహ్‌తో సజీవ సంభాషణగా మార్చే హృదయపూర్వక ఏకాగ్రత, వినయం.' },
    sections: [
      { check: { q_en: 'Khushu means...?', q_te: 'ఖుషూ అంటే...?', opts: [{ en: 'Focus and humility', te: 'ఏకాగ్రత, వినయం' }, { en: 'Speed', te: 'వేగం' }, { en: 'Loudness', te: 'గట్టిగా' }], ans: 0 }, h_en: 'What is Khushu', h_te: 'ఖుషూ అంటే ఏమిటి', b_en: 'Khushu is calmness, focus, and humility before Allah in prayer — the heart present, not just the body.', b_te: 'ఖుషూ అంటే నమాజ్‌లో అల్లాహ్ ముందు ప్రశాంతత, ఏకాగ్రత, వినయం — శరీరమే కాక హృదయం కూడా ఉండటం.' },
      { h_en: 'How to build it', h_te: 'దాన్ని ఎలా పెంచుకోవాలి', b_en: 'Understand the words you say, pray slowly, remove distractions like the phone, fix your gaze at the place of prostration, and remember you are standing before Allah.', b_te: 'మీరు చెప్పే మాటల అర్థం తెలుసుకోండి, నెమ్మదిగా చేయండి, ఫోన్ వంటి ఆటంకాలను తొలగించండి, చూపును సజ్దా స్థానంపై ఉంచండి, మీరు అల్లాహ్ ముందు నిలబడ్డారని గుర్తుంచుకోండి.' },
      { h_en: 'Consistency', h_te: 'స్థిరత్వం', b_en: 'A little prayer offered with presence is better than much prayer offered absent-mindedly. Build the habit gently and keep it.', b_te: 'యాంత్రికంగా చేసే ఎక్కువ నమాజ్ కంటే ఏకాగ్రతతో చేసే కొంచెం నమాజ్ మేలు. అలవాటును మెల్లగా పెంచుకొని నిలబెట్టుకోండి.' }
    ],
    mindmap: { c_en: 'Khushu', c_te: 'ఖుషూ', branches: [{ en: 'Focus', te: 'ఏకాగ్రత' }, { en: 'Understand the words', te: 'మాటల అర్థం' }, { en: 'Slow down', te: 'నెమ్మదిగా' }, { en: 'Remove distractions', te: 'ఆటంకాలు తొలగించండి' }, { en: 'Presence of heart', te: 'హృదయ సాన్నిధ్యం' }] },
    didyouknow: [
      { en: 'The Prophet ﷺ found rest and joy in prayer, calling it the coolness of his eyes.', te: 'ప్రవక్త ﷺ నమాజ్‌లో విశ్రాంతి, ఆనందం పొందారు; దాన్ని తన కంటి చల్లదనం అని పిలిచారు.' },
      { en: 'Understanding the meaning of what you recite greatly increases khushu.', te: 'మీరు పఠించే దాని అర్థం తెలుసుకోవడం ఖుషూను ఎంతో పెంచుతుంది.' }
    ],
    takeaways: [
      { en: 'Presence of heart is the real goal of prayer.', te: 'హృదయ సాన్నిధ్యమే నమాజ్ నిజమైన లక్ష్యం.' },
      { en: 'Quality with focus beats quantity without it.', te: 'ఏకాగ్రత లేని పరిమాణం కంటే ఏకాగ్రతతో కూడిన నాణ్యత మిన్న.' }
    ],
    reflect: [{ en: 'What is one distraction I can remove before I pray?', te: 'నమాజ్‌కు ముందు నేను తొలగించగల ఒక ఆటంకం ఏది?' }],
    quiz: [
      { q_en: 'Khushu in prayer means...?', q_te: 'నమాజ్‌లో ఖుషూ అంటే...?', opts: [{ en: 'praying quickly', te: 'వేగంగా నమాజ్' }, { en: 'focus and humility of the heart', te: 'హృదయ ఏకాగ్రత, వినయం' }, { en: 'praying loudly', te: 'బిగ్గరగా నమాజ్' }], ans: 1 },
      { q_en: 'What greatly increases khushu?', q_te: 'ఖుషూను ఎక్కువగా పెంచేది ఏది?', opts: [{ en: 'Understanding what you recite', te: 'పఠించేదాని అర్థం తెలుసుకోవడం' }, { en: 'Praying faster', te: 'వేగంగా చేయడం' }, { en: 'Praying less often', te: 'తక్కువసార్లు చేయడం' }], ans: 0 }
    ],
    mistakes: [{ en: 'Letting the mind wander to daily worries without gently returning focus.', te: 'మనసు రోజువారీ చింతల వైపు పోతున్నా మెల్లగా ఏకాగ్రతను తిరిగి తేకపోవడం.' }, { en: 'Praying with a phone or noise nearby that breaks concentration.', te: 'ఏకాగ్రతను భంగపరిచే ఫోన్ లేదా శబ్దం దగ్గరగా ఉండగా నమాజ్ చేయడం.' }],
    faqs: [{ q_en: 'How do I stop getting distracted?', q_te: 'ఏకాగ్రత చెదరకుండా ఎలా ఆపాలి?', a_en: 'Understand the words, slow down, remove distractions, and remember you are standing before Allah.', a_te: 'మాటల అర్థం తెలుసుకోండి, నెమ్మదించండి, ఆటంకాలు తొలగించండి, మీరు అల్లాహ్ ముందు నిలబడ్డారని గుర్తుంచుకోండి.' }, { q_en: 'Is my prayer valid if I lose focus?', q_te: 'ఏకాగ్రత కోల్పోతే నమాజ్ చెల్లుతుందా?', a_en: 'Yes, the prayer counts; but khushu increases its reward and benefit, so build it gradually.', a_te: 'అవును, నమాజ్ లెక్కించబడుతుంది; కానీ ఖుషూ దాని పుణ్యం, ప్రయోజనాన్ని పెంచుతుంది, కాబట్టి క్రమంగా పెంచుకోండి.' }],
    revision: [{ en: 'Khushu is focus and humility of the heart — the soul of prayer.', te: 'ఖుషూ హృదయ ఏకాగ్రత, వినయం — నమాజ్ ఆత్మ.' }, { en: 'Build it by understanding the words and removing distractions.', te: 'మాటల అర్థం తెలుసుకోవడం, ఆటంకాలు తొలగించడం ద్వారా దాన్ని పెంచుకోండి.' }],
    summary: { en: 'Khushu — focus and humility of the heart — is the soul of prayer. Build it by understanding the words, slowing down, removing distractions, and praying with presence.', te: 'ఖుషూ — హృదయ ఏకాగ్రత, వినయం — నమాజ్ ఆత్మ. మాటల అర్థం తెలుసుకోవడం, నెమ్మదించడం, ఆటంకాలు తొలగించడం, సాన్నిధ్యంతో నమాజ్ చేయడం ద్వారా దాన్ని పెంచుకోండి.' },
    apply: { en: 'Apply it: in your next prayer, remove your phone from the room first, choose one short surah, and think about the meaning of each line as you recite it.', te: 'ఆచరణ: తదుపరి నమాజ్‌లో ముందుగా మీ ఫోన్‌ను గది నుండి తీసివేసి, ఒక చిన్న సూరా ఎంచుకుని, దాన్ని పఠిస్తూ ప్రతి పంక్తి అర్థం గురించి ఆలోచించండి.' },
    reading: [{ label: 'SeekersGuidance', url: 'https://seekersguidance.org' }], refs: [{ label: 'Quran 23:1-2', url: 'https://quran.com/23' }, { label: 'Sunnah.com', url: 'https://sunnah.com' }]
  }
  ]
};
