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
