import React from 'react';
import { formatCurrency, cn } from '@/lib/utils';

interface PriceDisplayProps {
  sellingPrice: number;
  mrpPrice?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriceDisplay({
  sellingPrice,
  mrpPrice,
  discountPercent,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const hasDiscount = mrpPrice && mrpPrice > sellingPrice;
  const discount = discountPercent || (hasDiscount ? Math.round(((mrpPrice - sellingPrice) / mrpPrice) * 100) : 0);

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span
        className={cn(
          'font-extrabold text-navy-900 tracking-tight',
          size === 'sm' && 'text-base',
          size === 'md' && 'text-xl',
          size === 'lg' && 'text-2xl'
        )}
      >
        {formatCurrency(sellingPrice)}
      </span>

      {hasDiscount && (
        <span
          className={cn(
            'text-slate-400 line-through font-normal',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base'
          )}
        >
          {formatCurrency(mrpPrice)}
        </span>
      )}

      {hasDiscount && discount > 0 && (
        <span className="text-xs font-bold text-successGreen bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          {discount}% OFF
        </span>
      )}
    </div>
  );
}
