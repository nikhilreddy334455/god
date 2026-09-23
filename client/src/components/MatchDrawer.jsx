import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, ArrowRight, MapPin, Calendar, Check, ExternalLink } from 'lucide-react';
import ClaimModal from './ClaimModal.jsx';

export default function MatchDrawer({ match, currentItem, isOpen, onClose, onClaimSuccess, navigate }) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  if (!isOpen || !match) return null;

  const isCurrentLost = currentItem.type === 'lost';
  const oppositeItem = isCurrentLost ? match.found_item : match.lost_item;
  const score = Math.round(match.confidence_score);

  return (
    <>
      <div 
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div 
        className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#090e1c] border-l border-slate-800 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 sticky top-0 z-10 backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>AI Match Analysis</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {score}% Score
                </span>
              </h2>
              <p className="text-xs text-slate-400">Gemini 2.5 Multimodal Semantic Cross-Verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-5 sm:p-6 space-y-6 flex-1">
          {/* Confidence Meter Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Confidence Calibration</span>
              <span className={`font-bold text-sm ${score >= 85 ? 'text-emerald-400' : 'text-teal-400'}`}>
                {score}% Match
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-teal-500 via-indigo-500 to-emerald-400 transition-all duration-1000 ease-out"
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Threshold: 60%</span>
              <span>High Probability: 85%+</span>
            </div>
          </div>

          {/* Side-by-Side Comparison */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Item Comparison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Item 1 (Current) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    currentItem.type === 'lost' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    {currentItem.type === 'lost' ? 'Your Lost Report' : 'Your Found Report'}
                  </span>
                </div>
                <img 
                  src={currentItem.image_url} 
                  alt={currentItem.title}
                  className="w-full h-32 object-cover rounded-xl mb-2.5 bg-slate-900"
                />
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{currentItem.title}</h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{currentItem.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{new Date(currentItem.incident_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Item 2 (Opposite Match) */}
              <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-indigo-900/30 ring-1 ring-indigo-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    oppositeItem?.type === 'lost' ? 'bg-amber-500/20 text-amber-300' : 'bg-teal-500/20 text-teal-300'
                  }`}>
                    {oppositeItem?.type === 'lost' ? 'Lost Report' : 'Found Report'}
                  </span>
                  {oppositeItem?.id && (
                    <button 
                      onClick={() => {
                        onClose();
                        navigate(`/items/${oppositeItem.id}`);
                      }}
                      className="text-[10px] text-teal-400 hover:underline flex items-center gap-0.5"
                    >
                      View <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
                <img 
                  src={oppositeItem?.image_url} 
                  alt={oppositeItem?.title}
                  className="w-full h-32 object-cover rounded-xl mb-2.5 bg-slate-900"
                />
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{oppositeItem?.title || 'Matched Item'}</h4>
                <div className="mt-2 space-y-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-rose-400" />
                    <span>{oppositeItem?.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>{oppositeItem?.incident_date ? new Date(oppositeItem.incident_date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* AI Qualitative Rationale */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Gemini AI Matching Rationale
            </h4>
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
              {match.match_reasoning}
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-800/80 bg-slate-950/80 sticky bottom-0 z-10 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              navigate(`/matches/${match.id}`);
            }}
            className="btn-secondary text-xs"
          >
            Full Comparison View
          </button>

          <button
            onClick={() => setClaimModalOpen(true)}
            className="btn-primary text-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Initiate Ownership Claim</span>
          </button>
        </div>
      </div>

      {/* Embedded Claim Modal */}
      {claimModalOpen && (
        <ClaimModal
          match={match}
          onClose={() => setClaimModalOpen(false)}
          onSuccess={() => {
            setClaimModalOpen(false);
            if (onClaimSuccess) onClaimSuccess();
          }}
        />
      )}
    </>
  );
}
