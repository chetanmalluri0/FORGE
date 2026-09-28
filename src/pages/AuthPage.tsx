import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Lock,
  LogIn,
  Mail,
  Phone,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthPageProps {
  onSuccess: () => void;
  onNavigateToAdmin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigateToAdmin }) => {
  const { loginCustomer, registerCustomer } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    fitnessGoal: 'Build Muscle & Raw Strength',
    age: '26',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please fill in your name, Gmail/email address, and password.');
        }
        await registerCustomer({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phone: formData.phone.trim() || undefined,
          fitnessGoal: formData.fitnessGoal,
          age: Number(formData.age) || undefined,
        });
      } else {
        if (!formData.email.trim() || !formData.password.trim()) {
          throw new Error('Please enter your Gmail/email address and password.');
        }
        await loginCustomer(formData.email.trim().toLowerCase(), formData.password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setIsRegister(false);
    setError(null);
    setFormData({
      ...formData,
      email: 'aarav.sharma1@gmail.com',
      password: 'ForgeMember2026!',
    });
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-[#101010] border border-[#262626] p-6 sm:p-8 shadow-2xl">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-[#FF3838] flex items-center justify-center font-display font-black text-black text-xl mx-auto mb-3">
            F
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-white">
            {isRegister ? 'Register Athlete Account' : 'Athlete Portal Login'}
          </h2>
          <p className="text-xs text-[#888888] mt-1.5">
            {isRegister
              ? 'Create your athlete profile using your Gmail / email address.'
              : 'Sign in with your Gmail or email to access your membership, bookings, and workouts.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] text-xs font-medium leading-relaxed">
            {error}
          </div>
        )}

        {/* Demo Fast Fill Button */}
        {!isRegister && (
          <div className="mb-5">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2.5 bg-[#1B1B1B] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border border-[#333333] text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF3838]" />
              <span>Fill Seeded Demo Member (aarav.sharma1@gmail.com)</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#FF3838]" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838] transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#FF3838]" />
              <span>Gmail / Email Address *</span>
            </label>
            <input
              type="email"
              required
              placeholder="athlete@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#FF3838]" />
              <span>Password *</span>
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838] transition-colors"
            />
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#888888]" />
                    <span>Phone Number</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="16"
                    max="80"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1 flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-[#FF3838]" />
                  <span>Primary Fitness Goal</span>
                </label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838] transition-colors"
                >
                  <option value="Build Muscle & Raw Strength">Build Muscle & Raw Strength</option>
                  <option value="Cut Body Fat & Lean Tone">Cut Body Fat & Lean Tone</option>
                  <option value="Improve Athletic Speed & Agility">Improve Athletic Speed & Agility</option>
                  <option value="CrossFit & Metabolic Endurance">CrossFit & Metabolic Endurance</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {loading ? (
                <span>Authenticating with DB...</span>
              ) : isRegister ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Athlete Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In with Gmail / Email</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Register / Login */}
        <div className="mt-6 pt-5 border-t border-[#222222] text-center text-xs text-[#888888]">
          {isRegister ? (
            <p>
              Already an athlete member?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-[#FF3838] hover:text-[#ff5555] font-bold underline ml-1 cursor-pointer transition-colors"
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New to FORGE?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setError(null);
                }}
                className="text-[#FF3838] hover:text-[#ff5555] font-bold underline ml-1 cursor-pointer transition-colors"
              >
                Create Account with Gmail / Email
              </button>
            </p>
          )}
        </div>

        {/* Staff portal link */}
        <div className="mt-6 pt-4 border-t border-[#1C1C1C] text-center">
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="text-[11px] font-mono text-[#666666] hover:text-[#AAAAAA] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Staff & Coaching Coordinator Console →
          </button>
        </div>
      </div>
    </div>
  );
};
