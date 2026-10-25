import React from 'react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-borderSoft shadow-sm space-y-6 text-xs sm:text-sm text-slateText leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Terms of Service & Clinical Conditions
          </h1>
          <p className="text-slate-400">Last updated: October 2026</p>

          <p>
            By accessing or booking diagnostic tests through HealthPoint Diagnostics, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">1. Booking & Sample Collection</h2>
          <p>
            Home sample collection appointments are subject to phlebotomist availability within designated metropolitan coverage areas. Patients are required to follow provided fasting or preparation instructions to guarantee biological sample validity.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">2. Medical Disclaimer</h2>
          <p>
            HealthPoint Diagnostics provides laboratory testing services. The test results, reference ranges, and informational descriptions do not constitute individualized clinical diagnoses or prescriptions. Interpretation must be conducted by a registered medical practitioner.
          </p>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
