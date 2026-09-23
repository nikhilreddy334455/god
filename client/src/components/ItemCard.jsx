import React from 'react';
import { MapPin, Calendar, Sparkles, Tag, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function ItemCard({ item, onClick }) {
  const isLost = item.type === 'lost';
  const incidentDate = new Date(item.incident_date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const aiTags = item.ai_tags || {};
  const summaryTags = Array.isArray(aiTags.summary_tags) ? aiTags.summary_tags.slice(0, 3) : [];

  return (
    <div 
      onClick={onClick}
      className="glass-card group cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-all duration-300"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-950">
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Type Badge (Lost vs Found) */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
              isLost 
                ? 'bg-amber-500/90 text-slate-950' 
                : 'bg-teal-500/90 text-slate-950'
            }`}>
              {isLost ? 'Lost Item' : 'Found Item'}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <StatusBadge status={item.status} />
          </div>

          {/* Match Score Indicator Overlay */}
          {item.matches_count > 0 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-950/80 backdrop-blur-md border border-indigo-500/40 text-indigo-300 text-xs font-semibold shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{item.matches_count} AI Match{item.matches_count > 1 ? 'es' : ''}</span>
              {item.top_match_score && (
                <span className="text-emerald-400 font-bold ml-1">
                  ({Math.round(item.top_match_score)}%)
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="font-semibold text-teal-400">{item.category}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              {incidentDate}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-100 group-hover:text-teal-300 transition-colors line-clamp-1 mb-2">
            {item.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
            {item.description}
          </p>

          {/* AI Extracted Feature Tags */}
          {summaryTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {summaryTags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50"
                >
                  <Tag className="w-2.5 h-2.5 text-teal-400" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Location & Action */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
          <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>
        <div className="flex items-center gap-1 text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform">
          <span>Details</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
