import React from 'react';
import Link from 'next/link';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { ShieldCheck, Home, Clock, Activity, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  const services = [
    {
      title: 'Hygienic Home Sample Collection',
      desc: 'Certified phlebotomists arrive at your doorstep in sanitized PPE with single-use needles and cold-chain sample carriers.',
      icon: Home,
      features: ['Morning slots from 6:30 AM', 'Zero fee on ₹499+', 'Barcoded collection tubes'],
    },
    {
      title: 'Preventive Health Checkup Packages',
      desc: 'Comprehensive multi-parameter health packages evaluating heart, liver, kidneys, blood sugar, and vital vitamins.',
      icon: ShieldCheck,
      features: ['Up to 60% package savings', 'Full organ function tests', 'Free home sample collection'],
    },
    {
      title: 'Clinical Pathology & Hematology',
      desc: 'Complete blood count (CBC), ESR, peripheral smear examination, and automated coagulation profiles.',
      icon: Activity,
      features: ['5-part differential cell counters', 'Same day 8-12 hr reporting', 'Pathologist review of smears'],
    },
    {
      title: 'Clinical Biochemistry & Immunoassays',
      desc: 'High-throughput chemiluminescence testing for thyroid hormones, Vitamin D, Vitamin B12, and HbA1c.',
      icon: Clock,
      features: ['Roche Cobas & Beckman analyzers', 'Internal Quality Controls (IQC)', 'High precision calibration'],
    },
    {
      title: 'Urinalysis & Microbiology',
      desc: 'Routine urine analysis, urinary microalbumin, and culture sensitivity investigations for infection detection.',
      icon: FileText,
      features: ['Automated urine analyzers', 'Clean sterile collection kits', 'Microscopic sediment analysis'],
    },
    {
      title: 'Doctor Prescription Review & Support',
      desc: 'Upload your physician’s handwritten prescription; our qualified lab pharmacists identify the exact tests required.',
      icon: CheckCircle2,
      features: ['Response within 15 mins', 'Assisted slot booking', 'Custom combination discounts'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="max-w-2xl">
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Our Diagnostic Services
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight mt-1">
            Comprehensive Pathology & Diagnostic Capabilities
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-2 leading-relaxed">
            HealthPoint Diagnostics provides patient-centric pathology services with automated testing technology and certified medical oversight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-borderSoft p-6 shadow-sm hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-navy-900 mb-2">{s.title}</h3>
                  <p className="text-xs text-slateText leading-relaxed mb-4">{s.desc}</p>
                  <ul className="space-y-1.5 text-xs text-navy-800">
                    {s.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-borderSoft">
                  <Link
                    href="/tests"
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
                  >
                    <span>Browse Tests</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
