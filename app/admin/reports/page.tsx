'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Plus,
  X,
  Edit,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingsWithoutReports, setBookingsWithoutReports] = useState<any[]>([]);

  // Create Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [remarks, setRemarks] = useState('All parameters calibrated against automated Roche Cobas & Beckman reference controls.');
  const [status, setStatus] = useState('RELEASED');
  const [saving, setSaving] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }

      // Also fetch bookings that don't have reports yet
      const bRes = await fetch('/api/admin/bookings?status=PROCESSING');
      if (bRes.ok) {
        const bData = await bRes.json();
        setBookingsWithoutReports(bData.bookings || []);
        if (bData.bookings && bData.bookings.length > 0) {
          setSelectedBookingId(bData.bookings[0].id);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    setSaving(true);

    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          remarks,
          status,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReports((prev) => [data.report, ...prev]);
        setCreateModalOpen(false);
      } else {
        alert(data.message || 'Failed to upload report');
      }
    } catch {
      alert('Error saving report');
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      r.reportNumber.toLowerCase().includes(s) ||
      r.booking?.bookingRef.toLowerCase().includes(s) ||
      r.booking?.patientName.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Medical Reports & Digital Pathology Release
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Pathologist verification, digital PDF signature release, and patient access controls.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Upload className="w-4 h-4" />
          Release New Medical Report
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderSoft shadow-sm flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search report ID, booking ref, or patient..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bgLight border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No medical reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">Booking Ref</th>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Release Timestamp</th>
                  <th className="p-3">Verified By</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {filteredReports.map((r) => (
                  <tr key={r.id} className="hover:bg-bgLight transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{r.reportNumber}</td>
                    <td className="p-3 font-mono font-semibold text-navy-800">
                      {r.booking?.bookingRef}
                    </td>
                    <td className="p-3 font-bold text-navy-900">{r.booking?.patientName}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">
                      {r.releasedAt ? formatDateTime(r.releasedAt) : 'Pending'}
                    </td>
                    <td className="p-3 text-slate-600 font-medium">
                      {r.releasedBy?.name || 'Dr. Sunita Rao (Consulting Pathologist)'}
                    </td>
                    <td className="p-3 text-right">
                      <a
                        href={`/api/reports/download/${r.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Preview PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Release New Report Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-borderSoft shadow-dropdown">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <h3 className="text-base font-bold text-navy-900">
                Release Verified Medical Report
              </h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Select Patient Booking *</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full p-2.5 border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
                >
                  {bookingsWithoutReports.length > 0 ? (
                    bookingsWithoutReports.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bookingRef} — {b.patientName} ({b.status})
                      </option>
                    ))
                  ) : (
                    <option value="">No pending processing bookings available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Release Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2.5 border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
                >
                  <option value="RELEASED">RELEASED (Immediately Available to Patient)</option>
                  <option value="READY">READY (Ready for Consultant Pathologist Signoff)</option>
                  <option value="DRAFT">DRAFT (Under Assay)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Pathologist Remarks / Clinical Notes</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full p-2.5 border border-borderSoft rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borderSoft">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedBookingId}
                  className="px-5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors"
                >
                  {saving ? 'Releasing...' : 'Release Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
