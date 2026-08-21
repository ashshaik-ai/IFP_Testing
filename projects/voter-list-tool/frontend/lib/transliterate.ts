const INDEPENDENT: Record<string, string> = {
  "అ": "a",
  "ఆ": "aa",
  "ఇ": "i",
  "ఈ": "ee",
  "ఉ": "u",
  "ఊ": "oo",
  "ఋ": "ru",
  "ఎ": "e",
  "ఏ": "e",
  "ఐ": "ai",
  "ఒ": "o",
  "ఓ": "o",
  "ఔ": "au",
};

const CONSONANTS: Record<string, string> = {
  "క్ష": "ksh",
  "క": "k",
  "ఖ": "kh",
  "గ": "g",
  "ఘ": "gh",
  "ఙ": "ng",
  "చ": "ch",
  "ఛ": "chh",
  "జ": "j",
  "ఝ": "jh",
  "ఞ": "ny",
  "ట": "t",
  "ఠ": "th",
  "డ": "d",
  "ఢ": "dh",
  "ణ": "n",
  "త": "t",
  "థ": "th",
  "ద": "d",
  "ధ": "dh",
  "న": "n",
  "ప": "p",
  "ఫ": "ph",
  "బ": "b",
  "భ": "bh",
  "మ": "m",
  "య": "y",
  "ర": "r",
  "ల": "l",
  "వ": "v",
  "శ": "sh",
  "ష": "sh",
  "స": "s",
  "హ": "h",
  "ళ": "l",
  "ఱ": "r",
};

const VOWELS: Record<string, string> = {
  "ా": "aa",
  "ి": "i",
  "ీ": "ee",
  "ు": "u",
  "ూ": "oo",
  "ృ": "ru",
  "ె": "e",
  "ే": "e",
  "ై": "ai",
  "ొ": "o",
  "ో": "o",
  "ౌ": "au",
};

const SIGNS: Record<string, string> = { "ం": "m", "ః": "h", "ఁ": "m" };
const VIRAMA = "్";

const WORD_FIXES: Array<[string, string]> = [
  ["Shek", "Shaik"],
  ["Shaek", "Shaik"],
  ["Shake", "Shaik"],
  ["Khaadar", "Khader"],
  ["Baashaa", "Basha"],
  ["Saaheb", "Saheb"],
  ["Semtar", "Center"],
  ["Setar", "Center"],
  ["Paarkurod", "Park Road"],
  ["Rod", "Road"],
  ["Peta", "Peta"],
  ["Bajaar", "Bazar"],
  ["TippArabajaar", "Tipparla Bazar"],
  ["Tipparabajaar", "Tipparla Bazar"],
];

