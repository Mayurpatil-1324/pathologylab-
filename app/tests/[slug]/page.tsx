import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { PriceDisplay } from '@/components/ui/price-display';
import { TestCard } from '@/components/ui/test-card';
import { TestDetailsClient } from '@/components/tests/test-details-client';
import {
  Clock,
  Droplet,
  AlertCircle,
  CheckCircle2,
  Home,
  Building2,
  ShieldCheck,
  ChevronRight,
  FileText,
  Activity,
} from 'lucide-react';

export const revalidate = 60;

export default async function TestDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const test = await prisma.diagnosticTest.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      parameters: {
        orderBy: { displayOrder: 'asc' },
      },
    },
  });

  if (!test || !test.isActive) {
    notFound();
  }

  // Related tests from same category
  const relatedTests = await prisma.diagnosticTest.findMany({
    where: {
      categoryId: test.categoryId,
      id: { not: test.id },
      isActive: true,
    },
    take: 3,
    include: {
      category: true,
      parameters: true,
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/" className="hover:text-navy-900">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tests" className="hover:text-navy-900">Lab Tests</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/tests?category=${test.category.slug}`} className="hover:text-navy-900">
            {test.category.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-navy-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {test.name}
          </span>
        </nav>

        {/* Hero Card & Booking Action */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 uppercase">
                  {test.category.name}
                </span>
                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-borderSoft">
                  Code: {test.testCode}
                </span>
                {test.isPopular && (
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    ★ Highly Recommended
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight leading-tight">
                {test.name}
              </h1>

              <p className="text-xs sm:text-sm text-slateText leading-relaxed">
                {test.shortDescription}
              </p>
            </div>

            {/* Key Clinical Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-bgLight rounded-2xl border border-borderSoft text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Specimen</span>
                  <strong className="text-navy-900 font-semibold text-xs">{test.sampleType}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Turnaround</span>
                  <strong className="text-navy-900 font-semibold text-xs">{test.reportTurnaroundHours} Hours</strong>
                </div>
              </div>

              <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fasting</span>
                  <strong className="text-navy-900 font-semibold text-xs">
                    {test.fastingRequired ? `${test.fastingHours}h Required` : 'Not Required'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Overview & Purpose */}
            <div className="space-y-4 pt-2">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Overview & Clinical Significance
              </h2>
              <p className="text-xs sm:text-sm text-slateText leading-relaxed">
                {test.overview}
              </p>
              <div className="p-4 bg-brand-50/50 rounded-xl border-l-4 border-brand-500 text-xs sm:text-sm text-navy-900 leading-relaxed">
                <strong>Why Doctors Advise This Test:</strong> {test.clinicalPurpose}
              </div>
            </div>

            {/* Preparation Guidelines */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-teal-600" />
                Preparation & Fasting Instructions
              </h2>
              <div className="p-4 rounded-xl border border-borderSoft bg-bgLight text-xs sm:text-sm text-slateText leading-relaxed space-y-2">
                <p>{test.preparation}</p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-slate-500">
                  <li>Normal water intake is permitted unless advised otherwise by your consulting physician.</li>
                  <li>Avoid strenuous physical exercise and alcohol consumption for 24 hours prior to sample collection.</li>
                  <li>Continue essential prescribed medications as directed by your doctor.</li>
                </ul>
              </div>
            </div>

            {/* Parameters Breakdown Table */}
            {test.parameters && test.parameters.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-600" />
                    Parameters Evaluated ({test.parameters.length})
                  </h2>
                </div>

                <div className="border border-borderSoft rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Parameter Name</th>
                        <th className="p-3">Standard Reference Interval</th>
                        <th className="p-3">Unit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-borderSoft">
                      {test.parameters.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-bgLight">
                          <td className="p-3 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                          <td className="p-3 font-semibold text-navy-900">
                            <div>{p.name}</div>
                            {p.description && (
                              <div className="text-[11px] text-slate-400 font-normal">{p.description}</div>
                            )}
                          </td>
                          <td className="p-3 text-slate-700 font-medium">
                            {p.referenceRange || 'Reference ranges supplied on final report'}
                          </td>
                          <td className="p-3 text-slate-500 font-mono">{p.unit || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Medical Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
              <strong>Medical Disclaimer:</strong> This test detail page is curated for informational purposes and is not a medical prescription. Test results should be correlated with comprehensive physical evaluation by your licensed medical practitioner.
            </div>
          </div>

          {/* Booking Action Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <TestDetailsClient test={test} />

            {/* Quality & Trust Box */}
            <div className="bg-white p-5 rounded-2xl border border-borderSoft shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                HealthPoint Quality Assurance
              </h3>
              <div className="space-y-3 text-xs text-slateText">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>ISO 15189 Quality Compliant Testing Infrastructure</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Home className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>Doorstep sample collection available 7 days a week</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                  <span>Verified digital PDF report signed by certified MD pathologist</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Tests Section */}
        {relatedTests.length > 0 && (
          <div className="pt-8 border-t border-borderSoft">
            <h2 className="text-xl font-bold text-navy-900 mb-5">
              Related Tests in {test.category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedTests.map((rt) => (
                <TestCard key={rt.id} test={rt as any} />
              ))}
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
