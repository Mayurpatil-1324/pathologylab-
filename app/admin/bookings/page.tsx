'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Phone,
  MapPin,
  FileText,
  Download,
  AlertCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collectionTypeFilter, setCollectionTypeFilter] = useState('ALL');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editStatusModalOpen, setEditStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);
      if (collectionTypeFilter !== 'ALL') params.set('collectionType', collectionTypeFilter);

      const res = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, collectionTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    setUpdating(true);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBooking.id,
          status: newStatus || undefined,
          notes: adminNotes || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBooking.id ? data.booking : b))
        );
        setEditStatusModalOpen(false);
        setSelectedBooking(null);
      } else {
        alert(data.message || 'Failed to update booking status');
      }
    } catch {
      alert('Error updating status');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = [
    'PENDING_CONFIRMATION',
    'CONFIRMED',
    'COLLECTION_ASSIGNED',
    'SAMPLE_COLLECTED',
    'SAMPLE_RECEIVED',
    'PROCESSING',
    'REPORT_READY',
    'COMPLETED',
    'CANCELLED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Bookings Management
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Dispatch phlebotomists, track biological sample workflow, and update diagnostic statuses.
          </p>
        </div>

        <a
          href="/api/admin/export/bookings"
          target="_blank"
          rel="noreferrer"
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export All Bookings CSV
        </a>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderSoft shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:max-w-md relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ref (HPD-..), patient name, or phone..."
            className="w-full pl-9 pr-16 py-2 text-xs bg-bgLight border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-navy-900 text-white text-xs font-bold rounded-lg"
          >
            Find
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-bgLight border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Collection type filter */}
          <select
            value={collectionTypeFilter}
            onChange={(e) => setCollectionTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-bgLight border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
          >
            <option value="ALL">All Modes</option>
            <option value="HOME_COLLECTION">Home Doorstep</option>
            <option value="CENTER_VISIT">Center Visit</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">
            Querying active diagnostic orders...
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No bookings found matching filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Schedule Date & Slot</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Phlebotomist</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-bgLight transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">
                      {b.bookingRef}
                    </td>
                    <td className="p-3">
                      <strong className="text-navy-900 font-bold block">{b.patientName}</strong>
                      <span className="text-[11px] text-slate-400">{b.patientPhone}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-navy-900">{formatDate(b.scheduledDate)}</div>
                      <div className="text-[11px] text-slate-400">{b.slotTime}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {b.collectionType === 'HOME_COLLECTION' ? 'Home' : 'Center'}
                      </span>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-navy-900">{formatCurrency(b.finalAmount)}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{b.paymentStatus}</span>
                    </td>
                    <td className="p-3 text-slate-600">
                      {b.phlebotomist ? (
                        <span className="font-medium text-navy-900">{b.phlebotomist.name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setNewStatus(b.status);
                            setAdminNotes(b.notes || '');
                            setEditStatusModalOpen(true);
                          }}
                          className="p-1.5 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg"
                          title="Update Status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL */}
      {detailModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-borderSoft shadow-dropdown max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <div>
                <span className="text-xs font-mono font-bold text-brand-600">
                  {selectedBooking.bookingRef}
                </span>
                <h3 className="text-base font-bold text-navy-900">
                  Diagnostic Booking Detail
                </h3>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-bgLight p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Patient Name</span>
                  <strong className="text-navy-900">{selectedBooking.patientName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Age / Gender</span>
                  <strong className="text-navy-900">{selectedBooking.patientAge} Y / {selectedBooking.patientGender}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Phone</span>
                  <strong className="text-navy-900">{selectedBooking.patientPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Appointment Date</span>
                  <strong className="text-navy-900">{formatDate(selectedBooking.scheduledDate)} ({selectedBooking.slotTime})</strong>
                </div>
              </div>

              {selectedBooking.addressString && (
                <div>
                  <span className="text-slate-400 block">Doorstep Address</span>
                  <span className="text-navy-900">{selectedBooking.addressString}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-1">Ordered Tests / Packages</span>
                <div className="space-y-1">
                  {selectedBooking.items.map((it: any) => (
                    <div key={it.id} className="p-2 rounded bg-slate-50 flex justify-between">
                      <span className="font-semibold text-navy-900">{it.itemName}</span>
                      <strong className="text-brand-600">{formatCurrency(it.priceCharged)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2 border-t border-borderSoft font-bold">
                <span>Total Amount Charged:</span>
                <span className="text-brand-600 text-sm">{formatCurrency(selectedBooking.finalAmount)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-borderSoft flex justify-end gap-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-navy-800 bg-slate-100 rounded-xl hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {editStatusModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-borderSoft shadow-dropdown">
            <h3 className="text-base font-bold text-navy-900">
              Update Booking Workflow Status
            </h3>
            <p className="text-xs text-slateText">
              Updating status logs this sensitive change to the immutable audit trail.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">New Workflow Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
                >
                  {statusOptions.map((st) => (
                    <option key={st} value={st}>
                      {st.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Internal Operations Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Sample tube barcode, phlebotomist remarks, etc."
                  className="w-full p-2.5 border border-borderSoft rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditStatusModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors"
                >
                  {updating ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
