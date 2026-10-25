'use client';

import React, { useState } from 'react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { Phone, Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Get in Touch
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight mt-1">
            Contact HealthPoint Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-2">
            Have questions about your test preparation, home collection time, or reports? Our patient support desk is available 7 days a week.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-bold text-navy-900">Direct Support Channels</h3>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Phone Support</strong>
                  <span className="text-slateText">+91 98765 43210 (Toll-Free Helpline)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Email Inquiries</strong>
                  <span className="text-slateText">care@healthpointdiagnostics.in</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-navy-900">Operating Hours</strong>
                  <span className="text-slateText">Monday to Sunday: 6:30 AM – 9:00 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-3 text-xs">
              <h3 className="text-sm font-bold text-navy-900">Central Laboratory Centers</h3>
              <p className="text-slateText">
                <strong>Delhi NCR:</strong> Plot 42, Institutional Area, Hauz Khas, New Delhi - 110016
              </p>
              <p className="text-slateText">
                <strong>Bengaluru:</strong> 100 Feet Road, 12th Main, Indiranagar, Bengaluru - 560038
              </p>
              <p className="text-slateText">
                <strong>Mumbai:</strong> Link Road, Andheri West, Mumbai - 400053
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-navy-900">
              Send us a Message
            </h2>

            {submitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold">Message Received!</h4>
                <p>Our patient care desk will reach out to you within 30 minutes.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Subject / Query Type</label>
                  <select className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500">
                    <option>Home Collection Scheduling</option>
                    <option>Report Status & Download</option>
                    <option>Fasting / Test Preparation Question</option>
                    <option>Corporate / Bulk Health Checkups</option>
                    <option>Feedback or Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry..."
                    className="w-full p-3 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition-colors shadow-sm"
                >
                  Send Inquiry
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
