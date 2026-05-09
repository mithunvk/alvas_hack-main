import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// ── Events & Stats ─────────────────────────────────────────

export const getEvents = (limit = 50) =>
  api.get(`/events?limit=${limit}`).then(r => r.data);

export const getEvent = (eventId) =>
  api.get(`/events/${eventId}`).then(r => r.data);

export const getStats = () =>
  api.get('/stats').then(r => r.data);

// ── Webhook ─────────────────────────────────────────────────

export const sendWebhook = (payload) =>
  api.post('/webhook/github', payload).then(r => r.data);

// ── AI Agent ────────────────────────────────────────────────

export const triggerAgent = (eventId, logContent = '') =>
  api.post('/trigger/agent', { event_id: eventId, log_content: logContent }).then(r => r.data);

// ── Apply Fix ───────────────────────────────────────────────

export const applyFix = (eventId, fileToChange = null, changeContent = null) =>
  api.post('/apply/fix', {
    event_id: eventId,
    file_to_change: fileToChange,
    change_content: changeContent,
  }).then(r => r.data);

// ── Deployment ──────────────────────────────────────────────

export const deployStaging = (branch = 'main', commitSha = null) =>
  api.post('/deploy/staging', { branch, commit_sha: commitSha }).then(r => r.data);

export const deployProduction = (branch = 'main', approved = false, approvedBy = '') =>
  api.post('/deploy/prod', { branch, approved, approved_by: approvedBy }).then(r => r.data);

export const getConfig = () =>
  api.get('/config').then(r => r.data);

export const getCurrentBranch = () =>
  api.get('/git/branch').then(r => r.data);

export const getDeployStatus = () =>
  api.get('/deploy/status').then(r => r.data);

// ── Health ──────────────────────────────────────────────────

export const getHealth = () =>
  api.get('/health').then(r => r.data);

export default api;
