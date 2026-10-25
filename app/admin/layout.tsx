'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  Layers,
  FolderTree,
  FileText,
  Users,
  ShieldCheck,
  Tag,
  Globe,
  ClipboardList,
  LogOut,
  ChevronRight,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isStaffRole } from '@/lib/permissions';
import { cn } from '@/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isStaffRole(user.role))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500">
        Loading Admin Operations Desk...
      </div>
    );
  }

  if (!user || !isStaffRole(user.role)) {
    return null;
  }

  const menuItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Bookings Management', href: '/admin/bookings', icon: Calendar },
    { name: 'Diagnostic Tests', href: '/admin/tests', icon: Activity },
    { name: 'Health Packages', href: '/admin/packages', icon: Layers },
    { name: 'Test Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Medical Reports', href: '/admin/reports', icon: FileText },
    { name: 'Registered Patients', href: '/admin/patients', icon: Users },
    { name: 'Staff & Roles', href: '/admin/staff', icon: ShieldCheck },
    { name: 'Coupons & Promos', href: '/admin/coupons', icon: Tag },
    { name: 'Website Content CMS', href: '/admin/content', icon: Globe },
    { name: 'Audit Trail Logs', href: '/admin/audit-logs', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-navy-950 text-slate-300 border-r border-slate-800 shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-teal-400 flex items-center justify-center text-white shadow-sm font-black text-lg">
            H
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white leading-none">
              HealthPoint
            </div>
            <div className="text-[10px] font-bold tracking-widest text-teal-400 uppercase leading-tight">
              Admin Operations
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-bold text-white truncate">{user.name}</div>
            <div className="text-[10px] font-semibold text-teal-400 uppercase truncate">
              {user.role.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  isActive
                    ? 'bg-brand-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Public Website
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-borderSoft px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="text-xs font-semibold text-slate-400 hidden sm:block">
              Pathology Laboratory Management Suite • ISO 15189 Compliant
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-navy-900 hidden sm:inline">
                Live Operations Engine
              </span>
            </div>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>View Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Mobile Sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm md:hidden flex">
            <div className="w-64 bg-navy-950 text-slate-300 p-4 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-white text-sm">Navigation</span>
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="space-y-1 mt-3">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="block px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 rounded-lg"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <button
                onClick={() => logout()}
                className="w-full flex items-center gap-2 text-xs text-rose-400 py-2 font-bold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Child Pages Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
