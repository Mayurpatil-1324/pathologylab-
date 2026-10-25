'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, MapPin, Users, Heart, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { useAuth } from '@/lib/auth-context';

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [emergencyPhone, setEmergencyPhone] = useState('+91 98765 99999');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xs text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/account/bookings" className="text-xs font-bold text-slate-500 hover:text-navy-900 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Bookings
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Patient Profile & Address Book
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Manage your personal contact details, saved home addresses, and family members.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile Form (7 cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-borderSoft">
              <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">{user.name}</h3>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile details updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={user.phone || '+91 98765 12345'}
                    disabled
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl bg-slate-50 text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-navy-900 mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-borderSoft flex justify-end">
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-colors shadow-sm"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Saved Addresses & Family (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Saved Addresses */}
            <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-navy-900">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  <span>Saved Addresses</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-brand-200 bg-brand-50/40 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900">Home (Default)</span>
                  <span className="text-[10px] font-bold text-brand-700 bg-white px-1.5 py-0.5 rounded border border-brand-200">
                    Primary
                  </span>
                </div>
                <p className="text-slateText leading-relaxed">
                  Flat 402, Lotus Towers, Outer Ring Road, Bellandur, Bengaluru - 560103
                </p>
                <div className="text-[11px] text-slate-400">Landmark: Near EcoSpace Tech Park</div>
              </div>
            </div>

            {/* Family Members */}
            <div className="bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-navy-900">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>Family Members</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-borderSoft bg-bgLight flex items-center justify-between">
                  <div>
                    <strong className="text-navy-900 block font-bold">Ananya Sen</strong>
                    <span className="text-slate-400">Spouse • 38 Yrs • Female</span>
                  </div>
                  <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold border border-teal-200">
                    Spouse
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-borderSoft bg-bgLight flex items-center justify-between">
                  <div>
                    <strong className="text-navy-900 block font-bold">Subhash Sen</strong>
                    <span className="text-slate-400">Parent • 68 Yrs • Male</span>
                  </div>
                  <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded font-semibold border border-brand-200">
                    Parent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
