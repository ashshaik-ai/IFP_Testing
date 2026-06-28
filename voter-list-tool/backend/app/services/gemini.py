from __future__ import annotations

import base64
import json
import time
from pathlib import Path
from typing import Any

import httpx

from app.core.config import settings


PROMPT_TE = """
ఈ చిత్రం ఒకే తెలుగు ఓటర్ కార్డు. కనిపిస్తున్న వివరాలను మాత్రమే చదవండి.
JSON మాత్రమే ఇవ్వండి. అంచనా వేసిన విలువలు పెట్టొద్దు.
క్షేత్రాలు: serial_no, card_no, name_te, name_en, relation_label_te,
relation_name_te, age, occupation_te, house_no, area_te, area_en, raw_text,
confidence, needs_review.
తెలుగు విలువలను తెలుగులోనే ఉంచండి. name_en మరియు area_en కోసం చదవగలిగితే
సాధారణ English transliteration ఇవ్వండి.
area_te కోసం కార్డు లోని "నివాసం" / residence / locality విలువ మాత్రమే ఇవ్వండి.
పేజీ పైభాగంలోని సంస్థ పేరు, శీర్షిక, సంవత్సరం, గ్రామం లేదా మండలాన్ని area_te గా పెట్టొద్దు.
""".strip()

AREA_PROMPT_TE = """
ఈ చిత్రం ఓటర్ జాబితా పేజీ పైభాగం. ఇందులో కనిపించే ప్రాంతం, వార్డు,
బూత్ లేదా locality పేరును గుర్తించండి. JSON మాత్రమే ఇవ్వండి.
క్షేత్రాలు: area_te, area_en, ward_no, raw_text, confidence.
తెలుగు పేరును తెలుగులోనే ఉంచండి.
""".strip()

PAGE_CARDS_PROMPT_TE = """
ఇది ఒక తెలుగు ఓటరు జాబితా పేజీ. ఈ పేజీలో ఉన్న ప్రతి ఓటరు కార్డును ఎడమ నుండి కుడి, పై నుండి కింది వరుస క్రమంలో చదవండి.
JSON మాత్రమే ఇవ్వండి. ఫలితం ఈ ఆకారంలో ఉండాలి:
{
  "voters": [
    {
      "serial_no": "",
      "card_no": "",
      "name_te": "",
      "name_en": "",
      "relation_label_te": "తండ్రి/భర్త",
      "relation_name_te": "",
      "age": "",
      "occupation_te": "",
      "house_no": "",
      "area_te": "",
      "area_en": "",
      "raw_text": "",
      "confidence": 0.0,
      "needs_review": false
    }
  ]
}

నియమాలు:
- ప్రతి కార్డుకు ఒకే రికార్డు ఇవ్వండి.
- కనిపించే విలువలు మాత్రమే ఇవ్వండి. కానీ ఫీల్డ్ ఖాళీగా వదిలేయొద్దు, కార్డులో కనిపించే దగ్గరలోని సరైన విలువను చదవడానికి రెండుసార్లు ప్రయత్నించండి.
- తెలుగు విలువలు తెలుగు లిపిలోనే ఇవ్వండి.
- `name_en` మరియు `area_en` కు సరళమైన English transliteration ఇవ్వండి.
- `house_no` లో ఇం.నెం./వార్డు విలువ ఇవ్వండి.
- `area_te` లో `నివాసం` పంక్తి విలువ మాత్రమే ఇవ్వండి.
- రద్దు చేసిన కార్డులకు కూడా రికార్డు ఇవ్వండి, కానీ ఖాళీగా కనిపించే ఫీల్డులను మాత్రమే ఖాళీగా ఉంచండి.
""".strip()


class GeminiRotator:
    def __init__(self) -> None:
        self.cooldowns: dict[str, float] = {}

    def _available_keys(self) -> list[str]:
        now = time.time()
        return [key for key in settings.gemini_api_keys if self.cooldowns.get(key, 0) <= now]

    async def extract_card(self, image_path: Path) -> dict[str, Any]:
        return await self.extract_json(image_path, PROMPT_TE)

    async def extract_page_area(self, image_path: Path) -> dict[str, Any]:
        return await self.extract_json(image_path, AREA_PROMPT_TE)

    async def extract_page_cards(self, image_path: Path) -> list[dict[str, Any]]:
        data = await self.extract_json(image_path, PAGE_CARDS_PROMPT_TE)
        if isinstance(data, dict):
            voters = data.get("voters", [])
            if isinstance(voters, list):
                return [item for item in voters if isinstance(item, dict)]
        return []

    async def extract_json(self, image_path: Path, prompt: str) -> dict[str, Any]:
        keys = self._available_keys()
        if not keys:
            raise RuntimeError("Gemini API keys అందుబాటులో లేవు")
        errors: list[str] = []
        for key in keys:
            try:
                return await self._call_gemini(key, image_path, prompt)
            except Exception as exc:
                errors.append(str(exc))
                if any(code in str(exc) for code in ("429", "403", "quota", "rate")):
                    self.cooldowns[key] = time.time() + 60 * 10
        raise RuntimeError("; ".join(errors) or "Gemini OCR విఫలమైంది")

    async def _call_gemini(self, key: str, image_path: Path, prompt: str) -> dict[str, Any]:
        image_b64 = base64.b64encode(image_path.read_bytes()).decode()
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={key}"
        )
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {"inline_data": {"mime_type": "image/png", "data": image_b64}},
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0,
            },
        }
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(url, json=payload)
        if response.status_code >= 400:
            raise RuntimeError(f"Gemini {response.status_code}: {response.text[:300]}")
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)


gemini_rotator = GeminiRotator()
