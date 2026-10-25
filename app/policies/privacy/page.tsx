import React from 'react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-borderSoft shadow-sm space-y-6 text-xs sm:text-sm text-slateText leading-relaxed">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Privacy & Healthcare Data Protection Policy
          </h1>
          <p className="text-slate-400">Last updated: October 2026</p>

          <p>
            HealthPoint Diagnostics is committed to safeguarding the privacy and confidentiality of your sensitive personal data and medical health records (SPDI) under the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011 and the Digital Personal Data Protection Act, 2023.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">1. Information We Collect</h2>
          <p>
            We collect personal identification information (name, phone number, address, date of birth, biological gender) and health-related diagnostic data strictly necessary to fulfill diagnostic orders, assign phlebotomists, and deliver doctor-verified reports.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">2. Confidentiality of Medical Test Results</h2>
          <p>
            Your diagnostic reports and biological test outcomes are classified as confidential medical information. They are accessible only by authorized laboratory pathologists, technologists performing assays, and you as the verified patient. Medical reports are never sold or shared with unauthorized commercial third parties.
          </p>

          <h2 className="text-base font-bold text-navy-900 pt-2">3. Storage & Access Security</h2>
          <p>
            All patient records and digital PDFs are stored in encrypted environments with strict role-based access control (RBAC), multi-factor verification for clinical staff, and comprehensive audit logging of all report download events.
          </p>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
