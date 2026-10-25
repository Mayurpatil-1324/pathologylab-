import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { PackageDetailsClient } from '@/components/packages/package-details-client';
import {
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Layers,
  CheckCircle2,
  FileText,
  Activity,
} from 'lucide-react';

export const revalidate = 60;

export default async function PackageDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const pkg = await prisma.healthPackage.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      tests: {
        include: {
          test: {
            include: {
              category: true,
              parameters: {
                orderBy: { displayOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!pkg || !pkg.isActive) {
    notFound();
  }

  const testsList = pkg.tests.map((t) => t.test);
  const totalParameters = testsList.reduce((acc, t) => acc + (t.parameters?.length || 2), 0);

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-navy-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/packages" className="hover:text-navy-900">Health Packages</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-navy-900 font-semibold truncate">
            {pkg.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                <Layers className="w-3.5 h-3.5" />
                {testsList.length} Tests Included ({totalParameters}+ Parameters)
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight leading-tight">
                {pkg.name}
              </h1>

              <p className="text-xs sm:text-sm text-slateText leading-relaxed">
                {pkg.shortDescription}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-bgLight rounded-2xl border border-borderSoft text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Parameters</span>
                  <strong className="text-navy-900 font-semibold text-xs">{totalParameters}+ Tests</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Turnaround</span>
                  <strong className="text-navy-900 font-semibold text-xs">{pkg.reportTurnaroundHours} Hours</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fasting</span>
                  <strong className="text-navy-900 font-semibold text-xs">
                    {pkg.fastingRequired ? `${pkg.fastingHours}h Overnight Fasting` : 'Not Required'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Package Description & Scope
              </h2>
              <p className="text-xs sm:text-sm text-slateText leading-relaxed">
                {pkg.overview}
              </p>
            </div>

            {/* Included Tests Accordion List */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Included Diagnostic Profiles & Investigations ({testsList.length})
              </h2>

              <div className="space-y-3">
                {testsList.map((test, index) => (
                  <div
                    key={test.id}
                    className="border border-borderSoft rounded-2xl p-4 bg-bgLight/40 hover:bg-bgLight transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-navy-900">
                          {test.name}
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {test.parameters?.length || 1} Parameters
                      </span>
                    </div>

                    <p className="text-xs text-slateText mb-3">
                      {test.shortDescription}
                    </p>

                    {/* Parameters pills */}
                    {test.parameters && test.parameters.length > 0 && (
                      <div className="pt-2 border-t border-borderSoft/60">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                          Parameters Analyzed:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {test.parameters.map((param) => (
                            <span
                              key={param.id}
                              className="text-[11px] bg-white text-navy-800 px-2 py-0.5 rounded-md border border-borderSoft"
                            >
                              {param.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation notice */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Patient Preparation Advice:</strong> {pkg.fastingRequired ? `Please observe 10 to 12 hours of overnight fasting prior to your sample collection appointment. Water is permitted. Continue regular prescription medications unless directed otherwise by your physician.` : 'No special fasting is strictly required.'}
            </div>
          </div>

          {/* Sticky Booking Action (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <PackageDetailsClient pkg={pkg} totalParameters={totalParameters} />

            <div className="bg-white p-5 rounded-2xl border border-borderSoft shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                Package Guarantees
              </h4>
              <div className="space-y-2 text-xs text-slateText">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free Home Collection Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>NABL Quality Controlled Assays</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Smart Digital Report with Visual Charts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
