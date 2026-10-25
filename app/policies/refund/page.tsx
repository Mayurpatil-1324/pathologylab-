import React from 'react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-borderSoft shadow-sm space-y-6 text-xs sm:text-sm text-slateText leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Cancellation & Refund Policy
          </h1>
          <p className="text-slate-400">Last updated: October 2026</p>

          <h2 className="text-base font-bold text-navy-900 pt-2">1. Cancellation Window</h2>
          <p>
            You can cancel or reschedule your diagnostic booking free of charge up to 2 hours before the scheduled sample collection time directly via your online portal or by calling customer care.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">2. Refund Processing</h2>
          <p>
            For prepaid bookings cancelled within the eligible window, 100% refund will be credited back to the original source (UPI, Card, Net Banking) within 3 to 5 business days. Once a phlebotomist has arrived or samples have been collected, bookings cannot be cancelled.
          </p>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
