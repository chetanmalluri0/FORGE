import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  MessageSquare,
  Shield,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import { api } from '../services/api.ts';
import { GymClass, GymProgram, MembershipPlan, Trainer } from '../types/index.ts';

interface HomePageProps {
  setCurrentView: (view: string) => void;
  onOpenFreeTrial: () => void;
  onSelectPlan: (plan: MembershipPlan) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentView,
  onOpenFreeTrial,
  onSelectPlan,
}) => {
  const [programs, setPrograms] = useState<GymProgram[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, planRes, trainRes, classRes] = await Promise.all([
          api.getPrograms(),
          api.getMembershipPlans(),
          api.getTrainers(),
          api.getClasses(),
        ]);
        setPrograms(progRes);
        setPlans(planRes);
        setTrainers(trainRes);
        setUpcomingClasses(classRes.slice(0, 4));
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-[#1C1C1C]">
        {/* High contrast editorial background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop"
            alt="FORGE Performance Lab training arena"
            className="w-full h-full object-cover object-center filter grayscale contrast-125 brightness-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 to-[#080808]/40" />
          <div className="absolute inset-0 bg-[radial-gradient(#FF3838_1px,transparent_1px)] [background-size:32px_32px] opacity-10" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
          {/* Subtle Tagline kicker */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-[#141414]/90 border border-[#262626] mb-8 text-xs font-mono tracking-widest text-[#FF3838] uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF3838] animate-pulse" />
            <span>BUILD STRENGTH. BUILD DISCIPLINE.</span>
          </div>

          <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight uppercase leading-[0.95] text-white">
            TRAIN WITH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#E0E0E0] to-[#FF3838]">
              PURPOSE.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-xl text-[#B0B0B0] max-w-2xl mx-auto font-normal leading-relaxed">
            Performance-driven training for people who refuse to stay average. Precision barbell systems, high-density conditioning, and master coaching.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <button
              onClick={onOpenFreeTrial}
              className="w-full sm:w-auto px-8 py-4 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-[0_0_30px_rgba(255,56,56,0.4)] flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 fill-white" />
              <span>Start Your Free Trial</span>
            </button>

            <button
              onClick={() => {
                setCurrentView('memberships');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 bg-[#141414] hover:bg-[#1E1E1E] text-white border border-[#2E2E2E] hover:border-[#555555] text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <span>View Memberships</span>
              <ArrowRight className="w-4 h-4 text-[#888888]" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-12 border-t border-[#222222]/80 text-left">
            <div>
              <p className="font-display font-black text-2xl sm:text-3xl text-white">12,000</p>
              <p className="text-[11px] uppercase tracking-wider text-[#777777] font-mono mt-0.5">
                SQ. FT. PERFORMANCE LAB
              </p>
            </div>
            <div>
              <p className="font-display font-black text-2xl sm:text-3xl text-white">15</p>
              <p className="text-[11px] uppercase tracking-wider text-[#777777] font-mono mt-0.5">
                CSCS MASTER COACHES
              </p>
            </div>
            <div>
              <p className="font-display font-black text-2xl sm:text-3xl text-white">100%</p>
              <p className="text-[11px] uppercase tracking-wider text-[#777777] font-mono mt-0.5">
                ELEIKO & ROGUE RIGS
              </p>
            </div>
            <div>
              <p className="font-display font-black text-2xl sm:text-3xl text-[#FF3838]">0</p>
              <p className="text-[11px] uppercase tracking-wider text-[#777777] font-mono mt-0.5">
                GIMMICKS OR SHORTCUTS
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRAINING PROGRAMS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
              Methodology & Focus
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
              Performance Programs
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('programs')}
            className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-wider text-[#A0A0A0] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Explore All 5 Programs</span>
            <ChevronRight className="w-4 h-4 text-[#FF3838]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div
              key={program.id}
              className="group bg-[#111111] border border-[#202020] hover:border-[#383838] transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute top-3 right-3 bg-[#0A0A0A]/90 border border-[#2A2A2A] px-2.5 py-1 text-xs font-mono font-bold text-[#FF3838]">
                  ₹{program.price.toLocaleString()}
                  <span className="text-[10px] text-[#888888] font-normal"> /mo</span>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display font-black text-xl uppercase tracking-tight text-white group-hover:text-[#FF3838] transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-xs text-[#999999] mt-2 line-clamp-3 leading-relaxed">
                    {program.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-[#1F1F1F] pt-4">
                  {program.benefits.slice(0, 2).map((benefit, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 text-xs text-[#CCCCCC]">
                      <Check className="w-3.5 h-3.5 text-[#FF3838] shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={onOpenFreeTrial}
                    className="w-full py-2.5 bg-[#181818] hover:bg-[#FF3838] text-white hover:text-white border border-[#282828] hover:border-[#FF3838] text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Experience in Free Trial
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBERSHIP TIERS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
            Transparent Investment
          </span>
          <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-1">
            Membership Tiers
          </h2>
          <p className="text-xs sm:text-sm text-[#A0A0A0] mt-3">
            Choose the tier matching your discipline. No lock-in fees. Instant PostgreSQL membership generation with full class access.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-[#101010] border p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'border-[#FF3838] shadow-[0_0_35px_rgba(255,56,56,0.15)] bg-[#131111]'
                  : 'border-[#222222] hover:border-[#333333]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF3838] text-white px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
                  Most Selected by Athletes
                </div>
              )}

              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    {plan.name}
                  </h3>
                  <span className="text-xs font-mono text-[#888888]">{plan.duration}</span>
                </div>

                <div className="mb-6">
                  <span className="font-display font-black text-4xl text-white">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#777777] ml-1">/month</span>
                </div>

                <p className="text-xs text-[#999999] mb-6 leading-relaxed border-b border-[#1E1E1E] pb-6">
                  {plan.description}
                </p>

                <div className="space-y-3 mb-8">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
                    Plan Inclusions:
                  </p>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                      <Check className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => onSelectPlan(plan)}
                  className={`w-full py-3.5 text-xs font-black uppercase tracking-widest transition-all ${
                    plan.popular
                      ? 'bg-[#FF3838] hover:bg-[#e02e2e] text-white shadow-[0_0_20px_rgba(255,56,56,0.3)]'
                      : 'bg-[#181818] hover:bg-white hover:text-black text-white border border-[#2B2B2B]'
                  }`}
                >
                  Select {plan.name} Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MASTER TRAINERS ROSTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
              Elite Coaching Staff
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
              Meet the Coaches
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('trainers')}
            className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-wider text-[#A0A0A0] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>View All 15 Certified Coaches</span>
            <ChevronRight className="w-4 h-4 text-[#FF3838]" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainers.slice(0, 4).map((trainer) => (
            <div
              key={trainer.id}
              className="bg-[#101010] border border-[#202020] overflow-hidden group hover:border-[#383838] transition-all"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={trainer.imageUrl}
                  alt={trainer.name}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-[10px] font-mono uppercase font-bold text-[#FF3838]">
                    {trainer.experience}
                  </p>
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    {trainer.name}
                  </h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <p className="text-xs font-semibold text-[#CCCCCC]">{trainer.specialization}</p>
                <p className="text-[11px] text-[#777777] line-clamp-2 leading-relaxed">
                  {trainer.bio}
                </p>
                {trainer.certifications && (
                  <p className="text-[10px] font-mono text-[#555555] truncate pt-1">
                    {trainer.certifications}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* GYM EDITORIAL GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
            The Iron Arena
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
            The Facility
          </h2>
          <p className="text-xs sm:text-sm text-[#888888] mt-2">
            Engineered with zero compromises. Swedish Eleiko steel, heavy turf tracks, and cold recovery suites.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative h-48 sm:h-64 overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop"
              alt="Barbell Arena"
              className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold uppercase text-white bg-black/60 px-2 py-0.5">
              Olympic Lifting Platforms
            </span>
          </div>

          <div className="relative h-48 sm:h-64 overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop"
              alt="Metabolic Sprint Turf"
              className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold uppercase text-white bg-black/60 px-2 py-0.5">
              Sled Turf & SkiErgs
            </span>
          </div>

          <div className="relative h-48 sm:h-64 overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
              alt="Combat Striking Cage"
              className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold uppercase text-white bg-black/60 px-2 py-0.5">
              Combat Striking Ring
            </span>
          </div>

          <div className="relative h-48 sm:h-64 overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"
              alt="Recovery & Cold Plunge Suite"
              className="w-full h-full object-cover grayscale contrast-125 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors" />
            <span className="absolute bottom-2 left-2 text-[10px] font-mono font-bold uppercase text-white bg-black/60 px-2 py-0.5">
              Recovery & Cold Plunge
            </span>
          </div>
        </div>
      </section>

      {/* TODAY'S CLASSES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
              Live Booking System
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
              Upcoming Classes
            </h2>
          </div>
          <button
            onClick={() => setCurrentView('classes')}
            className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-wider text-[#A0A0A0] hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <span>View Full 7-Day Schedule</span>
            <ChevronRight className="w-4 h-4 text-[#FF3838]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingClasses.map((item) => (
            <div
              key={item.id}
              className="bg-[#121212] border border-[#202020] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#333333] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[11px] font-mono text-[#888888]">
                  <Clock className="w-3.5 h-3.5 text-[#FF3838]" />
                  <span>
                    {item.startTime} — {item.endTime}
                  </span>
                  <span>·</span>
                  <span className="text-white font-semibold">{item.category}</span>
                </div>
                <h3 className="font-display font-black text-lg text-white uppercase">
                  {item.title}
                </h3>
                <p className="text-xs text-[#777777]">
                  Coach: {item.trainer?.name || 'Head Coach'} · {item.room}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <span className="text-xs font-mono text-[#A0A0A0]">
                  Capacity: <strong className="text-white">{item.bookedCount}/{item.capacity}</strong>
                </span>
                <button
                  onClick={() => setCurrentView('classes')}
                  className="px-4 py-2 bg-[#1B1B1B] hover:bg-[#FF3838] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEMBER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#1C1C1C] pt-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
            Verifiable Results
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-white mt-1">
            From The Crucible
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'Arjun Singhania',
              role: 'Competitive Lifter & Founder',
              quote:
                'I had hit a 3-year plateau on my squat and deadlift. Within 12 weeks on FORGE Strength under Coach Marcus, my deadlift climbed from 180kg to 220kg with zero lower-back pain.',
              stat: '+40KG DEADLIFT',
            },
            {
              name: 'Meenakshi Sundaram',
              role: 'Distance Runner',
              quote:
                'The athletic mobility and functional conditioning here completely cured my chronic IT-band friction. The coaches understand human anatomy, not just loud cheering.',
              stat: 'PAIN-FREE PR',
            },
            {
              name: 'Rohan Mehra',
              role: 'Tech Executive',
              quote:
                'The culture is unapologetic. No people on their phones sitting on machines for 20 minutes. You show up, warm up with intent, hit your numbers, and leave stronger.',
              stat: '-11% BODY FAT',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#0F0F0F] border border-[#202020] p-6 space-y-4">
              <div className="flex items-center gap-1 text-[#FF3838]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-[#FF3838]" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-[#CCCCCC] leading-relaxed italic">
                "{item.quote}"
              </p>
              <div className="border-t border-[#1C1C1C] pt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-white uppercase">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#777777]">{item.role}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#FF3838] bg-[#FF3838]/10 px-2 py-1">
                  {item.stat}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL FREE TRIAL CALLOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-[#141414] via-[#1A1212] to-[#141414] border border-[#331C1C] p-8 sm:p-16 text-center overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
              Ready to Step In?
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Start With A Complimentary Pass
            </h2>
            <p className="text-xs sm:text-base text-[#A0A0A0] leading-relaxed">
              No sales pitches. No spam. Experience the energy, equipment, and coaching firsthand. We guarantee you will never want to train in a commercial gym again.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onOpenFreeTrial}
                className="w-full sm:w-auto px-8 py-4 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,56,56,0.4)] flex items-center justify-center gap-2"
              >
                <Flame className="w-4 h-4 fill-white" />
                <span>Claim Free Trial Pass</span>
              </button>
              <button
                onClick={() => setCurrentView('contact')}
                className="w-full sm:w-auto px-8 py-4 bg-transparent hover:bg-white/5 text-white border border-[#444444] text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Visit Our Facility
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
