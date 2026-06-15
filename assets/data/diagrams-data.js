/* Islamic Front — Visual Guide diagrams (consumed by if-diagrams.js).
   Folder-keyed; sets window.IF_DIAGRAMS for the current portal. Inline SVG
   (no external assets), schematic educational aids. Bilingual captions. */
(function () {
  var DB = {
    'learn-arabic': {
      title_en: 'Visual Guide to Arabic', title_te: 'అరబిక్ దృశ్య మార్గదర్శిని',
      sub_en: 'Understand the shapes and patterns before you read.', sub_te: 'చదవడానికి ముందు రూపాలు, నమూనాలను అర్థం చేసుకోండి.',
      items: [
        { cap_en: 'One letter, four shapes by position', cap_te: 'ఒక అక్షరం, స్థానాన్ని బట్టి నాలుగు రూపాలు',
          svg: '<svg viewBox="0 0 240 92" role="img"><g font-family="Amiri,serif" font-size="24" fill="#0d3b1e" text-anchor="middle"><rect x="8" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="32" y="50">ع</text><rect x="68" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="92" y="50">عـ</text><rect x="128" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="152" y="50">ـعـ</text><rect x="188" y="18" width="44" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="210" y="50">ـع</text></g><g font-family="DM Sans,sans-serif" font-size="9" fill="#7a6840" text-anchor="middle"><text x="32" y="84">isolated</text><text x="92" y="84">initial</text><text x="152" y="84">medial</text><text x="210" y="84">final</text></g></svg>' },
        { cap_en: 'One root grows a family of words', cap_te: 'ఒక మూలం పదాల కుటుంబంగా పెరుగుతుంది',
          svg: '<svg viewBox="0 0 240 120" role="img" font-family="DM Sans,sans-serif"><rect x="88" y="6" width="64" height="30" rx="8" fill="#0d3b1e"/><text x="120" y="27" fill="#e8b84b" font-size="15" text-anchor="middle" font-family="Amiri,serif">ك ت ب</text><line x1="120" y1="36" x2="40" y2="68" stroke="#2e8b57"/><line x1="120" y1="36" x2="120" y2="68" stroke="#2e8b57"/><line x1="120" y1="36" x2="200" y2="68" stroke="#2e8b57"/><g font-size="13" text-anchor="middle" font-family="Amiri,serif" fill="#0d3b1e"><rect x="8" y="68" width="64" height="28" rx="8" fill="#faf6ee" stroke="#c8922a"/><text x="40" y="87">كَتَبَ</text><rect x="88" y="68" width="64" height="28" rx="8" fill="#faf6ee" stroke="#c8922a"/><text x="120" y="87">كِتاب</text><rect x="168" y="68" width="64" height="28" rx="8" fill="#faf6ee" stroke="#c8922a"/><text x="200" y="87">مَكْتَب</text></g><g font-size="8" fill="#7a6840" text-anchor="middle"><text x="40" y="110">wrote</text><text x="120" y="110">book</text><text x="200" y="110">office</text></g></svg>' },
        { cap_en: 'Harakat change how a letter sounds', cap_te: 'హరకాత్ అక్షర ధ్వనిని మారుస్తాయి',
          svg: '<svg viewBox="0 0 240 110" role="img" font-family="DM Sans,sans-serif"><g font-family="Amiri,serif" font-size="26" fill="#0d3b1e" text-anchor="middle"><text x="44" y="38">بَ</text><text x="44" y="72">بِ</text><text x="44" y="104">بُ</text></g><g font-size="13" fill="#7a6840"><text x="84" y="36">fatha makes "ba"</text><text x="84" y="70">kasra makes "bi"</text><text x="84" y="102">damma makes "bu"</text></g></svg>' }
      ]
    },
    'learn-urdu': {
      title_en: 'Visual Guide to Urdu', title_te: 'ఉర్దూ దృశ్య మార్గదర్శిని',
      sub_en: 'See how the script behaves before you read it.', sub_te: 'చదవడానికి ముందు లిపి ఎలా ప్రవర్తిస్తుందో చూడండి.',
      items: [
        { cap_en: 'Some letters join, some do not join forward', cap_te: 'కొన్ని అక్షరాలు కలుస్తాయి, కొన్ని ముందుకు కలవవు',
          svg: '<svg viewBox="0 0 240 92" role="img"><text x="62" y="48" font-family="Amiri,serif" font-size="30" fill="#0d3b1e" text-anchor="middle">بـبـب</text><text x="178" y="48" font-family="Amiri,serif" font-size="30" fill="#0d3b1e" text-anchor="middle">د ا و</text><g font-family="DM Sans,sans-serif" font-size="9" fill="#7a6840" text-anchor="middle"><text x="62" y="80">these join together</text><text x="178" y="80">these do not join forward</text></g></svg>' },
        { cap_en: 'One letter, four shapes by position', cap_te: 'ఒక అక్షరం, స్థానాన్ని బట్టి నాలుగు రూపాలు',
          svg: '<svg viewBox="0 0 240 92" role="img"><g font-family="Amiri,serif" font-size="24" fill="#0d3b1e" text-anchor="middle"><rect x="8" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="32" y="50">ب</text><rect x="68" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="92" y="50">بـ</text><rect x="128" y="18" width="48" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="152" y="50">ـبـ</text><rect x="188" y="18" width="44" height="48" rx="10" fill="#faf6ee" stroke="#c8922a"/><text x="210" y="50">ـب</text></g><g font-family="DM Sans,sans-serif" font-size="9" fill="#7a6840" text-anchor="middle"><text x="32" y="84">isolated</text><text x="92" y="84">initial</text><text x="152" y="84">medial</text><text x="210" y="84">final</text></g></svg>' },
        { cap_en: 'Nastaliq writing flows on a gentle slope', cap_te: 'నస్తలీఖ్ రాత మెల్లని వాలులో ప్రవహిస్తుంది',
          svg: '<svg viewBox="0 0 240 92" role="img"><line x1="22" y1="30" x2="220" y2="66" stroke="#c8922a" stroke-dasharray="5 4"/><text x="120" y="50" font-family="Noto Nastaliq Urdu,Amiri,serif" font-size="28" fill="#0d3b1e" text-anchor="middle">اردو</text><text x="120" y="84" font-family="DM Sans,sans-serif" font-size="9" fill="#7a6840" text-anchor="middle">top-right down to bottom-left</text></svg>' }
      ]
    },
    'kids-islam': {
      title_en: 'See and Learn', title_te: 'చూడండి, నేర్చుకోండి',
      sub_en: 'Big ideas as simple pictures.', sub_te: 'పెద్ద విషయాలు సరళ చిత్రాలుగా.',
      items: [
        { cap_en: 'The Five Pillars hold up our faith', cap_te: 'ఐదు స్తంభాలు మన విశ్వాసాన్ని నిలబెడతాయి',
          svg: '<svg viewBox="0 0 240 120" role="img"><rect x="18" y="18" width="204" height="14" rx="5" fill="#2e8b57"/><rect x="28" y="40" width="26" height="60" rx="5" fill="#3b82f6"/><rect x="72" y="40" width="26" height="60" rx="5" fill="#f59e0b"/><rect x="116" y="40" width="26" height="60" rx="5" fill="#a855f7"/><rect x="160" y="40" width="26" height="60" rx="5" fill="#ec4899"/><rect x="196" y="40" width="26" height="60" rx="5" fill="#14b8a6"/><rect x="18" y="100" width="204" height="12" rx="5" fill="#0d3b1e"/></svg>' },
        { cap_en: 'Wudu, step by step', cap_te: 'వుదూ, దశలవారీగా',
          svg: '<svg viewBox="0 0 240 72" role="img" font-family="DM Sans,sans-serif"><g text-anchor="middle"><circle cx="30" cy="28" r="15" fill="#2e8b57"/><text x="30" y="33" fill="#fff" font-size="13">1</text><circle cx="78" cy="28" r="15" fill="#2e8b57"/><text x="78" y="33" fill="#fff" font-size="13">2</text><circle cx="126" cy="28" r="15" fill="#2e8b57"/><text x="126" y="33" fill="#fff" font-size="13">3</text><circle cx="174" cy="28" r="15" fill="#2e8b57"/><text x="174" y="33" fill="#fff" font-size="13">4</text><circle cx="216" cy="28" r="15" fill="#2e8b57"/><text x="216" y="33" fill="#fff" font-size="13">5</text></g><g stroke="#c8922a"><line x1="45" y1="28" x2="63" y2="28"/><line x1="93" y1="28" x2="111" y2="28"/><line x1="141" y1="28" x2="159" y2="28"/><line x1="189" y1="28" x2="201" y2="28"/></g><text x="120" y="62" text-anchor="middle" font-size="9" fill="#7a6840">simple steps, always in order</text></svg>' },
        { cap_en: 'Good manners grow like a tree', cap_te: 'మంచి నడవడిక చెట్టులా పెరుగుతుంది',
          svg: '<svg viewBox="0 0 240 120" role="img" font-family="DM Sans,sans-serif"><rect x="112" y="74" width="16" height="40" rx="3" fill="#8a5a12"/><circle cx="120" cy="52" r="40" fill="#2e8b57"/><g fill="#fff" text-anchor="middle" font-size="11"><text x="120" y="40">Kindness</text><text x="120" y="56">Honesty</text><text x="120" y="72">Respect</text></g></svg>' }
      ]
    }
  };
  var parts = location.pathname.replace(/\/+$/, '').split('/');
  var folder = parts[parts.length - 2] || '';
  if (DB[folder]) window.IF_DIAGRAMS = DB[folder];
})();
