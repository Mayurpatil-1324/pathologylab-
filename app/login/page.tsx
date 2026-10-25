'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Lock, ArrowRight, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid credentials');
      }

      await refreshUser();
      if (data.user.role !== 'PATIENT') {
        router.push('/admin');
      } else {
        router.push('/account/bookings');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
              Sign In to HealthPoint
            </h1>
            <p className="text-xs sm:text-sm text-slateText">
              Access your diagnostic test bookings, view test results, and download reports.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-navy-900 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-navy-900">
                    Password
                  </label>
                  <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center text-xs text-slateText pt-2 border-t border-borderSoft">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-brand-600 hover:underline">
                Create Patient Account
              </Link>
            </div>
          </div>

          {/* Quick Demo Credentials Panel */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
              <span>Quick Demo Role Fill (1-Click Login)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('patient@healthpoint.in', 'Patient@123')}
                className="p-2 bg-white hover:bg-brand-50 border border-borderSoft rounded-lg text-left"
              >
                <div className="font-bold text-navy-900">Patient Demo</div>
                <div className="text-[10px] text-slate-400">patient@healthpoint.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin@healthpoint.in', 'Admin@123')}
                className="p-2 bg-white hover:bg-brand-50 border border-borderSoft rounded-lg text-left"
              >
                <div className="font-bold text-brand-700">Super Admin</div>
                <div className="text-[10px] text-slate-400">superadmin@healthpoint.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('labmanager@healthpoint.in', 'Admin@123')}
                className="p-2 bg-white hover:bg-brand-50 border border-borderSoft rounded-lg text-left"
              >
                <div className="font-bold text-teal-700">Lab Manager</div>
                <div className="text-[10px] text-slate-400">labmanager@healthpoint.in</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reportmanager@healthpoint.in', 'Admin@123')}
                className="p-2 bg-white hover:bg-brand-50 border border-borderSoft rounded-lg text-left"
              >
                <div className="font-bold text-purple-700">Report Manager</div>
                <div className="text-[10px] text-slate-400">reportmanager@healthpoint.in</div>
              </button>
            </div>
          </div>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
