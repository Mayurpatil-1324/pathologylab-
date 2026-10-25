import React from 'react';
import Link from 'next/link';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            About HealthPoint Diagnostics
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Setting the Benchmark in Clinical Diagnostic Accuracy
          </h1>
          <p className="text-sm text-slateText max-w-2xl mx-auto leading-relaxed">
            Founded with the conviction that timely, precise diagnostic testing is the bedrock of effective medical care, HealthPoint Diagnostics brings high-standard pathology to homes and clinics across India.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-borderSoft shadow-sm space-y-6 text-sm text-slateText leading-relaxed">
          <h2 className="text-xl font-bold text-navy-900">
            Our Quality Framework & Philosophy
          </h2>
          <p>
            At HealthPoint Diagnostics, we strictly adhere to Good Laboratory Practice (GLP) and ISO 15189 international standards. Our laboratories deploy closed-tube sampling, automated barcode identification, and cold-chain sample logistics to safeguard diagnostic accuracy from needle-prick to final report release.
          </p>
          <p>
            Every single biological investigation is analyzed on industry-leading automated platforms from Beckman Coulter, Roche Diagnostics, and Sysmex. All abnormal, critical, or panic values trigger automatic double-testing and review by our senior consultant pathologists before report release.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-borderSoft">
            <div className="p-4 bg-bgLight rounded-2xl border border-borderSoft text-center">
              <div className="text-2xl font-black text-brand-600 mb-1">50,000+</div>
              <div className="text-xs font-semibold text-navy-900">Patients Served</div>
            </div>
            <div className="p-4 bg-bgLight rounded-2xl border border-borderSoft text-center">
              <div className="text-2xl font-black text-teal-600 mb-1">100%</div>
              <div className="text-xs font-semibold text-navy-900">Automated Analyzers</div>
            </div>
            <div className="p-4 bg-bgLight rounded-2xl border border-borderSoft text-center">
              <div className="text-2xl font-black text-purple-600 mb-1">5 Metros</div>
              <div className="text-xs font-semibold text-navy-900">Home Sample Coverage</div>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
