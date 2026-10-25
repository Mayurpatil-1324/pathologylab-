'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/patients?search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Registered Patients
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Access authorized patient profiles, booking history, and contact coordinates.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-borderSoft shadow-sm flex items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient name, phone, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bgLight border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
          />
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading patients...</div>
        ) : patients.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No patients found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Default Address</th>
                  <th className="p-3">Bookings Count</th>
                  <th className="p-3">Registered Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {patients.map((p) => {
                  const defAddr = p.addresses?.[0];
                  return (
                    <tr key={p.id} className="hover:bg-bgLight transition-colors">
                      <td className="p-3 font-bold text-navy-900">{p.name}</td>
                      <td className="p-3 text-slate-700">
                        <div>{p.phone || '—'}</div>
                        <div className="text-[11px] text-slate-400">{p.email}</div>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs truncate">
                        {defAddr ? `${defAddr.area}, ${defAddr.city} (${defAddr.pincode})` : '—'}
                      </td>
                      <td className="p-3 font-bold text-brand-600">
                        {p.bookings?.length || 0} Bookings
                      </td>
                      <td className="p-3 text-slate-500">{formatDate(p.createdAt)}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
