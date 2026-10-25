'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Activity,
  Layers,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Download,
  ArrowRight,
  RefreshCw,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/overview');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-xs text-slate-400">
        Loading operations metrics from laboratory database...
      </div>
    );
  }

  const { kpis, bookingTrends, statusBreakdown, popularTests, recentBookings, upcomingCollections, recentAuditLogs } = data;

  const kpiCards = [
    { label: 'Total Bookings', value: kpis.totalBookings, icon: Calendar, color: 'text-brand-600 bg-brand-50 border-brand-200' },
    { label: "Today's Bookings", value: kpis.todayBookings, icon: Clock, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { label: 'Confirmed Bookings', value: kpis.confirmedBookings, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Pending Confirmation', value: kpis.pendingBookings, icon: AlertCircle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Completed Bookings', value: kpis.completedBookings, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { label: 'Cancelled Bookings', value: kpis.cancelledBookings, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { label: 'Total Revenue (Paid)', value: formatCurrency(kpis.totalRevenue), icon: TrendingUp, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { label: 'Pending Payments', value: kpis.pendingPayments, icon: AlertCircle, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    { label: 'Reports Awaiting Release', value: kpis.reportsAwaitingUpload, icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Laboratory Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Real-time diagnostic workload, sample processing pipeline, and revenue tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            className="bg-white hover:bg-slate-50 text-navy-800 border border-borderSoft px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <a
            href="/api/admin/export/bookings"
            target="_blank"
            rel="noreferrer"
            className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      {/* 9 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-borderSoft shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {kpi.label}
                </span>
                <span className="text-2xl font-black text-navy-900">
                  {kpi.value}
                </span>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS / TRENDS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Booking & Revenue Trend (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-borderSoft">
            <div>
              <h3 className="text-sm font-bold text-navy-900">
                7-Day Booking & Revenue Velocity
              </h3>
              <p className="text-xs text-slate-400">
                Daily patient volume and collected revenues
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active Trend
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {bookingTrends.map((trend: any, idx: number) => {
              const maxRev = 5000;
              const barWidth = Math.min(100, Math.max(15, (trend.revenue / maxRev) * 100));

              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-navy-900 font-semibold">
                    <span className="w-20 font-mono text-slate-500">{trend.day}</span>
                    <span className="text-slate-600">{trend.bookings} Bookings</span>
                    <span className="font-bold text-brand-600">{formatCurrency(trend.revenue)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-teal-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Distribution & Popular Tests (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status Breakdown */}
          <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
              Booking Status Pipeline
            </h3>
            <div className="space-y-2.5 text-xs">
              {statusBreakdown.map((sb: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sb.color }} />
                    <span className="font-semibold text-slate-700">{sb.name}</span>
                  </div>
                  <span className="font-bold text-navy-900">{sb.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tests */}
          <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
              Top Diagnostic Tests
            </h3>
            <div className="space-y-2 text-xs">
              {popularTests.map((pt: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-bgLight">
                  <span className="font-medium text-navy-900 truncate pr-2">{pt.name}</span>
                  <span className="font-bold text-brand-600 shrink-0">{pt.count} booked</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-white rounded-3xl border border-borderSoft p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-borderSoft">
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Recent Patient Bookings
            </h3>
            <p className="text-xs text-slate-400">
              Latest incoming home collection and center appointments
            </p>
          </div>
          <Link
            href="/admin/bookings"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Scheduled Date</th>
                <th className="p-3">Collection Mode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Amount</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderSoft">
              {recentBookings.map((b: any) => (
                <tr key={b.id} className="hover:bg-bgLight transition-colors">
                  <td className="p-3 font-mono font-bold text-brand-600">{b.bookingRef}</td>
                  <td className="p-3">
                    <strong className="text-navy-900 block font-semibold">{b.patientName}</strong>
                    <span className="text-[11px] text-slate-400">{b.patientPhone}</span>
                  </td>
                  <td className="p-3 text-slate-700">
                    <div>{formatDate(b.scheduledDate)}</div>
                    <div className="text-[11px] text-slate-400">{b.slotTime}</div>
                  </td>
                  <td className="p-3">
                    <span className="text-[11px] font-semibold text-slate-700">
                      {b.collectionType === 'HOME_COLLECTION' ? 'Home Doorstep' : 'Center Visit'}
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="p-3 font-bold text-navy-900">
                    {formatCurrency(b.finalAmount)}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/bookings?search=${b.bookingRef}`}
                      className="text-xs font-bold text-brand-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
