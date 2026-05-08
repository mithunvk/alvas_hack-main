"""
Event Store Service
Manages reading and writing CI/CD events to data/events.json
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
EVENTS_FILE = os.path.join(DATA_DIR, "events.json")


def _ensure_data_dir():
    """Ensure the data directory and events file exist."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(EVENTS_FILE):
        with open(EVENTS_FILE, "w") as f:
            json.dump([], f)


def load_events() -> list[dict]:
    """Load all events from the JSON store."""
    _ensure_data_dir()
    try:
        with open(EVENTS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return []


def save_events(events: list[dict]):
    """Save events list to the JSON store."""
    _ensure_data_dir()
    with open(EVENTS_FILE, "w") as f:
        json.dump(events, f, indent=2, default=str)


def add_event(
    event_type: str,
    status: str,
    repo: str,
    branch: str,
    commit_sha: str = "",
    commit_message: str = "",
    log_url: Optional[str] = None,
    error_summary: Optional[str] = None,
) -> dict:
    """Create and store a new event."""
    events = load_events()
    event = {
        "id": f"evt_{uuid.uuid4().hex[:6]}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "type": event_type,
        "status": status,
        "repo": repo,
        "branch": branch,
        "commit_sha": commit_sha,
        "commit_message": commit_message,
        "log_url": log_url,
        "error_summary": error_summary,
        "diagnosis": None,
        "fix_pr": None,
    }
    events.insert(0, event)
    save_events(events)
    return event


def get_event_by_id(event_id: str) -> Optional[dict]:
    """Find an event by its ID."""
    events = load_events()
    for event in events:
        if event["id"] == event_id:
            return event
    return None


def update_event(event_id: str, updates: dict) -> Optional[dict]:
    """Update an existing event with new data."""
    events = load_events()
    for i, event in enumerate(events):
        if event["id"] == event_id:
            events[i].update(updates)
            save_events(events)
            return events[i]
    return None


def get_events_by_status(status: str) -> list[dict]:
    """Get all events with a specific status."""
    return [e for e in load_events() if e.get("status") == status]


def get_recent_events(limit: int = 20) -> list[dict]:
    """Get the most recent events."""
    return load_events()[:limit]
