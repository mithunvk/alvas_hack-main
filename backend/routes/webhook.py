"""
Webhook Route
Receives GitHub webhook events (workflow_run, check_suite, push) and stores them.
"""

from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from services.event_store import add_event, load_events, get_recent_events

router = APIRouter()


class WebhookPayload(BaseModel):
    """Manual webhook trigger payload for testing."""
    event_type: str = "workflow_run"
    status: str = "failure"
    repo: str = "monk-mh/alvas_hack"
    branch: str = "main"
    commit_sha: str = ""
    commit_message: str = ""
    log_url: Optional[str] = None
    error_summary: Optional[str] = None


@router.post("/webhook/github")
async def receive_github_webhook(request: Request):
    """
    Receive GitHub webhook events.
    Handles both real GitHub webhook payloads and manual test payloads.
    """
    try:
        payload = await request.json()
    except Exception:
        return {"status": "error", "message": "Invalid JSON payload"}

    # Detect if this is a real GitHub webhook or a manual trigger
    if "action" in payload and "workflow_run" in payload:
        # Real GitHub webhook — workflow_run event
        wf_run = payload["workflow_run"]
        event = add_event(
            event_type="workflow_run",
            status=wf_run.get("conclusion", wf_run.get("status", "unknown")),
            repo=payload.get("repository", {}).get("full_name", "unknown"),
            branch=wf_run.get("head_branch", "unknown"),
            commit_sha=wf_run.get("head_sha", "")[:7],
            commit_message=wf_run.get("display_title", ""),
            log_url=wf_run.get("html_url"),
            error_summary=None if wf_run.get("conclusion") == "success" else f"Workflow '{wf_run.get('name')}' failed",
        )
    elif "action" in payload and "check_suite" in payload:
        # Real GitHub webhook — check_suite event
        suite = payload["check_suite"]
        event = add_event(
            event_type="check_suite",
            status=suite.get("conclusion", suite.get("status", "unknown")),
            repo=payload.get("repository", {}).get("full_name", "unknown"),
            branch=suite.get("head_branch", "unknown"),
            commit_sha=suite.get("head_sha", "")[:7],
            commit_message="Check suite " + suite.get("status", ""),
            log_url=None,
            error_summary=None if suite.get("conclusion") == "success" else "Check suite failed",
        )
    else:
        # Manual trigger / test payload
        event = add_event(
            event_type=payload.get("event_type", "manual"),
            status=payload.get("status", "unknown"),
            repo=payload.get("repo", "unknown"),
            branch=payload.get("branch", "unknown"),
            commit_sha=payload.get("commit_sha", ""),
            commit_message=payload.get("commit_message", ""),
            log_url=payload.get("log_url"),
            error_summary=payload.get("error_summary"),
        )

    return {
        "status": "received",
        "event_id": event["id"],
        "message": f"Event stored: {event['type']} - {event['status']}",
    }


@router.get("/events")
async def get_events(limit: int = 50):
    """Get recent events."""
    return {"events": get_recent_events(limit)}


@router.get("/events/{event_id}")
async def get_event(event_id: str):
    """Get a specific event by ID."""
    from services.event_store import get_event_by_id
    event = get_event_by_id(event_id)
    if not event:
        return {"status": "error", "message": f"Event '{event_id}' not found"}
    return {"event": event}


@router.get("/stats")
async def get_stats():
    """Get dashboard statistics."""
    events = load_events()
    total = len(events)
    failures = len([e for e in events if e.get("status") == "failure"])
    successes = len([e for e in events if e.get("status") == "success"])
    running = len([e for e in events if e.get("status") == "running"])
    ai_fixes = len([e for e in events if e.get("diagnosis") is not None])
    prs_created = len([e for e in events if e.get("fix_pr") is not None])
    deployments = len([e for e in events if e.get("type") == "deployment"])

    return {
        "total_pipelines": total,
        "failures": failures,
        "successes": successes,
        "running": running,
        "ai_fixes": ai_fixes,
        "prs_created": prs_created,
        "deployments": deployments,
    }
