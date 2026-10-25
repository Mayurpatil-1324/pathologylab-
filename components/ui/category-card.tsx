import React from 'react';
import Link from 'next/link';
import * as Icons from 'lucide-react';

interface CategoryCardProps {
  name: string;
  slug: string;
  iconName: string;
  description?: string;
  testCount?: number;
}

export function CategoryCard({
  name,
  slug,
  iconName,
  description,
  testCount,
}: CategoryCardProps) {
  // Dynamic icon retrieval with fallback
  const LucideIcon = (Icons as Record<string, any>)[iconName] || Icons.Activity;

  return (
    <Link
      href={`/tests?category=${slug}`}
      className="group bg-white rounded-xl border border-borderSoft p-4 flex flex-col items-center text-center hover:border-brand-300 hover:shadow-cardHover transition-all duration-200"
    >
      <div className="w-13 h-13 rounded-2xl bg-brand-50 group-hover:bg-brand-500 text-brand-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors duration-200 shadow-sm">
        <LucideIcon className="w-6 h-6" />
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-navy-900 group-hover:text-brand-600 transition-colors line-clamp-1">
        {name}
      </h4>

      {testCount !== undefined && (
        <span className="text-[11px] text-slate-400 mt-1">
          {testCount} {testCount === 1 ? 'Test' : 'Tests'}
        </span>
      )}
    </Link>
  );
}
