import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  Flame,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { ClassRegistration, Membership } from '../types/index.ts';

interface CustomerDashboardProps {
  onNavigateToSchedule: () => void;
  onNavigateToMemberships: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onNavigateToSchedule,
  onNavigateToMemberships,
}) => {
  const { user, refreshUser, logout } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [historyMemberships, setHistoryMemberships] = useState<Membership[]>([]);
  const [bookings, setBookings] = useState<ClassRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    fitnessGoal: user?.fitnessGoal || 'Build Muscle & Raw Strength',
    age: user?.age ? String(user.age) : '26',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [memRes, bookRes] = await Promise.all([
        api.getMyMembership(),
        api.getMyBookings(),
      ]);
      setMembership(memRes.currentMembership);
      setHistoryMemberships(memRes.history);
      setBookings(bookRes);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        fitnessGoal: profileForm.fitnessGoal,
        age: Number(profileForm.age) || undefined,
      });
      await refreshUser();
      setProfileMsg('Profile updated successfully.');
    } catch (err: any) {
      setProfileMsg(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCancelBooking = async (classId: number) => {
    try {
      await api.cancelClassRegistration(classId);
      await loadDashboardData();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-[#888888]">Please sign in to access the athlete portal.</p>
      </div>
    );
  }

  const upcomingBookings = bookings.filter((b) => b.status === 'Confirmed');
  const pastBookings = bookings.filter((b) => b.status !== 'Confirmed');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Top Banner / Welcome */}
      <div className="bg-[#111111] border border-[#222222] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3838]">
            Athlete Portal · Verified Account
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white">
            {user.name}
          </h1>
          <p className="text-xs text-[#888888] font-mono">
            {user.email} · Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToSchedule}
            className="px-4 py-2.5 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Book A Class</span>
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 bg-[#181818] hover:bg-[#222222] text-[#888888] hover:text-white border border-[#2B2B2B] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Membership & Profile | Right Column Class Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
        <div className="lg:col-span-5 space-y-8">
          {/* Active Membership Card */}
          <div className="bg-[#101010] border border-[#222222] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
                Current Membership Tier
              </span>
              {membership && (
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 ${
                    membership.status === 'Active'
                      ? 'bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30'
                      : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                  }`}
                >
                  {membership.status}
                </span>
              )}
            </div>

            {membership ? (
              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    {membership.plan?.name || 'Standard'} Tier
                  </h3>
                  <span className="text-xs font-mono text-[#888888]">
                    ₹{membership.amountPaid.toLocaleString()} paid
                  </span>
                </div>

                <div className="bg-[#141414] border border-[#202020] p-3 text-xs font-mono space-y-1.5 text-[#AAAAAA]">
                  <div className="flex justify-between">
                    <span>Valid From:</span>
                    <span className="text-white">
                      {new Date(membership.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Renewal:</span>
                    <span className="text-[#FF3838] font-bold">
                      {new Date(membership.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="text-white">{membership.paymentMethod}</span>
                  </div>
                </div>

                {membership.plan?.features && (
                  <div className="space-y-1 pt-1">
                    <p className="text-[10px] uppercase font-bold text-[#777777] font-mono">
                      Active Inclusions:
                    </p>
                    {membership.plan.features.slice(0, 3).map((feat, i) => (
                      <p key={i} className="text-xs text-[#CCCCCC]">
                        ✓ {feat}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center space-y-3">
                <p className="text-xs text-[#888888]">
                  No active membership enrolled under this profile.
                </p>
                <button
                  onClick={onNavigateToMemberships}
                  className="px-4 py-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Explore Membership Plans
                </button>
              </div>
            )}
          </div>

          {/* Profile Edit Card */}
          <div className="bg-[#101010] border border-[#222222] p-6 space-y-4">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Athlete Profile & Biometrics
            </h3>

            {profileMsg && (
              <p className="text-xs font-mono text-[#25D366] bg-[#25D366]/10 p-2 border border-[#25D366]/30">
                {profileMsg}
              </p>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] uppercase font-bold text-[10px] tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-white focus:outline-none focus:border-[#FF3838]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] uppercase font-bold text-[10px] tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-white focus:outline-none focus:border-[#FF3838]"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] uppercase font-bold text-[10px] tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={profileForm.age}
                    onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-white focus:outline-none focus:border-[#FF3838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] uppercase font-bold text-[10px] tracking-wider mb-1">
                  Primary Fitness Objective
                </label>
                <select
                  value={profileForm.fitnessGoal}
                  onChange={(e) => setProfileForm({ ...profileForm, fitnessGoal: e.target.value })}
                  className="w-full bg-[#161616] border border-[#2A2A2A] px-3 py-2 text-white focus:outline-none focus:border-[#FF3838]"
                >
                  <option value="Build Muscle & Raw Strength">Build Muscle & Raw Strength</option>
                  <option value="Cut Body Fat & Lean Tone">Cut Body Fat & Lean Tone</option>
                  <option value="Improve Athletic Speed & Agility">Improve Athletic Speed & Agility</option>
                  <option value="Fix Posture & Lower Back Pain">Fix Posture & Lower Back Pain</option>
                  <option value="CrossFit & Metabolic Endurance">CrossFit & Metabolic Endurance</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full py-2.5 bg-[#1B1B1B] hover:bg-[#2A2A2A] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5 text-[#FF3838]" />
                  <span>{profileSaving ? 'Saving...' : 'Update Details'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Class Bookings */}
        <div className="lg:col-span-7 space-y-8">
          {/* Upcoming sessions */}
          <div className="bg-[#101010] border border-[#222222] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#1C1C1C] pb-4">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
                  Schedule & Platforms
                </span>
                <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-0.5">
                  Upcoming Booked Classes
                </h3>
              </div>
              <span className="text-xs font-mono text-[#888888]">
                {upcomingBookings.length} Active Slot{upcomingBookings.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <p className="text-xs font-mono text-[#777777] py-6 text-center">
                Fetching reservations from PostgreSQL...
              </p>
            ) : upcomingBookings.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <Clock className="w-8 h-8 text-[#444444] mx-auto" />
                <p className="text-xs text-[#888888]">You have no upcoming class reservations.</p>
                <button
                  onClick={onNavigateToSchedule}
                  className="px-4 py-2 bg-[#FF3838] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Browse Class Schedule
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-[#141414] border border-[#252525] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#FF3838] font-bold uppercase">
                        <span>{reg.classDetails?.category}</span>
                        <span>·</span>
                        <span className="text-white">{reg.classDetails?.date}</span>
                      </div>
                      <h4 className="font-display font-black text-lg uppercase text-white">
                        {reg.classDetails?.title}
                      </h4>
                      <p className="text-xs text-[#888888]">
                        {reg.classDetails?.startTime} - {reg.classDetails?.endTime} · Coach{' '}
                        {reg.classDetails?.trainer?.name || 'Staff'} · {reg.classDetails?.room}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCancelBooking(reg.classId)}
                      className="px-3 py-1.5 bg-[#1F1F1F] hover:bg-[#FF3838] text-[#888888] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
                    >
                      Cancel Spot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings / History */}
          {pastBookings.length > 0 && (
            <div className="bg-[#101010] border border-[#222222] p-6 space-y-4">
              <h4 className="font-display font-black text-lg uppercase tracking-tight text-white border-b border-[#1C1C1C] pb-3">
                Past Sessions & Cancellations
              </h4>
              <div className="space-y-2 text-xs">
                {pastBookings.map((reg) => (
                  <div
                    key={reg.id}
                    className="p-3 bg-[#131313] border border-[#1E1E1E] flex justify-between items-center text-[#888888]"
                  >
                    <div>
                      <p className="text-white font-semibold">{reg.classDetails?.title}</p>
                      <p className="text-[11px] font-mono">{reg.classDetails?.date}</p>
                    </div>
                    <span className="font-mono text-[10px] uppercase font-bold text-[#666666]">
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
