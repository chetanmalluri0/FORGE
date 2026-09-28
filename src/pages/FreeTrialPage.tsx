import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';

export const FreeTrialPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: '25',
    fitnessGoal: 'Build Muscle & Raw Strength',
    preferredTime: '06:00 AM - 08:00 AM (Early Iron Wave)',
    previousExperience: '1-3 years of barbell training',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedLead, setConfirmedLead] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.submitFreeTrial({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        age: Number(formData.age) || undefined,
        fitnessGoal: formData.fitnessGoal,
        preferredTime: formData.preferredTime,
        previousExperience: formData.previousExperience,
      });

      setConfirmedLead(res.lead);
      api.trackEvent('free_trial_submitted', { goal: formData.fitnessGoal });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Editorial Value Proposition */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
              Test The Crucible Firsthand
            </span>
            <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
              Complimentary 1-Day Trial Pass
            </h1>
            <p className="text-sm sm:text-base text-[#AAAAAA] mt-4 leading-relaxed">
              We do not believe in signing contracts without feeling the knurling on the bars. Come train on our platforms, run through an assessment, and see why serious athletes call FORGE home.
            </p>
          </div>

          <div className="space-y-4 text-xs text-[#CCCCCC]">
            <div className="p-4 bg-[#121212] border border-[#202020] space-y-1">
              <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#FF3838]" />
                Full Floor & Rack Access
              </h4>
              <p className="text-[#888888] leading-relaxed">
                Unlimited access to Olympic lifting platforms, calibrated Eleiko plates, dumbbell racks up to 60kg, and specialty bars.
              </p>
            </div>

            <div className="p-4 bg-[#121212] border border-[#202020] space-y-1">
              <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[#FF3838]" />
                Movement & Mobility Screen
              </h4>
              <p className="text-[#888888] leading-relaxed">
                Our floor coach will run a quick 10-minute assessment of your ankle, hip, and thoracic spine mechanics prior to loading.
              </p>
            </div>

            <div className="p-4 bg-[#121212] border border-[#202020] space-y-1">
              <h4 className="font-bold text-white uppercase text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF3838]" />
                Zero Sales Pressure
              </h4>
              <p className="text-[#888888] leading-relaxed">
                No awkward cubicle sales tactics. If you love the training atmosphere, you enroll online. If not, the sweat was on us.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Lead Form or Confirmation */}
        <div className="lg:col-span-6">
          <div className="bg-[#101010] border border-[#262626] p-6 sm:p-10 shadow-2xl">
            {!confirmedLead ? (
              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                <div>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    Reserve Your Session
                  </h3>
                  <p className="text-xs text-[#888888] mt-1">
                    Direct integration with FORGE management & WhatsApp dispatch.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-[#FF3838]/10 border border-[#FF3838]/40 text-[#FF6B6B] font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Malhotra"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Phone Number *
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
                      max="85"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Fitness Goal *
                  </label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-[#181818] border border-[#2D2D2D] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                  >
                    <option value="Build Muscle & Raw Strength">Build Muscle & Raw Strength</option>
                    <option value="Fat Loss & High-Density Conditioning">Fat Loss & High-Density Conditioning</option>
                    <option value="Athletic Speed & Explosive Power">Athletic Speed & Explosive Power</option>
                    <option value="Fix Posture & Joint Resilience">Fix Posture & Joint Resilience</option>
                    <option value="Combat Conditioning & Striking">Combat Conditioning & Striking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Preferred Time Slot *
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
                    <option value="Complete beginner, new to weight training">Complete beginner, new to weight training</option>
                    <option value="1-3 years of barbell training">1-3 years of barbell training</option>
                    <option value="3+ years advanced powerlifting/bodybuilding">3+ years advanced powerlifting/bodybuilding</option>
                    <option value="Former competitive athlete">Former competitive athlete</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,56,56,0.35)]"
                  >
                    {loading ? (
                      <span>Saving to PostgreSQL...</span>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 fill-white" />
                        <span>Lock In My Pass</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Success Lead View */
              <div className="text-center py-6 space-y-6">
                <div className="w-16 h-16 bg-[#25D366]/10 border border-[#25D366]/40 rounded-full flex items-center justify-center mx-auto text-[#25D366]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#25D366]">
                    Pass Generated & Dispatched
                  </span>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    See You on the Platform, {confirmedLead.name}
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    Your trial record is stored in our database. Confirmation emails and WhatsApp notifications have been sent.
                  </p>
                </div>

                <div className="bg-[#161616] border border-[#2A2A2A] p-4 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#252525] pb-2">
                    <span className="text-[#888888]">Athlete:</span>
                    <span className="font-bold text-white">{confirmedLead.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-2">
                    <span className="text-[#888888]">Time Window:</span>
                    <span className="text-white">{confirmedLead.preferredTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#252525] pb-2">
                    <span className="text-[#888888]">Objective:</span>
                    <span className="text-[#FF3838] font-bold">{confirmedLead.fitnessGoal}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#888888]">Status:</span>
                    <span className="text-[#25D366] font-bold">New Lead in Admin Dashboard</span>
                  </div>
                </div>

                <button
                  onClick={() => setConfirmedLead(null)}
                  className="w-full bg-[#1E1E1E] hover:bg-[#282828] text-white py-3 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Register Another Pass
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
