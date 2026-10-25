'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Upload,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Home,
  Tag,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Phone,
  ChevronDown,
  Layers,
  FileText,
  MapPin,
  HelpCircle,
  Star,
  Users,
} from 'lucide-react';
import { TestCard, TestCardData } from '@/components/ui/test-card';
import { PackageCard, PackageCardData } from '@/components/ui/package-card';
import { CategoryCard } from '@/components/ui/category-card';
import { PrescriptionModal } from '@/components/ui/prescription-modal';
import { ComparePackagesModal } from '@/components/ui/compare-packages-modal';
import { useLocation } from '@/lib/location-context';
import { cn } from '@/lib/utils';

interface HomeViewProps {
  categories: any[];
  popularTests: any[];
  featuredPackages: any[];
  faqs: any[];
  testimonials: any[];
}

export function HomeView({
  categories,
  popularTests,
  featuredPackages,
  faqs,
  testimonials,
}: HomeViewProps) {
  const router = useRouter();
  const { selectedCity } = useLocation();

  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [heroSearchQuery, setHeroSearchQuery] = useState('');
  const [comparingPackages, setComparingPackages] = useState<PackageCardData[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [activeFaqCategory, setActiveFaqCategory] = useState<string>('All');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Home collection pincode check state
  const [pincodeInput, setPincodeInput] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      router.push(`/tests?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const handleToggleCompare = (pkg: PackageCardData) => {
    setComparingPackages((prev) => {
      const exists = prev.some((p) => p.id === pkg.id);
      if (exists) {
        return prev.filter((p) => p.id !== pkg.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 packages at once.');
        return prev;
      }
      return [...prev, pkg];
    });
    setCompareModalOpen(true);
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincodeInput.trim() || pincodeInput.length < 6) {
      setPincodeResult('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    // All 6 digit pincodes in demo metros are supported
    setPincodeResult(
      `✓ Home Sample Collection is Available in PIN code ${pincodeInput} (${selectedCity}). Phlebotomists available tomorrow morning from 6:30 AM.`
    );
  };

  const filteredFaqs =
    activeFaqCategory === 'All'
      ? faqs
      : faqs.filter((f) => f.category === activeFaqCategory);

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* SECTION A: HERO & SEARCH */}
      <section className="relative bg-gradient-to-b from-brand-50/70 via-bgLight to-white pt-8 pb-14 border-b border-borderSoft/60 overflow-hidden">
        {/* Subtle background decorative shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-teal-100/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 rounded-full bg-brand-100/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Search */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Trusted Pathology & Health Diagnostics in {selectedCity}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-navy-900 tracking-tight leading-tight">
                Your Health,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">
                  Our Priority
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slateText max-w-2xl leading-relaxed">
                Book diagnostic tests and preventive health checkups with convenient sample collection and secure online reports. Managed by certified pathologists and state-of-the-art automated laboratories.
              </p>

              {/* Search Box */}
              <div className="bg-white p-2.5 rounded-2xl shadow-cardHover border border-borderSoft max-w-xl">
                <form onSubmit={handleHeroSearch} className="flex items-center gap-2">
                  <div className="pl-3 text-slate-400">
                    <Search className="w-5 h-5 text-brand-500" />
                  </div>
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search for tests, packages, or health checkups..."
                    className="w-full py-2.5 text-sm text-navy-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Popular Search Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-slate-400 font-semibold">Popular:</span>
                {[
                  { name: 'Complete Blood Count (CBC)', slug: 'complete-blood-count-cbc' },
                  { name: 'Thyroid Profile', slug: 'thyroid-profile-total' },
                  { name: 'Lipid Profile', slug: 'lipid-profile-comprehensive' },
                  { name: 'HbA1c', slug: 'hba1c-glycated-hemoglobin' },
                  { name: 'Full Body Checkup', slug: 'full-body-checkup', isPackage: true },
                ].map((item) => (
                  <Link
                    key={item.name}
                    href={item.isPackage ? '/packages/comprehensive-full-body-checkup' : `/tests/${item.slug}`}
                    className="bg-white hover:bg-brand-50 hover:text-brand-700 text-navy-800 border border-borderSoft px-2.5 py-1 rounded-lg transition-colors font-medium text-[11px]"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  href="/tests"
                  className="bg-navy-900 hover:bg-navy-950 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-teal-400" />
                  Book a Test
                </Link>

                <button
                  onClick={() => setPrescriptionOpen(true)}
                  className="bg-white hover:bg-teal-50 text-teal-800 border-2 border-teal-500 text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-teal-600" />
                  Upload Prescription
                </button>
              </div>
            </div>

            {/* Right Column: Premium Visual & Diagnostic Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Visual card */}
                <div className="bg-white rounded-3xl p-6 shadow-dropdown border border-borderSoft relative overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-borderSoft">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-900 leading-snug">
                          HealthPoint Central Lab
                        </h4>
                        <span className="text-[11px] text-teal-600 font-semibold">
                          Certified High-Throughput Diagnostic Center
                        </span>
                      </div>
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  </div>

                  <div className="py-5 space-y-3.5 text-xs text-slateText">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-bgLight border border-borderSoft">
                      <div className="flex items-center gap-2.5">
                        <Home className="w-4 h-4 text-brand-500" />
                        <div>
                          <div className="font-bold text-navy-900">Home Sample Collection</div>
                          <div className="text-[11px] text-slate-400">Trained phlebotomist at your doorstep</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-bgLight border border-borderSoft">
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-teal-600" />
                        <div>
                          <div className="font-bold text-navy-900">Rapid Verified Turnaround</div>
                          <div className="text-[11px] text-slate-400">Most reports ready within 12–24 hours</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                        12–24 hrs
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-bgLight border border-borderSoft">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-bold text-navy-900">Secure Online Report Portal</div>
                          <div className="text-[11px] text-slate-400">Authorized PDF downloads with barcode</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Digital
                      </span>
                    </div>
                  </div>

                  {/* Trust footer inside visual card */}
                  <div className="pt-4 border-t border-borderSoft flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 font-semibold text-navy-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Sterile Single-Use Vacutainers
                    </span>
                    <span className="font-semibold text-brand-600">Cold-Chain Box</span>
                  </div>
                </div>

                {/* Floating highlight badge */}
                <div className="absolute -bottom-5 -left-4 bg-navy-900 text-white py-2.5 px-4 rounded-xl shadow-lg border border-slate-700 hidden sm:flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold leading-tight">50,000+ Tests Processed</div>
                    <div className="text-[10px] text-slate-400">Strict Pathologist Oversight</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B: TRUST INDICATORS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Qualified Laboratory Professionals',
              description: 'Led by MD Pathologists, Biochemists, and certified medical laboratory technologists.',
              icon: GraduationCap,
              color: 'text-brand-600 bg-brand-50 border-brand-200',
            },
            {
              title: 'Convenient Home Collection',
              description: 'Trained phlebotomists follow strict hygiene and temperature-controlled sample carriers.',
              icon: Home,
              color: 'text-teal-600 bg-teal-50 border-teal-200',
            },
            {
              title: 'Secure Online Reports',
              description: 'Instant notification and private, authenticated digital access to doctor-signed PDF reports.',
              icon: ShieldCheck,
              color: 'text-purple-600 bg-purple-50 border-purple-200',
            },
            {
              title: 'Transparent Test Pricing',
              description: 'Zero hidden collection charges, clear parameter breakdown, and honest discounted packages.',
              icon: Tag,
              color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white rounded-xl border border-borderSoft p-5 flex items-start gap-4 hover:shadow-card transition-all"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border', card.color)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900 mb-1 leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-xs text-slateText leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION C: BROWSE BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
              Specialized Care
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
              Browse Diagnostic Tests by Category
            </h2>
            <p className="text-xs sm:text-sm text-slateText mt-1">
              Find the right tests curated for vital organs, health conditions, and preventive wellness.
            </p>
          </div>
          <Link
            href="/tests"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group shrink-0"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              slug={category.slug}
              iconName={category.iconName}
              testCount={category._count?.tests}
            />
          ))}
        </div>
      </section>

      {/* SECTION D: POPULAR LAB TESTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">
              Most Booked
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
              Popular Diagnostic Tests
            </h2>
            <p className="text-xs sm:text-sm text-slateText mt-1">
              Frequently advised routine and vital organ screenings with same-day collection.
            </p>
          </div>
          <Link
            href="/tests"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group shrink-0"
          >
            <span>View all 15+ tests</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTests.slice(0, 8).map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      </section>

      {/* SECTION E: HEALTH PACKAGES */}
      <section className="bg-gradient-to-b from-bgLight via-white to-bgLight py-14 border-y border-borderSoft/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
                Preventive Health Checkups
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
                Curated Health Packages
              </h2>
              <p className="text-xs sm:text-sm text-slateText mt-1">
                Save up to 60% on bundled multi-parameter profiles tailored for all family members.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {comparingPackages.length > 0 && (
                <button
                  onClick={() => setCompareModalOpen(true)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-300 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                  Compare ({comparingPackages.length})
                </button>
              )}
              <Link
                href="/packages"
                className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 group shrink-0"
              >
                <span>View all packages</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPackages.map((pkg) => (
              <PackageCard
                key={pkg.id}
                packageData={pkg}
                onCompare={handleToggleCompare}
                isComparing={comparingPackages.some((p) => p.id === pkg.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION F: HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
            How HealthPoint Diagnostics Works
          </h2>
          <p className="text-xs sm:text-sm text-slateText mt-2">
            Get tested from the comfort of your home in 4 seamless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {[
            {
              step: '01',
              title: 'Search & Select Tests',
              description: 'Select individual lab tests or bundled health packages from our comprehensive diagnostic catalog.',
              icon: Search,
            },
            {
              step: '02',
              title: 'Choose Collection Mode',
              description: 'Opt for doorstep sample collection by a certified phlebotomist or visit our local diagnostic center.',
              icon: Home,
            },
            {
              step: '03',
              title: 'Pick Date & Slot',
              description: 'Select your preferred morning fasting slot (from 6:30 AM) with guaranteed phlebotomist arrival.',
              icon: Calendar,
            },
            {
              step: '04',
              title: 'Secure Online Report',
              description: 'Receive verified digital reports directly on WhatsApp/Email and download authorized PDFs from your portal.',
              icon: FileText,
            },
          ].map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="bg-white rounded-2xl border border-borderSoft p-6 relative flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-black">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-200">
                      {step.step}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-navy-900 mb-2">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slateText leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION G: HOME SAMPLE COLLECTION & PINCODE CHECK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-dropdown">
          <div className="max-w-2xl relative z-10 space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full uppercase">
              <Home className="w-3.5 h-3.5" /> Doorstep Pathology Services
            </span>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Hygienic Home Sample Collection at Zero Extra Charge on ₹499+
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Our trained phlebotomists use vacuum-sealed, single-use needle kits and transport blood and urine samples in cold-chain containers to preserve analyte stability until analysis at our central laboratory.
            </p>

            {/* Pincode Availability Check */}
            <div className="pt-2">
              <form onSubmit={handlePincodeCheck} className="flex flex-col sm:flex-row gap-2 max-w-md">
                <div className="relative flex-1">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit PIN code (e.g. 560103)"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 text-white border border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal-400"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-colors shrink-0"
                >
                  Check Availability
                </button>
              </form>

              {pincodeResult && (
                <div className="mt-3 text-xs p-3 rounded-lg bg-teal-900/60 border border-teal-600 text-teal-200">
                  {pincodeResult}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Morning Slots:</span>
                <strong className="text-white">6:30 AM – 11:30 AM</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Covered Metros:</span>
                <strong className="text-white">Delhi NCR, Mumbai, Bengaluru, Hyderabad, Pune</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Specimen Safety:</span>
                <strong className="text-teal-400">Cold Chain 2°C – 8°C</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION H: WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
              Clinical Quality & Ethics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
              Why Doctors & Patients Trust HealthPoint Diagnostics
            </h2>
            <p className="text-sm text-slateText leading-relaxed">
              We operate under standard laboratory protocols with bi-level internal quality controls (IQC) and external quality assessment schemes (EQAS) to ensure every reported value is clinically reliable.
            </p>

            <div className="space-y-3 pt-2">
              {[
                { title: 'Fully Automated Robotic Analyzers', desc: 'Roche, Beckman Coulter, and Sysmex platforms minimize pre-analytical errors.' },
                { title: 'Double Verification by Pathologists', desc: 'Every abnormal result is reviewed and re-tested by consulting MD pathologists.' },
                { title: 'Barcode Sample Identification', desc: 'End-to-end sample tracking from doorstep prick to analyzer rack prevents mix-ups.' },
                { title: 'Transparent Healthcare', desc: 'Detailed test parameter explanation and preparation guidance for every test.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-navy-900">{item.title}</h4>
                    <p className="text-xs text-slateText">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonials snippet */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Verified Patient Experiences
            </div>
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-borderSoft p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ Verified Patient
                  </span>
                </div>
                <p className="text-xs text-navy-900 italic leading-relaxed">
                  "{t.reviewText}"
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-borderSoft">
                  <span className="font-bold text-navy-900">{t.patientName}</span>
                  <span className="text-slate-400">{t.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION I: FAQS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-brand-600 tracking-wider uppercase">
            Have Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Learn about fasting guidelines, sample collection, report delivery, and payments.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {['All', 'General', 'Fasting', 'Home Collection', 'Reports', 'Payment'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFaqCategory(cat)}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors',
                activeFaqCategory === cat
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-navy-800 border-borderSoft hover:bg-slate-50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQs Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedFaqIndex === idx;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-borderSoft overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-navy-900 hover:text-brand-600 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200',
                      isExpanded && 'rotate-180 text-brand-500'
                    )}
                  />
                </button>
                {isExpanded && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-slateText leading-relaxed border-t border-borderSoft/60 bg-bgLight/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Prescription Upload Modal */}
      <PrescriptionModal
        isOpen={prescriptionOpen}
        onClose={() => setPrescriptionOpen(false)}
      />

      {/* Compare Packages Modal */}
      <ComparePackagesModal
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        packages={comparingPackages}
        onRemovePackage={(id) => {
          setComparingPackages((prev) => prev.filter((p) => p.id !== id));
        }}
      />
    </div>
  );
}
