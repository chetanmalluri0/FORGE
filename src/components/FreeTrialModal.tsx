import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Mail,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../services/api.ts';

interface FreeTrialModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedGoal?: string;
}

export const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
  isOpen,
  onClose,
  preselectedGoal,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '26',
    fitnessGoal: preselectedGoal || 'Build Muscle & Raw Strength',
    preferredTime: '06:00 AM - 08:00 AM (Morning Wave)',
    previousExperience: '1-3 years of barbell training',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successLead, setSuccessLead] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name || !formData.phone || !formData.email) {
        throw new Error('Please fill in all required contact details.');
      }

      const res = await api.submitFreeTrial({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        age: Number(formData.age) || undefined,
        fitnessGoal: formData.fitnessGoal,
        preferredTime: formData.preferredTime,
        previousExperience: formData.previousExperience,
      });

      setSuccessLead(res.lead);
      api.trackEvent('free_trial_submitted', { goal: formData.fitnessGoal });
    } catch (err: any) {
      setError(err.message || 'Failed to submit free trial pass.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccessLead(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0F0F0F] border border-[#262626] shadow-2xl p-6 sm:p-8 my-8 text-white animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 text-[#888888] hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!successLead ? (
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838] mb-1">
                <Flame className="w-4 h-4 fill-[#FF3838]" />
                <span>Complimentary 1-Day Performance Pass</span>
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase">
                Claim Your Free Trial
              </h2>
              <p className="text-xs sm:text-sm text-[#A0A0A0] mt-1 leading-relaxed">
                Step onto the floor, meet our strength coaching staff, and test your capacity with full facility access.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                  />
                </div>

                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  Primary Fitness Goal *
                </label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                >
                  <option value="Build Muscle & Raw Strength">Build Muscle & Raw Strength</option>
                  <option value="Fat Loss & Metabolic Conditioning">Fat Loss & Metabolic Conditioning</option>
                  <option value="Athletic Speed, Jump & Explosiveness">Athletic Speed, Jump & Explosiveness</option>
                  <option value="Fix Posture & Injury Rehabilitation">Fix Posture & Injury Rehabilitation</option>
                  <option value="Combat Conditioning & Striking">Combat Conditioning & Striking</option>
                  <option value="Olympic Weightlifting & Barbell Precision">Olympic Weightlifting & Barbell Precision</option>
                </select>
              </div>

              <div>
                <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                  Preferred Arrival Time *
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                >
                  <option value="06:00 AM - 08:00 AM (Early Iron Wave)">06:00 AM - 08:00 AM (Early Iron Wave)</option>
                  <option value="08:00 AM - 10:00 AM (Morning Conditioning)">08:00 AM - 10:00 AM (Morning Conditioning)</option>
                  <option value="12:00 PM - 02:00 PM (Mid-Day Power Block)">12:00 PM - 02:00 PM (Mid-Day Power Block)</option>
                  <option value="05:30 PM - 07:30 PM (Evening Prime)">05:30 PM - 07:30 PM (Evening Prime)</option>
                  <option value="07:30 PM - 09:30 PM (Night Shift)">07:30 PM - 09:30 PM (Night Shift)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                  Previous Gym Experience *
                </label>
                <select
                  value={formData.previousExperience}
                  onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                >
                  <option value="Beginner — New to weightlifting and structured gyms">Beginner — New to weightlifting and structured gyms</option>
                  <option value="Intermediate — 1-3 years of gym training, looking for coaching">Intermediate — 1-3 years of gym training, looking for coaching</option>
                  <option value="Advanced — 3+ years heavy barbell & competitive conditioning">Advanced — 3+ years heavy barbell & competitive conditioning</option>
                  <option value="Athlete / Former Competitor — Sport-specific strength needs">Athlete / Former Competitor — Sport-specific strength needs</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,56,56,0.35)]"
                >
                  {loading ? (
                    <span>Registering Pass with Lab...</span>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 fill-white" />
                      <span>Confirm Free Trial Pass</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-[#666666] text-center pt-1">
                Zero obligations. No credit card required. Confirmation dispatched via WhatsApp & Email.
              </p>
            </form>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-[#25D366]/10 border border-[#25D366]/40 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#25D366]">
                Pass Confirmed & Dispatched
              </span>
              <h3 className="font-display font-black text-2xl uppercase tracking-tight">
                Welcome to FORGE, {successLead.name}
              </h3>
              <p className="text-xs text-[#A0A0A0] max-w-md mx-auto">
                Your free trial pass has been recorded in our performance database. Our coaching staff has received your details.
              </p>
            </div>

            {/* Pass details receipt */}
            <div className="bg-[#161616] border border-[#2A2A2A] p-4 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-[#252525] pb-2">
                <span className="text-[#888888]">Pass Holder:</span>
                <span className="font-bold text-white">{successLead.name}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-2">
                <span className="text-[#888888]">Training Wave:</span>
                <span className="text-white">{successLead.preferredTime}</span>
              </div>
              <div className="flex justify-between border-b border-[#252525] pb-2">
                <span className="text-[#888888]">Focus Program:</span>
                <span className="text-[#FF3838] font-bold">{successLead.fitnessGoal}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-[#888888]">Status:</span>
                <span className="text-[#25D366] font-bold">Trial Scheduled (Database Confirmed)</span>
              </div>
            </div>

            {/* Notification logs simulation */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="p-3 bg-[#131313] border border-[#222222] flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF3838] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#777777] uppercase font-bold">Email Sent</p>
                  <p className="text-[11px] text-white truncate">{successLead.email}</p>
                </div>
              </div>
              <div className="p-3 bg-[#131313] border border-[#222222] flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-[#25D366] shrink-0" />
                <div>
                  <p className="text-[10px] text-[#777777] uppercase font-bold">WhatsApp Alert</p>
                  <p className="text-[11px] text-white truncate">Dispatched to Front Desk</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Done & Return to Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
