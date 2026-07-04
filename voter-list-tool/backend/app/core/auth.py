from __future__ import annotations

import base64
import hashlib
import hmac
import time
from pathlib import Path
from fastapi import Header, HTTPException, status

from app.core.config import settings


TOKEN_TTL_SECONDS = 60 * 60 * 24 * 14
_CODE_FILE = Path("/app/data/access_code.txt")


def _live_codes() -> list[str]:
    """Read active codes from file override first, then fall back to env var."""
    if _CODE_FILE.exists():
        code = _CODE_FILE.read_text().strip()
        if code:
            return [code]
    return list(settings.access_codes)


def _sign(payload: str) -> str:
    return hmac.new(settings.token_secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


def create_token(code: str) -> str:
    payload = f"{code}:{int(time.time())}"
    body = base64.urlsafe_b64encode(payload.encode()).decode()
    return f"{body}.{_sign(body)}"


def verify_token(token: str) -> bool:
    try:
        body, sig = token.split(".", 1)
        if not hmac.compare_digest(sig, _sign(body)):
            return False
        payload = base64.urlsafe_b64decode(body.encode()).decode()
        code, issued = payload.rsplit(":", 1)
        return code in _live_codes() and time.time() - int(issued) <= TOKEN_TTL_SECONDS
    except Exception:
        return False


def require_auth(authorization: str | None = Header(default=None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="లాగిన్ అవసరం")
    if not verify_token(authorization.removeprefix("Bearer ").strip()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="సెషన్ గడువు ముగిసింది")
