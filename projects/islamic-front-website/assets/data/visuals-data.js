/* Islamic Front — Visual Learning placeholder sets (consumed by if-visuals.js).
   Keyed by portal folder. Each item becomes an if-media placeholder slot
   (premium now, real asset later via data-src). Addresses the portal-specific
   visual gaps: maps, timelines, process/flow diagrams, comparisons, infographics. */
window.IF_VISUALS_DB = {
  /* 'learn-quran' is handled by assets/js/if-quran-visuals.js (rich interactive components) */
  /* 'learn-salah' is handled by assets/js/if-salah-visuals.js (rich interactive components) */
  /* 'seerah' is handled by assets/js/if-seerah-visuals.js (rich interactive components, not placeholders) */
  /* 'islamic-history' is handled by assets/js/if-history-visuals.js (rich interactive components) */
  'kids-islam': {
    title_en: 'Look, play and learn', title_te: 'చూడండి, ఆడండి, నేర్చుకోండి',
    items: [
      { type: 'illustration', en: 'Prophet story storyboard', te: 'ప్రవక్త కథ చిత్రమాలిక' },
      { type: 'infographic', en: 'Good manners chart', te: 'మంచి నడవడిక చార్ట్' },
      { type: 'interactive', en: 'Match-the-pairs activity', te: 'జతలు కలిపే కృత్యం' }
    ]
  },
  'learn-arabic': {
    title_en: 'See the language', title_te: 'భాషను దృశ్యంగా చూడండి',
    items: [
      { type: 'illustration', en: 'Letterform tracing guide', te: 'అక్షర రూప గైడ్' },
      { type: 'infographic', en: 'Root-word family map', te: 'మూల-పద కుటుంబ పటం' },
      { type: 'pronunciation', en: 'Alphabet pronunciation audio', te: 'వర్ణమాల ఉచ్చారణ ఆడియో' }
    ]
  },
  'learn-urdu': {
    title_en: 'See the language', title_te: 'భాషను దృశ్యంగా చూడండి',
    items: [
      { type: 'illustration', en: 'Nastaliq writing guide', te: 'నస్తలీఖ్ రాత గైడ్' },
      { type: 'pronunciation', en: 'Alphabet pronunciation audio', te: 'వర్ణమాల ఉచ్చారణ ఆడియో' },
      { type: 'infographic', en: 'Urdu poetry forms', te: 'ఉర్దూ కవితా రూపాలు' }
    ]
  }
};
