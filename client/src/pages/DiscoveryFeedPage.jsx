import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, PlusCircle, Search, Layers, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client.js';
import ItemCard from '../components/ItemCard.jsx';
import ItemFilters from '../components/ItemFilters.jsx';

export default function DiscoveryFeedPage({ navigate, initialSearch = '' }) {
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    location: 'all',
    status: 'all',
    search: initialSearch,
    page: 1,
    limit: 9
  });

  // Sync initialSearch if prop changes
  useEffect(() => {
    if (initialSearch) {
      setFilters(prev => ({ ...prev, search: initialSearch }));
    }
  }, [initialSearch]);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['items-feed', filters],
    queryFn: () => api.getItems(filters),
    keepPreviousData: true
  });

  const handleResetFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      location: 'all',
      status: 'all',
      search: '',
      page: 1,
      limit: 9
    });
  };

  const items = data?.items || [];
  const pagination = data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <span>Campus Discovery Feed</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
              {pagination.total} Total Reports
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time repository of lost possessions and recovered campus items
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Refresh items"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-teal-400' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/items/new')}
            className="btn-primary text-xs py-2.5 px-4"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Report</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Component */}
      <ItemFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleResetFilters}
      />

      {/* Items Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-card h-80 animate-pulse bg-slate-900/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center max-w-lg mx-auto my-12 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 mx-auto flex items-center justify-center">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Matching Campus Items</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              We couldn't find any reports matching your active filters. Try broadening your search or submit a new report.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={handleResetFilters}
              className="btn-secondary text-xs"
            >
              Reset Filters
            </button>
            <button
              onClick={() => navigate('/items/new')}
              className="btn-primary text-xs"
            >
              Report Item
            </button>
          </div>
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

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-slate-400 font-medium px-4">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
