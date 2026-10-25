'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  XCircle,
  Download,
  ChevronRight,
  ShieldCheck,
  Building2,
  Home,
} from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { StatusBadge } from '@/components/ui/status-badge';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export default function PatientBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadBookings();
    }
  }, [user, authLoading, router]);

  const handleCancelBooking = async () => {
    if (!selectedBookingForCancel) return;
    try {
      const res = await fetch(`/api/bookings/${selectedBookingForCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === selectedBookingForCancel.id ? { ...b, status: 'CANCELLED' } : b))
        );
        setCancelModalOpen(false);
        setSelectedBookingForCancel(null);
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch {
      alert('Error cancelling booking');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
              My Diagnostic Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slateText mt-1">
              Track your scheduled sample collections, lab processing status, and report release.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/account/reports"
              className="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span>Medical Reports</span>
            </Link>
            <Link
              href="/tests"
              className="text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Book New Test
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-xs text-slate-400">
            Loading your bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-borderSoft p-12 text-center max-w-md mx-auto space-y-4">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-navy-900">No bookings found</h3>
            <p className="text-xs text-slateText">
              You haven't scheduled any diagnostic test bookings yet.
            </p>
            <Link
              href="/tests"
              className="inline-block text-xs font-bold px-5 py-2.5 bg-brand-500 text-white rounded-xl"
            >
              Explore Tests Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-borderSoft p-5 sm:p-6 shadow-sm hover:shadow-card transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-borderSoft">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono font-bold text-sm text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                      {booking.bookingRef}
                    </span>
                    <StatusBadge status={booking.status} />
                    <span className="text-xs text-slate-400">
                      Booked on {formatDate(booking.createdAt)}
                    </span>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <span className="text-sm font-extrabold text-navy-900">
                      {formatCurrency(booking.finalAmount)}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-bold mb-1">
                      Patient Details
                    </span>
                    <strong className="text-navy-900 font-bold block">{booking.patientName}</strong>
                    <span className="text-slateText">{booking.patientAge} Years / {booking.patientGender}</span>
                    <div className="text-slateText">{booking.patientPhone}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-bold mb-1">
                      Scheduled Appointment
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-navy-900">
                      <Calendar className="w-3.5 h-3.5 text-brand-500" />
                      <span>{formatDate(booking.scheduledDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slateText mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{booking.slotTime}</span>
                    </div>
                    <div className="text-slateText mt-1 flex items-center gap-1">
                      {booking.collectionType === 'HOME_COLLECTION' ? (
                        <>
                          <Home className="w-3.5 h-3.5 text-brand-600" />
                          <span>Home Doorstep Collection</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Lab Center Visit</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px] uppercase font-bold mb-1">
                      Center & Address
                    </span>
                    <div className="text-navy-900 font-semibold">{booking.serviceLocation?.name}</div>
                    {booking.addressString && (
                      <div className="text-slate-500 line-clamp-2 mt-0.5">
                        {booking.addressString}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items snapshot */}
                <div className="pt-3 border-t border-borderSoft/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {booking.items.map((it: any) => (
                      <span
                        key={it.id}
                        className="text-[11px] font-semibold bg-bgLight text-navy-900 px-2 py-1 rounded-md border border-borderSoft"
                      >
                        {it.itemName} ({formatCurrency(it.priceCharged)})
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* View Report if available */}
                    {booking.reports && booking.reports.length > 0 && booking.reports[0].status === 'RELEASED' && (
                      <a
                        href={`/api/reports/download/${booking.reports[0].id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600" />
                        Download PDF Report
                      </a>
                    )}

                    {/* Cancellation option if not finished */}
                    {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                      <button
                        onClick={() => {
                          setSelectedBookingForCancel(booking);
                          setCancelModalOpen(true);
                        }}
                        className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold px-2 py-1"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Cancellation Modal */}
      {cancelModalOpen && selectedBookingForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-borderSoft shadow-dropdown">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertCircle className="w-5 h-5" />
              <span>Cancel Booking #{selectedBookingForCancel.bookingRef}</span>
            </div>
            <p className="text-xs text-slateText leading-relaxed">
              Are you sure you want to cancel this booking scheduled for {formatDate(selectedBookingForCancel.scheduledDate)}? If you paid online, your refund will be processed back to your original source within 3–5 working days.
            </p>
            <div>
              <label className="block text-xs font-bold text-navy-900 mb-1">
                Reason for Cancellation
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Need to reschedule, physician changed prescription"
                className="w-full p-2 text-xs border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors"
              >
                Yes, Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <MainFooter />
    </div>
  );
}
