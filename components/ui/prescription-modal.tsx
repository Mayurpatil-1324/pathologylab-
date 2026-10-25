'use client';

import React, { useState } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, FileText, Phone, User } from 'lucide-react';
import { useLocation } from '@/lib/location-context';

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrescriptionModal({ isOpen, onClose }: PrescriptionModalProps) {
  const { selectedCity } = useLocation();
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<{ message: string; ref: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !phone.trim()) {
      setErrorMsg('Please enter your name and contact phone number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/prescriptions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          phone,
          city: selectedCity,
          notes,
          fileName: selectedFileName || 'prescription_document.pdf',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit prescription');
      }

      setSuccessResult({
        ref: data.prescriptionRef,
        message: data.message,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-dropdown border border-borderSoft overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-teal-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            <h3 className="text-lg font-bold">Upload Doctor's Prescription</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-navy-900">Prescription Received!</h4>
              <p className="text-sm text-slateText leading-relaxed">
                {successResult.message}
              </p>
              <div className="bg-bgLight p-3 rounded-lg border border-borderSoft text-xs font-mono text-brand-700">
                Tracking ID: <strong>{successResult.ref}</strong>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-lg transition-colors mt-2"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slateText leading-relaxed">
                Can't find your prescribed test? Upload your prescription photo or document. Our clinical team will identify the tests and schedule home sample collection for you.
              </p>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Upload Box */}
              <div className="border-2 border-dashed border-borderSoft hover:border-brand-400 bg-bgLight/50 p-6 rounded-xl text-center cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-10 h-10 text-brand-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-navy-900">
                  {selectedFileName ? selectedFileName : 'Drag & Drop prescription here or Browse'}
                </p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF up to 10MB</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Patient Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy-800 mb-1">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 text-sm border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-800 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Doctor instructions, preferred morning time, etc."
                  className="w-full p-2.5 text-sm border border-borderSoft rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-navy-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 rounded-lg shadow-sm transition-colors"
                >
                  {loading ? 'Uploading...' : 'Submit Prescription'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
