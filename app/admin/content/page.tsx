'use client';

import React, { useState, useEffect } from 'react';
import { Globe, Save, CheckCircle2 } from 'lucide-react';

export default function AdminContentPage() {
  const [heroTitle, setHeroTitle] = useState('Your Health, Our Priority');
  const [heroSubtitle, setHeroSubtitle] = useState('Book diagnostic tests and preventive health checkups with convenient sample collection and secure online reports.');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('care@healthpointdiagnostics.in');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/content');
        if (res.ok) {
          const data = await res.json();
          const hero = data.contents?.find((c: any) => c.sectionKey === 'HERO_BANNER');
          if (hero) {
            setHeroTitle(hero.title);
            if (hero.subtitle) setHeroSubtitle(hero.subtitle);
          }
        }
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionKey: 'HERO_BANNER',
          title: heroTitle,
          subtitle: heroSubtitle,
          contentJson: JSON.stringify({ phone, email }),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Error updating content');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
          Website Content & CMS
        </h1>
        <p className="text-xs sm:text-sm text-slateText mt-1">
          Customize homepage headline, marketing copy, and lab contact details without editing source code.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Website content updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
            Homepage Hero Section
          </h3>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Hero Main Heading</label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="w-full p-2.5 border border-borderSoft rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block font-bold text-navy-900 mb-1">Hero Subtitle & Supporting Text</label>
            <textarea
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="w-full p-2.5 border border-borderSoft rounded-xl text-xs sm:text-sm focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-borderSoft">
          <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
            Contact & Support Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-navy-900 mb-1">Customer Helpline Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 border border-borderSoft rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-navy-900 mb-1">Support Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 border border-borderSoft rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish CMS Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
