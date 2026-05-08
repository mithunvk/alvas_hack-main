"""
Agent Route
Triggers AI analysis of CI/CD failures using Gemini AI.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.event_store import get_event_by_id, update_event
from services.gemini_service import analyze_failure

router = APIRouter()


class AgentTrigger(BaseModel):
    """Payload to trigger AI analysis."""
    event_id: str
    log_content: Optional[str] = None


@router.post("/trigger/agent")
async def trigger_agent(payload: AgentTrigger):
    """
    Analyze a CI/CD failure using Gemini AI.
    Takes an event_id, fetches the event, analyzes the failure, and stores the diagnosis.
    """
    event = get_event_by_id(payload.event_id)
    if not event:
        return {
            "status": "error",
            "message": f"Event '{payload.event_id}' not found",
        }

    if event.get("status") != "failure":
        return {
            "status": "skipped",
            "message": f"Event '{payload.event_id}' is not a failure (status: {event.get('status')})",
        }

    # Analyze with Gemini AI
    diagnosis = analyze_failure(
        repo=event.get("repo", ""),
        branch=event.get("branch", ""),
        error_summary=event.get("error_summary", ""),
        log_content=payload.log_content or event.get("error_summary", ""),
    )

    # Store diagnosis in the event
    updated = update_event(payload.event_id, {"diagnosis": diagnosis})

    return {
        "status": "analyzed",
        "event_id": payload.event_id,
        "diagnosis": diagnosis,
        "message": f"AI analysis complete: {diagnosis.get('issue_type', 'unknown')} ({diagnosis.get('risk', 'unknown')} risk)",
    }
