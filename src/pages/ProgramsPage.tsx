import React, { useEffect, useState } from 'react';
import { Check, Clock, Dumbbell, Flame, Sparkles, User, Zap } from 'lucide-react';
import { api } from '../services/api.ts';
import { GymProgram } from '../types/index.ts';

interface ProgramsPageProps {
  onOpenFreeTrial: (goal?: string) => void;
  setCurrentView: (view: string) => void;
}

export const ProgramsPage: React.FC<ProgramsPageProps> = ({
  onOpenFreeTrial,
  setCurrentView,
}) => {
  const [programs, setPrograms] = useState<GymProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getPrograms()
      .then((data) => setPrograms(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          Curated Athletic Disciplines
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Training Programs
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          Every program at FORGE is grounded in exercise physiology, periodization principles, and biomechanics. No guesswork. Just progressive overload and disciplined coaching.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#777777]">
          Loading performance programs from database...
        </div>
      ) : (
        <div className="space-y-12">
          {programs.map((program, idx) => (
            <div
              key={program.id}
              className={`bg-[#0F0F0F] border border-[#222222] overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Program Photo */}
              <div className="lg:col-span-5 relative h-72 sm:h-96 overflow-hidden">
                <img
                  src={program.imageUrl}
                  alt={program.title}
                  className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent lg:hidden" />
              </div>

              {/* Program Info */}
              <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#1E1E1E] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF3838] font-bold">
                      Program {idx + 1} of {programs.length}
                    </span>
                    <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
                      {program.title}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-black text-3xl text-white">
                      ₹{program.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#888888] font-sans block">
                      /{program.duration}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#AAAAAA] leading-relaxed">
                  {program.description}
                </p>

                {/* Key Benefits */}
                <div className="space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#FFFFFF] font-mono">
                    Program Inclusions & Benefits:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {program.benefits.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-2 text-xs text-[#CCCCCC]">
                        <Check className="w-3.5 h-3.5 text-[#FF3838] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Row */}
                <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={() => onOpenFreeTrial(program.title)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,56,56,0.3)]"
                  >
                    <Flame className="w-4 h-4 fill-white" />
                    <span>Try In Free Trial</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('memberships');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-[#181818] hover:bg-[#252525] text-white border border-[#2B2B2B] text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Enroll Via Membership
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
