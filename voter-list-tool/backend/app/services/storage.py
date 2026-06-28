from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import settings


def ensure_data_dir() -> Path:
    settings.data_dir.mkdir(parents=True, exist_ok=True)
    return settings.data_dir


def job_dir(job_id: str) -> Path:
    path = ensure_data_dir() / "jobs" / job_id
    path.mkdir(parents=True, exist_ok=True)
    (path / "cards").mkdir(exist_ok=True)
    (path / "photos").mkdir(exist_ok=True)
    return path


def read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def jobs_index_path() -> Path:
    return ensure_data_dir() / "jobs.json"


def load_jobs() -> list[dict[str, Any]]:
    return read_json(jobs_index_path(), [])


def save_jobs(jobs: list[dict[str, Any]]) -> None:
    write_json(jobs_index_path(), jobs)


def job_meta_path(job_id: str) -> Path:
    return job_dir(job_id) / "job.json"


def voters_path(job_id: str) -> Path:
    return job_dir(job_id) / "voters.json"
