import React from 'react';
import {
  Clock,
  Dumbbell,
  Flame,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Shield,
} from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  onOpenFreeTrial: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView, onOpenFreeTrial }) => {
  return (
    <footer className="bg-[#050505] border-t border-[#1C1C1C] text-[#888888] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#181818]">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#FF3838] flex items-center justify-center font-display font-black text-black text-lg">
                F
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                FORGE <span className="text-[#666666]">LAB</span>
              </span>
            </div>
            <p className="text-sm text-[#A0A0A0] max-w-sm leading-relaxed">
              Build Strength. Build Discipline. Performance-driven training for athletes, lifters, and people who refuse to stay average.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/919876543210?text=Hi%20FORGE%20Lab%2C%20I%20would%20like%20to%20inquire%20about%20a%20membership."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Desk</span>
              </a>
              <button
                onClick={onOpenFreeTrial}
                className="inline-flex items-center gap-2 bg-[#FF3838] hover:bg-[#e02e2e] text-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Claim Pass</span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Facilities
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('programs')}
                  className="hover:text-white transition-colors"
                >
                  Training Programs
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('memberships')}
                  className="hover:text-white transition-colors"
                >
                  Membership Tiers
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('classes')}
                  className="hover:text-white transition-colors"
                >
                  Live Class Schedule
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('trainers')}
                  className="hover:text-white transition-colors"
                >
                  Master Coaches
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('about')}
                  className="hover:text-white transition-colors"
                >
                  The FORGE Code
                </button>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              Lab Hours
            </h4>
            <div className="space-y-2 text-xs text-[#A0A0A0]">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#FF3838] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Mon — Sat</p>
                  <p>05:30 AM — 10:30 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Clock className="w-3.5 h-3.5 text-[#666666] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Sunday (Open Gym)</p>
                  <p>07:00 AM — 08:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Headquarters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white font-mono">
              HQ Location
            </h4>
            <div className="space-y-2 text-xs text-[#A0A0A0]">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF3838] shrink-0 mt-0.5" />
                <span>Plot 42, Sector 18, Cyber Hub Corridor, Bengaluru, KA 560001</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF3838] shrink-0" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF3838] shrink-0" />
                <span>contact@forgeperformancelab.in</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#555555] gap-4">
          <p>© {new Date().getFullYear()} FORGE Performance Lab. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentView('contact')}
              className="hover:text-[#888888] transition-colors"
            >
              Directions
            </button>
            <button
              onClick={() => setCurrentView('admin-login')}
              className="hover:text-[#FF3838] transition-colors flex items-center gap-1 font-mono text-[10px] tracking-wider"
            >
              <Shield className="w-3 h-3 text-[#FF3838]" />
              <span>Staff / Admin Console</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
