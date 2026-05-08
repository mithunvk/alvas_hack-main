"""
Gemini AI Service
Analyzes CI/CD failure logs using Google's Gemini AI and returns structured fix suggestions.
"""

import json
import os
from typing import Optional

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


def _get_client():
    """Initialize and return the Gemini client."""
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or not GEMINI_AVAILABLE:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-1.5-flash")


ANALYSIS_PROMPT = """You are an expert DevOps engineer and CI/CD specialist. Analyze the following CI/CD failure log and provide a structured diagnosis.

**Repository:** {repo}
**Branch:** {branch}
**Error Summary:** {error_summary}

**Full Log Context:**
```
{log_content}
```

Respond with ONLY valid JSON in this exact format:
{{
  "issue_type": "missing_dependency | syntax_error | test_failure | config_error | build_error | runtime_error",
  "file_to_change": "path/to/file.ext",
  "change": "exact change or fix to apply",
  "risk": "low | medium | high",
  "explanation": "clear explanation of what went wrong and why this fix resolves it"
}}
"""


def analyze_failure(
    repo: str,
    branch: str,
    error_summary: str,
    log_content: str = "",
) -> dict:
    """
    Analyze a CI/CD failure using Gemini AI.
    Returns structured diagnosis or a demo response if Gemini is unavailable.
    """
    model = _get_client()

    if model is None:
        # Return a smart demo response based on the error summary
        return _generate_demo_diagnosis(error_summary)

    try:
        prompt = ANALYSIS_PROMPT.format(
            repo=repo,
            branch=branch,
            error_summary=error_summary,
            log_content=log_content or error_summary,
        )

        response = model.generate_content(prompt)
        text = response.text.strip()

        # Extract JSON from the response (handle markdown code blocks)
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        return json.loads(text)

    except Exception as e:
        return {
            "issue_type": "analysis_error",
            "file_to_change": "unknown",
            "change": f"Manual investigation needed: {str(e)}",
            "risk": "high",
            "explanation": f"Gemini AI analysis encountered an error: {str(e)}",
        }


def _generate_demo_diagnosis(error_summary: str) -> dict:
    """Generate a realistic demo diagnosis based on error patterns."""
    error_lower = (error_summary or "").lower()

    if "modulenotfounderror" in error_lower or "no module named" in error_lower:
        # Extract module name
        module = "unknown_module"
        if "'" in error_summary:
            parts = error_summary.split("'")
            if len(parts) >= 2:
                module = parts[1]
        return {
            "issue_type": "missing_dependency",
            "file_to_change": "requirements.txt",
            "change": f"{module}>=1.0.0",
            "risk": "low",
            "explanation": f"The '{module}' package is imported in the code but not listed in requirements.txt. Adding it as a dependency will resolve the ImportError.",
        }

    elif "syntaxerror" in error_lower:
        return {
            "issue_type": "syntax_error",
            "file_to_change": "src/main.py",
            "change": "Fix syntax error (likely missing bracket or parenthesis)",
            "risk": "low",
            "explanation": "A syntax error was detected. This is typically caused by a missing closing bracket, parenthesis, or incorrect indentation.",
        }

    elif "assertionerror" in error_lower or "failed" in error_lower:
        return {
            "issue_type": "test_failure",
            "file_to_change": "tests/test_main.py",
            "change": "Update test assertions to match current implementation",
            "risk": "medium",
            "explanation": "Test assertions don't match the current code behavior. Either the test or the implementation needs to be updated.",
        }

    else:
        return {
            "issue_type": "build_error",
            "file_to_change": "pyproject.toml",
            "change": "Review build configuration and dependencies",
            "risk": "medium",
            "explanation": "A build error occurred. Review the build configuration, dependency versions, and ensure all required files are present.",
        }
