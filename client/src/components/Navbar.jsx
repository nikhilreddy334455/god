import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  PlusCircle, 
  User, 
  ShieldAlert, 
  Menu, 
  X, 
  ChevronDown,
  Layers,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar({ currentRoute, navigate }) {
  const { currentUser, demoUsers, switchUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Overview', route: '/', icon: Home },
    { label: 'Discovery Feed', route: '/items', icon: Search },
    { label: 'My Submissions', route: '/dashboard', icon: Layers },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ label: 'Admin Console', route: '/admin', icon: ShieldAlert });
  }

  const roleColors = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    faculty: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    student: 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  };

  return (
    <nav className="sticky top-0 z-40 bg-[#060913]/85 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-navy-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  Campus<span className="text-teal-400">Find</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 -mt-1 hidden sm:block">Intelligent Lost &amp; Found</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.route;
              return (
                <button
                  key={item.route}
                  onClick={() => navigate(item.route)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-teal-400 border border-slate-700/80 shadow-inner'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Header Section: CTA & Demo User Switcher */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Report CTA */}
            <button
              onClick={() => navigate('/items/new')}
              className="btn-primary text-sm py-2 px-4 shadow-teal-500/25 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-teal-400 font-bold text-xs border border-slate-700">
                  {currentUser?.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden lg:block text-xs">
                  <div className="font-semibold text-slate-200 truncate max-w-[110px]">
                    {currentUser?.full_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-medium border ${roleColors[currentUser?.role] || 'border-slate-700'}`}>
                      {currentUser?.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-xs">
                    <p className="text-slate-400">Signed in as</p>
                    <p className="font-semibold text-slate-100 truncate">{currentUser?.email}</p>
                  </div>

                  <div className="py-1">
                    <p className="px-3 pt-2 pb-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Switch Campus Identity
                    </p>
                    {demoUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => switchUser(user)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          user.id === currentUser?.id
                            ? 'bg-teal-500/10 text-teal-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="text-left">
                          <div>{user.full_name}</div>
                          <div className="text-[10px] text-slate-500">{user.email}</div>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${roleColors[user.role]}`}>
                          {user.role}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      <span>Admin Security Dashboard</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => navigate('/items/new')}
              className="p-2 rounded-lg bg-teal-500 text-navy-950 font-bold"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 px-4 pt-3 pb-5 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.route}
                onClick={() => {
                  navigate(item.route);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  currentRoute === item.route
                    ? 'bg-slate-800 text-teal-400'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* User selector on mobile */}
          <div className="pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-400 font-semibold mb-2">Campus Profile Switcher</p>
            <div className="grid grid-cols-2 gap-2">
              {demoUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs text-left border ${
                    u.id === currentUser?.id 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-300' 
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <p className="font-semibold truncate">{u.full_name}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{u.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
