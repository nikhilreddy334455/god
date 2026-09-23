import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Sparkles, Lock, FileText, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client.js';

export default function ClaimModal({ match, onClose, onSuccess }) {
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (proof.trim().length < 15) {
      setError('Proof description must be at least 15 characters with specific verifiable details.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.submitClaim(match.id, proof.trim());
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit ownership claim');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="glass-panel w-full max-w-lg p-6 sm:p-7 relative border border-slate-700/80 shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ownership Claim Filed</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Campus Security has received your verification statement. An officer or custodian will cross-reference the proof and contact you for release.
              </p>
            </div>
            <button
              onClick={onClose}
              className="btn-primary w-full text-sm mt-4"
            >
              Back to Item Details
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Verify Ownership &amp; Claim Item</h3>
                <p className="text-xs text-slate-400">Campus Security Identity &amp; Custody Protocol</p>
              </div>
            </div>

            {/* Match summary snippet */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-4 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Potential Match:</span>
                <span className="font-bold text-emerald-400">
                  {Math.round(match.confidence_score)}% AI Confidence
                </span>
              </div>
              <div className="text-slate-200 font-semibold line-clamp-1">
                {match.found_item?.title || match.lost_item?.title || 'Matched Item'}
              </div>
              <div className="text-slate-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                Proof is stored securely and reviewed exclusively by verified campus staff.
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Proof of Ownership <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  placeholder="Provide verifiable attributes that only the owner knows: partial serial numbers, lockscreen image, contents inside compartments, unique scratches, or student credentials..."
                  className="glass-input w-full text-xs resize-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Must be at least 15 characters ({proof.trim().length}/15 entered).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || proof.trim().length < 15}
                  className="btn-primary text-xs px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
