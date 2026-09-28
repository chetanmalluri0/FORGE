import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Flame,
  HelpCircle,
  Info,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthPageProps {
  onSuccess: () => void;
  onNavigateToAdmin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onNavigateToAdmin }) => {
  const { loginCustomer, registerCustomer, loginWithGoogle, redirectError, clearRedirectError } = useAuth();
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
  const [firebaseError, setFirebaseError] = useState<{
    code?: string;
    message: string;
    domain?: string;
  } | null>(null);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentProjectId = firebaseConfig.projectId || 'ungoogly-node-qsmzh';

  React.useEffect(() => {
    if (redirectError) {
      setFirebaseError({
        code: redirectError.code,
        message: redirectError.message,
        domain: currentDomain,
      });
      clearRedirectError();
    }
  }, [redirectError, currentDomain]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFirebaseError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('Please fill in name, email, and password.');
        }
        await registerCustomer({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined,
          fitnessGoal: formData.fitnessGoal,
          age: Number(formData.age) || undefined,
        });
      } else {
        if (!formData.email || !formData.password) {
          throw new Error('Please enter your email and password.');
        }
        await loginCustomer(formData.email, formData.password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setFirebaseError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      const code = err.code || '';
      const msg = err.message || 'Google authentication failed.';
      setFirebaseError({
        code,
        message: msg,
        domain: currentDomain,
      });
      setError(null); // Managed via dedicated Firebase diagnostics box
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setIsRegister(false);
    setFirebaseError(null);
    setError(null);
    setFormData({
      ...formData,
      email: 'aarav.sharma1@gmail.com',
      password: 'ForgeMember2026!',
    });
  };

  const copyDomainToClipboard = () => {
    if (navigator?.clipboard && currentDomain) {
      navigator.clipboard.writeText(currentDomain);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
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
            {isRegister ? 'Register Athlete Profile' : 'Athlete Portal Login'}
          </h2>
          <p className="text-xs text-[#888888] mt-1">
            Access your memberships, class bookings, and workout schedule.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Dedicated Firebase Error Diagnostics & Resolution Box */}
        {firebaseError && (
          <div className="mb-6 p-4 bg-[#1A1212] border border-[#FF4444]/60 rounded-none shadow-lg text-left">
            <div className="flex items-start gap-2.5 mb-2.5">
              <AlertTriangle className="w-5 h-5 text-[#FF4444] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Firebase Authentication Error
                </h4>
                <p className="text-[11px] font-mono text-[#FF8888] mt-0.5">
                  {firebaseError.code || 'OAuth Exception'}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#CCCCCC] leading-relaxed mb-3">
              {firebaseError.code === 'auth/unauthorized-domain' ? (
                <>
                  Firebase blocked Google OAuth because this app's preview domain is not yet allowlisted in the Firebase Console.
                </>
              ) : firebaseError.code === 'auth/popup-blocked' ? (
                <>
                  Your browser or the iframe sandbox blocked the Google Sign-In popup window.
                </>
              ) : firebaseError.code === 'auth/configuration-not-found' || firebaseError.code === 'auth/operation-not-allowed' ? (
                <>
                  Google Sign-In provider has not been toggled on in the Firebase project console.
                </>
              ) : (
                firebaseError.message
              )}
            </p>

            {/* How to Fix Step-by-Step */}
            <div className="bg-[#111111] border border-[#2D2D2D] p-3 text-[11px] mb-3 space-y-2">
              <div className="text-[#FF3838] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>How to Fix in Firebase Console</span>
              </div>

              {firebaseError.code === 'auth/unauthorized-domain' ? (
                <div className="space-y-2 text-[#AAAAAA]">
                  <div>
                    <span className="text-white font-bold">1. Current Domain to Authorize:</span>
                    <div className="mt-1 flex items-center justify-between bg-[#1D1D1D] px-2.5 py-1.5 border border-[#333333]">
                      <span className="font-mono text-white text-[11px] truncate">
                        {currentDomain || 'current-preview-domain.run.app'}
                      </span>
                      <button
                        type="button"
                        onClick={copyDomainToClipboard}
                        className="ml-2 px-2 py-0.5 bg-[#FF3838] text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-[#e02e2e]"
                      >
                        {copiedDomain ? (
                          <>
                            <Check className="w-3 h-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-white font-bold">2. Add to Firebase Project:</span>
                    <p className="mt-0.5">
                      Go to <span className="text-white">Firebase Console</span> → Project{' '}
                      <span className="text-white font-mono">{currentProjectId}</span> →{' '}
                      <span className="text-white">Authentication</span> →{' '}
                      <span className="text-white">Settings</span> →{' '}
                      <span className="text-white">Authorized domains</span> → click{' '}
                      <span className="text-white">Add domain</span> and paste the copied domain.
                    </p>
                  </div>
                  <div>
                    <span className="text-white font-bold">3. Direct Link:</span>
                    <a
                      href={`https://console.firebase.google.com/project/${currentProjectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B6B] hover:text-[#FF8888] underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <span>Open Firebase Auth Settings</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : firebaseError.code === 'auth/popup-blocked' ? (
                <div className="space-y-1 text-[#AAAAAA]">
                  <p>
                    1. Check your browser address bar for a "Pop-up blocked" icon and click "Always allow pop-ups for this site".
                  </p>
                  <p>
                    2. Or alternatively, use the 1-click PostgreSQL native demo login below.
                  </p>
                </div>
              ) : (
                <div className="space-y-1 text-[#AAAAAA]">
                  <p>
                    1. Open <a href={`https://console.firebase.google.com/project/${currentProjectId}/authentication/providers`} target="_blank" rel="noreferrer" className="text-[#FF6B6B] underline">Firebase Authentication Sign-in Methods</a>.
                  </p>
                  <p>
                    2. Enable <strong className="text-white">Google</strong> under Sign-in providers.
                  </p>
                </div>
              )}
            </div>

            {/* Instant Fallback Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={async () => {
                  try {
                    setLoading(true);
                    await loginCustomer('aarav.sharma1@gmail.com', 'ForgeMember2026!');
                    onSuccess();
                  } catch (e: any) {
                    setError(e.message || 'Direct DB login failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Bypass & Login as Demo Member (Direct PostgreSQL)</span>
              </button>
              <p className="text-[10px] text-[#888888] text-center mt-1.5">
                The Cloud SQL PostgreSQL database is 100% active and does not require Google OAuth.
              </p>
            </div>
          </div>
        )}

        {/* Demo Fast Fill Button */}
        {!isRegister && (
          <div className="mb-5">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2 bg-[#1B1B1B] hover:bg-[#252525] text-[#AAAAAA] hover:text-white border border-[#333333] text-[11px] font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF3838]" />
              <span>Fill Seeded Demo Member</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isRegister && (
            <div>
              <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
              />
            </div>
          )}

          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="athlete@forge.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
            />
          </div>

          <div>
            <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
            />
          </div>

          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
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
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                  Primary Fitness Goal
                </label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
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
              className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                  <span>Enter Member Portal</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Google OAuth Firebase */}
        <div className="mt-5 pt-5 border-t border-[#222222]">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-[#181818] hover:bg-[#222222] text-white border border-[#303030] py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Firebase Setup & Help Accordion */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
              className="w-full text-left text-[11px] font-mono text-[#888888] hover:text-[#CCCCCC] flex items-center justify-between py-1 transition-colors"
            >
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-[#FF3838]" />
                <span>Firebase OAuth Guide & Authorized Domain</span>
              </span>
              {showFirebaseGuide ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showFirebaseGuide && (
              <div className="mt-2 p-3 bg-[#141414] border border-[#262626] text-[11px] text-[#AAAAAA] space-y-2.5">
                <div>
                  <span className="text-white font-bold block mb-0.5">Firebase Project ID:</span>
                  <code className="text-[#FF3838] font-mono bg-[#1E1E1E] px-1.5 py-0.5">
                    {currentProjectId}
                  </code>
                </div>

                <div>
                  <span className="text-white font-bold block mb-0.5">App Domain to Authorize:</span>
                  <div className="flex items-center justify-between bg-[#1E1E1E] px-2 py-1 border border-[#333333]">
                    <span className="font-mono text-white text-[10px] truncate">
                      {currentDomain || 'current-preview-domain'}
                    </span>
                    <button
                      type="button"
                      onClick={copyDomainToClipboard}
                      className="ml-2 px-1.5 py-0.5 bg-[#333333] hover:bg-[#444444] text-white text-[10px] font-mono uppercase"
                    >
                      {copiedDomain ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="text-[10px] space-y-1 text-[#888888]">
                  <p>
                    • If Google Sign-In gives <code className="text-white">auth/unauthorized-domain</code>, add the domain above to{' '}
                    <a
                      href={`https://console.firebase.google.com/project/${currentProjectId}/authentication/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FF6B6B] underline"
                    >
                      Firebase Console Authorized Domains
                    </a>.
                  </p>
                  <p>
                    • If inside an iframe and popups are blocked, allow popups in your browser address bar.
                  </p>
                  <p>
                    • Full authentication also works directly via PostgreSQL without external Google OAuth!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Toggle Register / Login */}
        <div className="mt-6 text-center text-xs text-[#888888]">
          {isRegister ? (
            <p>
              Already an athlete member?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setError(null);
                }}
                className="text-[#FF3838] font-bold underline ml-1"
              >
                Log In
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
                className="text-[#FF3838] font-bold underline ml-1"
              >
                Create Account
              </button>
            </p>
          )}
        </div>

        {/* Staff portal link */}
        <div className="mt-6 pt-4 border-t border-[#1C1C1C] text-center">
          <button
            type="button"
            onClick={onNavigateToAdmin}
            className="text-[11px] font-mono text-[#666666] hover:text-[#999999] uppercase tracking-wider"
          >
            Staff & Coaching Coordinator Console →
          </button>
        </div>
      </div>
    </div>
  );
};
