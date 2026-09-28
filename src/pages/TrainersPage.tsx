import React, { useEffect, useState } from 'react';
import { Award, ChevronRight, Dumbbell, Instagram, Mail, Phone, Search } from 'lucide-react';
import { api } from '../services/api.ts';
import { Trainer } from '../types/index.ts';

interface TrainersPageProps {
  onOpenFreeTrial: (specialty?: string) => void;
  setCurrentView: (view: string) => void;
}

export const TrainersPage: React.FC<TrainersPageProps> = ({
  onOpenFreeTrial,
  setCurrentView,
}) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');

  useEffect(() => {
    api
      .getTrainers()
      .then((data) => setTrainers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const specialties = [
    'All',
    'Strength Training',
    'Functional Training',
    'Boxing & High-Intensity',
    'Mobility',
    'CrossFit',
    'Athletic Performance',
  ];

  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization.toLowerCase().includes(search.toLowerCase()) ||
      t.bio.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialty =
      selectedSpecialty === 'All' ||
      t.specialization.toLowerCase().includes(selectedSpecialty.toLowerCase().split(' ')[0]);

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          Certified Strength Masters
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Master Coaches
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          No lifestyle influencers. Every coach on our floor holds CSCS, USAW, or Doctor of Physical Therapy credentials, with over 5+ years of verified athletic coaching experience.
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-[#202020] pb-6">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coach by name or focus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121212] border border-[#2A2A2A] pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#FF3838]"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 text-xs">
          {specialties.map((spec) => (
            <button
              key={spec}
              onClick={() => setSelectedSpecialty(spec)}
              className={`px-3 py-1.5 whitespace-nowrap text-xs font-semibold transition-colors ${
                selectedSpecialty === spec
                  ? 'bg-white text-black font-bold'
                  : 'bg-[#141414] text-[#888888] hover:text-white border border-[#222222]'
              }`}
            >
              {spec}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-mono text-[#777777]">
          Loading coaches from database...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-[#111111] border border-[#222222] hover:border-[#383838] transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={trainer.imageUrl}
                  alt={trainer.name}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF3838] bg-black/70 px-2 py-0.5">
                      {trainer.experience}
                    </span>
                    {trainer.instagram && (
                      <span className="text-[11px] font-mono text-[#CCCCCC] flex items-center gap-1 bg-black/70 px-2 py-0.5">
                        <Instagram className="w-3 h-3 text-[#FF3838]" />
                        {trainer.instagram}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white mt-1">
                    {trainer.name}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-bold text-[#FF3838] uppercase tracking-wider font-mono">
                    {trainer.specialization}
                  </p>
                  <p className="text-xs text-[#999999] mt-2.5 leading-relaxed">
                    {trainer.bio}
                  </p>
                </div>

                {trainer.certifications && (
                  <div className="border-t border-[#1C1C1C] pt-3">
                    <p className="text-[10px] uppercase font-bold text-[#777777] font-mono mb-1">
                      Credentials:
                    </p>
                    <p className="text-xs text-[#CCCCCC] font-mono leading-tight">
                      {trainer.certifications}
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCurrentView('classes');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full py-2.5 bg-[#181818] hover:bg-[#FF3838] text-white text-xs font-bold uppercase tracking-wider border border-[#282828] hover:border-[#FF3838] transition-colors"
                  >
                    View Classes with {trainer.name.split(' ')[0]}
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
