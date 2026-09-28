import React, { useState } from 'react';
import { CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import { api } from '../services/api.ts';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Facility & Membership Query',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Store query as a lead or track event
      await api.submitFreeTrial({
        name: formData.name,
        phone: formData.phone || '+91 90000 00000',
        email: formData.email,
        fitnessGoal: `${formData.subject}: ${formData.message.substring(0, 100)}`,
        preferredTime: 'Direct Contact Form',
        previousExperience: 'Submitted via Contact Inquiry Form',
      });
      setSent(true);
      api.trackEvent('contact_submitted', { subject: formData.subject });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-16">
      {/* Header */}
      <div className="max-w-3xl">
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FF3838]">
          Physical Lab & Digital Desk
        </span>
        <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tight text-white mt-1">
          Find The Crucible
        </h1>
        <p className="text-sm sm:text-base text-[#A0A0A0] mt-4 leading-relaxed">
          Drop by our facility in Bengaluru or reach our coaching coordinators directly via WhatsApp or phone.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Details */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#101010] border border-[#222222] p-6 sm:p-8 space-y-6">
            <h3 className="font-display font-black text-xl uppercase tracking-tight text-white">
              Studio Coordinates
            </h3>

            <div className="space-y-4 text-xs text-[#CCCCCC]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white uppercase text-xs">Physical Address</p>
                  <p className="text-[#888888] mt-0.5">Plot 42, Sector 18, Cyber Hub Corridor</p>
                  <p className="text-[#888888]">Bengaluru, Karnataka 560001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white uppercase text-xs">Direct Phone Line</p>
                  <p className="text-[#888888] mt-0.5">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white uppercase text-xs">Electronic Mail</p>
                  <p className="text-[#888888] mt-0.5">contact@forgeperformancelab.in</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#FF3838] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white uppercase text-xs">Lab Hours</p>
                  <p className="text-[#888888] mt-0.5">Monday – Saturday: 05:30 AM – 10:30 PM</p>
                  <p className="text-[#888888]">Sunday: 07:00 AM – 08:00 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/919876543210?text=Hi%20FORGE%20Lab%2C%20I%20have%20a%20question%20about%20your%20training%20facility."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black uppercase text-xs tracking-wider py-3 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>Chat on WhatsApp Directly</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#101010] border border-[#222222] p-6 sm:p-8">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="font-display font-black text-xl uppercase tracking-tight text-white mb-2">
                  Send A Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kabir Joshi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kabir@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] px-3.5 py-2.5 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                      Subject
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-[#161616] border border-[#2A2A2A] px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FF3838]"
                    >
                      <option value="General Facility & Membership Query">General Facility & Membership Query</option>
                      <option value="Corporate / Team Athletic Conditioning">Corporate / Team Athletic Conditioning</option>
                      <option value="Personal Training Coaching Inquiries">Personal Training Coaching Inquiries</option>
                      <option value="Facility Tour Booking">Facility Tour Booking</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#CCCCCC] uppercase font-bold tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your fitness objectives or questions..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#161616] border border-[#2A2A2A] p-3 text-white placeholder-[#555555] focus:outline-none focus:border-[#FF3838]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FF3838] hover:bg-[#e02e2e] text-white py-3.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Transmitting...' : 'Send Inquiry To Desk'}</span>
                </button>
              </form>
            ) : (
              <div className="text-center py-10 space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#25D366] mx-auto" />
                <h4 className="font-display font-black text-xl uppercase tracking-tight text-white">
                  Message Dispatched
                </h4>
                <p className="text-xs text-[#888888] max-w-sm mx-auto">
                  Thank you, {formData.name}. Our front desk and strength coaches have received your message and will respond within 2-4 hours.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-xs text-[#FF3838] uppercase font-bold underline"
                >
                  Send another query
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