const PERSON_TOKEN_FIXES: Record<string, string> = {
  // Syed / Sayyid
  sayyad: "Syed", sayad: "Syed", saiyad: "Syed", syyad: "Syed", sayyid: "Syed",
  // Muhammad
  mahammad: "Muhammad", mohammad: "Muhammad", mohammed: "Muhammad", muhammad: "Muhammad", mahamed: "Muhammad",
  // Hussain
  hussen: "Hussain", husen: "Hussain", hussein: "Hussain", husain: "Hussain",
  // Siddiq
  siddik: "Siddiq", sidik: "Siddiq", siddeeq: "Siddiq", siddeek: "Siddiq", siddiq: "Siddiq",
  // Ismail
  ismaayil: "Ismail", ismayil: "Ismail", ismaayeel: "Ismail",
  // Shaik
  shek: "Shaik", shake: "Shaik", shaek: "Shaik", shaik: "Shaik",
  beg: "Beg",
  // Ashraf
  ashraph: "Ashraf", ashraap: "Ashraf", aapraaph: "Ashraf", aapreeph: "Ashraf",
  // Arif
  areeph: "Arif", ariph: "Arif", aariph: "Arif", aareeph: "Arif", areef: "Arif",
  // Firoz
  phiroj: "Firoz", pheeroj: "Firoz", phiroz: "Firoz",
  // Chand
  chaamd: "Chand", chaand: "Chand",
  // Mahmood
  mahamood: "Mahmood", mahmood: "Mahmood",
  // Sadiq
  saadik: "Sadiq", saadiq: "Sadiq",
  // Rafi
  raphee: "Rafi", raaphee: "Rafi", raphi: "Rafi",
  // Nizamuddin
  nijaamuddeen: "Nizamuddin", nijamuddin: "Nizamuddin", nizaamuddeen: "Nizamuddin",
  // Shareef
  shareeph: "Shareef", shareepha: "Shareef",
  // Jilani
  jilaani: "Jilani",
  // Ghaffar
  gaphaar: "Ghaffar", gaphar: "Ghaffar",
  // Subhani
  subhaani: "Subhani", subahaani: "Subhani", subaani: "Subhani",
  // Mahboob
  mahaboob: "Mahboob", mahboob: "Mahboob",
  // Khaja
  khaajaa: "Khaja", khaaja: "Khaja",
  // Rahimuddin
  rahimuddeen: "Rahimuddin",
  // Nagulmira
  naagulameer: "Nagulmira",
  // Basha
  baashaa: "Basha", baasha: "Basha", bhaasha: "Basha", bhaashaa: "Basha",
  // Ghanu
  ghanu: "Ghanu",
  // Shafi
  shaphi: "Shafi", shaaphi: "Shafi", shaaphee: "Shafi",
  // Irfan
  irphaan: "Irfan", irphan: "Irfan",
  // Asif
  aasiph: "Asif", asiph: "Asif",
  // Imtiaz
  imtiyaaj: "Imtiaz", imtiyaj: "Imtiaz",
  // Jakir
  jaakeer: "Jakir", jaakir: "Jakir",
  // Nihal
  neehaal: "Nihal", nihaal: "Nihal",
  // Abdullah
  abdullaa: "Abdullah",
  // Rahmatullah
  rahamatullaa: "Rahmatullah", rahamtullaa: "Rahmatullah",
  // Maulali
  maulaali: "Maulali", moulaali: "Maulali",
  // Ibrahim
  ibraheem: "Ibrahim",
  // Imran
  imraan: "Imran",
  // Yaseen
  yaasin: "Yaseen",
  // Mohiddin
  mohiddeen: "Mohiddin", moheenudeen: "Mohiddin",
  // Karimulla
  kareemullaa: "Karimulla", karimullaa: "Karimulla",
  // Altaf
  altaaph: "Altaf", altaph: "Altaf",
  // Munaf
  munaaph: "Munaf", munaph: "Munaf",
  // Rauf
  ravooph: "Rauf", rauph: "Rauf", rawuph: "Rauf",
  // Latif
  lateeph: "Latif", latiph: "Latif",
  // Attaf
  attaaph: "Attaf", attaph: "Attaf",
  // Sharif
  shariph: "Sharif", phaariph: "Sharif", pharif: "Sharif",
  // Hanif
  haneeph: "Hanif", haniph: "Hanif",
  // Yusuf
  yoosuph: "Yusuf", yaasuph: "Yusuf", yusuph: "Yusuf", yoosooph: "Yusuf",
  // Khalif
  khaleeph: "Khalif", khaliph: "Khalif",
  // Alf
  alph: "Alf",
  // Allaf
  allhaaph: "Allaf", allhaph: "Allaf",
};

const TEXT_TRANSLATIONS: Array<[RegExp, string]> = [
  [/^వ్యాపారం$/i, "Business"],
  [/^ఉద్యోగం$/i, "Employee"],
  [/^కూలి$/i, "Laborer"],
  [/^డ్రైవ(ర్|రు)$/i, "Driver"],
  [/^ఆటో డ్రైవ(ర్|రు)$/i, "Auto Driver"],
  [/^స్టూడెంట్$/i, "Student"],
  [/^బిజినెస్$/i, "Business"],
  [/^మెకానిక్$/i, "Mechanic"],
  [/^సేల్స్ మ్యాన్$/i, "Salesman"],
  [/^సాఫ్ట్వేర్$/i, "Software"],
  [/^వెల్డర్$/i, "Welder"],
  [/^కార్పెంటర్$/i, "Carpenter"],
  [/^క్లర్క్$/i, "Clerk"],
  [/^ఇమామ్$/i, "Imam"],
  [/^తాపీ మేస్త్రి$/i, "Mason"],
  [/^టైల్స్ పని$/i, "Tiles Work"],
  [/^గోల్డ్ వర్క్$/i, "Gold Work"],
  [/^లారీ డ్రైవర్$/i, "Lorry Driver"],
  [/^వ్యవసాయం$/i, "Farming"],
];

function titleWord(word: string) {
  return word ? `${word[0].toUpperCase()}${word.slice(1)}` : word;
}

