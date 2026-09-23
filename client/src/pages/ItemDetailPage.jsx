import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  CheckCircle2, 
  Trash2, 
  User, 
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import MatchDrawer from '../components/MatchDrawer.jsx';
import ClaimModal from '../components/ClaimModal.jsx';

export default function ItemDetailPage({ itemId, navigate }) {
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [claimModalMatch, setClaimModalMatch] = useState(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['item-detail', itemId],
    queryFn: () => api.getItemById(itemId),
    enabled: Boolean(itemId)
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries(['items-feed']);
      navigate('/items');
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="glass-card h-96 animate-pulse" />
      </div>
    );
  }

  if (error || !data?.item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Item Not Found</h2>
        <p className="text-xs text-slate-400">The requested item report may have been resolved or deleted.</p>
        <button onClick={() => navigate('/items')} className="btn-secondary text-xs">
          Back to Feed
        </button>
      </div>
    );
  }

  const { item, matches = [] } = data;
  const isOwner = currentUser?.id === item.user_id;
  const isAdmin = currentUser?.role === 'admin';
  const aiTags = item.ai_tags || {};

  const handleOpenDrawer = (match) => {
    setSelectedMatch(match);
    setDrawerOpen(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Nav Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/items')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery Feed</span>
        </button>

        {/* Delete button (Owner or Admin only per Section 11 RLS) */}
        {(isOwner || isAdmin) && (
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to remove this item report?')) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isLoading}
            className="btn-danger text-xs py-1.5 px-3"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Report</span>
          </button>
        )}
      </div>

      {/* Main Item Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Photo & High-res Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card overflow-hidden p-2">
            <div className="relative h-80 sm:h-96 w-full rounded-xl overflow-hidden bg-slate-950">
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
                }}
              />
              <div className="absolute top-3 left-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
                  item.type === 'lost' ? 'bg-amber-500/90 text-slate-950' : 'bg-teal-500/90 text-slate-950'
                }`}>
                  {item.type === 'lost' ? 'Lost Item Report' : 'Found Item Report'}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <StatusBadge status={item.status} size="lg" />
              </div>
            </div>
          </div>

          {/* Reporter Information Card */}
          <div className="glass-card p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-400 font-semibold">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Campus Reporter</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>{item.user_full_name}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 capitalize">
                {item.user_role}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Reported on {new Date(item.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Right Col: Metadata & AI Intelligence Analysis (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold mb-2">
              <span>{item.category}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {item.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(item.incident_date).toLocaleDateString()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              {item.title}
            </h1>
          </div>

          {/* Description */}
          <div className="glass-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Report Description
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* AI Extracted Structural Tags (Section 2, 4, 13) */}
          <div className="glass-panel p-5 border-teal-500/20 shadow-glow-teal">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-3">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span>Gemini 2.5 Flash Multimodal Analysis</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Extracted Color</div>
                <div className="font-bold text-slate-200 mt-0.5">{aiTags.extracted_color || 'Neutral'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Detected Brand</div>
                <div className="font-bold text-slate-200 mt-0.5">{aiTags.brand || 'Unbranded'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Assessed Condition</div>
                <div className="font-bold text-slate-200 mt-0.5">{aiTags.condition || 'Good'}</div>
              </div>
            </div>

            {/* Distinguishing Features */}
            {Array.isArray(aiTags.distinguishing_features) && aiTags.distinguishing_features.length > 0 && (
              <div className="mb-3">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  Distinguishing Visual Features:
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {aiTags.distinguishing_features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal-400 mt-0.5">•</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags Pills */}
            {Array.isArray(aiTags.summary_tags) && aiTags.summary_tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80">
                {aiTags.summary_tags.map((tag, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-slate-900 text-teal-300 border border-teal-500/20 font-medium">
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* AI Match Recommendations Section (Section 2, 4, 15) */}
      <section className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>AI Match Recommendations</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {matches.length} Discovered
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated semantic similarity and temporal-spatial cross-matching
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="glass-card p-8 text-center max-w-xl mx-auto space-y-3">
            <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-200">No High-Confidence Matches Found Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The matching engine continuously evaluates new opposing submissions as they are filed. You will see candidate matches once similarity exceeds 60%.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => {
              const opposite = item.type === 'lost' ? match.found_item : match.lost_item;
              const score = Math.round(match.confidence_score);

              return (
                <div 
                  key={match.id}
                  className="glass-card p-5 border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Confidence header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-extrabold ${score >= 85 ? 'text-emerald-400' : 'text-teal-400'}`}>
                          {score}% Match
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                          {score >= 85 ? 'High Probability' : 'Potential Connection'}
                        </span>
                      </div>
                      <StatusBadge status={match.status} />
                    </div>

                    {/* Opposite Item snippet */}
                    <div className="flex gap-3 mb-3">
                      <img 
                        src={opposite?.image_url} 
                        alt={opposite?.title}
                        className="w-20 h-20 object-cover rounded-xl bg-slate-950 shrink-0 border border-slate-800"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-100 line-clamp-1 mb-1">
                          {opposite?.title || 'Opposite Item'}
                        </h4>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span className="truncate">{opposite?.location}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {opposite?.description}
                        </p>
                      </div>
                    </div>

                    {/* AI Reasoning preview */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 mb-4 line-clamp-2">
                      {match.match_reasoning?.split('\n')[0] || 'High visual and location correlation identified.'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenDrawer(match)}
                      className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                    >
                      <span>Compare Side-by-Side</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setClaimModalMatch(match)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verify &amp; Claim</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Slide-over Match Drawer */}
      <MatchDrawer
        match={selectedMatch}
        currentItem={item}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onClaimSuccess={() => {
          refetch();
          queryClient.invalidateQueries(['items-feed']);
        }}
        navigate={navigate}
      />

      {/* Claim Modal */}
      {claimModalMatch && (
        <ClaimModal
          match={claimModalMatch}
          onClose={() => setClaimModalMatch(null)}
          onSuccess={() => {
            refetch();
            queryClient.invalidateQueries(['items-feed']);
          }}
        />
      )}

    </div>
  );
}
