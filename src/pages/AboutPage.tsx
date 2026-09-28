import React from 'react';
import { Award, Compass, Dumbbell, Flame, Shield, Target, Zap } from 'lucide-react';

interface AboutPageProps {
  onOpenFreeTrial: () => void;
  setCurrentView: (view: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onOpenFreeTrial,
  setCurrentView,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          The Origin & Ethos
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Built For The Relentless
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          FORGE Performance Lab was established to dismantle everything broken about modern corporate fitness: crowded machine labyrinths, indifferent staff, and gimmick-heavy classes designed to entertain rather than adapt.
        </p>
      </div>

      {/* 3 Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#111111] border border-[#222222] p-8 space-y-4">
          <div className="w-10 h-10 bg-[#FF3838]/10 text-[#FF3838] flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            1. Mechanical Tension
          </h3>
          <p className="text-xs text-[#999999] leading-relaxed">
            The fundamental driver of both hypertrophy and bone density is mechanical loading through full joint ranges. We prioritize barbells, dumbbells, and cable systems that allow pure motor-unit recruitment.
          </p>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-8 space-y-4">
          <div className="w-10 h-10 bg-[#FF3838]/10 text-[#FF3838] flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            2. High-Density Conditioning
          </h3>
          <p className="text-xs text-[#999999] leading-relaxed">
            Cardiovascular health without muscle wasting. We utilize air-resistance bikes, Concept2 rowers, SkiErgs, and heavy sled pushes to develop VO2 max while sparing joints.
          </p>
        </div>

        <div className="bg-[#111111] border border-[#222222] p-8 space-y-4">
          <div className="w-10 h-10 bg-[#FF3838]/10 text-[#FF3838] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
            3. Parasympathetic Recovery
          </h3>
          <p className="text-xs text-[#999999] leading-relaxed">
            You don’t grow inside the gym; you grow when your nervous system adapts. Our infrared sauna, contrast cold plunge, and fascial mobility suites ensure you show up fresh for every heavy wave.
          </p>
        </div>
      </div>

      {/* Equipment Showcase */}
      <div className="bg-[#0E0E0E] border border-[#222222] p-8 sm:p-12 space-y-8">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
            Zero Cheap Substitutes
          </span>
          <h2 className="font-display font-black text-2xl sm:text-4xl uppercase tracking-tight text-white mt-1">
            The Equipment Standard
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="space-y-2 border-l-2 border-[#FF3838] pl-4">
            <h4 className="font-bold text-white uppercase text-sm">Eleiko Bars & Plates</h4>
            <p className="text-[#888888]">
              Competition calibrated 20kg & 15kg barbells with aggressive knurling and tight needle-bearing spin.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#FF3838] pl-4">
            <h4 className="font-bold text-white uppercase text-sm">Rogue Monster Racks</h4>
            <p className="text-[#888888]">
              3x3” 11-gauge steel uprights bolted directly into reinforced concrete with pin-pipe safeties and pull-up spheres.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#FF3838] pl-4">
            <h4 className="font-bold text-white uppercase text-sm">Concept2 Fleet</h4>
            <p className="text-[#888888]">
              RowErgs, SkiErgs, and BikeErgs linked with PM5 performance monitors for real-time split testing.
            </p>
          </div>

          <div className="space-y-2 border-l-2 border-[#FF3838] pl-4">
            <h4 className="font-bold text-white uppercase text-sm">InBody 570 Analyzer</h4>
            <p className="text-[#888888]">
              Direct segmental multi-frequency bioelectrical impedance testing for skeletal muscle mass and visceral fat.
            </p>
          </div>
        </div>
      </div>

      {/* The Standard Code */}
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <h3 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-white">
          The FORGE Code
        </h3>
        <div className="text-xs sm:text-sm text-[#CCCCCC] space-y-3 leading-relaxed text-left bg-[#121212] border border-[#222222] p-6 sm:p-8">
          <p>
            <strong>1. Strip Your Bars:</strong> Every member re-racks their plates. Discipline begins with respecting the iron and the athlete stepping onto the platform next.
          </p>
          <p>
            <strong>2. Chalk is Sacred:</strong> We provide premium magnesium chalk on every platform. Use it generously, drop weights safely, and clean your station.
          </p>
          <p>
            <strong>3. Leave the Phone in the Locker:</strong> High-performance training requires complete neural focus. Film your heavy PR sets if needed, but do not scroll between sets.
          </p>
          <p>
            <strong>4. Coachability:</strong> If a coach cues your barbell path or spine alignment, receive the cue. We protect our athletes from bad habits before bad habits cause injuries.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={onOpenFreeTrial}
            className="px-8 py-3.5 bg-[#FF3838] hover:bg-[#e02e2e] text-white text-xs font-black uppercase tracking-widest transition-all"
          >
            Train Under The Standard
          </button>
        </div>
      </div>
    </div>
  );
};
