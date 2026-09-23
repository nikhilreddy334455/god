import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  Sparkles, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText,
  Lock,
  ExternalLink
} from 'lucide-react';
import { api } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ClaimModal from '../components/ClaimModal.jsx';

export default function MatchDetailPage({ matchId, navigate }) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['match-detail', matchId],
    queryFn: () => api.getMatchById(matchId),
    enabled: Boolean(matchId)
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  if (error || !data?.match) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Match Record Not Found</h2>
        <p className="text-xs text-slate-400">The match record may have expired or been resolved.</p>
        <button onClick={() => navigate('/items')} className="btn-secondary text-xs">
          Back to Feed
        </button>
      </div>
    );
  }

  const { match } = data;
  const { lost_item, found_item, claims = [] } = match;
  const score = Math.round(match.confidence_score);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Navigation */}
      <button
        onClick={() => navigate('/items')}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Items</span>
      </button>

      {/* Match Header Bar */}
      <div className="glass-panel p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-900/40 shadow-glow-indigo">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Automated AI Match
              </span>
              <StatusBadge status={match.status} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {score}% Similarity Confidence
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Multimodal verification using Google Gen AI gemini-2.5-flash
            </p>
          </div>
        </div>

        {/* Claim Action Button */}
        <div>
          <button
            onClick={() => setClaimModalOpen(true)}
            className="btn-primary text-xs py-3 px-5 w-full md:w-auto"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Initiate Ownership Claim</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Detailed Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lost Item Panel */}
        <div className="glass-card p-6 border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="badge-lost">Lost Item Report</span>
            {lost_item && (
              <button
                onClick={() => navigate(`/items/${lost_item.id}`)}
                className="text-xs text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Full Item View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img 
              src={lost_item?.image_url} 
              alt={lost_item?.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">{lost_item?.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3">
              {lost_item?.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate">{lost_item?.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{lost_item?.incident_date ? new Date(lost_item.incident_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Found Item Panel */}
        <div className="glass-card p-6 border-teal-500/20 space-y-4">
          <div className="flex items-center justify-between">
            <span className="badge-found">Found Item Report</span>
            {found_item && (
              <button
                onClick={() => navigate(`/items/${found_item.id}`)}
                className="text-xs text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Full Item View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="h-56 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
            <img 
              src={found_item?.image_url} 
              alt={found_item?.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-white mb-2">{found_item?.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-3">
              {found_item?.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate">{found_item?.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{found_item?.incident_date ? new Date(found_item.incident_date).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* AI Qualitative Rationale Report */}
      <div className="glass-panel p-6 sm:p-7 space-y-4 border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <span>Gemini AI Multimodal Similarity Rationale</span>
        </h3>
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
          {match.match_reasoning}
        </div>
      </div>

      {/* Claims History for this Match */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <span>Verification &amp; Custody Claims ({claims.length})</span>
        </h3>

        {claims.length === 0 ? (
          <p className="text-xs text-slate-400">
            No claims have been submitted yet. If this lost item belongs to you, click "Initiate Ownership Claim" above.
          </p>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Claim Filed on {new Date(claim.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                    claim.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                    claim.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                    'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {claim.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-slate-400 italic">
                  "{claim.proof_description}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <ClaimModal
          match={match}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}

    </div>
  );
}
