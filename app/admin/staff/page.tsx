'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, X, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('PHLEBOTOMIST');
  const [password, setPassword] = useState('Staff@123');
  const [saving, setSaving] = useState(false);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data.staff || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, role, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaffList((prev) => [...prev, data.staff]);
        setModalOpen(false);
      } else {
        alert(data.message || 'Failed to add staff member');
      }
    } catch {
      alert('Error saving staff');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Staff & Role Permissions
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Manage laboratory roles: Super Admin, Lab Manager, Phlebotomist, Report Manager, Receptionist.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading staff...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Email & Phone</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Created Date</th>
                  <th className="p-3">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {staffList.map((s) => (
                  <tr key={s.id} className="hover:bg-bgLight transition-colors">
                    <td className="p-3 font-bold text-navy-900">{s.name}</td>
                    <td className="p-3 text-slate-700">
                      <div>{s.email}</div>
                      <div className="text-[11px] text-slate-400">{s.phone}</div>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-xs text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 uppercase">
                        {s.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{formatDate(s.createdAt)}</td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-borderSoft shadow-dropdown">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <h3 className="text-base font-bold text-navy-900">Add Laboratory Staff Member</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Staff Member Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Priya Nair"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Staff Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@healthpoint.in"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98111 22233"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Role & Permission Tier *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-borderSoft rounded-lg font-semibold text-navy-900 focus:outline-none"
                >
                  <option value="ADMIN">ADMIN (Operations & Commercials)</option>
                  <option value="LAB_MANAGER">LAB MANAGER (Lab & Specimen Operations)</option>
                  <option value="PHLEBOTOMIST">PHLEBOTOMIST (Sample Collection Tasks)</option>
                  <option value="REPORT_MANAGER">REPORT MANAGER (Pathologist / Report Verification)</option>
                  <option value="RECEPTIONIST">RECEPTIONIST (Walk-in Bookings & Front Desk)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-borderSoft rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-borderSoft">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm transition-colors"
                >
                  {saving ? 'Creating...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
