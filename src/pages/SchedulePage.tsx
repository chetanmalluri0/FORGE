import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Dumbbell,
  Filter,
  Flame,
  MapPin,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { GymClass } from '../types/index.ts';

interface SchedulePageProps {
  onNavigateToAuth: () => void;
}

export const SchedulePage: React.FC<SchedulePageProps> = ({ onNavigateToAuth }) => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const categories = [
    'All',
    'Strength',
    'HIIT',
    'CrossFit',
    'Yoga',
    'Mobility',
    'Boxing',
    'Functional Training',
  ];

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await api.getClasses(selectedCategory, selectedDate || undefined);
      setClasses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedCategory, selectedDate, user]);

  const handleBook = async (gymClass: GymClass) => {
    if (!user) {
      onNavigateToAuth();
      return;
    }

    if (gymClass.bookedCount >= gymClass.capacity) {
      setNotificationMsg({ text: 'This class has reached full capacity.', type: 'error' });
      return;
    }

    try {
      setActionLoadingId(gymClass.id);
      await api.registerForClass(gymClass.id);
      setNotificationMsg({
        text: `Confirmed spot for "${gymClass.title}"! Confirmation dispatched to ${user.email}.`,
        type: 'success',
      });
      await fetchClasses();
    } catch (err: any) {
      setNotificationMsg({ text: err.message || 'Failed to book slot.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (gymClass: GymClass) => {
    try {
      setActionLoadingId(gymClass.id);
      await api.cancelClassRegistration(gymClass.id);
      setNotificationMsg({ text: `Registration for ${gymClass.title} cancelled.`, type: 'success' });
      await fetchClasses();
    } catch (err: any) {
      setNotificationMsg({ text: err.message || 'Failed to cancel booking.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          Real-Time Capacity & Slots
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Class Schedule
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          Book your spot on the platform. All sessions are strictly capped to ensure individualized coaching feedback and barbell space.
        </p>
      </div>

      {notificationMsg && (
        <div
          className={`p-4 border text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2 ${
            notificationMsg.type === 'success'
              ? 'bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]'
              : 'bg-[#FF3838]/10 border-[#FF3838]/40 text-[#FF6B6B]'
          }`}
        >
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Flame className="w-4 h-4 shrink-0" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#101010] border border-[#222222] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 whitespace-nowrap text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#181818] text-[#888888] hover:text-white border border-[#262626]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="w-4 h-4 text-[#888888]" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#181818] border border-[#2A2A2A] px-3 py-1.5 text-white focus:outline-none focus:border-[#FF3838] text-xs font-mono"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-[11px] text-[#FF3838] underline ml-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Classes list */}
      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#777777]">
          Connecting to Cloud SQL and loading schedule...
        </div>
      ) : classes.length === 0 ? (
        <div className="py-16 text-center bg-[#101010] border border-[#222222] p-8 space-y-3">
          <p className="font-display font-bold text-lg text-white uppercase">
            No sessions match the selected filter
          </p>
          <p className="text-xs text-[#888888]">
            Try switching category to &quot;All&quot; or selecting a different date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const isFull = cls.bookedCount >= cls.capacity;
            const pct = Math.min(100, Math.round((cls.bookedCount / cls.capacity) * 100));

            return (
              <div
                key={cls.id}
                className="bg-[#111111] border border-[#222222] p-6 flex flex-col justify-between space-y-5 hover:border-[#383838] transition-colors"
              >
                <div>
                  {/* Top line with Category & Date */}
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-[#FF3838] font-bold uppercase tracking-wider">
                      {cls.category}
                    </span>
                    <span className="text-[#888888]">{cls.date}</span>
                  </div>

                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
                    {cls.title}
                  </h3>

                  <p className="text-xs text-[#999999] mt-2 leading-relaxed">
                    {cls.description}
                  </p>
                </div>

                <div className="space-y-3 text-xs border-t border-[#1C1C1C] pt-4">
                  {/* Time & Trainer */}
                  <div className="flex items-center justify-between text-[#CCCCCC]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#FF3838]" />
                      <span className="font-mono">{cls.startTime} - {cls.endTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#888888]">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{cls.room}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A0A0A0]">
                    <span>Coach: <strong className="text-white">{cls.trainer?.name || 'Staff'}</strong></span>
                    <span className="font-mono text-[10px] bg-[#1A1A1A] px-2 py-0.5 text-[#CCCCCC]">
                      {cls.intensity} Intensity
                    </span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-[#888888]">
                      <span>Occupancy</span>
                      <span className={isFull ? 'text-[#FF3838] font-bold' : 'text-white'}>
                        {cls.bookedCount} / {cls.capacity} spots ({isFull ? 'FULL' : `${cls.capacity - cls.bookedCount} left`})
                      </span>
                    </div>
                    <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isFull ? 'bg-[#FF3838]' : pct > 75 ? 'bg-amber-500' : 'bg-[#25D366]'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  {cls.isRegistered ? (
                    <div className="space-y-2">
                      <div className="w-full py-2 bg-[#25D366]/10 border border-[#25D366]/40 text-[#25D366] text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>Registered & Confirmed</span>
                      </div>
                      <button
                        onClick={() => handleCancel(cls)}
                        disabled={actionLoadingId === cls.id}
                        className="w-full text-center text-[10px] text-[#888888] hover:text-[#FF3838] transition-colors py-1 uppercase tracking-wider font-semibold"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  ) : isFull ? (
                    <button
                      disabled
                      className="w-full py-3 bg-[#1C1C1C] text-[#555555] text-xs font-black uppercase tracking-widest cursor-not-allowed border border-[#282828]"
                    >
                      Class Full (Waitlist at Desk)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBook(cls)}
                      disabled={actionLoadingId === cls.id}
                      className="w-full py-3 bg-[#181818] hover:bg-[#FF3838] text-white text-xs font-black uppercase tracking-widest border border-[#282828] hover:border-[#FF3838] transition-all flex items-center justify-center gap-2"
                    >
                      {actionLoadingId === cls.id ? (
                        <span>Reserving in DB...</span>
                      ) : (
                        <>
                          <Dumbbell className="w-3.5 h-3.5" />
                          <span>Reserve Spot</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
