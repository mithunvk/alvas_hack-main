"""
GitHub Service
Handles GitHub operations via PyGithub: branch creation, file updates, PR creation, workflow triggers.
"""

import os
from typing import Optional

try:
    from github import Github,GithubException
    PYGITHUB_AVAILABLE = True
except ImportError:
    PYGITHUB_AVAILABLE = False


def _get_github_client():
    """Initialize and return PyGithub client."""
    token = os.getenv("GITHUB_TOKEN", "")
    if not token or not PYGITHUB_AVAILABLE:
        return None
    return Github(token)


def _get_repo():
    """Get the configured GitHub repository."""
    client = _get_github_client()
    if not client:
        return None
    repo_name = os.getenv("GITHUB_REPO", "")
    if not repo_name:
        return None
    try:
        return client.get_repo(repo_name)
    except GithubException:
        return None


def create_fix_branch(branch_name: str, base_branch: str = "main") -> dict:
    """Create a new branch for the fix."""
    repo = _get_repo()
    if not repo:
        return _demo_branch_response(branch_name)

    try:
        base_ref = repo.get_branch(base_branch)
        repo.create_git_ref(
            ref=f"refs/heads/{branch_name}",
            sha=base_ref.commit.sha,
        )
        return {
            "success": True,
            "branch": branch_name,
            "base": base_branch,
            "message": f"Branch '{branch_name}' created from '{base_branch}'",
        }
    except GithubException as e:
        return {
            "success": False,
            "branch": branch_name,
            "message": f"Failed to create branch: {str(e)}",
        }


def update_file(
    branch: str,
    file_path: str,
    new_content: str,
    commit_message: str,
) -> dict:
    """Update a file in the repository on the specified branch."""
    repo = _get_repo()
    if not repo:
        return _demo_file_response(file_path, branch)

    try:
        # Get existing file to obtain its SHA
        existing = repo.get_contents(file_path, ref=branch)
        repo.update_file(
            path=file_path,
            message=commit_message,
            content=new_content,
            sha=existing.sha,
            branch=branch,
        )
        return {
            "success": True,
            "file": file_path,
            "branch": branch,
            "message": f"File '{file_path}' updated on branch '{branch}'",
        }
    except GithubException as e:
        return {
            "success": False,
            "file": file_path,
            "message": f"Failed to update file: {str(e)}",
        }


def create_pull_request(
    branch: str,
    title: str,
    body: str,
    base: str = "main",
) -> dict:
    """Create a pull request from the fix branch to the base branch."""
    repo = _get_repo()
    if not repo:
        return _demo_pr_response(branch, title)

    try:
        pr = repo.create_pull(
            title=title,
            body=body,
            head=branch,
            base=base,
        )
        return {
            "success": True,
            "pr_number": pr.number,
            "pr_url": pr.html_url,
            "title": title,
            "branch": branch,
            "message": f"Pull request #{pr.number} created",
        }
    except GithubException as e:
        return {
            "success": False,
            "message": f"Failed to create PR: {str(e)}",
        }


def trigger_workflow(workflow_file: str, branch: str = "main", inputs: Optional[dict] = None) -> dict:
    """Trigger a GitHub Actions workflow via workflow_dispatch."""
    repo = _get_repo()
    if not repo:
        return _demo_workflow_response(workflow_file, branch)

    try:
        workflow = repo.get_workflow(workflow_file)
        result = workflow.create_dispatch(ref=branch, inputs=inputs or {})
        return {
            "success": result,
            "workflow": workflow_file,
            "branch": branch,
            "message": f"Workflow '{workflow_file}' triggered on '{branch}'",
        }
    except GithubException as e:
        return {
            "success": False,
            "workflow": workflow_file,
            "message": f"Failed to trigger workflow: {str(e)}",
        }


def get_workflow_logs(run_id: int) -> str:
    """Fetch logs for a specific workflow run."""
    repo = _get_repo()
    if not repo:
        return "Demo mode: No live logs available. Configure GITHUB_TOKEN to fetch real logs."

    try:
        run = repo.get_workflow_run(run_id)
        # PyGithub doesn't directly support log download, return summary
        return f"Workflow Run #{run_id}\nStatus: {run.status}\nConclusion: {run.conclusion}\nURL: {run.html_url}"
    except GithubException:
        return f"Unable to fetch logs for run #{run_id}"


# ── Demo Mode Responses ──────────────────────────────────────────────

def _demo_branch_response(branch_name: str) -> dict:
    return {
        "success": True,
        "branch": branch_name,
        "base": "main",
        "message": f"[DEMO] Branch '{branch_name}' created (demo mode - configure GITHUB_TOKEN for live operations)",
    }


def _demo_file_response(file_path: str, branch: str) -> dict:
    return {
        "success": True,
        "file": file_path,
        "branch": branch,
        "message": f"[DEMO] File '{file_path}' updated on '{branch}' (demo mode)",
    }


def _demo_pr_response(branch: str, title: str) -> dict:
    return {
        "success": True,
        "pr_number": 99,
        "pr_url": "https://github.com/demo/repo/pull/99",
        "title": title,
        "branch": branch,
        "message": "[DEMO] Pull request #99 created (demo mode)",
    }


def _demo_workflow_response(workflow_file: str, branch: str) -> dict:
    return {
        "success": True,
        "workflow": workflow_file,
        "branch": branch,
        "message": f"[DEMO] Workflow '{workflow_file}' triggered (demo mode)",
    }
