'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Mail,
  Home,
  Building2,
  Calendar,
  Clock,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { MainHeader } from '@/components/header/main-header';
import { MainFooter } from '@/components/footer/main-footer';
import { useCart } from '@/lib/cart-context';
import { useLocation } from '@/lib/location-context';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, subtotal, coupon, collectionFee, finalTotal } = useCart();
  const { selectedCity, selectedLocation, locations } = useLocation();
  const { user } = useAuth();

  // Multi-step state: 1: Patient Details, 2: Collection & Address, 3: Slot Scheduling, 4: Payment, 5: Confirmation
  const [currentStep, setCurrentStep] = useState(1);

  // Patient Details
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientAge, setPatientAge] = useState('35');
  const [patientGender, setPatientGender] = useState('Male');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientNotes, setPatientNotes] = useState('');

  // Collection Method
  const [collectionType, setCollectionType] = useState<'HOME_COLLECTION' | 'CENTER_VISIT'>('HOME_COLLECTION');

  // Address (for Home Collection)
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState(selectedCity);
  const [pincode, setPincode] = useState('560103');
  const [landmark, setLandmark] = useState('');

  // Location & Scheduling
  const [chosenLocationId, setChosenLocationId] = useState(selectedLocation?.id || '');
  const [scheduledDate, setScheduledDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [slotTime, setSlotTime] = useState('07:30 AM - 08:30 AM');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'CASH_ON_COLLECTION' | 'PAY_AT_LAB'>('ONLINE');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Confirmation result
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Sync chosen location ID when locations load
  useEffect(() => {
    if (!chosenLocationId && locations.length > 0) {
      const match = locations.find((l) => l.city === selectedCity) || locations[0];
      setChosenLocationId(match.id);
    }
  }, [locations, selectedCity, chosenLocationId]);

  // Sync user details if logged in
  useEffect(() => {
    if (user) {
      if (!patientName) setPatientName(user.name);
      if (!patientEmail) setPatientEmail(user.email);
      if (!patientPhone && user.phone) setPatientPhone(user.phone);
    }
  }, [user]);

  // Fetch available slots whenever location or date changes
  useEffect(() => {
    if (!chosenLocationId) return;

    async function loadSlots() {
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/slots?locationId=${chosenLocationId}&date=${scheduledDate}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableSlots(data.slots || []);
          if (data.slots && data.slots.length > 0) {
            const firstAvailable = data.slots.find((s: any) => s.isAvailable) || data.slots[0];
            setSlotTime(`${firstAvailable.startTime} - ${firstAvailable.endTime}`);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingSlots(false);
      }
    }

    loadSlots();
  }, [chosenLocationId, scheduledDate]);

  // If cart is empty and no confirmation yet, redirect to cart
  useEffect(() => {
    if (items.length === 0 && !confirmedBooking) {
      router.push('/cart');
    }
  }, [items, confirmedBooking, router]);

  // Step 1 validation
  const validateStep1 = () => {
    if (!patientName.trim()) {
      setErrorMsg('Please enter the patient full name.');
      return false;
    }
    if (!patientPhone.trim() || patientPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!patientAge || Number(patientAge) <= 0 || Number(patientAge) > 120) {
      setErrorMsg('Please enter a valid patient age.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Step 2 validation
  const validateStep2 = () => {
    if (collectionType === 'HOME_COLLECTION') {
      if (!houseNumber.trim() || !pincode.trim() || pincode.length < 6) {
        setErrorMsg('Please enter house/flat number and a valid 6-digit PIN code.');
        return false;
      }
    }
    setErrorMsg('');
    return true;
  };

  // Step 3 validation
  const validateStep3 = () => {
    if (!chosenLocationId) {
      setErrorMsg('Please select a diagnostic center location.');
      return false;
    }
    if (!scheduledDate || !slotTime) {
      setErrorMsg('Please select an appointment date and collection time slot.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  // Handle final booking submission
  const handleConfirmBooking = async () => {
    setErrorMsg('');
    setSubmittingBooking(true);

    try {
      const payload = {
        items,
        patientDetails: {
          name: patientName.trim(),
          age: Number(patientAge),
          gender: patientGender,
          phone: patientPhone.trim(),
          email: patientEmail.trim() || undefined,
          notes: patientNotes.trim() || undefined,
        },
        collectionType,
        scheduledDate,
        slotTime,
        serviceLocationId: chosenLocationId,
        address:
          collectionType === 'HOME_COLLECTION'
            ? {
                houseNumber,
                street,
                area,
                city,
                pincode,
                landmark,
              }
            : undefined,
        couponCode: coupon?.code,
        paymentMethod,
      };

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to confirm booking');
      }

      setConfirmedBooking(data.booking);
      clearCart();
      setCurrentStep(5); // Go to confirmation step
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while creating booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-bgLight/40">
      <MainHeader />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Stepper */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Patient Info' },
                { step: 2, label: 'Collection & Address' },
                { step: 3, label: 'Schedule Slot' },
                { step: 4, label: 'Payment' },
              ].map((s, idx) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors',
                      currentStep === s.step
                        ? 'bg-brand-500 text-white shadow-md'
                        : currentStep > s.step
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white border border-borderSoft text-slate-400'
                    )}
                  >
                    {currentStep > s.step ? '✓' : s.step}
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold hidden sm:inline',
                      currentStep >= s.step ? 'text-navy-900' : 'text-slate-400'
                    )}
                  >
                    {s.label}
                  </span>
                  {idx < 3 && <div className="w-8 sm:w-12 h-px bg-borderSoft mx-1" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: BOOKING CONFIRMATION SCREEN */}
        {currentStep === 5 && confirmedBooking ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-borderSoft p-6 sm:p-10 shadow-dropdown space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 uppercase">
                Booking Confirmed
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight mt-2">
                Thank You, {confirmedBooking.patientName}!
              </h2>
              <p className="text-xs sm:text-sm text-slateText mt-1">
                Your diagnostic booking has been successfully scheduled. A confirmation SMS and WhatsApp message have been dispatched.
              </p>
            </div>

            {/* Reference Badge */}
            <div className="bg-bgLight p-4 rounded-2xl border border-borderSoft text-left space-y-3 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-borderSoft">
                <span className="text-slate-500">Booking Reference</span>
                <span className="font-mono font-black text-base text-brand-600">
                  {confirmedBooking.bookingRef}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Appointment Date</span>
                  <strong className="text-navy-900">{formatDate(confirmedBooking.scheduledDate)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Time Slot</span>
                  <strong className="text-navy-900">{confirmedBooking.slotTime}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Collection Mode</span>
                  <strong className="text-navy-900">
                    {confirmedBooking.collectionType === 'HOME_COLLECTION' ? 'Doorstep Home Collection' : 'Lab Center Visit'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Status</span>
                  <strong className={confirmedBooking.paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}>
                    {confirmedBooking.paymentStatus} ({formatCurrency(confirmedBooking.finalAmount)})
                  </strong>
                </div>
              </div>

              {confirmedBooking.addressString && (
                <div className="pt-2 border-t border-borderSoft">
                  <span className="text-slate-400 block text-[11px]">Collection Address</span>
                  <span className="text-navy-900">{confirmedBooking.addressString}</span>
                </div>
              )}
            </div>

            {/* Next Steps Card */}
            <div className="p-4 bg-brand-50/60 rounded-2xl border border-brand-100 text-left text-xs space-y-2">
              <div className="font-bold text-navy-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-brand-600" />
                What Happens Next?
              </div>
              <ul className="list-disc pl-5 text-slateText space-y-1">
                <li>Our certified phlebotomist will call {confirmedBooking.patientPhone} 30 minutes before arrival.</li>
                <li>Please observe any overnight fasting instructions if your tests require it.</li>
                <li>Once samples are analyzed, doctor-verified digital reports will be available in your portal.</li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account/bookings"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors shadow-sm"
              >
                View in My Bookings
              </Link>
              <Link
                href="/"
                className="bg-slate-100 hover:bg-slate-200 text-navy-800 font-bold py-3 px-6 rounded-xl text-xs transition-colors"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Steps Form (8 cols) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderSoft shadow-sm space-y-6">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* STEP 1: PATIENT DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">
                      Step 1: Patient Information
                    </h2>
                    <p className="text-xs text-slateText mt-0.5">
                      Enter the details of the person whose samples will be collected.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Patient Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Ramesh Patel"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder="e.g. 35"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Biological Gender *
                      </label>
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Mobile Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Email Address (for Digital Reports)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-navy-900 mb-1">
                        Special Instructions / Medical Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={patientNotes}
                        onChange={(e) => setPatientNotes(e.target.value)}
                        placeholder="Fasting status, hard to find vein, elderly patient, etc."
                        className="w-full p-2.5 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-borderSoft flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep1()) setCurrentStep(2);
                      }}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Proceed to Collection Method</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: COLLECTION & ADDRESS */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">
                      Step 2: Collection Mode & Address
                    </h2>
                    <p className="text-xs text-slateText mt-0.5">
                      Choose whether you prefer home collection or visiting our diagnostic center.
                    </p>
                  </div>

                  {/* Mode options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCollectionType('HOME_COLLECTION')}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all',
                        collectionType === 'HOME_COLLECTION'
                          ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm'
                          : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
                      )}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        <Home className="w-4 h-4 text-brand-600" />
                        <span>Home Sample Collection</span>
                      </div>
                      <p className="text-xs text-slateText leading-relaxed">
                        Trained phlebotomist arrives at your home with single-use needles and cold storage kits.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCollectionType('CENTER_VISIT')}
                      className={cn(
                        'p-4 rounded-2xl border text-left transition-all',
                        collectionType === 'CENTER_VISIT'
                          ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm'
                          : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
                      )}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm mb-1">
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <span>Visit Diagnostic Center</span>
                      </div>
                      <p className="text-xs text-slateText leading-relaxed">
                        Walk in to our main diagnostic laboratory facility for sample collection.
                      </p>
                    </button>
                  </div>

                  {/* Address fields (if Home Collection) */}
                  {collectionType === 'HOME_COLLECTION' ? (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-navy-900">
                        Doorstep Address Details
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            Flat / House No. / Building *
                          </label>
                          <input
                            type="text"
                            required
                            value={houseNumber}
                            onChange={(e) => setHouseNumber(e.target.value)}
                            placeholder="e.g. Flat 402, Lotus Towers"
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            Street / Road
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="e.g. Outer Ring Road"
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            Area / Locality
                          </label>
                          <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g. Bellandur"
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl bg-slate-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            PIN Code *
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            required
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit PIN code"
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-navy-900 mb-1">
                            Landmark (Optional)
                          </label>
                          <input
                            type="text"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="Near EcoSpace Tech Park, opposite bank"
                            className="w-full px-3 py-2 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900">
                      <strong>Center Visit Selected:</strong> You will visit our diagnostic center during the scheduled time slot. Free on-site parking and priority sample processing desk available.
                    </div>
                  )}

                  <div className="pt-4 border-t border-borderSoft flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) setCurrentStep(3);
                      }}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Proceed to Schedule Slot</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: SCHEDULE SLOT */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">
                      Step 3: Select Date & Available Time Slot
                    </h2>
                    <p className="text-xs text-slateText mt-0.5">
                      Pick your diagnostic center and preferred morning or afternoon collection slot.
                    </p>
                  </div>

                  {/* Diagnostic Center selector */}
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">
                      Assigned Processing Diagnostic Center
                    </label>
                    <select
                      value={chosenLocationId}
                      onChange={(e) => setChosenLocationId(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500 font-semibold text-navy-900"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name} — {loc.address}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Appointment Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-1">
                      Collection Date
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm border border-borderSoft rounded-xl focus:outline-none focus:border-brand-500 font-semibold"
                    />
                  </div>

                  {/* Time Slots Grid with live capacity */}
                  <div>
                    <label className="block text-xs font-bold text-navy-900 mb-2">
                      Available Time Slots for {formatDate(scheduledDate)}
                    </label>

                    {loadingSlots ? (
                      <div className="text-xs text-slate-400 py-6 text-center">
                        Checking slot availability...
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {availableSlots.map((slot) => {
                          const slotString = `${slot.startTime} - ${slot.endTime}`;
                          const isSelected = slotTime === slotString;
                          const disabled = !slot.isAvailable;

                          return (
                            <button
                              key={slot.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSlotTime(slotString)}
                              className={cn(
                                'p-3 rounded-xl border text-left transition-all text-xs',
                                disabled
                                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                                  : isSelected
                                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm font-bold'
                                  : 'bg-white hover:bg-slate-50 text-navy-900 border-borderSoft'
                              )}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-semibold">{slotString}</span>
                                {slot.isFastingSlot && (
                                  <span
                                    className={cn(
                                      'text-[9px] px-1.5 py-0.2 rounded font-bold uppercase',
                                      isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                                    )}
                                  >
                                    Fasting
                                  </span>
                                )}
                              </div>
                              <div
                                className={cn(
                                  'text-[10px]',
                                  isSelected ? 'text-white/80' : disabled ? 'text-rose-500 font-bold' : 'text-slate-400'
                                )}
                              >
                                {disabled ? 'Fully Booked' : `${slot.availableCapacity} slots left`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-borderSoft flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep3()) setCurrentStep(4);
                      }}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs sm:text-sm py-3 px-6 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT SELECTION */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">
                      Step 4: Select Payment Method
                    </h2>
                    <p className="text-xs text-slateText mt-0.5">
                      Choose online payment (Razorpay test gateway) or pay upon sample collection.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('ONLINE')}
                      className={cn(
                        'w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all',
                        paymentMethod === 'ONLINE'
                          ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm'
                          : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
                      )}
                    >
                      <CreditCard className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-navy-900">
                          Online Payment (UPI, Cards, Net Banking)
                        </div>
                        <p className="text-xs text-slateText mt-0.5 leading-relaxed">
                          Secure instant payment via Razorpay test gateway. Instant booking confirmation.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod(collectionType === 'HOME_COLLECTION' ? 'CASH_ON_COLLECTION' : 'PAY_AT_LAB')}
                      className={cn(
                        'w-full p-4 rounded-2xl border text-left flex items-start gap-3 transition-all',
                        paymentMethod !== 'ONLINE'
                          ? 'border-brand-500 bg-brand-50/70 text-navy-900 shadow-sm'
                          : 'border-borderSoft bg-white hover:bg-slate-50 text-slate-600'
                      )}
                    >
                      <Banknote className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm text-navy-900">
                          {collectionType === 'HOME_COLLECTION' ? 'Pay Cash / UPI on Collection' : 'Pay at Lab Reception Desk'}
                        </div>
                        <p className="text-xs text-slateText mt-0.5 leading-relaxed">
                          Pay directly to our phlebotomist upon sample collection via Cash or mobile QR scan.
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 bg-bgLight rounded-2xl border border-borderSoft text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between font-bold text-navy-900 text-sm pb-1 border-b border-borderSoft">
                      <span>Total Amount to Pay:</span>
                      <span className="text-brand-600 font-black">{formatCurrency(finalTotal)}</span>
                    </div>
                    <div>Patient: {patientName} ({patientAge} Y, {patientGender})</div>
                    <div>Appointment: {formatDate(scheduledDate)} at {slotTime}</div>
                  </div>

                  <div className="pt-4 border-t border-borderSoft flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-navy-900 flex items-center gap-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={submittingBooking}
                      onClick={handleConfirmBooking}
                      className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-md"
                    >
                      <span>{submittingBooking ? 'Securing Booking...' : `Confirm & Book (${formatCurrency(finalTotal)})`}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Booking Summary Sidebar (4 cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-borderSoft shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy-900 pb-2 border-b border-borderSoft">
                Order Summary ({items.length} items)
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold text-navy-900 line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.itemType}</div>
                    </div>
                    <span className="font-bold text-navy-900 shrink-0">
                      {formatCurrency(item.price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-borderSoft space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Coupon ({coupon.code})</span>
                    <span>-{formatCurrency(coupon.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Collection Charge</span>
                  <span>{collectionFee === 0 ? 'FREE' : formatCurrency(collectionFee)}</span>
                </div>
                <div className="pt-2 border-t border-borderSoft flex justify-between font-black text-sm text-navy-900">
                  <span>Grand Total</span>
                  <span className="text-brand-600 text-base">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>NABL Quality Accredited Testing</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <MainFooter />
    </div>
  );
}
