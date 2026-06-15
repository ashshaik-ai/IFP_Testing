/* Islamic Front — sub-lesson interactivity data (consumed by if-sublesson.js).
   Keyed by "<folder>/<filename-without-ext>". Each entry: portal (matches
   if-<portal>-progress), pid (portal lesson id that lights up the dashboard),
   next (recommended next lesson), quiz (knowledge check), reflect. Bilingual. */
window.IF_SUBLESSON_DB = {
  /* ---------- Learn Arabic ---------- */
  'learn-arabic/alphabet': { portal: 'arabic', pid: 'alphabet',
    next: { href: 'harakat.html', en: 'Harakat and Vowels', te: 'హరకాత్, అచ్చులు' },
    quiz: [
      { q_en: 'How many letters are in the Arabic alphabet?', q_te: 'అరబిక్ వర్ణమాలలో ఎన్ని అక్షరాలు?', opts: [{ en: '28', te: '28' }, { en: '26', te: '26' }, { en: '39', te: '39' }], ans: 0 },
      { q_en: 'In which direction is Arabic written?', q_te: 'అరబిక్ ఏ దిశలో రాస్తారు?', opts: [{ en: 'Right to left', te: 'కుడి నుండి ఎడమకు' }, { en: 'Left to right', te: 'ఎడమ నుండి కుడికి' }, { en: 'Top to bottom', te: 'పై నుండి కిందకు' }], ans: 0 },
      { q_en: 'Each letter can change shape depending on its...?', q_te: 'ప్రతి అక్షరం దేన్ని బట్టి రూపం మారుతుంది?', opts: [{ en: 'Position in the word', te: 'పదంలో స్థానం' }, { en: 'Colour', te: 'రంగు' }, { en: 'Day of week', te: 'వారం రోజు' }], ans: 0 }
    ],
    reflect: [{ en: 'Which Arabic letters share the same shape and differ only by dots?', te: 'ఏ అరబిక్ అక్షరాలు ఒకే రూపం కలిగి కేవలం చుక్కలతో భిన్నంగా ఉంటాయి?' }],
    media: [{ type: 'pronunciation', en: 'Letter pronunciation audio', te: 'అక్షర ఉచ్చారణ ఆడియో' }] },
  'learn-arabic/harakat': { portal: 'arabic', pid: 'harakat',
    next: { href: 'vocabulary.html', en: 'Building Vocabulary', te: 'పదజాలం పెంచడం' },
    quiz: [
      { q_en: 'What do fatha, kasra and damma represent?', q_te: 'ఫత్‌హా, కస్రా, దమ్మా దేన్ని సూచిస్తాయి?', opts: [{ en: 'Short vowels', te: 'హ్రస్వ అచ్చులు' }, { en: 'Letters', te: 'అక్షరాలు' }, { en: 'Numbers', te: 'సంఖ్యలు' }], ans: 0 },
      { q_en: 'What does a sukun show?', q_te: 'సుకూన్ దేన్ని చూపుతుంది?', opts: [{ en: 'No vowel on the letter', te: 'అక్షరంపై అచ్చు లేదు' }, { en: 'A doubled vowel', te: 'రెట్టింపు అచ్చు' }, { en: 'A capital letter', te: 'పెద్ద అక్షరం' }], ans: 0 },
      { q_en: 'A shadda tells you to...?', q_te: 'షద్దా దేన్ని తెలుపుతుంది?', opts: [{ en: 'Double the letter', te: 'అక్షరాన్ని రెట్టింపు చేయి' }, { en: 'Skip the letter', te: 'అక్షరాన్ని వదిలెయ్యి' }, { en: 'Whisper it', te: 'గుసగుసలాడు' }], ans: 0 }
    ],
    reflect: [{ en: 'Can you tell fatha, kasra and damma apart by where the mark sits?', te: 'గుర్తు ఎక్కడ ఉందో బట్టి ఫత్‌హా, కస్రా, దమ్మాను గుర్తించగలరా?' }],
    media: [{ type: 'audio', en: 'Listen to the harakat', te: 'హరకాత్ వినండి' }] },
  'learn-arabic/vocabulary': { portal: 'arabic', pid: 'vocabulary',
    next: { href: 'grammar.html', en: 'Grammar Basics', te: 'వ్యాకరణ ప్రాథమికాలు' },
    quiz: [
      { q_en: 'Most Arabic words come from roots of how many letters?', q_te: 'చాలా అరబిక్ పదాలు ఎన్ని అక్షరాల మూలాల నుండి వస్తాయి?', opts: [{ en: 'Three', te: 'మూడు' }, { en: 'Five', te: 'ఐదు' }, { en: 'One', te: 'ఒకటి' }], ans: 0 },
      { q_en: 'Words from the same root usually share a...?', q_te: 'ఒకే మూలం నుండి వచ్చిన పదాలు సాధారణంగా దేన్ని పంచుకుంటాయి?', opts: [{ en: 'Core meaning', te: 'ప్రధాన అర్థం' }, { en: 'Colour', te: 'రంగు' }, { en: 'Length', te: 'పొడవు' }], ans: 0 },
      { q_en: 'The fastest way to learn words is to group them by...?', q_te: 'పదాలు నేర్చుకునే వేగవంతమైన మార్గం వాటిని దేని వారీగా సమూహపరచడం?', opts: [{ en: 'Root', te: 'మూలం' }, { en: 'Alphabet', te: 'వర్ణమాల' }, { en: 'Size', te: 'పరిమాణం' }], ans: 0 }
    ],
    reflect: [{ en: 'Which root can you learn today and grow into several words?', te: 'ఏ మూలాన్ని నేడు నేర్చుకుని అనేక పదాలుగా విస్తరించగలరు?' }] },
  'learn-arabic/grammar': { portal: 'arabic', pid: 'grammar',
    next: { href: 'quranic-arabic.html', en: 'Quranic Arabic', te: 'ఖురాన్ అరబిక్' },
    quiz: [
      { q_en: 'Arabic sorts every word into how many types?', q_te: 'అరబిక్ ప్రతి పదాన్ని ఎన్ని రకాలుగా విభజిస్తుంది?', opts: [{ en: 'Three', te: 'మూడు' }, { en: 'Two', te: 'రెండు' }, { en: 'Five', te: 'ఐదు' }], ans: 0 },
      { q_en: 'The three word types are noun, verb and...?', q_te: 'మూడు పద రకాలు నామవాచకం, క్రియ, ఇంకా...?', opts: [{ en: 'Particle', te: 'అవ్యయం' }, { en: 'Colour', te: 'రంగు' }, { en: 'Number', te: 'సంఖ్య' }], ans: 0 },
      { q_en: 'The Arabic dual form is used for exactly...?', q_te: 'అరబిక్ ద్వివచన రూపం సరిగ్గా దేనికి?', opts: [{ en: 'Two', te: 'రెండు' }, { en: 'Ten', te: 'పది' }, { en: 'One', te: 'ఒకటి' }], ans: 0 }
    ],
    reflect: [{ en: 'How is the Arabic dual different from simply saying two?', te: 'అరబిక్ ద్వివచనం కేవలం రెండు అని చెప్పడం కంటే ఎలా భిన్నం?' }] },
  'learn-arabic/quranic-arabic': { portal: 'arabic', pid: 'quranic',
    next: { href: 'daily-arabic.html', en: 'Everyday Arabic', te: 'రోజువారీ అరబిక్' },
    quiz: [
      { q_en: 'The classical Arabic of the Quran is called?', q_te: 'ఖురాన్ శాస్త్రీయ అరబిక్‌ను ఏమంటారు?', opts: [{ en: 'Fus-ha', te: 'ఫుస్‌హా' }, { en: 'A dialect', te: 'మాండలికం' }, { en: 'Slang', te: 'వాడుక భాష' }], ans: 0 },
      { q_en: 'Learning the most frequent words helps you...?', q_te: 'ఎక్కువగా వచ్చే పదాలు నేర్చుకోవడం దేనికి సహాయపడుతుంది?', opts: [{ en: 'Understand as you recite', te: 'పఠిస్తూ అర్థం చేసుకోవడం' }, { en: 'Write faster', te: 'వేగంగా రాయడం' }, { en: 'Count better', te: 'బాగా లెక్కించడం' }], ans: 0 },
      { q_en: 'Classical Arabic unites Arabic speakers because it is...?', q_te: 'శాస్త్రీయ అరబిక్ అరబిక్ మాట్లాడేవారిని కలుపుతుంది ఎందుకంటే అది...?', opts: [{ en: 'One shared standard', te: 'ఒక ఉమ్మడి ప్రమాణం' }, { en: 'A local slang', te: 'స్థానిక యాస' }, { en: 'Very new', te: 'చాలా కొత్తది' }], ans: 0 }
    ],
    reflect: [{ en: 'Which frequent Quran word will you learn the meaning of first?', te: 'తరచూ వచ్చే ఏ ఖురాన్ పదం అర్థాన్ని ముందుగా నేర్చుకుంటారు?' }] },
  'learn-arabic/daily-arabic': { portal: 'arabic', pid: 'daily',
    next: { href: 'index.html', en: 'Your dashboard', te: 'మీ డాష్‌బోర్డ్' },
    quiz: [
      { q_en: 'What does shukran mean?', q_te: 'శుక్రన్ అంటే ఏమిటి?', opts: [{ en: 'Thank you', te: 'ధన్యవాదాలు' }, { en: 'Hello', te: 'నమస్కారం' }, { en: 'Water', te: 'నీరు' }], ans: 0 },
      { q_en: 'As-salaamu alaykum is a...?', q_te: 'అస్-సలాము అలైకుమ్ అంటే...?', opts: [{ en: 'Greeting of peace', te: 'శాంతి పలకరింపు' }, { en: 'Number', te: 'సంఖ్య' }, { en: 'Colour', te: 'రంగు' }], ans: 0 },
      { q_en: 'What does maa mean?', q_te: 'మా అంటే ఏమిటి?', opts: [{ en: 'Water', te: 'నీరు' }, { en: 'Bread', te: 'రొట్టె' }, { en: 'Book', te: 'పుస్తకం' }], ans: 0 }
    ],
    reflect: [{ en: 'Which three Arabic words will you use every day?', te: 'ఏ మూడు అరబిక్ పదాలను మీరు ప్రతిరోజూ వాడతారు?' }] },

  /* ---------- Learn Urdu ---------- */
  'learn-urdu/alphabet': { portal: 'urdu', pid: 'alphabet',
    next: { href: 'reading-basics.html', en: 'Reading Basics', te: 'చదవడం ప్రాథమికాలు' },
    quiz: [
      { q_en: 'In which direction is Urdu written?', q_te: 'ఉర్దూ ఏ దిశలో రాస్తారు?', opts: [{ en: 'Right to left', te: 'కుడి నుండి ఎడమకు' }, { en: 'Left to right', te: 'ఎడమ నుండి కుడికి' }, { en: 'Top to bottom', te: 'పై నుండి కిందకు' }], ans: 0 },
      { q_en: 'About how many letters are in the Urdu alphabet?', q_te: 'ఉర్దూ వర్ణమాలలో సుమారు ఎన్ని అక్షరాలు?', opts: [{ en: '39', te: '39' }, { en: '26', te: '26' }, { en: '50', te: '50' }], ans: 0 },
      { q_en: 'Urdu adds extra letters for sounds found in...?', q_te: 'ఉర్దూ అదనపు అక్షరాలను దేనిలోని ధ్వనుల కోసం చేరుస్తుంది?', opts: [{ en: 'South Asian languages', te: 'దక్షిణాసియా భాషలు' }, { en: 'English only', te: 'ఇంగ్లీష్ మాత్రమే' }, { en: 'No languages', te: 'ఏ భాషలూ కాదు' }], ans: 0 }
    ],
    reflect: [{ en: 'Which Urdu letters look the same as Arabic, and which are new?', te: 'ఏ ఉర్దూ అక్షరాలు అరబిక్‌లా ఉంటాయి, ఏవి కొత్తవి?' }],
    media: [{ type: 'pronunciation', en: 'Letter pronunciation audio', te: 'అక్షర ఉచ్చారణ ఆడియో' }] },
  'learn-urdu/reading-basics': { portal: 'urdu', pid: 'reading',
    next: { href: 'writing-skills.html', en: 'Writing Skills', te: 'రాత నైపుణ్యాలు' },
    quiz: [
      { q_en: 'What do zabar, zer and pesh show?', q_te: 'జబర్, జేర్, పేష్ దేన్ని చూపుతాయి?', opts: [{ en: 'Short vowels', te: 'హ్రస్వ అచ్చులు' }, { en: 'Numbers', te: 'సంఖ్యలు' }, { en: 'Punctuation', te: 'విరామ చిహ్నాలు' }], ans: 0 },
      { q_en: 'In everyday Urdu the vowel marks are usually...?', q_te: 'రోజువారీ ఉర్దూలో అచ్చు గుర్తులు సాధారణంగా...?', opts: [{ en: 'Left out', te: 'వదిలేస్తారు' }, { en: 'Doubled', te: 'రెట్టింపు చేస్తారు' }, { en: 'Coloured', te: 'రంగు వేస్తారు' }], ans: 0 },
      { q_en: 'Reading means joining letters into...?', q_te: 'చదవడం అంటే అక్షరాలను దేనిగా కలపడం?', opts: [{ en: 'Words', te: 'పదాలు' }, { en: 'Numbers', te: 'సంఖ్యలు' }, { en: 'Pictures', te: 'చిత్రాలు' }], ans: 0 }
    ],
    reflect: [{ en: 'Can you read a simple word by joining its letters?', te: 'అక్షరాలను కలిపి ఒక సరళ పదాన్ని చదవగలరా?' }] },
  'learn-urdu/writing-skills': { portal: 'urdu', pid: 'writing',
    next: { href: 'daily-urdu.html', en: 'Everyday Urdu', te: 'రోజువారీ ఉర్దూ' },
    quiz: [
      { q_en: 'Which calligraphic style is typical for Urdu?', q_te: 'ఉర్దూకు సాధారణ కాలిగ్రఫీ శైలి ఏది?', opts: [{ en: 'Nastaliq', te: 'నస్తలీఖ్' }, { en: 'Naskh', te: 'నస్ఖ్' }, { en: 'Kufic', te: 'కూఫిక్' }], ans: 0 },
      { q_en: 'When writing, you add the dots and marks...?', q_te: 'రాసేటప్పుడు చుక్కలు, గుర్తులను ఎప్పుడు చేరుస్తారు?', opts: [{ en: 'Last', te: 'చివర్లో' }, { en: 'First', te: 'మొదట' }, { en: 'Never', te: 'ఎప్పుడూ కాదు' }], ans: 0 },
      { q_en: 'Nastaliq writing slopes gently from...?', q_te: 'నస్తలీఖ్ రాత దేని నుండి మెల్లగా వాలుతుంది?', opts: [{ en: 'Top right to bottom left', te: 'పై కుడి నుండి కింది ఎడమకు' }, { en: 'Bottom up', te: 'కింది నుండి పైకి' }, { en: 'It is flat', te: 'ఇది సమతలం' }], ans: 0 }
    ],
    reflect: [{ en: 'How is the Nastaliq slope different from straight Naskh writing?', te: 'నస్తలీఖ్ వాలు సరళ నస్ఖ్ రాత కంటే ఎలా భిన్నం?' }] },
  'learn-urdu/daily-urdu': { portal: 'urdu', pid: 'daily',
    next: { href: 'islamic-urdu.html', en: 'Islamic Urdu', te: 'ఇస్లామిక్ ఉర్దూ' },
    quiz: [
      { q_en: 'What does shukriya mean?', q_te: 'శుక్రియా అంటే ఏమిటి?', opts: [{ en: 'Thank you', te: 'ధన్యవాదాలు' }, { en: 'Hello', te: 'నమస్కారం' }, { en: 'Goodbye', te: 'వీడ్కోలు' }], ans: 0 },
      { q_en: 'Salaam is a...?', q_te: 'సలామ్ అంటే...?', opts: [{ en: 'Greeting', te: 'పలకరింపు' }, { en: 'Number', te: 'సంఖ్య' }, { en: 'Colour', te: 'రంగు' }], ans: 0 },
      { q_en: 'Spoken Urdu is widely understood across...?', q_te: 'మాట్లాడే ఉర్దూ ఎక్కడ విస్తృతంగా అర్థమవుతుంది?', opts: [{ en: 'South Asia', te: 'దక్షిణాసియా' }, { en: 'Antarctica', te: 'అంటార్కిటికా' }, { en: 'Nowhere', te: 'ఎక్కడా కాదు' }], ans: 0 }
    ],
    reflect: [{ en: 'Which three Urdu words will you use every day?', te: 'ఏ మూడు ఉర్దూ పదాలను మీరు ప్రతిరోజూ వాడతారు?' }] },
  'learn-urdu/islamic-urdu': { portal: 'urdu', pid: 'islamic',
    next: { href: 'advanced-reading.html', en: 'Advanced Reading', te: 'ఉన్నత స్థాయి చదవడం' },
    quiz: [
      { q_en: 'What does namaz mean?', q_te: 'నమాజ్ అంటే ఏమిటి?', opts: [{ en: 'Prayer', te: 'ప్రార్థన' }, { en: 'Fasting', te: 'ఉపవాసం' }, { en: 'Charity', te: 'దానం' }], ans: 0 },
      { q_en: 'Roza means...?', q_te: 'రోజా అంటే...?', opts: [{ en: 'Fasting', te: 'ఉపవాసం' }, { en: 'Prayer', te: 'ప్రార్థన' }, { en: 'Pilgrimage', te: 'తీర్థయాత్ర' }], ans: 0 },
      { q_en: 'Much Islamic scholarship in South Asia was written in...?', q_te: 'దక్షిణాసియాలో చాలా ఇస్లామిక్ పాండిత్యం దేనిలో రాయబడింది?', opts: [{ en: 'Urdu', te: 'ఉర్దూ' }, { en: 'French', te: 'ఫ్రెంచ్' }, { en: 'Latin', te: 'లాటిన్' }], ans: 0 }
    ],
    reflect: [{ en: 'Which Islamic Urdu words do you already know from daily life?', te: 'రోజువారీ జీవితం నుండి మీకు ఇప్పటికే తెలిసిన ఇస్లామిక్ ఉర్దూ పదాలు ఏవి?' }] },
  'learn-urdu/advanced-reading': { portal: 'urdu', pid: 'advanced',
    next: { href: 'index.html', en: 'Your dashboard', te: 'మీ డాష్‌బోర్డ్' },
    quiz: [
      { q_en: 'Ghazal and nazm are forms of...?', q_te: 'గజల్, నజ్మ్ దేని రూపాలు?', opts: [{ en: 'Poetry', te: 'కవిత్వం' }, { en: 'Cooking', te: 'వంట' }, { en: 'Sport', te: 'క్రీడ' }], ans: 0 },
      { q_en: 'Fluent readers guess the vowels from...?', q_te: 'సరళ పాఠకులు అచ్చులను దేని నుండి ఊహిస్తారు?', opts: [{ en: 'Context', te: 'సందర్భం' }, { en: 'Pictures', te: 'చిత్రాలు' }, { en: 'Numbers', te: 'సంఖ్యలు' }], ans: 0 },
      { q_en: 'A short story in Urdu is called an...?', q_te: 'ఉర్దూలో చిన్న కథను ఏమంటారు?', opts: [{ en: 'Afsana', te: 'అఫ్సానా' }, { en: 'Ghazal', te: 'గజల్' }, { en: 'Namaz', te: 'నమాజ్' }], ans: 0 }
    ],
    reflect: [{ en: 'Which Urdu poet or writer would you like to read?', te: 'మీరు ఏ ఉర్దూ కవి లేదా రచయితను చదవాలనుకుంటున్నారు?' }] }
};
