"""
LaunchLoop — AI-Powered Agentic CI/CD Automation Platform
FastAPI Backend Entry Point
"""

import os
import sys

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

# Add backend root to Python path for imports
sys.path.insert(0, os.path.dirname(__file__))

from routes.webhook import router as webhook_router
from routes.agent import router as agent_router
from routes.fix import router as fix_router
from routes.deploy import router as deploy_router

# ── App Initialization ───────────────────────────────────────────────

app = FastAPI(
    title="LaunchLoop",
    description="AI-Powered Agentic CI/CD Automation Platform — Backend API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ───────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Route Registration ───────────────────────────────────────────────

app.include_router(webhook_router, tags=["Webhooks & Events"])
app.include_router(agent_router, tags=["AI Agent"])
app.include_router(fix_router, tags=["Auto-Fix"])
app.include_router(deploy_router, tags=["Deployment"])


# ── Root Endpoint ─────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "name": "LaunchLoop",
        "version": "1.0.0",
        "status": "operational",
        "description": "AI-Powered Agentic CI/CD Automation Platform",
        "docs": "/docs",
        "endpoints": {
            "webhook": "POST /webhook/github",
            "agent": "POST /trigger/agent",
            "fix": "POST /apply/fix",
            "deploy_staging": "POST /deploy/staging",
            "deploy_prod": "POST /deploy/prod",
            "events": "GET /events",
            "stats": "GET /stats",
        },
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "github_configured": bool(os.getenv("GITHUB_TOKEN")),
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }


# ── Run Server ────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
