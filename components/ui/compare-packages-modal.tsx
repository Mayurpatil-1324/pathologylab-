'use client';

import React from 'react';
import { X, Check, Minus, Layers, Clock, AlertCircle } from 'lucide-react';
import { PackageCardData } from './package-card';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: PackageCardData[];
  onRemovePackage: (pkgId: string) => void;
}

export function ComparePackagesModal({
  isOpen,
  onClose,
  packages,
  onRemovePackage,
}: CompareModalProps) {
  const { addItem, isInCart } = useCart();

  if (!isOpen || packages.length === 0) return null;

  // Collect all unique test names across all compared packages
  const allTestNames = Array.from(
    new Set(
      packages.flatMap((p) => p.tests?.map((t) => t.test.name) || [])
    )
  ).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-dropdown border border-borderSoft flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-borderSoft flex items-center justify-between bg-bgLight">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-navy-900">Compare Health Packages</h3>
            <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-semibold border border-brand-200">
              {packages.length} selected
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-navy-900 p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-1/4 p-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-borderSoft">
                    Features / Tests
                  </th>
                  {packages.map((pkg) => (
                    <th
                      key={pkg.id}
                      className="p-4 text-left border-b border-borderSoft bg-white min-w-[200px]"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-navy-900">{pkg.name}</span>
                        <button
                          onClick={() => onRemovePackage(pkg.id)}
                          className="text-slate-400 hover:text-rose-600"
                          title="Remove from comparison"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-lg font-extrabold text-navy-900 mb-1">
                        {formatCurrency(pkg.sellingPrice)}
                        <span className="text-xs text-slate-400 font-normal line-through ml-2">
                          {formatCurrency(pkg.mrpPrice)}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: pkg.id,
                            itemType: 'PACKAGE',
                            packageId: pkg.id,
                            name: pkg.name,
                            slug: pkg.slug,
                            price: pkg.sellingPrice,
                            mrpPrice: pkg.mrpPrice,
                          });
                        }}
                        className="w-full text-xs font-bold py-1.5 px-3 rounded bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                      >
                        {isInCart(pkg.id) ? 'In Cart' : 'Book Now'}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft text-xs">
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Total Tests</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-3 font-bold text-navy-900">
                      {pkg.tests?.length || 0} Diagnostic Profiles
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Fasting Requirement</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-700">
                      {pkg.fastingRequired ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {pkg.fastingHours}h Fasting
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Not Required
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-700 bg-slate-50/50">Report Delivery</td>
                  {packages.map((pkg) => (
                    <td key={pkg.id} className="p-3 text-slate-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      Within {pkg.reportTurnaroundHours} Hours
                    </td>
                  ))}
                </tr>

                {/* Individual tests matrix */}
                {allTestNames.map((testName) => (
                  <tr key={testName} className="hover:bg-bgLight/60">
                    <td className="p-3 font-medium text-navy-800 bg-slate-50/30">{testName}</td>
                    {packages.map((pkg) => {
                      const hasTest = pkg.tests?.some((t) => t.test.name === testName);
                      return (
                        <td key={pkg.id} className="p-3 text-center sm:text-left">
                          {hasTest ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                              <Check className="w-4 h-4" />
                              <span className="hidden sm:inline">Included</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-300">
                              <Minus className="w-4 h-4" />
                              <span className="hidden sm:inline">No</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-borderSoft bg-bgLight flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-navy-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
