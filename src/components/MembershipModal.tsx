import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  CreditCard,
  Flame,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { MembershipPlan } from '../types/index.ts';

interface MembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: MembershipPlan | null;
  onSuccess?: () => void;
  onNavigateToAuth?: () => void;
}

export const MembershipModal: React.FC<MembershipModalProps> = ({
  isOpen,
  onClose,
  selectedPlan,
  onSuccess,
  onNavigateToAuth,
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('UPI (Instant Razorpay / GPay)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  if (!isOpen || !selectedPlan) return null;

  const handleSubscribe = async () => {
    if (!user) {
      if (onNavigateToAuth) {
        onClose();
        onNavigateToAuth();
      }
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await api.subscribeMembership(selectedPlan.id, paymentMethod);
      setCompleted(true);
      if (onSuccess) onSuccess();
      api.trackEvent('membership_enrolled', { plan: selectedPlan.name, price: selectedPlan.price });
    } catch (err: any) {
      setError(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    setCompleted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#2B2B2B] shadow-2xl p-6 sm:p-8 my-8 text-white animate-in zoom-in-95 duration-200">
        <button
          onClick={handleFinish}
          className="absolute top-5 right-5 text-[#888888] hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!completed ? (
          <div>
            {/* Header */}
            <div className="mb-6 border-b border-[#222222] pb-5">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF3838]">
                Enrolling in FORGE Tier
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight">
                  {selectedPlan.name} Membership
                </h2>
                <span className="font-display font-black text-2xl text-[#FF3838]">
                  ₹{selectedPlan.price.toLocaleString()}
                  <span className="text-xs text-[#888888] font-sans font-normal ml-1">
                    /{selectedPlan.duration}
                  </span>
                </span>
              </div>
              <p className="text-xs text-[#A0A0A0] mt-1">{selectedPlan.description}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] text-xs font-medium">
                {error}
              </div>
            )}

            {/* If user not logged in */}
            {!user ? (
              <div className="bg-[#161616] border border-[#2D2D2D] p-5 mb-5 text-center space-y-3">
                <User className="w-8 h-8 text-[#FF3838] mx-auto" />
                <h4 className="text-sm font-bold uppercase tracking-wider">
                  Athlete Authentication Required
                </h4>
                <p className="text-xs text-[#999999] leading-relaxed">
                  You need an active athlete account in our database to tie this membership to your profile.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateToAuth) onNavigateToAuth();
                  }}
                  className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-2.5 text-xs font-black uppercase tracking-wider transition-colors"
                >
                  Log In or Register Account
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Account info */}
                <div className="bg-[#141414] border border-[#222222] p-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[#777777] block text-[10px] uppercase font-bold">
                      Account Registered To
                    </span>
                    <span className="font-bold text-white">{user.name}</span>
                    <span className="text-[#888888] block text-[11px]">{user.email}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-[#222222] px-2 py-1 text-[#25D366] font-bold">
                    VERIFIED
                  </span>
                </div>

                {/* Features included */}
                <div className="space-y-1.5 py-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#777777]">
                    Included in {selectedPlan.name} Plan
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {selectedPlan.features.slice(0, 4).map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#CCCCCC]">
                        <Check className="w-3.5 h-3.5 text-[#FF3838] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Selection */}
                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider text-[11px] mb-1.5">
                    Payment Method (Simulated Gateway)
                  </label>
                  <div className="space-y-2 text-xs">
                    {[
                      'UPI (Google Pay, PhonePe, Paytm)',
                      'Credit / Debit Card (Visa, Mastercard, RuPay)',
                      'NetBanking (HDFC, ICICI, SBI, Axis)',
                      'Front Desk Cash / Terminal on First Visit',
                    ].map((method) => (
                      <label
                        key={method}
                        className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${
                          paymentMethod === method
                            ? 'bg-[#1C1C1C] border-[#FF3838] text-white'
                            : 'bg-[#131313] border-[#252525] text-[#888888] hover:border-[#383838]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="accent-[#FF3838]"
                        />
                        <span className="text-xs font-medium">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,56,56,0.3)]"
                >
                  {loading ? (
                    <span>Activating in PostgreSQL...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        Confirm & Pay ₹{selectedPlan.price.toLocaleString()}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Success Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-[#25D366]/10 border border-[#25D366]/40 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#25D366]">
                Membership Active & Recorded
              </span>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight">
                You Are Now a {selectedPlan.name} Member
              </h3>
              <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
                Your payment and membership record have been committed to PostgreSQL. You now have full class booking privileges.
              </p>
            </div>

            <div className="bg-[#141414] border border-[#252525] p-4 text-left text-xs font-mono space-y-2">
              <div className="flex justify-between border-b border-[#222222] pb-1.5">
                <span className="text-[#888888]">Plan:</span>
                <span className="text-white font-bold">{selectedPlan.name} Tier</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-1.5">
                <span className="text-[#888888]">Amount:</span>
                <span className="text-[#FF3838] font-bold">₹{selectedPlan.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-[#222222] pb-1.5">
                <span className="text-[#888888]">Status:</span>
                <span className="text-[#25D366] font-bold">Active</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-[#888888]">Payment Gateway:</span>
                <span className="text-white">{paymentMethod.split(' ')[0]}</span>
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Go to Member Portal
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
