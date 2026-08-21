from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


def _resolve_env_path(value: str, fallback: Path) -> Path:
    raw = (value or "").strip()
    if not raw:
        return fallback.resolve()
    path = Path(raw)
    if not path.is_absolute():
        path = BACKEND_ROOT / path
    return path.resolve()


class Settings:
    app_name = "IFP Voter List Tool"
    data_dir = _resolve_env_path(os.getenv("VOTER_TOOL_DATA_DIR", ""), BACKEND_ROOT / "data")
    access_codes = [
        code.strip()
        for code in os.getenv("VOTER_APP_CODES", "ifp-private-2026").split(",")
        if code.strip()
    ]
    token_secret = os.getenv("VOTER_APP_SECRET", "change-this-secret-before-hosting")
    cors_origins = [
        origin.strip()
        for origin in os.getenv(
            "VOTER_CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000",
        ).split(",")
        if origin.strip()
    ]
    gemini_api_keys = [
        key.strip()
        for key in os.getenv("GEMINI_API_KEYS", "").split(",")
        if key.strip()
    ]
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    demo_ocr = os.getenv("VOTER_DEMO_OCR", "true").lower() in {"1", "true", "yes"}
    auto_sequence_serials = os.getenv("VOTER_AUTO_SEQUENCE_SERIALS", "false").lower() in {"1", "true", "yes"}
    ocr_provider = os.getenv("VOTER_OCR_PROVIDER", "local").lower()
    tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    tessdata_prefix = _resolve_env_path(os.getenv("TESSDATA_PREFIX", ""), data_dir / "tessdata")


settings = Settings()
