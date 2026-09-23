import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  User, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import ItemCard from '../components/ItemCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function DashboardPage({ navigate }) {
  const { currentUser, demoUsers, switchUser } = useAuth();
  const [activeTab, setActiveTab] = useState('lost');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['user-dashboard', currentUser?.id],
    queryFn: () => api.getDashboard()
  });

  // Refetch when custom event fires
  useEffect(() => {
    const handleSwitch = () => refetch();
    window.addEventListener('campus_user_switched', handleSwitch);
    return () => window.removeEventListener('campus_user_switched', handleSwitch);
  }, [refetch]);

  const lostItems = data?.lostItems || [];
  const foundItems = data?.foundItems || [];
  const claims = data?.claims || [];
  const matches = data?.matches || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-slate-700/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            {currentUser?.full_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentUser?.full_name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/15 text-teal-300 border border-teal-500/30">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{currentUser?.email}</p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/items/new?type=lost')}
            className="btn-secondary text-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-400" />
            <span>Report Lost</span>
          </button>
          <button
            onClick={() => navigate('/items/new?type=found')}
            className="btn-primary text-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Found</span>
          </button>
        </div>
      </div>

      {/* Switch Campus Identity Quick Tester */}
      <div className="glass-card p-4 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Quick Persona Switcher (For Evaluation &amp; Testing)
          </span>
          <span className="text-[11px] text-slate-500">
            Switch persona to test RLS &amp; item ownership
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {demoUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => switchUser(user)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                user.id === currentUser?.id
                  ? 'border-teal-500 bg-teal-500/10 text-teal-300 shadow-glow-teal'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-xs font-bold text-slate-200 truncate">{user.full_name}</div>
              <div className="text-[10px] text-slate-500 capitalize">{user.role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'lost', label: `My Lost Items (${lostItems.length})`, icon: Layers },
          { id: 'found', label: `My Found Items (${foundItems.length})`, icon: Layers },
          { id: 'matches', label: `AI Match Connections (${matches.length})`, icon: Sparkles },
          { id: 'claims', label: `My Submitted Claims (${claims.length})`, icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card h-80 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : (
        <div>
          {/* TAB: Lost Items */}
          {activeTab === 'lost' && (
            lostItems.length === 0 ? (
              <div className="glass-card p-10 text-center max-w-md mx-auto space-y-3">
                <p className="text-xs text-slate-400">You haven't reported any lost items under this account.</p>
                <button
                  onClick={() => navigate('/items/new?type=lost')}
                  className="btn-primary text-xs"
                >
                  Report Lost Belonging
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/items/${item.id}`)}
                  />
                ))}
              </div>
            )
          )}

          {/* TAB: Found Items */}
          {activeTab === 'found' && (
            foundItems.length === 0 ? (
              <div className="glass-card p-10 text-center max-w-md mx-auto space-y-3">
                <p className="text-xs text-slate-400">You haven't logged any found items under this account.</p>
                <button
                  onClick={() => navigate('/items/new?type=found')}
                  className="btn-primary text-xs"
                >
                  Report Found Belonging
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => navigate(`/items/${item.id}`)}
                  />
                ))}
              </div>
            )
          )}

          {/* TAB: Matches */}
          {activeTab === 'matches' && (
            matches.length === 0 ? (
              <div className="glass-card p-10 text-center max-w-md mx-auto space-y-3">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">No active AI matches linked to your reports yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <div 
                    key={match.id}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className="glass-card p-5 cursor-pointer hover:border-indigo-500/40 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-teal-400">
                          {Math.round(match.confidence_score)}% Score
                        </span>
                        <StatusBadge status={match.status} />
                      </div>
                      <p className="text-xs text-slate-300 font-semibold line-clamp-1">
                        Match ID: {match.id.slice(0, 8)}...
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Created {new Date(match.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB: Claims */}
          {activeTab === 'claims' && (
            claims.length === 0 ? (
              <div className="glass-card p-10 text-center max-w-md mx-auto space-y-3">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">You haven't filed any ownership claims yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="glass-card p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200">
                        Claim Verification Reference: {claim.id.slice(0, 8)}...
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                        claim.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                        claim.status === 'rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                        'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {claim.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800 italic">
                      "{claim.proof_description}"
                    </p>
                    <div className="text-[11px] text-slate-500">
                      Filed on {new Date(claim.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

    </div>
  );
}
