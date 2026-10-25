'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Droplet,
  Clock,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function AdminTestsPage() {
  const [tests, setTests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSample, setFormSample] = useState('Blood (Serum)');
  const [formFasting, setFormFasting] = useState(false);
  const [formFastingHours, setFormFastingHours] = useState('0');
  const [formTurnaround, setFormTurnaround] = useState('24');
  const [formMrp, setFormMrp] = useState('500');
  const [formPrice, setFormPrice] = useState('350');
  const [formPopular, setFormPopular] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tests');
      if (res.ok) {
        const data = await res.json();
        setTests(data.tests || []);
      }
      const catRes = await fetch('/api/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setFormCode(`HPD-TST-${Math.floor(10 + Math.random() * 90)}`);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormDesc('');
    setFormSample('Blood (Serum)');
    setFormFasting(false);
    setFormFastingHours('0');
    setFormTurnaround('24');
    setFormMrp('500');
    setFormPrice('350');
    setFormPopular(false);
    setModalOpen(true);
  };

  const openEditModal = (t: any) => {
    setEditingTest(t);
    setFormCode(t.testCode);
    setFormName(t.name);
    setFormCategory(t.categoryId);
    setFormDesc(t.shortDescription);
    setFormSample(t.sampleType);
    setFormFasting(t.fastingRequired);
    setFormFastingHours(t.fastingHours.toString());
    setFormTurnaround(t.reportTurnaroundHours.toString());
    setFormMrp(t.mrpPrice.toString());
    setFormPrice(t.sellingPrice.toString());
    setFormPopular(t.isPopular);
    setModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        testCode: formCode,
        name: formName,
        categoryId: formCategory,
        shortDescription: formDesc,
        sampleType: formSample,
        fastingRequired: formFasting,
        fastingHours: Number(formFastingHours),
        reportTurnaroundHours: Number(formTurnaround),
        mrpPrice: Number(formMrp),
        sellingPrice: Number(formPrice),
        discountPercent: Math.max(0, Math.round(((Number(formMrp) - Number(formPrice)) / Number(formMrp)) * 100)),
        isPopular: formPopular,
      };

      if (editingTest) {
        const res = await fetch('/api/admin/tests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingTest.id, ...payload }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTests((prev) => prev.map((t) => (t.id === editingTest.id ? data.test : t)));
          setModalOpen(false);
        } else {
          alert(data.message || 'Failed to update test');
        }
      } else {
        const res = await fetch('/api/admin/tests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTests((prev) => [data.test, ...prev]);
          setModalOpen(false);
        } else {
          alert(data.message || 'Failed to create test');
        }
      }
    } catch {
      alert('Error saving test');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to toggle the active/archive state of this test?')) return;
    try {
      const res = await fetch(`/api/admin/tests?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setTests((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isActive: data.isActive } : t))
        );
      }
    } catch {
      alert('Error toggling test archive');
    }
  };

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.testCode.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'ALL' || t.categoryId === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
            Diagnostic Tests Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slateText mt-1">
            Manage test parameters, specimen types, preparation guidance, and selling prices.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add New Test
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderSoft shadow-sm flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test name or code..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-bgLight border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
          />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="px-3 py-1.5 text-xs bg-bgLight border border-borderSoft rounded-xl font-semibold text-navy-900 focus:outline-none"
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl border border-borderSoft shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-slate-400">Loading catalog...</div>
        ) : filteredTests.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">No tests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-borderSoft">
                <tr>
                  <th className="p-3">Code</th>
                  <th className="p-3">Test Name & Category</th>
                  <th className="p-3">Specimen & Fasting</th>
                  <th className="p-3">Turnaround</th>
                  <th className="p-3">Selling Price (MRP)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borderSoft">
                {filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-bgLight transition-colors">
                    <td className="p-3 font-mono font-bold text-brand-600">{t.testCode}</td>
                    <td className="p-3">
                      <strong className="text-navy-900 font-bold block">{t.name}</strong>
                      <span className="text-[11px] text-teal-600 font-medium">
                        {t.category?.name}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">
                      <div>{t.sampleType}</div>
                      <div className="text-[10px] text-slate-400">
                        {t.fastingRequired ? `${t.fastingHours}h Fasting` : 'No fasting'}
                      </div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{t.reportTurnaroundHours}h</td>
                    <td className="p-3 font-bold text-navy-900">
                      {formatCurrency(t.sellingPrice)}
                      <span className="text-[10px] text-slate-400 line-through ml-1.5 font-normal">
                        {formatCurrency(t.mrpPrice)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {t.isActive ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(t)}
                          className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg"
                          title="Edit Test"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Archive / Toggle Active"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-borderSoft shadow-dropdown max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
              <h3 className="text-base font-bold text-navy-900">
                {editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-navy-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy-900 mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Lipid Profile Comprehensive"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-navy-900 mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Brief summary of test parameters and purpose"
                  className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">Sample Specimen Type</label>
                  <input
                    type="text"
                    value={formSample}
                    onChange={(e) => setFormSample(e.target.value)}
                    placeholder="e.g. Blood (Serum)"
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy-900 mb-1">Turnaround Time (Hours)</label>
                  <input
                    type="number"
                    value={formTurnaround}
                    onChange={(e) => setFormTurnaround(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-navy-900 mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    value={formMrp}
                    onChange={(e) => setFormMrp(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-navy-900 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full p-2 border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formFasting}
                    onChange={(e) => setFormFasting(e.target.checked)}
                    className="accent-brand-500"
                  />
                  <span className="font-semibold text-navy-900">Overnight Fasting Required</span>
                </label>

                {formFasting && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Hours:</span>
                    <input
                      type="number"
                      value={formFastingHours}
                      onChange={(e) => setFormFastingHours(e.target.value)}
                      className="w-16 p-1 border border-borderSoft rounded text-center"
                    />
                  </div>
                )}
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
                  {saving ? 'Saving...' : editingTest ? 'Update Test' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
