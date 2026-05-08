import { useState, useEffect } from 'react';
import { ScrollText, Search, Filter, RefreshCw, Download } from 'lucide-react';
import EventRow from '../components/EventRow';
import { getEvents } from '../api/client';

const demoEvents = [
  { id: 'evt_001', timestamp: '2026-05-08T10:15:30Z', type: 'workflow_run', status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/auth-module', commit_sha: 'a3f7c2e', commit_message: 'Add user authentication module', error_summary: "ModuleNotFoundError: No module named 'bcrypt'", diagnosis: { issue_type: 'missing_dependency' } },
  { id: 'evt_002', timestamp: '2026-05-08T11:22:00Z', type: 'workflow_run', status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/api-endpoints', commit_sha: 'b8d1f4a', commit_message: 'Update API endpoint handlers', diagnosis: { issue_type: 'syntax_error' } },
  { id: 'evt_003', timestamp: '2026-05-08T12:05:45Z', type: 'workflow_run', status: 'success', repo: 'monk-mh/alvas_hack', branch: 'main', commit_sha: 'c9e2b5d', commit_message: 'Merge PR #42: Fix missing bcrypt dependency' },
  { id: 'evt_004', timestamp: '2026-05-08T12:30:00Z', type: 'deployment', status: 'success', repo: 'monk-mh/alvas_hack', branch: 'main', commit_sha: 'c9e2b5d', commit_message: 'Deploy to staging after successful CI' },
  { id: 'evt_005', timestamp: '2026-05-08T12:45:10Z', type: 'workflow_run', status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/database-migration', commit_sha: 'd4f8a1c', commit_message: 'Add database migration scripts', diagnosis: { issue_type: 'test_failure' } },
  { id: 'evt_006', timestamp: '2026-05-08T13:00:00Z', type: 'workflow_run', status: 'running', repo: 'monk-mh/alvas_hack', branch: 'feature/caching-layer', commit_sha: 'e5g9b2d', commit_message: 'Implement Redis caching layer' },
];

export default function EventLogs() {
  const [events, setEvents] = useState(demoEvents);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getEvents(100);
      if (data.events?.length > 0) setEvents(data.events);
    } catch (err) { /* demo */ }
    finally { setLoading(false); }
  };

  const filtered = events
    .filter(e => typeFilter === 'all' || e.type === typeFilter)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .filter(e => !search || (e.commit_message || '').toLowerCase().includes(search.toLowerCase()) || (e.branch || '').toLowerCase().includes(search.toLowerCase()) || (e.id || '').toLowerCase().includes(search.toLowerCase()));

  const types = [...new Set(events.map(e => e.type))];
  const statuses = [...new Set(events.map(e => e.status))];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ScrollText className="w-7 h-7 text-neon-cyan" />Event Logs
          </h1>
          <p className="text-sm text-gray-500 mt-1">Complete timeline of all CI/CD events and system actions</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEvents} className="btn-primary flex items-center gap-2 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
          <button className="btn-primary flex items-center gap-2 text-xs">
            <Download className="w-3.5 h-3.5" />Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-600 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/30" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-1.5 bg-dark-600 border border-white/10 rounded-lg text-xs text-white focus:outline-none">
            <option value="all">All Types</option>
            {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-1.5 bg-dark-600 border border-white/10 rounded-lg text-xs text-white focus:outline-none">
            <option value="all">All Status</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <span className="text-xs text-gray-500 ml-auto">{filtered.length} of {events.length} events</span>
      </div>

      {/* Events List */}
      <div className="glass-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <ScrollText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No events match your filters</p>
          </div>
        ) : (
          filtered.map(event => <EventRow key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
