import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle, FileCode, Shield, Loader2, CheckCircle2, ArrowRight, Zap } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { getEvents, triggerAgent, applyFix } from '../api/client';

const demoEvents = [
  {
    id: 'evt_001', timestamp: '2026-05-08T10:15:30Z', status: 'failure',
    branch: 'feature/auth-module', commit_sha: 'a3f7c2e', commit_message: 'Add user authentication module',
    error_summary: "ModuleNotFoundError: No module named 'bcrypt'",
    diagnosis: { issue_type: 'missing_dependency', file_to_change: 'requirements.txt', change: 'bcrypt==4.1.3', risk: 'low', explanation: "The 'bcrypt' package is imported but not listed in requirements.txt." },
    fix_pr: { number: 42, url: '#', status: 'merged' },
  },
  {
    id: 'evt_002', timestamp: '2026-05-08T11:22:00Z', status: 'failure',
    branch: 'feature/api-endpoints', commit_sha: 'b8d1f4a', commit_message: 'Update API endpoint handlers',
    error_summary: 'SyntaxError: unexpected EOF while parsing in routes/api.py line 47',
    diagnosis: { issue_type: 'syntax_error', file_to_change: 'routes/api.py', change: 'Add missing closing parenthesis on line 47', risk: 'low', explanation: 'A closing parenthesis is missing in routes/api.py.' },
    fix_pr: { number: 43, url: '#', status: 'open' },
  },
  {
    id: 'evt_005', timestamp: '2026-05-08T12:45:10Z', status: 'failure',
    branch: 'feature/database-migration', commit_sha: 'd4f8a1c', commit_message: 'Add database migration scripts',
    error_summary: "FAILED tests/test_db.py - AssertionError: Table 'users' schema mismatch",
    diagnosis: { issue_type: 'test_failure', file_to_change: 'migrations/002_add_users.py', change: 'Update VARCHAR(50) to VARCHAR(255) for email field', risk: 'medium', explanation: 'The migration defines email as VARCHAR(50) but test expects VARCHAR(255).' },
    fix_pr: null,
  },
];

const riskColors = { low: 'text-neon-green', medium: 'text-neon-orange', high: 'text-neon-red' };
const riskBg = { low: 'bg-neon-green/10 border-neon-green/20', medium: 'bg-neon-orange/10 border-neon-orange/20', high: 'bg-neon-red/10 border-neon-red/20' };
const typeIcons = { missing_dependency: Shield, syntax_error: FileCode, test_failure: AlertTriangle, config_error: FileCode, build_error: AlertTriangle };

export default function AISuggestions() {
  const [events, setEvents] = useState(demoEvents);
  const [analyzing, setAnalyzing] = useState(null);
  const [applying, setApplying] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getEvents(50);
        const failures = (data.events || []).filter(e => e.status === 'failure');
        if (failures.length > 0) setEvents(failures);
      } catch (err) { /* demo */ }
    };
    fetch();
  }, []);

  const handleAnalyze = async (eventId) => {
    setAnalyzing(eventId);
    try {
      const result = await triggerAgent(eventId);
      if (result.diagnosis) {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, diagnosis: result.diagnosis } : e));
      }
    } catch (err) { console.error(err); }
    finally { setAnalyzing(null); }
  };

  const handleApplyFix = async (eventId) => {
    setApplying(eventId);
    try {
      const result = await applyFix(eventId);
      if (result.pull_request) {
        setEvents(prev => prev.map(e => e.id === eventId ? { ...e, fix_pr: { number: result.pull_request.pr_number, url: result.pull_request.pr_url, status: 'open' } } : e));
      }
    } catch (err) { console.error(err); }
    finally { setApplying(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Brain className="w-7 h-7 text-neon-purple" />AI Insights & Suggestions
        </h1>
        <p className="text-sm text-gray-500 mt-1">Gemini AI-powered failure analysis and automated fix suggestions</p>
      </div>

      {/* AI Stats Bar */}
      <div className="glass-card p-4 flex items-center gap-6">
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-neon-purple" /><span className="text-xs text-gray-400">Powered by Gemini AI</span></div>
        <div className="flex items-center gap-4 ml-auto text-xs">
          <span className="text-gray-400">Issues Analyzed: <span className="text-white font-bold">{events.filter(e => e.diagnosis).length}</span></span>
          <span className="text-gray-400">PRs Created: <span className="text-white font-bold">{events.filter(e => e.fix_pr).length}</span></span>
          <span className="text-gray-400">Success Rate: <span className="text-neon-green font-bold">94%</span></span>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {events.map(event => {
          const d = event.diagnosis;
          const TypeIcon = d ? (typeIcons[d.issue_type] || AlertTriangle) : AlertTriangle;

          return (
            <div key={event.id} className="glass-card overflow-hidden animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-red/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-neon-red" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{event.commit_message}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{event.branch} • {event.commit_sha?.slice(0, 7)}</p>
                  </div>
                </div>
                <StatusBadge status={event.status} />
              </div>

              {/* Error */}
              {event.error_summary && (
                <div className="px-4 py-3 bg-neon-red/5 border-b border-white/5">
                  <p className="text-xs font-medium text-neon-red mb-1">Error Output</p>
                  <code className="text-xs text-gray-300 font-mono">{event.error_summary}</code>
                </div>
              )}

              {/* AI Diagnosis */}
              {d ? (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-neon-purple" />
                    <span className="text-sm font-semibold text-neon-purple">AI Diagnosis</span>
                    <span className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-bold border ${riskBg[d.risk]}`}>
                      <span className={riskColors[d.risk]}>{d.risk?.toUpperCase()} RISK</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-dark-600/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TypeIcon className="w-4 h-4 text-neon-cyan" />
                        <span className="text-xs font-medium text-gray-400">Issue Type</span>
                      </div>
                      <p className="text-sm text-white font-medium">{d.issue_type?.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="bg-dark-600/50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FileCode className="w-4 h-4 text-neon-cyan" />
                        <span className="text-xs font-medium text-gray-400">File to Change</span>
                      </div>
                      <p className="text-sm text-neon-cyan font-mono">{d.file_to_change}</p>
                    </div>
                  </div>

                  <div className="bg-dark-600/50 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-400 mb-2">Suggested Fix</p>
                    <code className="code-block text-neon-green">{d.change}</code>
                  </div>

                  <div className="bg-dark-600/50 rounded-xl p-3">
                    <p className="text-xs font-medium text-gray-400 mb-1">Explanation</p>
                    <p className="text-sm text-gray-300">{d.explanation}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    {event.fix_pr ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-neon-green" />
                        <span className="text-sm text-neon-green font-medium">PR #{event.fix_pr.number} created</span>
                        <StatusBadge status={event.fix_pr.status} size="xs" />
                      </div>
                    ) : (
                      <button onClick={() => handleApplyFix(event.id)} disabled={applying === event.id} className="btn-primary flex items-center gap-2">
                        {applying === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Apply Fix & Create PR
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <button onClick={() => handleAnalyze(event.id)} disabled={analyzing === event.id} className="btn-purple flex items-center gap-2 mx-auto">
                    {analyzing === event.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                    Analyze with Gemini AI
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
