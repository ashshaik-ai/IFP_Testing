from __future__ import annotations

import re


INDEPENDENT = {
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
}

CONSONANTS = {
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
    "క్ష": "ksh",
    "ఱ": "r",
}

VOWELS = {
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
}

SIGNS = {"ం": "m", "ః": "h", "ఁ": "m"}
VIRAMA = "్"
WORD_FIXES = (
    ("Shek", "Shaik"),
    ("Shaek", "Shaik"),
    ("Shake", "Shaik"),
    ("Khaadar", "Khader"),
    ("Baashaa", "Basha"),
    ("Saaheb", "Saheb"),
    ("Semtar", "Center"),
    ("Setar", "Center"),
    ("Paarkurod", "Park Road"),
    ("Rod", "Road"),
    ("Peta", "Peta"),
    ("Bajaar", "Bazar"),
    ("TippArabajaar", "Tipparla Bazar"),
    ("Tipparabajaar", "Tipparla Bazar"),
)

PERSON_TOKEN_FIXES = {
    # Syed / Sayyid variants
    "sayyad": "Syed",
    "sayad": "Syed",
    "saiyad": "Syed",
    "syyad": "Syed",
    "sayyid": "Syed",
    # Muhammad variants
    "mahammad": "Muhammad",
    "mohammad": "Muhammad",
    "mohammed": "Muhammad",
    "muhammad": "Muhammad",
    "mahamed": "Muhammad",
    # Hussain
    "hussen": "Hussain",
    "husen": "Hussain",
    "hussein": "Hussain",
    "husain": "Hussain",
    # Siddiq
    "siddik": "Siddiq",
    "sidik": "Siddiq",
    "siddeeq": "Siddiq",
    "siddeek": "Siddiq",
    "siddiq": "Siddiq",
    # Ismail
    "ismaayil": "Ismail",
    "ismayil": "Ismail",
    "ismaayeel": "Ismail",
    # Shaik prefix
    "shek": "Shaik",
    "shake": "Shaik",
    "shaek": "Shaik",
    "shaik": "Shaik",
    "shaak": "Shaik",
    "beg": "Beg",
    # Khan
    "khaan": "Khan",
    # Pathan (and OCR/script variants)
    "pathaan": "Pathan",
    "pataan": "Pathan",
    "prathaan": "Pathan",
    "phathaan": "Pathan",
    # Masthan (AP South Indian Muslim convention)
    "mastaan": "Masthan",
    "mastan": "Masthan",
    # Meera (Muslim name/title, drops trailing aa)
    "meeraa": "Mira",
    # Hashim
    "khaasheem": "Hashim",
    "khasheem": "Hashim",
    "haasheem": "Hashim",
    "hasheem": "Hashim",
    # Sultan
    "sultaan": "Sultan",
    # Rahman
    "rahamaan": "Rahman",
    "rahemaan": "Rahman",
    # Muhammad contracted form
    "mahmad": "Muhammad",
    # Peera (Dargah custodian title)
    "peeraa": "Pira",
    # Tajuddin
    "taajuddeen": "Tajuddin",
    "tajuddeen": "Tajuddin",
    # Moinuddin
    "moyinudeen": "Moinuddin",
    "moinudeen": "Moinuddin",
    # Jahangir
    "jahamgeer": "Jahangir",
    "jahangeer": "Jahangir",
    # Abbas
    "abbaas": "Abbas",
    # Yakoob
    "yaakoob": "Yakub",
    # Pasha
    "paashaa": "Pasha",
    "paasha": "Pasha",
    # Asadullah
    "asadullaa": "Asadullah",
    # Ali (drops trailing ee)
    "alee": "Ali",
    # Riyaz (20x — Telugu జ → j but English convention uses z)
    "riyaaj": "Riyaz",
    "riyaajuddeen": "Riazuddin",
    # Shabbir
    "shabbeer": "Shabbir",
    # Rabbani
    "rabbaani": "Rabbani",
    # Nagoor (drop double aa)
    "naagoor": "Nagoor",
    # Razak
    "rajaak": "Razak",
    "raajaak": "Razak",
    # Malik
    "maalik": "Malik",
    # Sardar
    "sardaar": "Sardar",
    # Sattar
    "sattaar": "Sattar",
    # Shamsuddin
    "shamshuddeen": "Shamsuddin",
    "shamshudheen": "Shamsuddin",
    # Usman
    "usmaan": "Usman",
    # Suleman
    "sulemaan": "Suleman",
    # Yusuf ending in b (Telugu బ్)
    "yoosub": "Yusuf",
    "isoob": "Yusuf",
    # Adam
    "aadaam": "Adam",
    "aadam": "Adam",
    # Fakruddin
    "phakruddeen": "Fakruddin",
    "phakrudheen": "Fakruddin",
    # Mustapha
    "mustaphaa": "Mustafa",
    # Amanullah
    "amaanullaa": "Amanullah",
    # Rizwan
    "rijvaan": "Rizwan",
    # Rahman variant
    "rehamaan": "Rahman",
    "raheemaan": "Rahiman",
    # Rahiman (distinct from Rahman)
    "rahimaan": "Rahiman",
    # Fareed
    "phareed": "Farid",
    # Ghalib
    "gaalib": "Ghalib",
    # Bilal
    "bilaal": "Bilal",
    # Farooq
    "phaarook": "Faruq",
    "phaarukhaan": "Faruq Khan",
    # Saddam
    "saddaam": "Saddam",
    # Fayaz
    "phayaaj": "Fayaz",
    "phayaajuddeen": "Fayazuddin",
    # Salman
    "salmaan": "Salman",
    # Siraj
    "siraaj": "Siraj",
    # Ghafoor
    "gaphoor": "Ghafur",
    # Afroz
    "aphroj": "Afroz",
    # Khalid
    "khaleed": "Khalid",
    # Dawood
    "daavood": "Dawud",
    # Nasir
    "naasar": "Nasir",
    # Syed variants not yet caught
    "sayid": "Syed",
    "sayeed": "Syed",
    # Moghal variant
    "mogal": "Moghal",
    # Uddin suffix variants
    "nooruddeen": "Nuruddin",
    "najeeruddeen": "Najiruddin",
    "najimuddeen": "Najiruddin",
    # Yunus
    "yoonas": "Yunus",
    "yoonus": "Yunus",
    # Fazal / Fazulla
    "phajal": "Fazal",
    "phajullaa": "Fazulla",
    "phajuluddeen": "Fazaluddin",
    # Faruddin
    "phaaruddeen": "Faruddin",
    # Ansar
    "ansaar": "Ansar",
    # Pradhan
    "pradhaan": "Pradhan",
    # Meeravali (drop extra aa)
    "meeraavali": "Miravali",
    # Zia
    "jiyaa": "Zia",
    # Isa
    "eesaa": "Isa",
    # Fakir
    "phakeer": "Fakir",
    # Sohail
    "sohayil": "Sohail",
    # Yakoob OCR variant (j/y confusion)
    "jaakoob": "Yakub",
    # Sultan OCR scramble
    "stultaan": "Sultan",
    # Abdul OCR scramble
    "abdbul": "Abdul",
    # Ahmad OCR scramble
    "ahamamd": "Ahmad",
    # Naagul → Nagul (73 — community name, drop doubled aa)
    "naagul": "Nagul",
    "naagool": "Nagul",
    "naagulaa": "Nagula",
    "naagula": "Nagula",
    "naagur": "Nagur",
    "naagooraa": "Nagoora",
    # Saidaa → Saida (27)
    "saidaa": "Saida",
    "saidaavali": "Saidavali",
    # Baabu → Babu (26)
    "baabu": "Babu",
    "baabulaal": "Babulal",
    "baabaa": "Baba",
    "baabaavali": "Babavali",
    # Anvar → Anwar (23)
    "anvar": "Anwar",
    # Khaajaavali → Khajavali (14)
    "khaajaavali": "Khajavali",
    # Kaaleshaa → Kalesha (12)
    "kaaleshaa": "Kalesha",
    "kaalishaa": "Kalesha",
    # Kareem → Karim (10)
    "kareem": "Karim",
    # Imaam → Imam (8)
    "imaam": "Imam",
    # Samdhaani → Samdani (8)
    "samdhaani": "Samdani",
    "samdaani": "Samdani",
    # Shaakat → Shaukat (7)
    "shaakat": "Shaukat",
    # Sohel → Sohail (7)
    "sohel": "Sohail",
    # Ajeem → Azeem (6)
    "ajeem": "Azim",
    # Baajee → Baji (5)
    "baajee": "Baji",
    # Jaleel → Jalil (6)
    "jaleel": "Jalil",
    # Eesub → Yusuf (5)
    "eesub": "Yusuf",
    # Daadaa → Dada (5)
    "daadaa": "Dada",
    # Khaleel → Khalil (5)
    "khaleel": "Khalil",
    # Shahid (5+2)
    "shaahid": "Shahid",
    "shaaheed": "Shahid",
    # Habeeb → Habib (4)
    "habeeb": "Habib",
    # Aziz (4)
    "ajeej": "Aziz",
    # Zahir (4)
    "jaheer": "Zahir",
    # Mujib (4)
    "mujeeb": "Mujib",
    # Sajid (4)
    "saajid": "Sajid",
    # Salar (4)
    "silaar": "Salar",
    # Ilyas (4+1)
    "iliyaaj": "Ilyas",
    "iliyaas": "Ilyas",
    # Allabhakash (4)
    "allaabakaash": "Allabhaksh",
    # Mir (4)
    "meer": "Mir",
    # Pir (4)
    "peer": "Pir",
    # Shahrukh (4+3)
    "shaarookh": "Shahrukh",
    "shaarook": "Shahrukh",
    # Musa (3+1)
    "moosa": "Musa",
    "moosaa": "Musa",
    # Nazar (3)
    "naajar": "Nazar",
    # Shakir (3)
    "shaakeer": "Shakir",
    # Daula (3)
    "daulaa": "Daula",
    # Khayyam (3)
    "khayyoom": "Khayyam",
    # Naeem (3)
    "nayeem": "Naim",
    # Javeedu (3)
    "jaaveedu": "Javid",
    # Arifullah (3)
    "aariphullaa": "Arifullah",
    # Javed (2+2)
    "jaaveed": "Javed",
    "jaaved": "Javed",
    # Nisar (2)
    "nisaar": "Nisar",
    # Quddus (2)
    "khuddoos": "Quddus",
    # Humayun (2)
    "humayoon": "Humayun",
    # Maula (2)
    "maulaa": "Maula",
    # Liaquat (2)
    "liyaakhat": "Liaquat",
    # Munwar (2)
    "munvar": "Munwar",
    # Saadullah (2)
    "saadullaa": "Sadullah",
    # Aminullah (2)
    "ameenullaa": "Aminullah",
    # Habibullah (2)
    "habibullaa": "Habibullah",
    # Yadullah (2)
    "yadullaa": "Yadullah",
    # -ullah compounds (1 each)
    "hidaayatullaa": "Hidayatullah",
    "inaayitullaa": "Inayatullah",
    "ashadullaa": "Ashadullah",
    "shaayidullaa": "Shahidullah",
    "abedullaa": "Abedullah",
    "naseemullaa": "Nasimullah",
    "nasimullaa": "Nasimullah",
    "ajibullaa": "Ajibullah",
    "jabibullaa": "Jabibullah",
    "saiphullaa": "Saifullah",
    "ahmadullaa": "Ahmadullah",
    "asmatullaa": "Asmatullah",
    "aaruphullaa": "Arafullah",
    "phajarullaa": "Fazarullah",
    "shaphivullaa": "Shafiullah",
    "shaphipullaa": "Shafiullah",
    # -uddin compounds
    "jamaaluddeen": "Jamaluddin",
    "khamaruddeen": "Qamaruddin",
    "naseeruddeen": "Nasiruddin",
    "salaavuddeen": "Salahuddin",
    "imaamuddeen": "Imamuddin",
    "raheemuddeen": "Rahimuddin",
    "siraajuddeen": "Sirajuddin",
    "nigaaruddeen": "Nigaruddin",
    "ameeruddeen": "Amiruddin",
    "ajmuddeen": "Ajmuddin",
    "salimuddeen": "Salimuddin",
    "basheeruddeen": "Bashiruddin",
    "aariphuddeen": "Arifuddin",
    "mohinuddeen": "Mohiuddin",
    "kamrooddeen": "Kamruddin",
    "mujibudeen": "Mujibuddin",
    # ph→f remaining
    "hapheej": "Hafiz",
    "shapheek": "Shafiq",
    "phaahid": "Fahad",
    "shaphee": "Shafi",
    "raphitullaa": "Rafitullah",
    "ariphu": "Arif",
    "phared": "Farid",
    # Single-instance fixes
    "asma": "Asma",
    "asmaa": "Asma",
    "nagmaa": "Nagma",
    "bahaddoor": "Bahadur",
    "ikbaal": "Iqbal",
    "muktaar": "Mukhtar",
    "sartaaj": "Sartaj",
    "parvej": "Pervez",
    "shoyab": "Shoaib",
    "khaashim": "Hashim",
    "gulaam": "Ghulam",
    "kaadar": "Khader",
    "khadeer": "Khader",
    "khadir": "Khader",
    "madeenaa": "Madina",
    "jainulaabtin": "Zainulabedin",
    "jailaabtin": "Zainulabedin",
    "yaakhaab": "Yakub",
    "maahamaad": "Muhammad",
    "mahavamd": "Muhammad",
    # Ashraf
    "ashraph": "Ashraf",
    "ashraap": "Ashraf",
    # Arif
    "areeph": "Arif",
    "ariph": "Arif",
    "aariph": "Arif",
    "areef": "Arif",
    # Firoz / Feroz
    "phiroj": "Firoz",
    "pheeroj": "Firoz",
    "phiroz": "Firoz",
    # Chand
    "chaamd": "Chand",
    "chaand": "Chand",
    # Mahmood
    "mahamood": "Mahmud",
    "mahmood": "Mahmud",
    # Sadiq
    "saadik": "Sadiq",
    "saadiq": "Sadiq",
    # Rafi
    "raphee": "Rafi",
    "raaphee": "Rafi",
    # Nizamuddin
    "nijaamuddeen": "Nizamuddin",
    "nijamuddin": "Nizamuddin",
    "nizaamuddeen": "Nizamuddin",
    # Shareef
    "shareeph": "Sharif",
    "shareepha": "Sharif",
    # Jilani
    "jilaani": "Jilani",
    # Ghaffar
    "gaphaar": "Ghaffar",
    "gaphar": "Ghaffar",
    # Subhani
    "subhaani": "Subhani",
    # Mahaboob / Mahboob
    "mahaboob": "Mahbub",
    "mahboob": "Mahbub",
    # Khaja
    "khaajaa": "Khaja",
    "khaaja": "Khaja",
    # Rahimuddin
    "rahimuddeen": "Rahimuddin",
    # Nagulameer / Nagulmira
    "naagulameer": "Nagulmira",
    # Basha
    "baashaa": "Basha",
    "baasha": "Basha",
    # Ghanu
    "ghanu": "Ghanu",
    # Shafi
    "shaphi": "Shafi",
    "shaaphi": "Shafi",
    "shaaphee": "Shafi",
    # Irfan
    "irphaan": "Irfan",
    "irphan": "Irfan",
    # Asif
    "aasiph": "Asif",
    "asiph": "Asif",
    # Imtiaz
    "imtiyaaj": "Imtiaz",
    "imtiyaj": "Imtiaz",
    # Jakir / Zakir
    "jaakeer": "Jakir",
    "jaakir": "Jakir",
    # Nihal
    "neehaal": "Nihal",
    "nihaal": "Nihal",
    # Basha when rendered with bh (Telugu భ)
    "bhaasha": "Basha",
    "bhaashaa": "Basha",
    # Subhani variants
    "subahaani": "Subhani",
    "subaani": "Subhani",
    # Abdullah (trailing ā stripped)
    "abdullaa": "Abdullah",
    # Rahmatullah
    "rahamatullaa": "Rahmatullah",
    "rahamtullaa": "Rahmatullah",
    # Maulali
    "maulaali": "Maulali",
    "moulaali": "Maulali",
    # Ibrahim
    "ibraheem": "Ibrahim",
    # Imran
    "imraan": "Imran",
    # Yasin
    "yaasin": "Yasin",
    # Mohiddin
    "mohiddeen": "Mohiddin",
    "moheenudeen": "Mohiddin",
    # Karimulla
    "kareemullaa": "Karimulla",
    "karimullaa": "Karimulla",
    # Salim (both spellings acceptable — leave Saleem as is)
    # Basheer (keep — valid English form)
    # Rasheed (keep — valid)
    # Raphi (short-i form from రఫి — catches stale values before TOKEN_FIX ran)
    "raphi": "Rafi",
    # Altaf (అల్తాఫ్)
    "altaaph": "Altaf",
    "altaph": "Altaf",
    # Munaf (మునాఫ్)
    "munaaph": "Munaf",
    "munaph": "Munaf",
    # Rauf (రవూఫ్ / రౌఫ్)
    "ravooph": "Rauf",
    "rauph": "Rauf",
    "rawuph": "Rauf",
    # Latif (లతీఫ్)
    "lateeph": "Latif",
    "latiph": "Latif",
    # Attaf (అత్తాఫ్)
    "attaaph": "Attaf",
    "attaph": "Attaf",
    # Sharif (షరిఫ్ — note: Shareef already handled via shareeph)
    "shariph": "Sharif",
    # Hanif (హనీఫ్)
    "haneeph": "Hanif",
    "haniph": "Hanif",
    # Arif — extra long-vowel variant
    "aareeph": "Arif",
    # Yusuf (యూసుఫ్)
    "yoosuph": "Yusuf",
    "yaasuph": "Yusuf",
    "yusuph": "Yusuf",
    # Khalif (ఖలీఫ్)
    "khaleeph": "Khalif",
    "khaliph": "Khalif",
    # Ashraf — long-ā OCR variant (ఆప్రాఫ్)
    "aapraaph": "Ashraf",
    "aapreeph": "Ashraf",
    # Sharif — pha-prefix OCR variant (ఫారిఫ్)
    "phaariph": "Sharif",
    "pharif": "Sharif",
    # Yusuf — long-oo forms (యూసూఫ్)
    "yoosooph": "Yusuf",
    # Alf (అల్ఫ్ — Arabic name)
    "alph": "Alf",
    # Allaf (అల్ల్హాఫ్)
    "allhaaph": "Allaf",
    "allhaph": "Allaf",
    # Mabu (మాబు — short community name; drop doubled aa)
    "maabu": "Mabu",
    # Mahboob OCR variants (వ్రుహ/మ్రహ OCR corruption of మహ)
    "vruhaboob": "Mahbub",
    "vrahaboob": "Mahbub",
    "mrahaboob": "Mahbub",
    "mohaboob": "Mahbub",
    "mahaboo": "Mahbub",
    # Jafar (జాఫర్ → ph→f, drop double aa)
    "jaaphar": "Jafar",
    "japhaar": "Jafar",
    # Khader (ఖాదిర్ → double aa → single)
    "khaadir": "Khader",
    # Qasim (ఖాసీం — distinct from Hashim)
    "khaaseem": "Qasim",
    # Lal (drop double aa)
    "laal": "Lal",
    # Shahjehan
    "shaajahaan": "Shahjehan",
    # Community names — drop doubled aa
    "allaabhakshu": "Allabhaksh",
    "allaabhaktu": "Allabhaktu",
    # Najiru (drop trailing ee→i)
    "najeeru": "Najir",
    # Madar / Kalam
    "madaar": "Madar",
    "kalaam": "Kalam",
    # Mulla (Islamic title; drop doubled aa)
    "mullaa": "Mulla",
    # Alisha
    "alishaa": "Alisha",
    # Nasir (naasir variant)
    "naasir": "Nasir",
    # Muneer without trailing u → standardize to short-i
    "muneeru": "Munir",
    # Khaderi (alternate form)
    "khaderee": "Khaderi",
    # Raju
    "raaju": "Raju",
    # Najeebuddin
    "najeebuddeen": "Najibuddin",
    # Buderavu
    "buderaavu": "Buderavu",
    # Short forms — drop doubled aa
    "gadaa": "Gada",
    "maalak": "Malik",
    "kaalaa": "Kala",
    "budaa": "Buda",
    "rajaa": "Raja",
    "pedaa": "Peda",
    "naaraa": "Nara",
    # Subhan
    "subhaan": "Subhan",
    # Community name
    "bademiyaa": "Bademia",
    # Meerababu
    "meeraabaabu": "Mira Babu",
    # Masthanvali (compound)
    "mastaanvali": "Masthan Vali",
    # Chota (small/junior prefix)
    "chotaa": "Chota",
    # Khaja (variant spelling)
    "kaajaa": "Khaja",
    # Khalilu (trailing u→strip to Khalil done elsewhere; here keep Khalilu variant)
    "khaleelu": "Khalil",
    # Jakiru
    "jaakeeru": "Jakir",
    # Wahab
    "vahab": "Wahab",
    # Moinuddin variant not yet caught
    "moyinuddeen": "Moinuddin",
    # OCR prefix/suffix artifacts
    "stubhaani": "Subhani",
    "spulemaan": "Suleman",
    "sardhaar": "Sardar",
    "subhaaani": "Subhani",
    # Ghalib variant
    "gaaleeb": "Ghalib",
    # Kaleshavali
    "kaaleshaavali": "Kalesha Vali",
    "kaalesaavali": "Kalesha Vali",
    # Yusuf remaining OCR variant
    "yoosoob": "Yusuf",
    # Maqbool OCR variants
    "magbool": "Maqbul",
    "magnbool": "Maqbul",
    "makhybool": "Maqbul",
    # Ghafoor variant
    "gapoor": "Ghafur",
    # Aslam
    "aslaam": "Aslam",
    # Muhammad OCR fragment
    "mohamm": "Muhammad",
    # Nagulu (Telugu plural suffix)
    "naagulu": "Nagulu",
    # Maulana
    "maulaanaa": "Maulana",
    # Ahmad OCR variant
    "aahamad": "Ahmad",
    # Tajuddin variant
    "taajuddan": "Tajuddin",
    # Haider
    "hayidar": "Haider",
    # Mohiddin variant
    "momiddeen": "Mohiddin",
    # Shahnawaz / Shahbaz (aaj→az)
    "shaanavaaj": "Shahnawaz",
    "shaanaavaaj": "Shahnawaz",
    "shaabaaj": "Shahbaz",
    # Other aaj endings
    "parvaaj": "Parwaz",
    "shiriyaaj": "Shiriyaz",
    "neeyaaj": "Niyaz",
    "dariyaaj": "Dariyaz",
    "gayaaj": "Ghiyaz",
    # ph→f remaining
    "phajulul": "Fazlul",
    "pharisaa": "Farisa",
    "mujaphar": "Muzaffar",
    # -uddin remaining
    "suphuddeen": "Sufuddin",
    "amaluddeen": "Amaluddin",
    "nasheeruddeen": "Nashiruddin",
    "buddeen": "Buddin",
    "baabuddeen": "Babuddin",
    # Sarwar
    "sarvar": "Sarwar",
    # Community name cleanup
    "doodekulaa": "Doodekula",
    # Mansoor OCR variants
    "mansood": "Mansur",
    "manasoor": "Mansur",
    # Quddus variant
    "khuddus": "Quddus",
    # Ramzan
    "ramajaan": "Ramzan",
    "ramajaanu": "Ramzan",
    # OCR artifact prefixes from voter-list page formatting — strip entirely
    # "pi." / "pi" = telugu "పి." rendering artifact (~24 voters)
    "pi.": "",
    "pi": "",
    # "pu" / "pu." = "పు." artifact (~9 voters)
    "pu": "",
    "pu.": "",
    # "ka" = trailing/leading "క" OCR fragment (~26 voters)
    "ka": "",
    # "ga" = "గ" OCR fragment (~13 voters)
    "ga": "",
    # ── Round 6 — dual-valid standardization (short-i convention) ──────────────
    # Already did: Kareem→Karim, Habeeb→Habib, Khaleel→Khalil, Jaleel→Jalil
    # Remaining names with long-ī (ي) written "ee" → standardize to single-i
    "shareef": "Sharif",        # شريف — 42 voters
    "raheem": "Rahim",          # رحيم — 20 voters
    "saleem": "Salim",          # سليم — 25 voters
    "rasheed": "Rashid",        # راشد — 11 voters
    "hameed": "Hamid",          # حميد — 9 voters
    "sameer": "Samir",          # سمير — 9 voters
    "yaseen": "Yasin",          # ياسين — 10 voters
    "basheer": "Bashir",        # بشير — 10 voters
    "majeed": "Majid",          # مجيد — 7 voters
    "najeer": "Nazir",          # نذير — 11 voters
    "ameer": "Amir",            # أمير — 14 voters
    "jameer": "Jamir",          # جمير — 7 voters
    # ── OCR character confusions ───────────────────────────────────────────────
    # "ర" (Ra) misread as "బ" (Ba) by OCR
    "baashid": "Rashid",        # 9 voters
    "baasheed": "Rashid",       # 3 voters
    # Double-b OCR for Abdul
    "abbul": "Abdul",           # 3 voters
    # Drop doubled aa in Khaleem
    "khaaleem": "Khalim",       # 6 voters
    # Hazrat title (OCR scramble)
    "hajarat": "Hazrat",        # 3 voters
    # Drop doubled aa in Assalam
    "assaalam": "Assalam",      # 2 voters
    # Basha OCR variant (baashu)
    "baashu": "Basha",          # 4 voters
    # Abeed (abh OCR)
    "abheed": "Abid",           # 2 voters — ee→i
    # Mahboob short OCR fragment
    "mahabu": "Mahbub",         # 2 voters
    # Pira / Piru — drop doubled ee (peer already → Pir; extend to -ra/-ru forms)
    "peera": "Pira",            # 10 voters
    "peeru": "Piru",            # 1 voter
    # Wazir (Telugu వ→V, fix to W)
    "vajeer": "Wazir",          # 4 voters
    # ── Abbreviation fixes ─────────────────────────────────────────────────────
    "es.di.": "S.D.",           # ఎస్.డి. — 5 voters
    "es.ke": "S.K.",            # ఎస్.కె — 2 voters
    "es.": "S.",                # ఎస్. — lone initial
    # ── Fused-name splits ──────────────────────────────────────────────────────
    "shaikjaanibaashaa": "Shaik Jani Basha",    # 4 voters
    "shaikjaani": "Shaik Jani",                 # 3 voters
    "shaikkareemullaa": "Shaik Karimulla",       # 3 voters
    "khaajaamohiddeen": "Khaja Mohiddin",        # 4 voters
    "alikhaan": "Ali Khan",                      # 2 voters
    # ── OCR garbage tokens → remove ────────────────────────────────────────────
    # 2–3 letter fragments never forming standalone Muslim names
    "sha": "",   # 11 voters
    "ta": "",    # 8 voters
    "na": "",    # 10 voters
    "ya": "",    # 6 voters
    "la": "",    # 5 voters
    "laa": "",   # 5 voters
    "aa": "",    # 4 voters
    "kaa": "",   # 4 voters
    "sa": "",    # 3 voters
    "ja": "",    # 3 voters
    "ti": "",    # 3 voters
    "pe": "",    # 3 voters
    "pa": "",    # 2 voters
    "shaa": "",  # 7 voters
    "ra": "",    # 2 voters
    "da": "",    # 2 voters
    "jai": "",   # 2 voters
    "jaa": "",   # 2 voters
    "naa": "",   # 2 voters
    "baa": "",   # 2 voters
    "cha": "",   # 7 voters
    "ke": "",    # 2 voters
    "el": "",    # 2 voters
    "lo": "",    # 2 voters
    "le": "",    # 2 voters
    "ru": "",    # 2 voters
    "ku": "",    # 2 voters
    "yu": "",    # 2 voters
    "ni": "",    # 2 voters
    "bu": "",    # 2 voters
    "yoo": "",   # 2 voters
    # Multi-char OCR noise clusters
    "kka": "",
    "gla": "",
    "tla": "",
    "shya": "",
    "shlo": "",
    "dda": "",
    "dri": "",
    "kra": "",
    "phra": "",
    "rma": "",
    "rta": "",
    "nna": "",
    "tya": "",
    "tamdri": "",
    "lalalalalalalalulsa": "",
    "ajnyar": "",
    "gum": "",
    # ── Round 7 ────────────────────────────────────────────────────────────────
    # Gouse — community spelling of غوث (42 voters; user-confirmed)
    "gaus": "Gouse",
    # Title / honorific long-vowel drops — consistent with Round 6 short-form convention
    "baaji": "Baji",             # 104 voters
    "jaani": "Jani",             # 65 voters
    "jaan": "Jan",               # 27 voters
    # Ahmad — drop doubled m from Telugu gemination (14 voters)
    "ahammad": "Ahmad",
    # Salam — drop doubled aa (13 voters)
    "salaam": "Salam",
    # Short-i convention for remaining -eer names (Round 6 extended)
    "muneer": "Munir",           # 4 voters
    "naseer": "Nasir",           # 4 voters
    "shameer": "Shamir",         # 2 voters
    # peeru. with trailing dot (4 voters; peeru without dot already → Piru)
    "peeru.": "Piru",
    # Rashid OCR variant — same B/R confusion as baasheed (2 voters)
    "basheed": "Rashid",
    # OCR dot-suffix abbreviation artifacts
    "ka.": "",    # 4 voters
    "ma.": "",    # 2 voters
    "di.": "",    # 2 voters
    "yamdi.": "", # 4 voters
    "yam.di.": "", # 2 voters
    # Short OCR noise syllables
    "ki": "",     # 4 voters
    "to": "",     # 2 voters
    "taa": "",    # 2 voters
    "tama": "",   # 2 voters
    "sphen": "",  # 2 voters
    "raka": "",   # 2 voters
    "kyaa": "",   # 2 voters
    "kee": "",    # 2 voters
    "inaa": "",   # 2 voters
    "ghan": "",   # 2 voters
    "ganna": "",  # 2 voters
    "enu": "",    # 2 voters
    "baru": "",   # 2 voters
    "gamte": "",  # 4 voters
    "gamti": "",  # 2 voters
    # ── Round 8 ────────────────────────────────────────────────────────────────
    # New rules
    "mustapha": "Mustafa",       # short-form variant (ph→f)
    "ayoob": "Ayub",             # 5 voters — oo→u
    "mansoor": "Mansur",         # 4 voters — oo→u
    "jabeer": "Jabir",           # 3 voters — ee→i
    "ameen": "Amin",             # 3 voters — ee→i
    "masood": "Masud",           # 3 voters — oo→u
    # OCR garbage tokens
    "peru": "",                  # 12 voters — Telugu word for "name" leaking into field
    "gaana": "",                 # 3 voters — Telugu word for "song"
    # ── Round 9 ────────────────────────────────────────────────────────────────
    # Nur / Rasul — oo→u standardization
    "noor": "Nur",               # 14 voters
    "rasool": "Rasul",           # 13 voters
    # Faruq — oo→u (phaarook path already changed above; this catches bare 'farooq' raw)
    "farooq": "Faruq",           # 4 voters
    # Arshad — OCR 'rh' for 'rsh'
    "arhad": "Arshad",           # 4 voters
    # ee→i for remaining names
    "aleem": "Alim",             # 3 voters
    "naim": "Naim",              # guard: keep if already Naim
    "shaheed": "Shahid",         # 2 voters
    "shameem": "Shamim",         # 2 voters
    # Maqbul — direct raw token (in case name_te produces 'Maqbool' directly)
    "maqbool": "Maqbul",
    # Fused names
    "amjibaabu": "Amji Babu",    # 2 voters
    "imaamsaa": "Imam Shah",     # 2 voters (Imam + Shah fused)
    # OCR single-letter and short noise tokens
    "g": "",   # 7 voters
    "k": "",   # 6 voters
    "e": "",   # 4 voters
    "l": "",   # 4 voters
    "lla": "", # 4 voters — OCR split of -ullah
    "i": "",   # 3 voters
    "t": "",   # 3 voters
    "s": "",   # 3 voters
    "kana": "", # 3 voters
    "aadi": "", # 2 voters — OCR garbage
    "yakoob": "Yakub",  # 2 voters — short raw form (yaakoob path already fixed)
    "abeed": "Abid",    # 2 voters — ee→i direct path
    "llaa": "", # 2 voters
    "m": "",   # 2 voters
    "ye": "",  # 2 voters
    "shi": "", # 2 voters
    "lala": "", # 2 voters
    "a": "",   # 2 voters
    "san": "", # 2 voters
    "illa": "", # 2 voters — OCR split of -ullah suffix
}


