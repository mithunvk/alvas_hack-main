import { GitBranch, GitCommit, Clock, AlertTriangle, CheckCircle2, Rocket, Webhook } from 'lucide-react';
import StatusBadge from './StatusBadge';

const typeIcons = {
  workflow_run: GitBranch,
  check_suite: CheckCircle2,
  deployment: Rocket,
  manual: Webhook,
};

export default function EventRow({ event }) {
  const Icon = typeIcons[event.type] || Webhook;

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-b-0 group">
      {/* Type Icon */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${event.status === 'failure' ? 'bg-neon-red/10' :
          event.status === 'success' ? 'bg-neon-green/10' :
          event.status === 'running' ? 'bg-neon-blue/10' : 'bg-gray-500/10'}`}
      >
        <Icon className={`w-4 h-4
          ${event.status === 'failure' ? 'text-neon-red' :
            event.status === 'success' ? 'text-neon-green' :
            event.status === 'running' ? 'text-neon-blue' : 'text-gray-400'}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate font-medium">
          {event.commit_message || event.type}
        </p>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            {event.branch}
          </span>
          <span className="font-mono">{event.commit_sha?.slice(0, 7)}</span>
          <span>{event.repo}</span>
        </div>
      </div>

      {/* Status */}
      <StatusBadge status={event.status} size="xs" />

      {/* Diagnosis indicator */}
      {event.diagnosis && (
        <div className="flex items-center gap-1 text-[10px] text-neon-purple">
          <AlertTriangle className="w-3 h-3" />
          <span>AI</span>
        </div>
      )}

      {/* Time */}
      <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0 w-16 justify-end">
        <Clock className="w-3 h-3" />
        <span>{timeAgo(event.timestamp)}</span>
      </div>
    </div>
  );
}
