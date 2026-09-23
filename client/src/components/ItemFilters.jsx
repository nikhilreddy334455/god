import React from 'react';
import { Search, Filter, RotateCcw, Tag, MapPin } from 'lucide-react';

export const CATEGORIES = [
  'All',
  'Electronics',
  'ID & Cards',
  'Books & Stationery',
  'Apparel & Accessories',
  'Keys & Valuables',
  'Sports & Equipment',
  'Other'
];

export const LOCATIONS = [
  'All',
  'Main Library',
  'Student Center',
  'Science & Tech Building',
  'Engineering Block',
  'Sports Complex',
  'Cafeteria',
  'Dormitories',
  'Central Auditorium'
];

export const STATUSES = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active Reports' },
  { value: 'matched', label: 'AI Matched' },
  { value: 'pending_verification', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' }
];

export default function ItemFilters({ filters, setFilters, onReset }) {
  return (
    <div className="glass-panel p-4 sm:p-5 mb-8">
      {/* Top Bar: Search and Type Switcher */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search items by keywords, color, brand, or model..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="glass-input w-full pl-10 text-sm"
          />
        </div>

        {/* Report Type Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl self-start md:self-auto">
          {[
            { id: 'all', label: 'All Reports' },
            { id: 'lost', label: 'Lost Items' },
            { id: 'found', label: 'Found Items' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilters({ ...filters, type: tab.id })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.type === tab.id
                  ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Select Dropdowns & Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
        {/* Category Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-teal-400" />
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="glass-input w-full text-xs py-2"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat === 'All' ? 'all' : cat} className="bg-slate-900 text-slate-200">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Location Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-400" />
            Campus Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            className="glass-input w-full text-xs py-2"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc === 'All' ? 'all' : loc} className="bg-slate-900 text-slate-200">
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-indigo-400" />
            Report Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="glass-input w-full text-xs py-2"
          >
            {STATUSES.map((st) => (
              <option key={st.value} value={st.value} className="bg-slate-900 text-slate-200">
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters CTA */}
        <div className="flex items-end">
          <button
            onClick={onReset}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950/60 hover:bg-slate-900 border border-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
}