export function transliterateTe(text: string, placeholder = "") {
  const source = (text || "").replace(/\u200c|\u200d/g, "").trim();
  if (!source) {
    return placeholder;
  }

  const out: string[] = [];
  let index = 0;
  while (index < source.length) {
    const pair = source.slice(index, index + 2);
    const char = source[index];
    let base = "";

    if (CONSONANTS[pair]) {
      base = CONSONANTS[pair];
      index += 2;
    } else if (CONSONANTS[char]) {
      base = CONSONANTS[char];
      index += 1;
    } else if (INDEPENDENT[char]) {
      out.push(INDEPENDENT[char]);
      index += 1;
      continue;
    } else if (VOWELS[char] || char === VIRAMA) {
      index += 1;
      continue;
    } else if (SIGNS[char]) {
      out.push(SIGNS[char]);
      index += 1;
      continue;
    } else {
      out.push(char);
      index += 1;
      continue;
    }

    if (index < source.length && source[index] === VIRAMA) {
      out.push(base);
      index += 1;
    } else if (index < source.length && VOWELS[source[index]]) {
      out.push(base + VOWELS[source[index]]);
      index += 1;
    } else {
      out.push(base + "a");
    }
  }

  let textOut = out.join("").replace(/\s+/g, " ").trim().replace(/^[ .,:;|-]+|[ .,:;|-]+$/g, "");
  textOut = textOut
    .split(" ")
    .map(titleWord)
    .join(" ");
  for (const [wrong, right] of WORD_FIXES) {
    textOut = textOut.replaceAll(wrong, right);
  }
  return textOut || placeholder;
}

export function transliteratePersonNameTe(text: string, placeholder = "") {
  const base = transliterateTe(text, placeholder);
  if (!base) {
    return base;
  }
  const cleaned = base.replaceAll("Yas.ke.", "S.K.").replaceAll("Es.ke.", "S.K.").replaceAll("S.ke.", "S.K.");
  return cleaned
    .split(" ")
    .map((token) => {
      const bare = token.replace(/[^A-Za-z.]/g, "").toLowerCase();
      if (bare === "sk" || bare === "s.k." || bare === "ske") {
        return "S.K.";
      }
      return PERSON_TOKEN_FIXES[bare] || token;
    })
    .join(" ")
    .trim();
}

export function toEnglishText(text: string, placeholder = "") {
  const source = (text || "").trim();
  if (!source) {
    return placeholder;
  }
  for (const [pattern, replacement] of TEXT_TRANSLATIONS) {
    if (pattern.test(source)) {
      return replacement;
    }
  }
  return transliterateTe(source, placeholder);
}

export function toEnglishArea(text: string, fallback = "Other Area") {
  return transliterateTe(text, fallback);
}

export function toEnglishName(text: string, fallback = "") {
  return transliteratePersonNameTe(text, fallback);
}

// ── English → Telugu (reverse transliteration) ────────────────────────────

