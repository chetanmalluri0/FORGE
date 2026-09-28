import React, { useState } from 'react';
import {
  Calendar,
  ChevronRight,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  onOpenFreeTrial: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenFreeTrial,
}) => {
  const { user, adminUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'programs', label: 'Programs' },
    { id: 'memberships', label: 'Memberships' },
    { id: 'trainers', label: 'Coaches' },
    { id: 'classes', label: 'Schedule' },
    { id: 'about', label: 'Philosophy' },
    { id: 'contact', label: 'Location' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 bg-[#FF3838] flex items-center justify-center font-display font-black text-black text-xl tracking-tighter group-hover:bg-white transition-colors">
            F
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-white block leading-none">
              FORGE
            </span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#888888] block">
              Performance Lab
            </span>
          </div>
        </button>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleNavClick(link.id)}
              className={`transition-colors py-1 border-b-2 text-xs uppercase tracking-wider font-semibold ${
                currentView === link.id
                  ? 'text-white border-[#FF3838]'
                  : 'text-[#A0A0A0] border-transparent hover:text-white hover:border-[#333333]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action buttons */}
        <div className="hidden sm:flex items-center gap-4">
          {/* Admin link if logged in as admin */}
          {adminUser ? (
            <button
              onClick={() => handleNavClick('admin-dashboard')}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#FF3838] border border-[#FF3838]/40 hover:bg-[#FF3838]/10 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          ) : null}

          {/* User Account or Login */}
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavClick('customer-dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white bg-[#181818] border border-[#2A2A2A] hover:border-[#444444] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#FF3838]" />
                <span className="max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
              </button>
              <button
                onClick={logout}
                title="Sign out"
                className="p-1.5 text-[#888888] hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className="text-xs font-bold uppercase tracking-wider text-[#CCCCCC] hover:text-white transition-colors px-2 py-1"
            >
              Athlete Login
            </button>
          )}

          {/* Free Trial CTA */}
          <button
            onClick={onOpenFreeTrial}
            className="flex items-center gap-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,56,56,0.3)]"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Free Trial Pass</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            onClick={onOpenFreeTrial}
            className="bg-[#FF3838] text-white px-3 py-1.5 text-xs font-black uppercase tracking-wider"
          >
            Trial
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white hover:text-[#FF3838] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0D0D0D] border-b border-[#222222] px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-4 border-b border-[#222222]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 text-xs uppercase tracking-wider font-bold ${
                  currentView === link.id
                    ? 'text-[#FF3838] bg-[#1A1A1A]'
                    : 'text-[#AAAAAA] hover:text-white hover:bg-[#141414]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick('customer-dashboard')}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#161616] text-white text-xs font-bold uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#FF3838]" />
                    <span>Member Portal ({user.name.split(' ')[0]})</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#666666]" />
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-[#888888] uppercase tracking-wider"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('auth')}
                className="w-full text-center py-2.5 border border-[#333333] text-xs font-bold uppercase tracking-wider text-white"
              >
                Athlete Login / Sign Up
              </button>
            )}

            <button
              onClick={() => handleNavClick('admin-login')}
              className="w-full text-left px-4 py-2 text-[11px] font-semibold text-[#666666] hover:text-[#999999] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Shield className="w-3 h-3 text-[#FF3838]" />
              <span>Admin & Staff Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
