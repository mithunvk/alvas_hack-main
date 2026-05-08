import { useState, useEffect } from 'react';
import {
  Activity, GitBranch, Brain, Rocket, AlertTriangle, CheckCircle2,
  TrendingUp, Zap, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import EventRow from '../components/EventRow';
import { getStats, getEvents } from '../api/client';

// Demo data fallback
const demoStats = {
  total_pipelines: 6,
  failures: 3,
  successes: 2,
  running: 1,
  ai_fixes: 3,
  prs_created: 2,
  deployments: 1,
};

const demoEvents = [
  {
    id: 'evt_001', timestamp: '2026-05-08T10:15:30Z', type: 'workflow_run',
    status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/auth-module',
    commit_sha: 'a3f7c2e', commit_message: 'Add user authentication module',
    error_summary: "ModuleNotFoundError: No module named 'bcrypt'",
    diagnosis: { issue_type: 'missing_dependency', file_to_change: 'requirements.txt', change: 'bcrypt==4.1.3', risk: 'low' },
    fix_pr: { number: 42, url: '#', status: 'merged' }
  },
  {
    id: 'evt_002', timestamp: '2026-05-08T11:22:00Z', type: 'workflow_run',
    status: 'failure', repo: 'monk-mh/alvas_hack', branch: 'feature/api-endpoints',
    commit_sha: 'b8d1f4a', commit_message: 'Update API endpoint handlers',
    error_summary: 'SyntaxError: unexpected EOF in routes/api.py line 47',
    diagnosis: { issue_type: 'syntax_error', file_to_change: 'routes/api.py', change: 'Add missing parenthesis', risk: 'low' },
    fix_pr: { number: 43, url: '#', status: 'open' }
  },
  {
    id: 'evt_003', timestamp: '2026-05-08T12:05:45Z', type: 'workflow_run',
    status: 'success', repo: 'monk-mh/alvas_hack', branch: 'main',
    commit_sha: 'c9e2b5d', commit_message: 'Merge PR #42: Fix missing bcrypt dependency',
  },
  {
    id: 'evt_004', timestamp: '2026-05-08T12:30:00Z', type: 'deployment',
    status: 'success', repo: 'monk-mh/alvas_hack', branch: 'main',
    commit_sha: 'c9e2b5d', commit_message: 'Deploy to staging after successful CI',
  },
  {
    id: 'evt_006', timestamp: '2026-05-08T13:00:00Z', type: 'workflow_run',
    status: 'running', repo: 'monk-mh/alvas_hack', branch: 'feature/caching-layer',
    commit_sha: 'e5g9b2d', commit_message: 'Implement Redis caching layer',
  },
];

export default function Dashboard() {
  const [stats, setStats] = useState(demoStats);
  const [events, setEvents] = useState(demoEvents);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          getStats(),
          getEvents(10),
        ]);
        setStats(statsData);
        if (eventsData.events?.length > 0) setEvents(eventsData.events);
      } catch (err) {
        // Use demo data
        console.log('Using demo data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const failedEvents = events.filter(e => e.status === 'failure');
  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-7 h-7 text-neon-cyan" />
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 mt-1">Real-time CI/CD pipeline monitoring and AI-driven insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-green/5 border border-neon-green/20">
            <div className="status-dot-success" />
            <span className="text-xs text-neon-green font-medium">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Pipelines"
          value={stats.total_pipelines}
          icon={Activity}
          color="cyan"
          trend={12}
        />
        <StatCard
          label="Failures"
          value={stats.failures}
          icon={AlertTriangle}
          color="red"
          trend={-8}
          subtitle="AI auto-fix available"
        />
        <StatCard
          label="AI Fixes Applied"
          value={stats.ai_fixes}
          icon={Brain}
          color="purple"
          trend={25}
        />
        <StatCard
          label="Deployments"
          value={stats.deployments}
          icon={Rocket}
          color="green"
          trend={5}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Pipeline Runs */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-neon-cyan" />
              Recent Pipeline Runs
            </h2>
            <Link
              to="/pipelines"
              className="text-xs text-neon-cyan hover:text-neon-cyan/80 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentEvents.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-4">
          {/* Active Failures */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-neon-red" />
              Active Failures
            </h3>
            {failedEvents.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-neon-green mx-auto mb-2" />
                <p className="text-sm text-gray-400">No active failures!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {failedEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-neon-red/5 border border-neon-red/10">
                    <div className="status-dot-failure flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white truncate font-medium">{event.branch}</p>
                      <p className="text-[10px] text-gray-500 truncate">{event.error_summary}</p>
                    </div>
                    {event.diagnosis ? (
                      <StatusBadge status="merged" size="xs" showIcon={false} />
                    ) : (
                      <Link to="/ai-suggestions" className="text-[10px] text-neon-purple hover:underline flex-shrink-0">
                        Analyze
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Deploy */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Rocket className="w-4 h-4 text-neon-green" />
              Quick Deploy
            </h3>
            <div className="space-y-2">
              <Link
                to="/deployments"
                className="btn-success w-full text-center block text-xs"
              >
                Deploy to Staging
              </Link>
              <Link
                to="/deployments"
                className="btn-danger w-full text-center block text-xs"
              >
                Deploy to Production
              </Link>
            </div>
          </div>

          {/* AI Performance */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-neon-yellow" />
              AI Performance
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Issues Detected</span>
                <span className="text-sm font-bold text-white">{stats.ai_fixes}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">PRs Created</span>
                <span className="text-sm font-bold text-white">{stats.prs_created}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Fix Success Rate</span>
                <span className="text-sm font-bold text-neon-green">94%</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-1.5 mt-1">
                <div className="bg-gradient-to-r from-neon-cyan to-neon-green h-1.5 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
