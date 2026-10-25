'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In our seed, we created FIRST50, HEALTH15, FAMILY250
    const demoCoupons = [
      { id: '1', code: 'FIRST50', description: 'Flat ₹50 OFF on first booking', discountType: 'FIXED', discountValue: 50, minOrderValue: 299, maxUses: 1000, currentUses: 48, validUntil: '2028-12-31', isActive: true },
      { id: '2', code: 'HEALTH15', description: '15% OFF on tests & packages above ₹999 (Max ₹300)', discountType: 'PERCENTAGE', discountValue: 15, minOrderValue: 999, maxUses: 500, currentUses: 112, validUntil: '2028-12-31', isActive: true },
      { id: '3', code: 'FAMILY250', description: 'Special ₹250 OFF on family checkup orders above ₹1999', discountType: 'FIXED', discountValue: 250, minOrderValue: 1999, maxUses: 200, currentUses: 34, validUntil: '2028-12-31', isActive: true },
    ];
    setCoupons(demoCoupons);
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Coupons & Promotional Discounts
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Server-validated promo codes, minimum order rules, and usage tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {coupons.map((c) => (
          <div
            key={c.id}
            className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-black text-sm text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200">
                  {c.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-navy-900 font-semibold">{c.description}</p>
              <div className="text-xs text-slate400 space-y-1 pt-3 text-slate-500">
                <div>Type: <strong>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}% Discount` : `Flat ₹${c.discountValue} OFF`}</strong></div>
                <div>Min Order: <strong>{formatCurrency(c.minOrderValue)}</strong></div>
                <div>Expiry: <strong>{formatDate(c.validUntil)}</strong></div>
              </div>
            </div>

            <div className="pt-3 border-t border-borderSoft flex items-center justify-between text-xs">
              <span className="text-slate-400">Redeemed:</span>
              <strong className="text-brand-600 font-bold">{c.currentUses} Times</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