const ENGLISH_TO_TELUGU_NAME: Record<string, string> = {
  // Titles / family prefixes
  shaik: "షేక్", shaikh: "షేక్", sheikh: "షేక్",
  syed: "సయ్యద్", sayyid: "సయ్యద్",
  pathan: "పఠాన్",
  // Muhammad
  muhammad: "మహమ్మద్", mohammed: "మహమ్మద్", mohammad: "మహమ్మద్",
  mahammad: "మహమ్మద్", mahamad: "మహమ్మద్",
  // Common surnames
  basha: "బాషా", baasha: "బాషా",
  khan: "ఖాన్",
  begum: "బేగమ్", bibi: "బీబీ", khanum: "ఖానమ్", sultana: "సుల్తానా",
  // Men's names A–Z
  abdulla: "అబ్దుల్లా", abdullah: "అబ్దుల్లా",
  ajmal: "అజ్మల్",
  akbar: "అక్బర్",
  akram: "అక్రమ్",
  altaf: "అల్తాఫ్",
  ameer: "అమీర్", amir: "అమీర్",
  amjad: "అంజద్",
  anwar: "అన్వర్",
  arif: "అరీఫ్", areef: "అరీఫ్",
  arshad: "అర్షద్",
  asif: "ఆసిఫ్",
  aslam: "అస్లమ్",
  attar: "అత్తార్",
  aziz: "అజీజ్",
  badruddin: "బద్రుద్దీన్",
  basheer: "బషీర్", bashir: "బషీర్",
  bilal: "బిలాల్",
  chand: "చాంద్", chaand: "చాంద్",
  daud: "దావూద్",
  fareed: "ఫరీద్", farid: "ఫరీద్",
  farooq: "ఫారూఖ్",
  fayaz: "ఫయాజ్",
  firoz: "ఫిరోజ్",
  ghaffar: "గఫ్ఫార్",
  ghani: "గాని", gani: "గాని",
  ghouse: "ఘౌస్", ghous: "ఘౌస్",
  ghulam: "గులామ్",
  gulshan: "గుల్షన్",
  habib: "హబీబ్", habeeb: "హబీబ్",
  hafeez: "హఫీజ్",
  hameed: "హమీద్", hamid: "హమీద్",
  hamza: "హంజా",
  hanif: "హనీఫ్",
  hasan: "హసన్",
  hayat: "హయాత్",
  hussain: "హుస్సేన్", husain: "హుస్సేన్",
  ibrahim: "ఇబ్రాహిమ్",
  ilyas: "ఇల్యాస్",
  imran: "ఇమ్రాన్",
  imtiaz: "ఇంతియాజ్",
  iqbal: "ఇక్బాల్",
  irfan: "ఇర్ఫాన్",
  ismail: "ఇస్మాయిల్",
  jabbar: "జబ్బార్",
  jafar: "జాఫర్", zafar: "జాఫర్",
  jakir: "జాకిర్", zakir: "జాకిర్",
  jalal: "జలాల్",
  jameel: "జమీల్", jamil: "జమీల్",
  javeed: "జావీద్", javid: "జావీద్",
  jilani: "జిలాని", jilaani: "జిలాని",
  junaid: "జునేద్",
  kabir: "కబీర్", kabeer: "కబీర్",
  kafeel: "కఫీల్",
  karim: "కరీమ్", kareem: "కరీమ్",
  karimullah: "కరీముల్లా",
  kashif: "కాషిఫ్",
  khalid: "ఖాలిద్",
  khaleel: "ఖలీల్", khalil: "ఖలీల్",
  khader: "ఖాదర్",
  khaja: "ఖాజా",
  latif: "లతీఫ్", lateef: "లతీఫ్",
  mahboob: "మహబూబ్", mahaboob: "మహబూబ్",
  mahmood: "మహమూద్",
  mansoor: "మన్సూర్",
  manzoor: "మంజూర్",
  masood: "మసూద్",
  mastan: "మస్తాన్",
  maulali: "మౌలాలి", moulali: "మౌలాలి",
  mohiddin: "మొహిద్దీన్",
  mohsin: "మొహ్సిన్",
  mujeeb: "ముజీబ్",
  munaf: "మునాఫ్",
  muneer: "మునీర్", munir: "మునీర్",
  mushtaq: "ముష్తాక్",
  mustafa: "ముస్తఫా",
  nabi: "నబి",
  nadeem: "నదీమ్",
  nagulmira: "నాగుల్మీర",
  nazeer: "నజీర్", nazir: "నజీర్",
  nihal: "నిహాల్", nihaal: "నిహాల్",
  nisar: "నిసార్",
  nizam: "నిజామ్",
  nizamuddin: "నిజాముద్దీన్",
  omar: "ఉమర్", umar: "ఉమర్", umer: "ఉమర్",
  osman: "ఉస్మాన్", usman: "ఉస్మాన్",
  rafi: "రఫీ",
  rafiq: "రఫీఖ్", rafeeq: "రఫీఖ్",
  raheem: "రహీమ్", rahim: "రహీమ్",
  rahimuddin: "రహీముద్దీన్",
  rahmatullah: "రహ్మతుల్లా",
  rahman: "రహ్మాన్", rehman: "రెహ్మాన్",
  rasool: "రసూల్",
  rasheed: "రషీద్", rashid: "రషీద్",
  rauf: "రవూఫ్",
  riaz: "రియాజ్", riyaz: "రియాజ్",
  rizwan: "రిజ్వాన్",
  roshan: "రోషన్",
  sadiq: "సాదిక్",
  saheb: "సాహెబ్",
  sajid: "సాజిద్",
  saleem: "సలీమ్", salim: "సలీమ్",
  salman: "సల్మాన్",
  sameer: "సమీర్",
  sarwar: "సర్వర్",
  shafi: "షఫీ",
  shahid: "షహీద్",
  shareef: "షరీఫ్", sharif: "షరీఫ్",
  siddiq: "సిద్దిక్",
  subhani: "సుభాని",
  suleman: "సులేమాన్", sulaiman: "సులేమాన్",
  sultan: "సుల్తాన్",
  tahir: "తాహిర్",
  tariq: "తారిక్",
  vali: "వలి", wali: "వలి",
  waheed: "వహీద్",
  waseem: "వసీమ్",
  yaqoob: "యాఖూబ్", yaqub: "యాఖూబ్",
  yaseen: "యాసీన్",
  yusuf: "యూసుఫ్",
  zaid: "జైద్",
  ziauddin: "జియాఉద్దీన్",
  zubair: "జుబేర్",
  // Women's names
  ayesha: "ఆయేషా",
  fathima: "ఫాతిమా", fatima: "ఫాతిమా",
  hasina: "హసీనా",
  meera: "మీరా",
  raheema: "రహీమా",
  yasmeen: "యాస్మీన్",
  zubeda: "జుబేదా",
};

