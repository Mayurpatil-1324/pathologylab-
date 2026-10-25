'use client';

import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, Edit, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Diagnostic Categories
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Organize lab tests by clinical specialty, vital organs, and disease profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">Loading categories...</div>
        ) : (
          categories.map((cat) => {
            const LucideIcon = (Icons as Record<string, any>)[cat.iconName] || Icons.Activity;
            return (
              <div
                key={cat.id}
                className="bg-white p-5 rounded-2xl border border-borderSoft shadow-sm flex flex-col justify-between hover:shadow-card transition-all"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <LucideIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 mb-1">{cat.name}</h3>
                  <p className="text-xs text-slateText line-clamp-2 leading-relaxed mb-3">
                    {cat.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-borderSoft flex items-center justify-between text-xs">
                  <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                    {cat._count?.tests || 0} Tests
                  </span>
                  <span className="text-[11px] text-slate-400">Order #{cat.displayOrder}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
