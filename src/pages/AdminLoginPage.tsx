import React, { useState } from 'react';
import { Lock, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onBackToHome }) => {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid admin or staff credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail('admin@forgefitness.com');
    setPassword('ForgeAdmin2026!');
  };

  const fillStaff = () => {
    setEmail('staff@forgefitness.com');
    setPassword('ForgeStaff2026!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#101010] border border-[#2B2B2B] p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF3838] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3838] block">
            Security Clearance Required
          </span>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
            Staff & Admin Console
          </h2>
          <p className="text-xs text-[#888888]">
            Role-based dashboard for lead pipeline, schedules, memberships, and notification telemetry.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Quick Demo Pre-fill buttons */}
        <div className="space-y-2 bg-[#161616] p-3 border border-[#222222]">
          <p className="text-[10px] uppercase font-bold text-[#777777] font-mono">
            Demo Evaluator Fast-Fill:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={fillAdmin}
              className="py-1.5 px-2 bg-[#202020] hover:bg-[#2A2A2A] text-white border border-[#333333] text-[11px] font-mono font-bold uppercase transition-colors"
            >
              Fill Admin (Full)
            </button>
            <button
              type="button"
              onClick={fillStaff}
              className="py-1.5 px-2 bg-[#202020] hover:bg-[#2A2A2A] text-white border border-[#333333] text-[11px] font-mono font-bold uppercase transition-colors"
            >
              Fill Staff (Desk)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
              Admin Email *
            </label>
            <input
              type="email"
              required
              placeholder="admin@forgefitness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
            />
          </div>

          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
              Master Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,56,56,0.3)]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Authenticating with Cloud SQL...' : 'Enter Admin Console'}</span>
            </button>
          </div>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onBackToHome}
            className="text-[11px] font-mono text-[#666666] hover:text-[#999999] uppercase tracking-wider"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
