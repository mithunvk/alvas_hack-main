import { useState, useEffect } from 'react';
import { GitBranch, Filter, RefreshCw, Search } from 'lucide-react';
import PipelineCard from '../components/PipelineCard';
import { getEvents, triggerAgent, applyFix } from '../api/client';

const demoEvents = [
  {
    id: 'evt_001', timestamp: '2026-05-08T10:15:30Z', type: 'workflow_run',
    status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/auth-module',
    commit_sha: 'a3f7c2e', commit_message: 'Add user authentication module',
    log_url: '#', error_summary: "ModuleNotFoundError: No module named 'bcrypt'",
    diagnosis: { issue_type: 'missing_dependency', file_to_change: 'requirements.txt', change: 'bcrypt==4.1.3', risk: 'low', explanation: "bcrypt not in requirements.txt." },
    fix_pr: { number: 42, url: '#', status: 'merged' },
  },
  {
    id: 'evt_002', timestamp: '2026-05-08T11:22:00Z', type: 'workflow_run',
    status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/api-endpoints',
    commit_sha: 'b8d1f4a', commit_message: 'Update API endpoint handlers',
    log_url: '#', error_summary: 'SyntaxError: unexpected EOF in routes/api.py line 47',
    diagnosis: { issue_type: 'syntax_error', file_to_change: 'routes/api.py', change: 'Add missing parenthesis', risk: 'low', explanation: 'Missing closing parenthesis.' },
    fix_pr: { number: 43, url: '#', status: 'open' },
  },
  {
    id: 'evt_003', timestamp: '2026-05-08T12:05:45Z', type: 'workflow_run',
    status: 'success', repo: 'monk-mh/alvas_hack', branch: 'main',
    commit_sha: 'c9e2b5d', commit_message: 'Merge PR #42: Fix missing bcrypt dependency',
  },
  {
    id: 'evt_005', timestamp: '2026-05-08T12:45:10Z', type: 'workflow_run',
    status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/database-migration',
    commit_sha: 'd4f8a1c', commit_message: 'Add database migration scripts',
    error_summary: "FAILED tests/test_db.py - AssertionError: Table 'users' schema mismatch",
    diagnosis: { issue_type: 'test_failure', file_to_change: 'migrations/002_add_users.py', change: 'Update VARCHAR(50) to VARCHAR(255)', risk: 'medium', explanation: 'Schema mismatch.' },
  },
  {
    id: 'evt_006', timestamp: '2026-05-08T13:00:00Z', type: 'workflow_run',
    status: 'running', repo: 'monk-mh/alvas_hack', branch: 'feature/caching-layer',
    commit_sha: 'e5g9b2d', commit_message: 'Implement Redis caching layer',
  },
];

export default function PipelineMonitor() {
  const [events, setEvents] = useState(demoEvents);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents(50);
      if (data.events?.length > 0) setEvents(data.events);
    } catch (err) { /* demo data */ }
    finally { setLoading(false); }
  };

  const handleAnalyze = async (eventId) => {
    try {
      const result = await triggerAgent(eventId);
      if (result.diagnosis) {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, diagnosis: result.diagnosis } : e));
      }
    } catch (err) { console.error('Analysis failed'); }
  };

  const handleApplyFix = async (eventId) => {
    try {
      const result = await applyFix(eventId);
      if (result.pull_request) {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, fix_pr: { number: result.pull_request.pr_number, url: result.pull_request.pr_url, status: 'open' } } : e));
      }
    } catch (err) { console.error('Fix failed'); }
  };

  const filtered = events
    .filter(e => filter === 'all' || e.status === filter)
    .filter(e => !search || (e.commit_message || '').toLowerCase().includes(search.toLowerCase()) || (e.branch || '').toLowerCase().includes(search.toLowerCase()));

  const counts = { all: events.length, failure: events.filter(e => e.status === 'failure').length, success: events.filter(e => e.status === 'success').length, running: events.filter(e => e.status === 'running').length };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <GitBranch className="w-7 h-7 text-neon-cyan" />Pipeline Monitor
          </h1>
          <p className="text-sm text-gray-500 mt-1">Monitor all CI/CD pipeline runs in real-time</p>
        </div>
        <button onClick={fetchEvents} className="btn-primary flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="glass-card p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {['all', 'failure', 'success', 'running'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${filter === f
                ? f === 'failure' ? 'bg-neon-red/10 text-neon-red border-neon-red/30' : f === 'success' ? 'bg-neon-green/10 text-neon-green border-neon-green/30' : f === 'running' ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/30' : 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5 border-transparent'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search pipelines..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-600 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/30" />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center"><GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-3" /><p className="text-gray-400">No pipeline runs match your filters</p></div>
        ) : filtered.map(event => (
          <PipelineCard key={event.id} event={event} onAnalyze={handleAnalyze} onApplyFix={handleApplyFix} />
        ))}
      </div>
    </div>
  );
}
