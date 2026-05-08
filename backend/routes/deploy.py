"""
Deploy Route
Manages deployment orchestration for staging and production environments.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.event_store import add_event
from services.github_service import trigger_workflow

router = APIRouter()


class DeployPayload(BaseModel):
    """Deployment request payload."""
    branch: str = "main"
    commit_sha: Optional[str] = None


class ProdDeployPayload(BaseModel):
    """Production deployment requires explicit approval."""
    branch: str = "main"
    commit_sha: Optional[str] = None
    approved: bool = False
    approved_by: Optional[str] = None


@router.post("/deploy/staging")
async def deploy_staging(payload: DeployPayload):
    """
    Trigger a staging deployment.
    Dispatches the deploy-staging workflow and logs the event.
    """
    result = trigger_workflow(
        workflow_file="deploy-staging.yaml",
        branch=payload.branch,
        inputs={"environment": "staging"},
    )

    # Log deployment event
    event = add_event(
        event_type="deployment",
        status="running" if result.get("success") else "failure",
        repo=f"monk-mh/alvas_hack",
        branch=payload.branch,
        commit_sha=payload.commit_sha or "",
        commit_message=f"Staging deployment triggered for {payload.branch}",
    )

    return {
        "status": "triggered",
        "environment": "staging",
        "event_id": event["id"],
        "workflow_result": result,
        "message": f"Staging deployment triggered on branch '{payload.branch}'",
    }


@router.post("/deploy/prod")
async def deploy_production(payload: ProdDeployPayload):
    """
    Trigger a production deployment.
    Requires explicit approval (approved=true) as a safety gate.
    """
    if not payload.approved:
        return {
            "status": "pending_approval",
            "environment": "production",
            "message": "Production deployment requires manual approval. Set approved=true to proceed.",
        }

    result = trigger_workflow(
        workflow_file="deploy-prod.yaml",
        branch=payload.branch,
        inputs={
            "environment": "production",
            "approved_by": payload.approved_by or "unknown",
        },
    )

    # Log deployment event
    event = add_event(
        event_type="deployment",
        status="running" if result.get("success") else "failure",
        repo=f"monk-mh/alvas_hack",
        branch=payload.branch,
        commit_sha=payload.commit_sha or "",
        commit_message=f"Production deployment approved by {payload.approved_by or 'unknown'}",
    )

    return {
        "status": "triggered",
        "environment": "production",
        "event_id": event["id"],
        "approved_by": payload.approved_by,
        "workflow_result": result,
        "message": f"Production deployment triggered on branch '{payload.branch}'",
    }


@router.get("/deploy/status")
async def deployment_status():
    """Get current deployment status for both environments."""
    from services.event_store import load_events

    events = load_events()
    deployments = [e for e in events if e.get("type") == "deployment"]

    staging = next(
        (e for e in deployments if "staging" in (e.get("commit_message") or "").lower()),
        None,
    )
    production = next(
        (e for e in deployments if "production" in (e.get("commit_message") or "").lower()),
        None,
    )

    return {
        "staging": {
            "status": staging.get("status") if staging else "not_deployed",
            "last_deployed": staging.get("timestamp") if staging else None,
            "branch": staging.get("branch") if staging else None,
        },
        "production": {
            "status": production.get("status") if production else "not_deployed",
            "last_deployed": production.get("timestamp") if production else None,
            "branch": production.get("branch") if production else None,
        },
    }
