'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Download, ShieldCheck, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { useAuth } from '@/lib/auth-context';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function PatientReportsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadReports() {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          // Extract all reports from bookings
          const extracted: any[] = [];
          for (const b of data.bookings || []) {
            if (b.reports && b.reports.length > 0) {
              for (const r of b.reports) {
                extracted.push({
                  ...r,
                  booking: b,
                });
              }
            }
          }
          setReports(extracted);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadReports();
    }
  }, [user, authLoading, router]);

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/account/bookings" className="text-xs font-bold text-slate-500 hover:text-navy-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Medical Pathology Reports
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Access, view, and securely download your digitally verified laboratory reports.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">
            Retrieving authorized medical records...
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-borderSoft p-12 text-center max-w-md mx-auto space-y-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy-900">No medical reports available yet</h3>
            <p className="text-xs text-slateText">
              Once your collected blood or urine samples have been tested and verified by our pathologists, your PDF reports will be downloadable here.
            </p>
            <Link
              href="/tests"
              className="inline-block text-xs font-bold px-5 py-2.5 bg-brand-500 text-white rounded-xl"
            >
              Browse Lab Tests
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-borderSoft p-6 shadow-sm hover:shadow-card transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-900">
                        {report.fileName}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        Report ID: {report.reportNumber}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase">
                    {report.status}
                  </span>
                </div>

                <div className="bg-bgLight p-3.5 rounded-xl border border-borderSoft space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Patient Name:</span>
                    <strong className="text-navy-900">{report.booking?.patientName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Reference:</span>
                    <span className="font-mono font-semibold text-brand-600">{report.booking?.bookingRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Released On:</span>
                    <span className="text-navy-900">{report.releasedAt ? formatDateTime(report.releasedAt) : 'Pending'}</span>
                  </div>
                  {report.remarks && (
                    <div className="pt-1.5 border-t border-borderSoft/60 text-[11px] text-slate-600">
                      <strong>Remarks:</strong> {report.remarks}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Pathologist Verified</span>
                  </div>

                  <a
                    href={`/api/reports/download/${report.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Report PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
