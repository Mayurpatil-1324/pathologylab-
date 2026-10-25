'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit, Trash2, CheckCircle2, Clock, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [availableTests, setAvailableTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [overview, setOverview] = useState('');
  const [mrp, setMrp] = useState('2999');
  const [price, setPrice] = useState('1499');
  const [fasting, setFasting] = useState(true);
  const [fastingHours, setFastingHours] = useState('12');
  const [turnaround, setTurnaround] = useState('24');
  const [isFeatured, setIsFeatured] = useState(true);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const [pkgRes, testRes] = await Promise.all([
        fetch('/api/admin/packages'),
        fetch('/api/admin/tests'),
      ]);
      const pkgData = await pkgRes.json();
      const testData = await testRes.json();
      setPackages(pkgData.packages || []);
      setAvailableTests(testData.tests || []);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const openCreateModal = () => {
    setEditingPkg(null);
    setName('');
    setDesc('');
    setOverview('');
    setMrp('2999');
    setPrice('1499');
    setFasting(true);
    setFastingHours('12');
    setTurnaround('24');
    setIsFeatured(true);
    setSelectedTestIds(availableTests.slice(0, 4).map((t) => t.id));
    setModalOpen(true);
  };

  const openEditModal = (pkg: any) => {
    setEditingPkg(pkg);
    setName(pkg.name);
    setDesc(pkg.shortDescription);
    setOverview(pkg.overview);
    setMrp(pkg.mrpPrice.toString());
    setPrice(pkg.sellingPrice.toString());
    setFasting(pkg.fastingRequired);
    setFastingHours(pkg.fastingHours.toString());
    setTurnaround(pkg.reportTurnaroundHours.toString());
    setIsFeatured(pkg.isFeatured);
    setSelectedTestIds(pkg.tests?.map((t: any) => t.test.id) || []);
    setModalOpen(true);
  };

  const handleToggleTest = (id: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        shortDescription: desc,
        overview: overview || desc,
        mrpPrice: Number(mrp),
        sellingPrice: Number(price),
        discountPercent: Math.max(0, Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100)),
        fastingRequired: fasting,
        fastingHours: Number(fastingHours),
        reportTurnaroundHours: Number(turnaround),
        isFeatured,
        testIds: selectedTestIds,
      };

      if (editingPkg) {
        const res = await fetch('/api/admin/packages', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPkg.id, ...payload }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPackages((prev) => prev.map((p) => (p.id === editingPkg.id ? data.package : p)));
          setModalOpen(false);
        } else {
          alert(data.message || 'Failed to update package');
        }
      } else {
        const res = await fetch('/api/admin/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setPackages((prev) => [data.package, ...prev]);
          setModalOpen(false);
        } else {
          alert(data.message || 'Failed to create package');
        }
      }
    } catch {
      alert('Error saving package');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    if (!confirm('Toggle active state of this package?')) return;
    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setPackages((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: data.isActive } : p))
        );
      }
    } catch {
      alert('Error toggling package');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Health Packages Management
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Bundle individual diagnostic tests into comprehensive wellness packages.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create New Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Loading health packages...
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-3xl border border-borderSoft p-6 shadow-sm flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {pkg.tests?.length || 0} Included Tests
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      pkg.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {pkg.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-900 mb-1">{pkg.name}</h3>
                <p className="text-xs text-slateText line-clamp-2 mb-4">{pkg.shortDescription}</p>

                <div className="space-y-1 mb-4 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.tests?.map((t: any) => (
                      <span
                        key={t.test.id}
                        className="text-[10px] bg-bgLight text-navy-800 px-1.5 py-0.5 rounded border border-borderSoft"
                      >
                        {t.test.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-borderSoft flex items-center justify-between">
                <div>
                  <div className="text-lg font-black text-navy-900">
                    {formatCurrency(pkg.sellingPrice)}
                  </div>
                  <div className="text-[10px] text-slate-400 line-through">
                    {formatCurrency(pkg.mrpPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(pkg)}
                    className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-borderSoft shadow-dropdown max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <h3 className="text-base font-bold text-navy-900">
                {editingPkg ? 'Edit Health Package' : 'Create New Health Package'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-navy-900 mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Comprehensive Full Body Checkup"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Short Description</label>
                <input
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Brief highlight of package benefits"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              {/* Select Included Tests */}
              <div>
                <label className="block font-bold text-navy-900 mb-1">
                  Select Included Tests ({selectedTestIds.length} Selected)
                </label>
                <div className="max-h-40 overflow-y-auto border border-borderSoft rounded-xl p-2 space-y-1 bg-bgLight">
                  {availableTests.map((t) => (
                    <label
                      key={t.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTestIds.includes(t.id)}
                        onChange={() => handleToggleTest(t.id)}
                        className="accent-brand-500"
                      />
                      <span className="font-semibold text-navy-900">{t.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({t.testCode})</span>
                    </label>
                  ))}
                </div>
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
                  {saving ? 'Saving...' : editingPkg ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
