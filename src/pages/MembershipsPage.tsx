import React, { useEffect, useState } from 'react';
import { Check, Flame, HelpCircle, Lock, Shield, Sparkles, X } from 'lucide-react';
import { api } from '../services/api.ts';
import { MembershipPlan } from '../types/index.ts';

interface MembershipsPageProps {
  onSelectPlan: (plan: MembershipPlan) => void;
  onOpenFreeTrial: () => void;
}

export const MembershipsPage: React.FC<MembershipsPageProps> = ({
  onSelectPlan,
  onOpenFreeTrial,
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMembershipPlans()
      .then((data) => setPlans(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          Transparent, No-Nonsense Pricing
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Membership Plans
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          No sign-up charges. No annual lock-ins. Every tier provides access to authentic calibrated equipment, high-contrast performance spaces, and recovery facilities.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-[#101010] border p-8 flex flex-col justify-between transition-all ${
              plan.popular
                ? 'border-[#FF3838] shadow-[0_0_40px_rgba(255,56,56,0.18)] bg-[#131111]'
                : 'border-[#242424] hover:border-[#383838]'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF3838] text-white px-3.5 py-0.5 text-[10px] font-black uppercase tracking-widest">
                Most Popular Tier
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
                <span className="font-display font-black text-4xl sm:text-5xl text-white">
                  ₹{plan.price.toLocaleString()}
                </span>
                <span className="text-xs text-[#777777] ml-1">/month</span>
              </div>

              <p className="text-xs text-[#999999] mb-6 leading-relaxed border-b border-[#1E1E1E] pb-6">
                {plan.description}
              </p>

              {/* Inclusions */}
              <div className="space-y-3 mb-8">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#777777]">
                  What&apos;s Included:
                </p>
                {plan.features.map((feat, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                    <Check className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Perks */}
              {plan.benefits && plan.benefits.length > 0 && (
                <div className="space-y-2 mb-8 bg-[#161616] p-4 border border-[#222222]">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FF3838] font-mono">
                    Tier Privileges:
                  </p>
                  {plan.benefits.map((b, bIdx) => (
                    <p key={bIdx} className="text-[11px] text-[#A0A0A0]">
                      · {b}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => onSelectPlan(plan)}
                className={`w-full py-4 text-xs font-black uppercase tracking-widest transition-all ${
                  plan.popular
                    ? 'bg-[#FF3838] hover:bg-[#e02e2e] text-white shadow-[0_0_20px_rgba(255,56,56,0.3)]'
                    : 'bg-[#181818] hover:bg-white hover:text-black text-white border border-[#2B2B2B]'
                }`}
              >
                Enroll in {plan.name} (₹{plan.price.toLocaleString()})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Matrix */}
      <div className="bg-[#0D0D0D] border border-[#202020] p-6 sm:p-10 space-y-6">
        <h3 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight text-white">
          Tier Feature Comparison
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#252525] text-[#888888] font-mono uppercase">
                <th className="py-3 px-4 font-bold">Feature</th>
                <th className="py-3 px-4 font-bold text-center">Basic (₹1,999)</th>
                <th className="py-3 px-4 font-bold text-center text-[#FF3838]">Pro (₹2,999)</th>
                <th className="py-3 px-4 font-bold text-center">Elite (₹4,999)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A] text-[#CCCCCC]">
              <tr>
                <td className="py-3 px-4">Open Floor & Heavy Barbells</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Group Classes (HIIT, Boxing, Yoga)</td>
                <td className="py-3 px-4 text-center text-[#555555]">Drop-in pass only</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited VIP</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Sauna & Cold Plunge Suite</td>
                <td className="py-3 px-4 text-center text-[#555555]">—</td>
                <td className="py-3 px-4 text-center text-white">2x / month</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Dedicated 1-on-1 Personal Training</td>
                <td className="py-3 px-4 text-center text-[#555555]">—</td>
                <td className="py-3 px-4 text-center text-white">1 Consult</td>
                <td className="py-3 px-4 text-center text-[#25D366]">4 Sessions / mo</td>
              </tr>
              <tr>
                <td className="py-3 px-4">InBody 570 Scans</td>
                <td className="py-3 px-4 text-center text-white">Quarterly</td>
                <td className="py-3 px-4 text-center text-white">Bi-Weekly</td>
                <td className="py-3 px-4 text-center text-[#25D366]">Weekly</td>
              </tr>
              <tr>
                <td className="py-3 px-4">Class Booking Window</td>
                <td className="py-3 px-4 text-center text-white">24 hours ahead</td>
                <td className="py-3 px-4 text-center text-white">48 hours ahead</td>
                <td className="py-3 px-4 text-center text-[#25D366]">7 days ahead</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white text-center">
          Frequently Asked Questions
        </h3>

        <div className="space-y-4 text-xs">
          {[
            {
              q: 'Can I cancel or freeze my membership anytime?',
              a: 'Yes. All memberships operate on rolling monthly periods. You can pause or cancel your subscription anytime with zero penalty fees before the next billing cycle.',
            },
            {
              q: 'Are the group classes suitable for beginners?',
              a: 'Absolutely. Every class has certified coach supervision with scaled weight, tempo, and exercise regressions for novice lifters.',
            },
            {
              q: 'Do I get locker room and shower access?',
              a: 'All tiers have full access to our locker rooms, showers, towel service, and hydration stations.',
            },
          ].map((faq, i) => (
            <div key={i} className="bg-[#121212] border border-[#222222] p-5 space-y-2">
              <h4 className="font-bold text-white text-sm">{faq.q}</h4>
              <p className="text-[#999999] leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
