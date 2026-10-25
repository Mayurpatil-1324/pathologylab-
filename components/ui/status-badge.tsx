import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s.toUpperCase()) {
      case 'PENDING_CONFIRMATION':
      case 'PENDING':
        return { label: 'Pending Confirmation', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
      case 'COLLECTION_ASSIGNED':
        return { label: 'Phlebo Assigned', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
      case 'SAMPLE_COLLECTED':
        return { label: 'Sample Collected', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
      case 'SAMPLE_RECEIVED':
      case 'PROCESSING':
        return { label: 'Lab Processing', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
      case 'REPORT_READY':
        return { label: 'Report Ready', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
      case 'COMPLETED':
      case 'PAID':
      case 'RELEASED':
        return { label: s === 'PAID' ? 'Paid' : s === 'RELEASED' ? 'Released' : 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
      case 'CANCELLED':
      case 'FAILED':
        return { label: s === 'FAILED' ? 'Payment Failed' : 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
      case 'REFUND_PENDING':
        return { label: 'Refund Pending', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
      case 'REFUNDED':
        return { label: 'Refunded', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };
      default:
        return { label: s.replace(/_/g, ' '), bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
      {config.label}
    </span>
  );
}
