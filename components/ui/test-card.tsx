'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Droplet, Check, Plus, AlertCircle } from 'lucide-react';
import { PriceDisplay } from './price-display';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

export interface TestCardData {
  id: string;
  testCode: string;
  name: string;
  slug: string;
  shortDescription: string;
  sampleType: string;
  fastingRequired: boolean;
  fastingHours: number;
  reportTurnaroundHours: number;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent?: number;
  category?: {
    name: string;
    slug: string;
  };
  parameters?: any[];
}

export function TestCard({ test }: { test: TestCardData }) {
  const { addItem, isInCart, removeItem } = useCart();
  const added = isInCart(test.id);

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (added) {
      removeItem(test.id);
    } else {
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
    }
  };

  return (
    <div className="bg-white rounded-xl border border-borderSoft p-5 flex flex-col justify-between hover:shadow-cardHover transition-all duration-200 group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {test.category && (
            <span className="text-[11px] font-semibold tracking-wide text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md uppercase">
              {test.category.name}
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
            {test.testCode}
          </span>
        </div>

        <Link href={`/tests/${test.slug}`}>
          <h3 className="text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5">
            {test.name}
          </h3>
        </Link>

        <p className="text-xs text-slateText line-clamp-2 mb-4 leading-relaxed">
          {test.shortDescription}
        </p>

        <div className="space-y-1.5 mb-4 text-[12px] text-slate-600 bg-bgLight p-2.5 rounded-lg border border-borderSoft/60">
          <div className="flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-brand-500 shrink-0" />
            <span className="truncate">Sample: <strong className="font-semibold text-navy-900">{test.sampleType}</strong></span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Reports in: <strong className="font-semibold text-navy-900">{test.reportTurnaroundHours} Hours</strong></span>
          </div>

          {test.fastingRequired ? (
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{test.fastingHours} hrs fasting required</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>No fasting required</span>
            </div>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-borderSoft/80 flex items-center justify-between gap-3">
        <PriceDisplay
          sellingPrice={test.sellingPrice}
          mrpPrice={test.mrpPrice}
          discountPercent={test.discountPercent}
          size="md"
        />

        <div className="flex items-center gap-2">
          <Link
            href={`/tests/${test.slug}`}
            className="text-xs font-semibold text-navy-700 hover:text-brand-600 px-2 py-1.5 rounded transition-colors"
          >
            Details
          </Link>

          <button
            onClick={handleToggleCart}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all',
              added
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
            )}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
