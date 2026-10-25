'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  MapPin,
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  ShieldAlert,
  FileText,
  Phone,
  LogOut,
  Calendar,
  Activity,
  Layers,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useLocation } from '@/lib/location-context';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, cn } from '@/lib/utils';
import { PrescriptionModal } from '@/components/ui/prescription-modal';

export function MainHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedCity, setSelectedCity, locations } = useLocation();
  const { itemCount, subtotal } = useCart();
  const { user, logout } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<{
    tests: any[];
    packages: any[];
  }>({ tests: [], packages: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch search suggestions with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchSuggestions({ tests: [], packages: [] });
      setSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const [testsRes, pkgRes] = await Promise.all([
          fetch(`/api/tests?q=${encodeURIComponent(searchQuery)}`),
          fetch(`/api/packages?q=${encodeURIComponent(searchQuery)}`),
        ]);
        const testsData = await testsRes.json();
        const pkgData = await pkgRes.json();

        setSearchSuggestions({
          tests: (testsData.tests || []).slice(0, 4),
          packages: (pkgData.packages || []).slice(0, 3),
        });
        setSearchOpen(true);
      } catch {
        // ignore
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/tests?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Lab Tests', href: '/tests' },
    { name: 'Health Packages', href: '/packages' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200 bg-white',
          isScrolled ? 'shadow-md border-b border-borderSoft' : 'border-b border-borderSoft/60'
        )}
      >
        {/* Top announcement bar */}
        <div className="bg-navy-900 text-white text-[11px] py-1.5 px-4 hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-teal-300 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                NABL Quality Accredited Pathology Laboratory Standards
              </span>
              <span className="text-white/40">|</span>
              <span className="text-slate-300">
                Early Morning Sample Collection: 6:30 AM – 11:30 AM
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPrescriptionModalOpen(true)}
                className="text-white hover:text-teal-300 font-semibold underline underline-offset-2 transition-colors"
              >
                Upload Prescription
              </button>
              <span className="text-white/40">|</span>
              <a
                href="tel:+919876543210"
                className="flex items-center gap-1 text-slate-300 hover:text-white"
              >
                <Phone className="w-3 h-3 text-teal-400" />
                <span>+91 98765 43210</span>
              </a>
              {user?.role && user.role !== 'PATIENT' && (
                <Link
                  href="/admin"
                  className="bg-brand-500 hover:bg-brand-600 text-white px-2 py-0.5 rounded text-[10px] font-bold"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-3 md:gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-sm font-black text-lg">
                H
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-navy-900 leading-none">
                  HealthPoint
                </span>
                <span className="text-[10px] font-bold tracking-widest text-teal-600 uppercase leading-tight">
                  Diagnostics
                </span>
              </div>
            </Link>

            {/* Location Selector */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-navy-900 bg-bgLight hover:bg-slate-100 border border-borderSoft px-3 py-2 rounded-lg transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="truncate max-w-[110px]">{selectedCity}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {locationDropdownOpen && (
                <div className="absolute left-0 mt-1 w-56 bg-white rounded-xl shadow-dropdown border border-borderSoft p-2 z-50 animate-in fade-in">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                    Select Service City
                  </div>
                  {locations.length > 0 ? (
                    locations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setSelectedCity(loc.city);
                          setLocationDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors',
                          selectedCity === loc.city
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'hover:bg-slate-50 text-navy-800'
                        )}
                      >
                        <span>{loc.city}</span>
                        {selectedCity === loc.city && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        )}
                      </button>
                    ))
                  ) : (
                    ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Pune'].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setSelectedCity(c);
                          setLocationDropdownOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-slate-50"
                      >
                        {c}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Search Input with Live Suggestions */}
            <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) setSearchOpen(true);
                  }}
                  placeholder="Search for blood tests, health packages (e.g. CBC, HbA1c, Thyroid)..."
                  className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-bgLight border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Search
                </button>
              </form>

              {/* Autocomplete Dropdown */}
              {searchOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-dropdown border border-borderSoft p-3 z-50 animate-in fade-in max-h-96 overflow-y-auto">
                  {searchSuggestions.tests.length === 0 && searchSuggestions.packages.length === 0 ? (
                    <div className="text-xs text-slate-400 py-3 text-center">
                      No matching diagnostic tests or packages found.
                    </div>
                  ) : (
                    <>
                      {searchSuggestions.tests.length > 0 && (
                        <div className="mb-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Lab Tests
                          </div>
                          {searchSuggestions.tests.map((test) => (
                            <Link
                              key={test.id}
                              href={`/tests/${test.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-2 hover:bg-brand-50 rounded-lg group text-xs transition-colors"
                            >
                              <div>
                                <div className="font-bold text-navy-900 group-hover:text-brand-600">
                                  {test.name}
                                </div>
                                <div className="text-[11px] text-slate-400 font-mono">
                                  {test.testCode} • {test.sampleType}
                                </div>
                              </div>
                              <div className="text-right font-extrabold text-navy-900">
                                {formatCurrency(test.sellingPrice)}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {searchSuggestions.packages.length > 0 && (
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Health Packages
                          </div>
                          {searchSuggestions.packages.map((pkg) => (
                            <Link
                              key={pkg.id}
                              href={`/packages/${pkg.slug}`}
                              onClick={() => setSearchOpen(false)}
                              className="flex items-center justify-between p-2 hover:bg-teal-50 rounded-lg group text-xs transition-colors"
                            >
                              <div>
                                <div className="font-bold text-navy-900 group-hover:text-teal-700">
                                  {pkg.name}
                                </div>
                                <div className="text-[11px] text-teal-600 font-semibold">
                                  {pkg.tests?.length || 5}+ Tests Included
                                </div>
                              </div>
                              <div className="text-right font-extrabold text-navy-900">
                                {formatCurrency(pkg.sellingPrice)}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 mt-2 border-t border-borderSoft text-center">
                        <Link
                          href={`/tests?q=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setSearchOpen(false)}
                          className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          View all search results
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Actions: My Bookings, Account, Cart */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* My Bookings link */}
              <Link
                href="/account/bookings"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-navy-800 hover:text-brand-600 py-2 px-2.5 rounded-lg hover:bg-bgLight transition-colors"
              >
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>My Bookings</span>
              </Link>

              {/* Account Dropdown */}
              <div className="relative">
                {user ? (
                  <button
                    onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-navy-900 bg-bgLight hover:bg-slate-100 border border-borderSoft px-3 py-2 rounded-xl transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:inline max-w-[80px] truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3.5 py-2 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                )}

                {/* Account dropdown menu */}
                {accountDropdownOpen && user && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-dropdown border border-borderSoft p-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-borderSoft">
                      <div className="text-xs font-bold text-navy-900 truncate">{user.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="text-[10px] font-semibold text-brand-600 uppercase mt-0.5">
                        Role: {user.role.replace(/_/g, ' ')}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account/bookings"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-800 hover:bg-bgLight rounded-lg"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        My Bookings
                      </Link>
                      <Link
                        href="/account/reports"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-800 hover:bg-bgLight rounded-lg"
                      >
                        <FileText className="w-4 h-4 text-slate-400" />
                        Medical Reports
                      </Link>
                      <Link
                        href="/account/profile"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-navy-800 hover:bg-bgLight rounded-lg"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile & Addresses
                      </Link>

                      {user.role !== 'PATIENT' && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 rounded-lg"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-borderSoft pt-1">
                      <button
                        onClick={() => {
                          setAccountDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Shopping Cart Pill */}
              <Link
                href="/cart"
                className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white px-3.5 py-2 rounded-xl shadow-sm transition-all"
              >
                <div className="relative">
                  <ShoppingCart className="w-4 h-4" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-none">
                  <span className="text-[10px] text-white/80 font-medium">Cart</span>
                  <span className="text-xs font-bold">
                    {itemCount > 0 ? formatCurrency(subtotal) : 'Empty'}
                  </span>
                </div>
              </Link>

              {/* Mobile hamburger menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-navy-900 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          <div className="mt-2.5 md:hidden">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tests, packages..."
                className="w-full pl-9 pr-16 py-2 text-xs bg-bgLight border border-borderSoft rounded-lg focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-2.5 bg-brand-500 text-white rounded text-xs font-bold"
              >
                Go
              </button>
            </form>
          </div>
        </div>

        {/* Secondary Category / Navigation Links Bar */}
        <nav className="border-t border-borderSoft hidden md:block bg-bgLight/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-semibold text-navy-800">
            <div className="flex items-center gap-6 overflow-x-auto py-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      'py-1 whitespace-nowrap transition-colors relative',
                      isActive ? 'text-brand-600 font-bold' : 'hover:text-brand-600'
                    )}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-4 py-2 shrink-0">
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                ✓ Free Sample Collection on ₹499+
              </span>
            </div>
          </div>
        </nav>

        {/* Mobile slide-down drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-borderSoft bg-white p-4 space-y-4 animate-in slide-in-from-top duration-200">
            <div className="p-3 bg-bgLight rounded-xl border border-borderSoft flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500" />
                <span className="text-xs font-bold text-navy-900">City: {selectedCity}</span>
              </div>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="text-xs bg-white border border-borderSoft rounded p-1 font-semibold"
              >
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-bgLight rounded-lg"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/account/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-bgLight rounded-lg"
              >
                My Bookings
              </Link>
              <Link
                href="/account/reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-bgLight rounded-lg"
              >
                Medical Reports
              </Link>
            </div>

            <div className="pt-2 border-t border-borderSoft">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setPrescriptionModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold py-2.5 rounded-xl border border-teal-200 text-xs transition-colors"
              >
                <FileText className="w-4 h-4" />
                Upload Doctor's Prescription
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Prescription Upload Modal */}
      <PrescriptionModal
        isOpen={prescriptionModalOpen}
        onClose={() => setPrescriptionModalOpen(false)}
      />
    </>
  );
}
