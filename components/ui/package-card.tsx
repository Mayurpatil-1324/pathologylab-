'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, Check, Clock, Layers, ArrowRight } from 'lucide-react';
import { PriceDisplay } from './price-display';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

export interface PackageCardData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  mrpPrice: number;
  sellingPrice: number;
  discountPercent?: number;
  fastingRequired: boolean;
  fastingHours: number;
  reportTurnaroundHours: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  tests?: {
    test: {
      id: string;
      name: string;
      testCode: string;
      parameters?: any[];
    };
  }[];
}

interface PackageCardProps {
  packageData: PackageCardData;
  onCompare?: (pkg: PackageCardData) => void;
  isComparing?: boolean;
}

export function PackageCard({ packageData, onCompare, isComparing }: PackageCardProps) {
  const { addItem, isInCart, removeItem } = useCart();
  const added = isInCart(packageData.id);

  const testsList = packageData.tests?.map((t) => t.test) || [];
  const totalParameters = testsList.reduce((acc, t) => acc + (t.parameters?.length || 2), 0);

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (added) {
      removeItem(packageData.id);
    } else {
      addItem({
        id: packageData.id,
        itemType: 'PACKAGE',
        packageId: packageData.id,
        name: packageData.name,
        slug: packageData.slug,
        price: packageData.sellingPrice,
        mrpPrice: packageData.mrpPrice,
        sampleType: 'Blood & Urine',
        fastingRequired: packageData.fastingRequired,
        fastingHours: packageData.fastingHours,
        parametersCount: totalParameters,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-borderSoft p-6 flex flex-col justify-between hover:shadow-cardHover transition-all duration-300 relative overflow-hidden group">
      {packageData.isFeatured && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-brand-600 to-teal-500 text-white text-[10px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-bl-lg">
          Best Value Package
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
            <Layers className="w-3 h-3" />
            {testsList.length} Tests Included ({totalParameters}+ Parameters)
          </span>
        </div>

        <Link href={`/packages/${packageData.slug}`}>
          <h3 className="text-lg font-extrabold text-navy-900 group-hover:text-brand-600 transition-colors mb-2 leading-snug">
            {packageData.name}
          </h3>
        </Link>

        <p className="text-xs text-slateText line-clamp-2 mb-4 leading-relaxed">
          {packageData.shortDescription}
        </p>

        {/* Tests preview pills */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Includes Key Profiles:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {testsList.slice(0, 4).map((t) => (
              <span
                key={t.id}
                className="text-[11px] font-medium bg-bgLight text-navy-800 px-2 py-1 rounded-md border border-borderSoft truncate max-w-[200px]"
              >
                {t.name}
              </span>
            ))}
            {testsList.length > 4 && (
              <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-100">
                +{testsList.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Fasting & Report Info */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-5 py-2 px-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Turnaround: <strong className="text-navy-900 font-semibold">{packageData.reportTurnaroundHours}h</strong></span>
          </div>
          <div className="w-px h-3.5 bg-slate-200" />
          <div>
            <span>Fasting: <strong className="text-navy-900 font-semibold">{packageData.fastingRequired ? `${packageData.fastingHours}h Overnight` : 'Not required'}</strong></span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-borderSoft flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <PriceDisplay
            sellingPrice={packageData.sellingPrice}
            mrpPrice={packageData.mrpPrice}
            discountPercent={packageData.discountPercent}
            size="lg"
          />

          {onCompare && (
            <button
              onClick={() => onCompare(packageData)}
              className={cn(
                'text-xs font-semibold px-2.5 py-1 rounded border transition-colors',
                isComparing
                  ? 'bg-brand-50 border-brand-300 text-brand-700 font-bold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {isComparing ? '✓ Comparing' : '+ Compare'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/packages/${packageData.slug}`}
            className="flex items-center justify-center gap-1 text-xs font-bold text-navy-700 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-lg transition-colors"
          >
            View Package
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleToggleCart}
            className={cn(
              'flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg transition-all',
              added
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm'
            )}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                Booked
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Book Package
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
