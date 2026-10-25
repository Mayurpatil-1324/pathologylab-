'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ShoppingCart, ShieldCheck } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/price-display';
import { useCart } from '@/lib/cart-context';

export function PackageDetailsClient({
  pkg,
  totalParameters,
}: {
  pkg: any;
  totalParameters: number;
}) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const added = isInCart(pkg.id);

  const handleAddToCart = () => {
    addItem({
      id: pkg.id,
      itemType: 'PACKAGE',
      packageId: pkg.id,
      name: pkg.name,
      slug: pkg.slug,
      price: pkg.sellingPrice,
      mrpPrice: pkg.mrpPrice,
      sampleType: 'Blood & Urine',
      fastingRequired: pkg.fastingRequired,
      fastingHours: pkg.fastingHours,
      parametersCount: totalParameters,
    });
  };

  const handleBookNow = () => {
    if (!added) {
      handleAddToCart();
    }
    router.push('/checkout');
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Package Price
        </span>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Save {pkg.discountPercent || 50}%
        </span>
      </div>

      <PriceDisplay
        sellingPrice={pkg.sellingPrice}
        mrpPrice={pkg.mrpPrice}
        discountPercent={pkg.discountPercent}
        size="lg"
      />

      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>Includes Free Doorstep Phlebotomist Collection</span>
      </div>

      <div className="space-y-2 pt-2">
        <button
          onClick={handleBookNow}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>Book Health Package</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {added ? (
          <Link
            href="/cart"
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Added — View in Cart</span>
          </Link>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full bg-white hover:bg-slate-50 text-navy-800 border border-borderSoft font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <ShoppingCart className="w-4 h-4 text-slate-500" />
            <span>Add to Cart</span>
          </button>
        )}
      </div>

      <div className="text-[11px] text-center text-slate-400">
        Reports Delivered Digitally within {pkg.reportTurnaroundHours} Hours
      </div>
    </div>
  );
}
