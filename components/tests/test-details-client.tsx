'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, Building2, Check, ShoppingCart, ArrowRight } from 'lucide-react';
import { PriceDisplay } from '@/components/ui/price-display';
import { useCart } from '@/lib/cart-context';
import { useLocation } from '@/lib/location-context';
import { cn } from '@/lib/utils';

export function TestDetailsClient({ test }: { test: any }) {
  const router = useRouter();
  const { addItem, isInCart } = useCart();
  const { selectedCity } = useLocation();
  const [collectionMode, setCollectionMode] = useState<'HOME' | 'CENTER'>('HOME');

  const added = isInCart(test.id);

  const handleAddToCart = () => {
    addItem({
      id: test.id,
      itemType: 'TEST',
      testId: test.id,
      name: test.name,
      slug: test.slug,
      code: test.testCode,
      price: test.sellingPrice,
      mrpPrice: test.mrpPrice,
      sampleType: test.sampleType,
      fastingRequired: test.fastingRequired,
      fastingHours: test.fastingHours,
      parametersCount: test.parameters?.length || 1,
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
          Total Test Price
        </span>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          Save {test.discountPercent || 30}%
        </span>
      </div>

      <PriceDisplay
        sellingPrice={test.sellingPrice}
        mrpPrice={test.mrpPrice}
        discountPercent={test.discountPercent}
        size="lg"
      />

      {/* Collection Option Selection */}
      <div className="space-y-2 pt-1">
        <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
          Select Preferred Collection Mode
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCollectionMode('HOME')}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              collectionMode === 'HOME'
                ? 'border-brand-500 bg-brand-50/70 text-brand-900 shadow-sm'
                : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
            )}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Home className="w-3.5 h-3.5 text-brand-600" />
              <span>Home Sample</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Available in {selectedCity}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setCollectionMode('CENTER')}
            className={cn(
              'p-3 rounded-xl border text-left transition-all',
              collectionMode === 'CENTER'
                ? 'border-brand-500 bg-brand-50/70 text-brand-900 shadow-sm'
                : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
            )}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Building2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Lab Center Visit</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Walk-in at lab desk
            </div>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={handleBookNow}
          className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
        >
          <span>Book Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {added ? (
          <Link
            href="/cart"
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Added to Cart — View Cart</span>
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
        100% Secure Checkout • Online & Pay-at-Collection
      </div>
    </div>
  );
}
