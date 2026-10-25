'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Tag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Plus,
} from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { useCart } from '@/lib/cart-context';
import { formatCurrency, cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    clearCart,
    subtotal,
    mrpTotal,
    savingsTotal,
    coupon,
    applyCoupon,
    removeCoupon,
    collectionFee,
    finalTotal,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setApplying(true);
    setCouponMessage(null);

    const result = await applyCoupon(couponCodeInput.trim());
    setCouponMessage({ text: result.message, success: result.success });
    setApplying(false);
    if (result.success) {
      setCouponCodeInput('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight mb-2">
          Your Diagnostic Cart
        </h1>
        <p className="text-xs sm:text-sm text-slateText mb-8">
          Review your selected tests and health checkups before booking appointment.
        </p>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-borderSoft p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-navy-900">Your cart is currently empty</h3>
            <p className="text-xs text-slateText max-w-sm mx-auto leading-relaxed">
              Explore our wide catalog of diagnostic blood tests, health packages, and full-body profiles.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/tests"
                className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shadow-sm"
              >
                Browse Lab Tests
              </Link>
              <Link
                href="/packages"
                className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold px-5 py-3 rounded-xl transition-colors"
              >
                Explore Health Packages
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl border border-borderSoft p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-borderSoft mb-4">
                  <h3 className="text-sm font-bold text-navy-900">
                    Selected Items ({items.length})
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>

                <div className="divide-y divide-borderSoft">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded">
                            {item.itemType}
                          </span>
                          {item.code && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.code}
                            </span>
                          )}
                        </div>

                        <Link
                          href={item.itemType === 'PACKAGE' ? `/packages/${item.slug}` : `/tests/${item.slug}`}
                          className="font-bold text-sm text-navy-900 hover:text-brand-600 transition-colors block"
                        >
                          {item.name}
                        </Link>

                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          {item.sampleType && <span>Specimen: {item.sampleType}</span>}
                          {item.parametersCount && <span>{item.parametersCount} Parameters</span>}
                          {item.fastingRequired && (
                            <span className="text-amber-700 font-semibold">Fasting required</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-2">
                        <div className="font-extrabold text-base text-navy-900">
                          {formatCurrency(item.price)}
                        </div>
                        {item.mrpPrice > item.price && (
                          <div className="text-xs text-slate-400 line-through">
                            {formatCurrency(item.mrpPrice)}
                          </div>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-rose-500 hover:text-rose-700 hover:underline font-medium block ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more tests nudge */}
              <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-800">
                  Need to add more blood tests for family members?
                </span>
                <Link
                  href="/tests"
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add More Tests
                </Link>
              </div>
            </div>

            {/* Bill Summary (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Coupon Box */}
              <div className="bg-white p-5 rounded-2xl border border-borderSoft shadow-sm space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-navy-900">
                  <Tag className="w-4 h-4 text-brand-600" />
                  Apply Coupon Code
                </div>

                {coupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {coupon.code} Applied
                      </div>
                      <div className="text-[11px] text-emerald-600 mt-0.5">
                        {coupon.description}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-600 hover:underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. FIRST50, HEALTH15"
                      className="flex-1 py-2 px-3 text-xs bg-bgLight border border-borderSoft rounded-lg uppercase font-semibold focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={applying || !couponCodeInput.trim()}
                      className="bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {applying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}

                {couponMessage && (
                  <div
                    className={cn(
                      'text-xs p-2 rounded-lg',
                      couponMessage.success
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    )}
                  >
                    {couponMessage.text}
                  </div>
                )}

                {/* Demo Coupons Hint */}
                <div className="text-[11px] text-slate-400 pt-1">
                  Available Codes: <strong className="text-brand-600">FIRST50</strong> (₹50 off), <strong className="text-brand-600">HEALTH15</strong> (15% off), <strong className="text-brand-600">FAMILY250</strong>
                </div>
              </div>

              {/* Order Total Card */}
              <div className="bg-white p-6 rounded-2xl border border-borderSoft shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
                  Payment Summary
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Total MRP</span>
                    <span className="line-through">{formatCurrency(mrpTotal)}</span>
                  </div>

                  <div className="flex justify-between text-navy-800">
                    <span>Discounted Subtotal</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount ({coupon.code})</span>
                      <span>-{formatCurrency(coupon.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-navy-800">
                    <span>Sample Collection Fee</span>
                    <span>
                      {collectionFee === 0 ? (
                        <strong className="text-emerald-700">FREE</strong>
                      ) : (
                        formatCurrency(collectionFee)
                      )}
                    </span>
                  </div>

                  {subtotal < 499 && (
                    <div className="text-[10px] text-brand-600 bg-brand-50 p-2 rounded-lg">
                      Add ₹{499 - subtotal} more to get FREE home sample collection!
                    </div>
                  )}

                  <div className="pt-3 border-t border-borderSoft flex justify-between items-baseline">
                    <span className="text-sm font-bold text-navy-900">Total Payable Amount</span>
                    <span className="text-xl font-black text-brand-600">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>

                  {savingsTotal > 0 && (
                    <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg text-center border border-emerald-200">
                      You are saving {formatCurrency(savingsTotal)} on this booking!
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push('/checkout')}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm mt-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Secure Checkout & Diagnostic Integrity</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
