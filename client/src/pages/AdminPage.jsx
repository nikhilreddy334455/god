import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Layers, 
  Clock, 
  Cpu, 
  MapPin, 
  AlertCircle,
  FileText,
  Lock,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function AdminPage({ navigate }) {
  const queryClient = useQueryClient();
  const { currentUser, switchUser, demoUsers } = useAuth();
  const [actionMessage, setActionMessage] = useState(null);

  const { data, isLoading, refetch, isFetching, error } = useQuery({
    queryKey: ['admin-reports', currentUser?.id],
    queryFn: () => api.getAdminReports(),
    enabled: currentUser?.role === 'admin'
  });

  const claimStatusMutation = useMutation({
    mutationFn: ({ claimId, status }) => api.updateClaimStatus(claimId, status),
    onSuccess: (data, variables) => {
      setActionMessage(`Claim successfully ${variables.status === 'approved' ? 'Approved & Marked Resolved' : 'Rejected'}.`);
      setTimeout(() => setActionMessage(null), 4000);
      queryClient.invalidateQueries(['admin-reports']);
      queryClient.invalidateQueries(['items-feed']);
    }
  });

  // If currently not admin, provide 1-click switch button to Campus Admin persona
  if (currentUser?.role !== 'admin') {
    const adminUser = demoUsers.find(u => u.role === 'admin');
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Campus Security Clearance Required</h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The Admin Moderation Console is restricted to campus safety staff and system administrators. You are currently logged in as a <strong>{currentUser?.role}</strong> ({currentUser?.full_name}).
          </p>
        </div>
        {adminUser && (
          <div className="pt-2">
            <button
              onClick={() => switchUser(adminUser)}
              className="btn-primary text-xs px-5 py-2.5 shadow-rose-500/20"
            >
              Switch to Campus Public Safety Admin
            </button>
          </div>
        )}
      </div>
    );
  }

  const stats = data?.stats || {};
  const pendingClaims = data?.pendingClaims || [];
  const allClaims = data?.allClaims || [];
  const recentItems = data?.recentItems || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Campus Security Operations
            </span>
            <span className="text-xs text-slate-400">• High Clearance Mode</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span>Admin Moderation Console</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage ownership verification claims, inspect AI telemetry, and coordinate item custody release
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-teal-400' : ''}`} />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Reports', val: stats.totalItems || 0, color: 'text-white' },
          { label: 'Active Lost', val: stats.lostItems || 0, color: 'text-amber-400' },
          { label: 'Active Found', val: stats.foundItems || 0, color: 'text-teal-400' },
          { label: 'AI Matches', val: stats.totalMatches || 0, color: 'text-indigo-400' },
          { label: 'Pending Claims', val: stats.pendingClaims || 0, color: 'text-rose-400' },
          { label: 'Resolved', val: stats.resolvedItems || 0, color: 'text-emerald-400' },
        ].map((item, idx) => (
          <div key={idx} className="glass-card p-4 text-center">
            <div className={`text-2xl font-black ${item.color} tracking-tight`}>{item.val}</div>
            <div className="text-[11px] font-semibold text-slate-400 mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      {/* AI Telemetry & Model Status */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200">Gemini 2.5 Flash Vision &amp; Semantic Cross-Matcher</div>
            <div className="text-[11px] text-slate-400">
              API Status: <span className="text-emerald-400 font-semibold">{data?.geminiConfigured ? 'Live Production Key Connected' : 'Resilient Heuristics Fallback Active'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div>Confidence Threshold: <span className="text-teal-400 font-semibold">60.0%</span></div>
          <div>Auto-Notification: <span className="text-emerald-400 font-semibold">85.0%</span></div>
        </div>
      </div>

      {/* Moderation Queue: Pending Ownership Claims */}
      <div className="glass-panel p-6 sm:p-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Pending Custody &amp; Ownership Claims ({pendingClaims.length})</span>
          </h2>
        </div>

        {pendingClaims.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <span>No pending claims in the moderation queue. All claims are up to date.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingClaims.map((claim) => (
              <div 
                key={claim.id} 
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="text-sm font-bold text-slate-100">
                      Claimant: {claim.claimant_name} ({claim.claimant_email})
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-400" />
                      <span>{claim.location}</span>
                      <span>•</span>
                      <span>Filed: {new Date(claim.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-teal-400">
                      {Math.round(claim.confidence_score || 90)}% AI Confidence
                    </span>
                    <button
                      onClick={() => navigate(`/matches/${claim.match_id}`)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 ml-2"
                    >
                      <span>Inspect Match</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 font-semibold block mb-1">Lost Item Specification</span>
                    <p className="font-bold text-slate-200">{claim.lost_item_title}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-slate-500 font-semibold block mb-1">Found Item In Custody</span>
                    <p className="font-bold text-teal-300">{claim.found_item_title}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 block mb-1">
                    Submitted Verifiable Proof of Ownership:
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
                    "{claim.proof_description}"
                  </div>
                </div>

                {/* Moderation Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => claimStatusMutation.mutate({ claimId: claim.id, status: 'rejected' })}
                    disabled={claimStatusMutation.isLoading}
                    className="btn-danger text-xs py-1.5 px-3"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Claim</span>
                  </button>

                  <button
                    onClick={() => claimStatusMutation.mutate({ claimId: claim.id, status: 'approved' })}
                    disabled={claimStatusMutation.isLoading}
                    className="btn-primary text-xs py-1.5 px-4"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve &amp; Release Belonging</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campus Zones Overview */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Active Campus Custody Zones</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { zone: 'Main Library', desks: '2nd Floor Service Desk', status: 'Staffed' },
            { zone: 'Student Center', desks: 'Information Booth A', status: 'Staffed' },
            { zone: 'Science & Tech', desks: 'Lobby Security Station', status: 'Staffed' },
            { zone: 'Sports Complex', desks: 'Gym Turnstile Counter', status: 'Staffed' },
          ].map((z, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="font-bold text-slate-200">{z.zone}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{z.desks}</div>
              <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {z.status}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
