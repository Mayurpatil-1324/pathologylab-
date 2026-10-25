'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';
import { TestCard, TestCardData } from '@/components/ui/test-card';
import { cn } from '@/lib/utils';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TestListingViewProps {
  initialTests: TestCardData[];
  categories: CategoryOption[];
}

export function TestListingView({
  initialTests,
  categories,
}: TestListingViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tests, setTests] = useState<TestCardData[]>(initialTests);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedSampleType, setSelectedSampleType] = useState(searchParams.get('sampleType') || 'all');
  const [selectedFasting, setSelectedFasting] = useState(searchParams.get('fasting') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular');
  const [priceRange, setPriceRange] = useState<number>(1500);

  // Sync search input if query param changes
  useEffect(() => {
    setSearch(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  // Fetch filtered tests
  useEffect(() => {
    async function fetchFiltered() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set('q', search.trim());
        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedSampleType !== 'all') params.set('sampleType', selectedSampleType);
        if (selectedFasting !== 'all') params.set('fasting', selectedFasting);
        params.set('sort', sortBy);
        params.set('maxPrice', priceRange.toString());

        const res = await fetch(`/api/tests?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
        }
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchFiltered();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedCategory, selectedSampleType, selectedFasting, sortBy, priceRange]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedSampleType('all');
    setSelectedFasting('all');
    setSortBy('popular');
    setPriceRange(1500);
    router.push('/tests');
  };

  const sampleTypes = ['Blood', 'Urine', 'Serum', 'EDTA Whole Blood'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Banner & Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-navy-900 tracking-tight">
          Diagnostic Lab Tests
        </h1>
        <p className="text-xs sm:text-sm text-slateText mt-1">
          Explore individual blood, urine, hormone, and organ profile tests with NABL certified accuracy and doorstep sample collection.
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white p-5 rounded-2xl border border-borderSoft shadow-sm space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
            <div className="flex items-center gap-2 font-bold text-sm text-navy-900">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filter Tests</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Clear All
            </button>
          </div>

          {/* Search by Test Name / Code */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Search Tests
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Test name or code (e.g. CBC)..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-bgLight border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between',
                  selectedCategory === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <span>All Categories</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between',
                    selectedCategory === cat.slug
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sample Type Filter */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Sample Specimen
            </label>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedSampleType('all')}
                className={cn(
                  'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium',
                  selectedSampleType === 'all'
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                All Sample Types
              </button>
              {sampleTypes.map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedSampleType(st)}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium',
                    selectedSampleType === st
                      ? 'bg-brand-50 text-brand-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Fasting Requirement */}
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              Fasting Requirement
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { label: 'All', val: 'all' },
                { label: 'Fasting', val: 'true' },
                { label: 'No Fasting', val: 'false' },
              ].map((item) => (
                <button
                  key={item.val}
                  onClick={() => setSelectedFasting(item.val)}
                  className={cn(
                    'py-1.5 px-2 text-[11px] font-semibold rounded-lg border text-center transition-colors',
                    selectedFasting === item.val
                      ? 'bg-brand-500 text-white border-brand-500'
                      : 'bg-white text-navy-800 border-borderSoft hover:bg-slate-50'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
              <span>Max Price</span>
              <span className="text-brand-600 font-extrabold">₹{priceRange}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹100</span>
              <span>₹2000</span>
            </div>
          </div>
        </aside>

        {/* Tests Listing Column */}
        <div className="lg:col-span-3 space-y-4">
          {/* Controls Bar: Results Count, Sort, Mobile Filter Trigger */}
          <div className="bg-white p-3 rounded-xl border border-borderSoft flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-600">
              Showing <strong className="text-navy-900">{tests.length}</strong> tests
            </div>

            <div className="flex items-center gap-2">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-navy-900 bg-bgLight border border-borderSoft px-3 py-1.5 rounded-lg"
              >
                <Filter className="w-3.5 h-3.5 text-brand-500" />
                <span>Filters</span>
              </button>

              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                <span className="text-slate-400 hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-bgLight text-navy-900 border border-borderSoft font-semibold rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                >
                  <option value="popular">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="turnaround">Fastest Report</option>
                  <option value="name">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Test Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-borderSoft p-5 h-64 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-slate-100 rounded" />
                    <div className="w-3/4 h-5 bg-slate-200 rounded" />
                    <div className="w-full h-8 bg-slate-100 rounded" />
                  </div>
                  <div className="w-full h-10 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-borderSoft p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-navy-900">No matching tests found</h3>
              <p className="text-xs text-slateText max-w-sm mx-auto">
                We couldn't find tests matching your current filter criteria. Try resetting filters or searching with a different term.
              </p>
              <button
                onClick={handleClearFilters}
                className="mt-2 text-xs font-bold px-4 py-2 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map((test) => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-sm lg:hidden">
          <div className="bg-white w-full max-w-xs h-full p-5 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <h3 className="font-bold text-base text-navy-900">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-navy-900 uppercase mb-2">Category</label>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={cn(
                    'w-full text-left px-2.5 py-1.5 rounded-lg text-xs',
                    selectedCategory === 'all' ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'
                  )}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-lg text-xs',
                      selectedCategory === c.slug ? 'bg-brand-50 text-brand-700 font-bold' : 'text-slate-600'
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-borderSoft flex gap-2">
              <button
                onClick={handleClearFilters}
                className="w-1/2 py-2 text-xs font-semibold bg-slate-100 rounded-lg text-navy-800"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2 text-xs font-bold bg-brand-500 text-white rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
