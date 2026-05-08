import { useState } from 'react';
import { GitBranch, GitCommit, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function PipelineCard({ event, onAnalyze, onApplyFix }) {
  const [expanded, setExpanded] = useState(false);

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
    <div className="glass-card-hover animate-slide-up overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <StatusBadge status={event.status} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">
              {event.commit_message || 'Workflow run'}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3" />
                {event.branch}
              </span>
              <span className="flex items-center gap-1">
                <GitCommit className="w-3 h-3" />
                {event.commit_sha?.slice(0, 7) || '—'}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeAgo(event.timestamp)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {event.fix_pr && (
            <a
              href={event.fix_pr.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-neon-purple hover:text-neon-purple/80 flex items-center gap-1"
            >
              PR #{event.fix_pr.number}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-white/5 animate-fade-in">
          {/* Error Summary */}
          {event.error_summary && (
            <div className="px-4 py-3 bg-neon-red/5 border-b border-white/5">
              <p className="text-xs font-medium text-neon-red mb-1">Error Output</p>
              <code className="text-xs text-gray-300 font-mono block whitespace-pre-wrap">
                {event.error_summary}
              </code>
            </div>
          )}

          {/* AI Diagnosis */}
          {event.diagnosis && (
            <div className="px-4 py-3 bg-neon-purple/5 border-b border-white/5">
              <p className="text-xs font-medium text-neon-purple mb-2">AI Diagnosis</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Issue Type:</span>
                  <span className="ml-2 text-white font-medium">{event.diagnosis.issue_type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Risk:</span>
                  <span className={`ml-2 font-medium ${
                    event.diagnosis.risk === 'low' ? 'text-neon-green' :
                    event.diagnosis.risk === 'medium' ? 'text-neon-orange' : 'text-neon-red'
                  }`}>{event.diagnosis.risk}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">File:</span>
                  <span className="ml-2 text-neon-cyan font-mono">{event.diagnosis.file_to_change}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Fix:</span>
                  <code className="ml-2 text-gray-300 font-mono">{event.diagnosis.change}</code>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex items-center gap-2">
            {event.status === 'failure' && !event.diagnosis && (
              <button
                onClick={(e) => { e.stopPropagation(); onAnalyze?.(event.id); }}
                className="btn-purple text-xs"
              >
                🤖 Analyze with AI
              </button>
            )}
            {event.diagnosis && !event.fix_pr && (
              <button
                onClick={(e) => { e.stopPropagation(); onApplyFix?.(event.id); }}
                className="btn-primary text-xs"
              >
                🔧 Apply Fix & Create PR
              </button>
            )}
            {event.log_url && (
              <a
                href={event.log_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-400 hover:text-white flex items-center gap-1 ml-auto"
              >
                View Full Logs <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
