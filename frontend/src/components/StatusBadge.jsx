import { CheckCircle2, XCircle, Loader2, Clock, GitMerge } from 'lucide-react';

const statusConfig = {
  success: {
    label: 'Success',
    icon: CheckCircle2,
    classes: 'bg-status-success/10 text-status-success border-status-success/20',
    dotClass: 'status-dot-success',
  },
  failure: {
    label: 'Failed',
    icon: XCircle,
    classes: 'bg-status-failure/10 text-status-failure border-status-failure/20',
    dotClass: 'status-dot-failure',
  },
  running: {
    label: 'Running',
    icon: Loader2,
    classes: 'bg-status-running/10 text-status-running border-status-running/20',
    dotClass: 'status-dot-running',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    classes: 'bg-status-pending/10 text-status-pending border-status-pending/20',
    dotClass: 'status-dot-pending',
  },
  merged: {
    label: 'Merged',
    icon: GitMerge,
    classes: 'bg-status-merged/10 text-status-merged border-status-merged/20',
    dotClass: 'bg-status-merged',
  },
  open: {
    label: 'Open',
    icon: Clock,
    classes: 'bg-neon-blue/10 text-neon-blue border-neon-blue/20',
    dotClass: 'bg-neon-blue',
  },
  not_deployed: {
    label: 'Not Deployed',
    icon: Clock,
    classes: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    dotClass: 'bg-gray-500',
  },
};

export default function StatusBadge({ status, size = 'sm', showIcon = true, showDot = false }) {
  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border font-medium
        ${config.classes} ${sizeClasses[size]}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />}
      {showIcon && (
        <Icon
          className={`${size === 'xs' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${status === 'running' ? 'animate-spin' : ''}`}
          strokeWidth={2}
        />
      )}
      {config.label}
    </span>
  );
}