// Phonetic fallback: converts unrecognised English tokens to approximate Telugu
function _phoneticToTelugu(word: string): string {
  const VIRAMA = "్";
  type Ph = { type: "C" | "V"; te: string; matra: string };
  const ph: Ph[] = [];
  let i = 0;

  while (i < word.length) {
    const two = word.slice(i, i + 2);
    const one = word[i];
    // Digraph consonants (check before single chars)
    if (two === "sh") { ph.push({ type: "C", te: "శ", matra: "" }); i += 2; continue; }
    if (two === "kh") { ph.push({ type: "C", te: "ఖ", matra: "" }); i += 2; continue; }
    if (two === "gh") { ph.push({ type: "C", te: "ఘ", matra: "" }); i += 2; continue; }
    if (two === "ch") { ph.push({ type: "C", te: "చ", matra: "" }); i += 2; continue; }
    if (two === "th") { ph.push({ type: "C", te: "థ", matra: "" }); i += 2; continue; }
    if (two === "ph") { ph.push({ type: "C", te: "ఫ", matra: "" }); i += 2; continue; }
    if (two === "bh") { ph.push({ type: "C", te: "భ", matra: "" }); i += 2; continue; }
    if (two === "dh") { ph.push({ type: "C", te: "ధ", matra: "" }); i += 2; continue; }
    // Digraph vowels
    if (two === "aa") { ph.push({ type: "V", te: "ఆ", matra: "ా" }); i += 2; continue; }
    if (two === "ee" || two === "ii") { ph.push({ type: "V", te: "ఈ", matra: "ీ" }); i += 2; continue; }
    if (two === "oo" || two === "uu") { ph.push({ type: "V", te: "ఊ", matra: "ూ" }); i += 2; continue; }
    if (two === "ai") { ph.push({ type: "V", te: "ఐ", matra: "ై" }); i += 2; continue; }
    if (two === "au") { ph.push({ type: "V", te: "ఔ", matra: "ౌ" }); i += 2; continue; }
    // Single consonants
    const SC: Record<string, string> = {
      k: "క", g: "గ", j: "జ", t: "త", d: "ద", n: "న",
      p: "ప", b: "బ", m: "మ", y: "య", r: "ర", l: "ల",
      v: "వ", w: "వ", s: "స", h: "హ", f: "ఫ", z: "జ",
      q: "క", c: "క",
    };
    if (SC[one]) { ph.push({ type: "C", te: SC[one], matra: "" }); i++; continue; }
    // Single vowels
    const SV: Record<string, { te: string; matra: string }> = {
      a: { te: "అ", matra: "" },
      i: { te: "ఇ", matra: "ి" },
      u: { te: "ఉ", matra: "ు" },
      e: { te: "ఎ", matra: "ె" },
      o: { te: "ఒ", matra: "ొ" },
    };
    if (SV[one]) { ph.push({ type: "V", te: SV[one].te, matra: SV[one].matra }); i++; continue; }
    i++;
  }

  // Render phonemes → Telugu script
  const out: string[] = [];
  let j = 0;
  while (j < ph.length) {
    const cur = ph[j];
    const nxt = j + 1 < ph.length ? ph[j + 1] : null;
    if (cur.type === "V") {
      out.push(cur.te); j++; continue;
    }
    // Nasal before consonant → anusvara
    if ((cur.te === "న" || cur.te === "మ") && nxt && nxt.type === "C") {
      out.push("ం"); j++; continue;
    }
    if (!nxt) {
      out.push(cur.te + VIRAMA);
    } else if (nxt.type === "V") {
      out.push(nxt.matra === "" ? cur.te : cur.te + nxt.matra);
      j++; // consume vowel
    } else {
      out.push(cur.te + VIRAMA);
    }
    j++;
  }
  return out.join("");
}

export function englishToTeluguName(text: string): string {
  if (!text.trim()) return "";
  return text
    .trim()
    .split(/\s+/)
    .map((word) => {
      const key = word.toLowerCase().replace(/[^a-z.]/g, "");
      return ENGLISH_TO_TELUGU_NAME[key] ?? _phoneticToTelugu(key);
    })
    .join(" ");
}
