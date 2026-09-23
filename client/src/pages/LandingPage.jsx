import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Layers, 
  Eye, 
  Camera, 
  Cpu, 
  Lock 
} from 'lucide-react';
import { api } from '../api/client.js';
import ItemCard from '../components/ItemCard.jsx';

export default function LandingPage({ navigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['recent-items'],
    queryFn: () => api.getItems({ limit: 6 })
  });

  const { data: healthData } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => api.getHealth()
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  const items = data?.items || [];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4">
        {/* Glow ambient background effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-teal-400 text-xs font-semibold mb-6 shadow-glow-teal animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span>Powered by Gemini 2.5 Flash Multimodal Vision</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
          Misplaced Belongings,{' '}
          <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Intelligently Reunited.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
          Replace outdated bulletin boards and lost flyers. CampusFind uses multimodal AI to extract visual tags, perform cross-matching, and surface instant high-confidence claims across all campus departments.
        </p>

        {/* Quick Search Bar */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative mb-8">
          <div className="glass-panel p-2 flex items-center gap-2 shadow-2xl border-slate-700/80 focus-within:border-teal-500 transition-colors">
            <Search className="w-5 h-5 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search by keywords (e.g. 'Space Gray MacBook', 'Navy Jacket', 'Student ID')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none flex-1 px-2"
            />
            <button type="submit" className="btn-primary text-xs py-2.5 px-5">
              <span>Find Item</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Dual CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/items/new?type=lost')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>I Lost Something</span>
          </button>

          <button
            onClick={() => navigate('/items/new?type=found')}
            className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:from-teal-400 hover:to-emerald-400 shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>I Found Something</span>
          </button>
        </div>
      </section>

      {/* Live Campus Telemetry & Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: 'Campus Items Logged', value: '450+', icon: Layers, color: 'text-teal-400' },
            { label: 'AI Match Accuracy', value: '94.2%', icon: Sparkles, color: 'text-emerald-400' },
            { label: 'Return Resolution Rate', value: '88%', icon: CheckCircle2, color: 'text-cyan-400' },
            { label: 'Average Recovery Time', value: '< 14 hrs', icon: Clock, color: 'text-amber-400' },
          ].map((stat, idx) => (
            <div key={idx} className="glass-card p-5 text-center">
              <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">How Campus AI Matching Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Eliminating human guesswork through multimodal computer vision and semantic cross-referencing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Snap & Report',
              desc: 'Upload a clear photo and brief description. Specify the campus zone and incident timestamp.',
              icon: Camera
            },
            {
              step: '02',
              title: 'Gemini Parsing',
              desc: 'Multimodal vision automatically extracts brand, serial numbers, color tones, and distinctive marks.',
              icon: Cpu
            },
            {
              step: '03',
              title: 'Cross-Matching',
              desc: 'Background engine computes temporal, spatial, and semantic similarity scores between Lost and Found items.',
              icon: Sparkles
            },
            {
              step: '04',
              title: 'Secure Claim',
              desc: 'Submit private ownership verification proof reviewed by campus security for safe return.',
              icon: Lock
            }
          ].map((item, idx) => (
            <div key={idx} className="glass-card p-6 relative">
              <span className="text-3xl font-black text-slate-800/80 absolute top-4 right-4 select-none">
                {item.step}
              </span>
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Campus Submissions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Recent Campus Reports</h2>
            <p className="text-xs text-slate-400 mt-0.5">Live feed of active lost &amp; found items</p>
          </div>
          <button
            onClick={() => navigate('/items')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300"
          >
            <span>View All Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card h-80 animate-pulse bg-slate-900/40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/items/${item.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Safety & Custody Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Campus Public Safety Custody Protocol</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Found high-value valuables (electronics, wallets, legal IDs) must be deposited at the Main Security Station or library helpdesk within 24 hours. The AI system coordinates with campus staff for tamper-free return.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/items/new')}
            className="btn-primary text-xs shrink-0 whitespace-nowrap"
          >
            Report an Item Now
          </button>
        </div>
      </section>

    </div>
  );
}
