import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, Clock, Heart, Award } from 'lucide-react';

export function MainFooter() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-sm font-black text-lg">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white leading-none">
                  HealthPoint
                </span>
                <span className="text-[10px] font-bold tracking-widest text-teal-400 uppercase leading-tight">
                  Diagnostics
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              HealthPoint Diagnostics is a premier diagnostic healthcare and pathology network delivering high-precision laboratory testing, preventative health screenings, and hygienic home sample collection across Indian metropolitan cities.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-teal-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                ISO 15189 Compliant
              </div>
              <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-brand-400 font-semibold">
                <Award className="w-4 h-4" />
                Automated Analyzers
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Customer Care: +91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Email: care@healthpointdiagnostics.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Hours: Mon - Sun (6:30 AM – 9:00 PM)</span>
              </div>
            </div>
          </div>

          {/* Quick Links: Popular Tests */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Popular Tests
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tests/complete-blood-count-cbc" className="hover:text-white transition-colors">
                  Complete Blood Count (CBC)
                </Link>
              </li>
              <li>
                <Link href="/tests/thyroid-profile-total" className="hover:text-white transition-colors">
                  Thyroid Profile (T3, T4, TSH)
                </Link>
              </li>
              <li>
                <Link href="/tests/lipid-profile-comprehensive" className="hover:text-white transition-colors">
                  Lipid Profile Test
                </Link>
              </li>
              <li>
                <Link href="/tests/liver-function-test-lft" className="hover:text-white transition-colors">
                  Liver Function Test (LFT)
                </Link>
              </li>
              <li>
                <Link href="/tests/kidney-function-test-kft" className="hover:text-white transition-colors">
                  Kidney Function Test (KFT)
                </Link>
              </li>
              <li>
                <Link href="/tests/hba1c-glycated-hemoglobin" className="hover:text-white transition-colors">
                  HbA1c Blood Sugar Test
                </Link>
              </li>
              <li>
                <Link href="/tests/vitamin-d-25-hydroxy" className="hover:text-white transition-colors">
                  Vitamin D (25-OH)
                </Link>
              </li>
            </ul>
          </div>

          {/* Health Packages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Health Packages
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/packages/comprehensive-full-body-checkup" className="hover:text-white transition-colors">
                  Comprehensive Full Body Checkup
                </Link>
              </li>
              <li>
                <Link href="/packages/basic-health-checkup" className="hover:text-white transition-colors">
                  Basic Health Checkup
                </Link>
              </li>
              <li>
                <Link href="/packages/senior-citizen-wellness-package" className="hover:text-white transition-colors">
                  Senior Citizen Wellness
                </Link>
              </li>
              <li>
                <Link href="/packages/diabetes-care-package" className="hover:text-white transition-colors">
                  Diabetes Care Package
                </Link>
              </li>
              <li>
                <Link href="/packages/womens-wellness-package" className="hover:text-white transition-colors">
                  Women's Wellness Profile
                </Link>
              </li>
              <li>
                <Link href="/packages" className="text-teal-400 font-semibold hover:underline">
                  View All Packages →
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Service Locations
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Delhi NCR (Delhi, Gurgaon, Noida)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Mumbai (Andheri, Bandra, Powai)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Bengaluru (Indiranagar, Bellandur)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Hyderabad (Hitec City, Banjara)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" /> Pune (Viman Nagar, Kothrud)
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-slate-800">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white mb-2">
                Legal & Policies
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                <Link href="/policies/privacy" className="hover:underline">Privacy Policy</Link>
                <span>•</span>
                <Link href="/policies/terms" className="hover:underline">Terms & Conditions</Link>
                <span>•</span>
                <Link href="/policies/refund" className="hover:underline">Refund Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="border-t border-slate-800/80 pt-6 pb-6 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-400">MEDICAL DISCLAIMER:</strong> The information provided on this website is intended solely for general informational and educational purposes and is not a substitute for professional medical advice, diagnosis, or treatment. Diagnostic laboratory investigations should be ordered and interpreted under the guidance of a qualified healthcare practitioner. Do not disregard or delay seeking medical advice based on any content read on this platform.
          </p>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © {new Date().getFullYear()} HealthPoint Diagnostics Private Limited. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Built with care for Indian Diagnostic Healthcare</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
