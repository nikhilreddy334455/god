import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DiscoveryFeedPage from './pages/DiscoveryFeedPage.jsx';
import ReportWizardPage from './pages/ReportWizardPage.jsx';
import ItemDetailPage from './pages/ItemDetailPage.jsx';
import MatchDetailPage from './pages/MatchDetailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30s
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [searchParams, setSearchParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearchParams(new URLSearchParams(window.location.search));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (toUrl) => {
    window.history.pushState({}, '', toUrl);
    const [path, query] = toUrl.split('?');
    setCurrentPath(path || '/');
    setSearchParams(new URLSearchParams(query || ''));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const renderCurrentPage = () => {
    // 1. Landing Page
    if (currentPath === '/') {
      return <LandingPage navigate={navigate} />;
    }

    // 2. Report Wizard
    if (currentPath === '/items/new') {
      const type = searchParams.get('type') || 'lost';
      return <ReportWizardPage navigate={navigate} defaultType={type} />;
    }

    // 3. Item Detail: /items/:id
    const itemMatch = currentPath.match(/^\/items\/([a-zA-Z0-9_-]+)$/);
    if (itemMatch) {
      return <ItemDetailPage itemId={itemMatch[1]} navigate={navigate} />;
    }

    // 4. Discovery Feed: /items
    if (currentPath === '/items') {
      const search = searchParams.get('search') || '';
      return <DiscoveryFeedPage navigate={navigate} initialSearch={search} />;
    }

    // 5. Match Detail: /matches/:id
    const matchDetailMatch = currentPath.match(/^\/matches\/([a-zA-Z0-9_-]+)$/);
    if (matchDetailMatch) {
      return <MatchDetailPage matchId={matchDetailMatch[1]} navigate={navigate} />;
    }

    // 6. User Personal Submissions: /dashboard
    if (currentPath === '/dashboard') {
      return <DashboardPage navigate={navigate} />;
    }

    // 7. Campus Admin Console: /admin
    if (currentPath === '/admin') {
      return <AdminPage navigate={navigate} />;
    }

    // Fallback: 404 or redirect to /
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">The requested campus route does not exist.</p>
        <button onClick={() => navigate('/')} className="btn-primary text-xs">
          Return Home
        </button>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen flex flex-col justify-between bg-[#060913] text-slate-100 font-sans">
          
          {/* Top Sticky Navbar */}
          <Navbar currentRoute={currentPath} navigate={navigate} />

          {/* Main Route View */}
          <main className="flex-1">
            {renderCurrentPage()}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/70 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-300">CampusFind AI</span>
                <span>• Smart Campus Lost &amp; Found System</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span>Gemini 2.5 Flash Multimodal Engine</span>
                <span>•</span>
                <span>Campus Public Safety &amp; Custody</span>
              </div>
            </div>
          </footer>

        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}