def _title_word(word: str) -> str:
    if not word:
        return word
    return word[0].upper() + word[1:]


def transliterate_te(text: str, placeholder: str = "") -> str:
    source = (text or "").replace("\u200c", "").replace("\u200d", "").strip()
    if not source or "నిర్ధారించాలి" in source:
        return placeholder

    out: list[str] = []
    i = 0
    while i < len(source):
        pair = source[i : i + 2]
        char = source[i]
        if pair in CONSONANTS:
            base = CONSONANTS[pair]
            i += 2
        elif char in CONSONANTS:
            base = CONSONANTS[char]
            i += 1
        elif char in INDEPENDENT:
            out.append(INDEPENDENT[char])
            i += 1
            continue
        elif char in VOWELS or char == VIRAMA:
            i += 1
            continue
        elif char in SIGNS:
            out.append(SIGNS[char])
            i += 1
            continue
        else:
            out.append(char)
            i += 1
            continue

        if i < len(source) and source[i] == VIRAMA:
            out.append(base)
            i += 1
        elif i < len(source) and source[i] in VOWELS:
            out.append(base + VOWELS[source[i]])
            i += 1
        else:
            out.append(base + "a")

    text_out = "".join(out)
    text_out = re.sub(r"\s+", " ", text_out).strip(" .,:;|-")
    text_out = " ".join(_title_word(part) for part in text_out.split(" "))
    for wrong, right in WORD_FIXES:
        text_out = text_out.replace(wrong, right)
    return text_out


def transliterate_person_name_te(text: str, placeholder: str = "") -> str:
    result = transliterate_te(text, placeholder)
    if not result:
        return result
    cleaned = result.replace("Yas.ke.", "S.K.").replace("Es.ke.", "S.K.").replace("S.ke.", "S.K.")
    tokens: list[str] = []
    for token in cleaned.split():
        bare = re.sub(r"[^A-Za-z.]", "", token).lower()
        if bare in {"sk", "s.k.", "ske"}:
            tokens.append("S.K.")
            continue
        tokens.append(PERSON_TOKEN_FIXES.get(bare, token))
    return " ".join(t for t in tokens if t).strip()
