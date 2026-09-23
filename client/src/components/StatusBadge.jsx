import React from 'react';
import { CheckCircle2, Clock, Sparkles, Archive, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const configs = {
    active: {
      label: 'Active',
      icon: Clock,
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    matched: {
      label: 'AI Matched',
      icon: Sparkles,
      classes: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 ring-1 ring-indigo-500/20 animate-pulse-subtle'
    },
    pending_verification: {
      label: 'Under Review',
      icon: AlertCircle,
      classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    resolved: {
      label: 'Resolved & Returned',
      icon: CheckCircle2,
      classes: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
    },
    archived: {
      label: 'Archived',
      icon: Archive,
      classes: 'bg-slate-700/20 text-slate-400 border-slate-700/30'
    }
  };

  const current = configs[status] || configs.active;
  const Icon = current.icon;
  const sizeClasses = size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${sizeClasses} ${current.classes}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      <span>{current.label}</span>
    </span>
  );
}
