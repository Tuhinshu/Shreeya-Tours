'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SITE_CONFIG } from '@/config/site';

interface BookingFormProps {
  packageId?: string;
  packageName?: string;
  basePrice?: number;
  onSuccess?: () => void;
}

interface QuoteDetails {
  baseAmount: number;
  gstAmount: number;
  gstRate: number;
  totalAmount: number;
}

export default function BookingForm({
  packageId = 'andaman-pb-3n',
  packageName = 'Scenic Andaman Express (Port Blair)',
  basePrice = 11150,
  onSuccess,
}: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    pax: 2,
    specialRequests: '',
  });

  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Calculate 2-month (60-day) calendar bounds starting from tomorrow
  const { minDate, maxDate } = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const min = tomorrow.toISOString().split('T')[0];

    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 60);
    const max = maxDateObj.toISOString().split('T')[0];

    return { minDate: min, maxDate: max };
  }, []);

  // Fetch or calculate authoritative server-side quote
  useEffect(() => {
    let isCancelled = false;
    const backendUrl = SITE_CONFIG.apiUrl || 'http://localhost:5000';

    async function fetchQuote() {
      try {
        const res = await fetch(`${backendUrl}/api/bookings/quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ packageId, pax: formData.pax, state: 'Gujarat' }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.quote) {
            setQuote({
              baseAmount: data.quote.baseAmount,
              gstAmount: data.quote.gstAmount,
              gstRate: data.quote.gstRate,
              totalAmount: data.quote.totalAmount,
            });
            return;
          }
        }
      } catch {
        // Fallback to exact server GST formula (5% for standard tour)
      }

      // Parity fallback
      if (!isCancelled) {
        const base = basePrice * formData.pax;
        const gst = Math.round(base * 0.05);
        setQuote({
          baseAmount: base,
          gstAmount: gst,
          gstRate: 5,
          totalAmount: base + gst,
        });
      }
    }

    fetchQuote();
    return () => { isCancelled = true; };
  }, [packageId, formData.pax, basePrice]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaxChange = (increment: boolean) => {
    setFormData((prev) => ({
      ...prev,
      pax: increment ? Math.min(20, prev.pax + 1) : Math.max(1, prev.pax - 1),
    }));
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      alert('Please enter a valid 10-15 digit phone or WhatsApp number.');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.travelDate < minDate || formData.travelDate > maxDate) {
      alert('Please select a travel date between tomorrow and the next 60 days.');
      setLoading(false);
      return;
    }

    const payload = {
      packageId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      travelDate: formData.travelDate,
      pax: formData.pax,
      specialRequests: formData.specialRequests.trim() || undefined,
      state: 'Gujarat',
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmittedBookingId(data.bookingId || '');
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error submitting enquiry. Please try again.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    const totalDisplay = quote ? quote.totalAmount.toLocaleString('en-IN') : (basePrice * formData.pax).toLocaleString('en-IN');
    const whatsappMessage = `Hi Shreeya Tours! I have submitted a booking enquiry (Ref: ${submittedBookingId}) for *${packageName}* (${formData.pax} PAX) on ${formData.travelDate}.\n\nLead Name: ${formData.name}\nContact: ${formData.phone}\nEstimated Total (inc. 5% GST): ₹${totalDisplay}${formData.specialRequests ? `\nSpecial Requests: ${formData.specialRequests}` : ''}`;

    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-auto border border-gray-100 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h3>
        <p className="text-gray-600 mb-2 text-sm leading-relaxed">
          Thank you, <span className="font-semibold">{formData.name}</span>. Your enquiry for <span className="font-semibold">{packageName}</span> ({formData.pax} PAX) is registered with ID <span className="font-mono font-bold text-primary">{submittedBookingId}</span>.
        </p>
        <p className="text-gray-500 mb-6 text-xs">
          Our tour specialists will contact you shortly on <span className="font-semibold">{formData.phone}</span>.
        </p>

        {/* Instant WhatsApp Handoff Button */}
        <a
          href={SITE_CONFIG.getWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center space-x-2 border border-primary/10 mb-3"
        >
          <span>Chat on WhatsApp with Enquiry ➔</span>
        </a>

        <button
          onClick={() => { setSubmitted(false); setStep(1); }}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
        >
          Book Another Tour
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg mx-auto overflow-hidden">
      {/* Header and Step Indicators */}
      <div className="bg-primary text-white p-6">
        <h3 className="text-xl font-extrabold uppercase tracking-tight">Book Your Adventure</h3>
        <p className="text-xs text-red-100 mt-1">Fill out the form below to receive an official quote</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mt-6 text-xs text-red-100 max-w-xs mx-auto">
          <div className="flex items-center flex-col relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${step >= 1 ? 'bg-white text-primary shadow' : 'bg-primary-dark/80'}`}>1</div>
            <p className={`${step >= 1 ? 'text-white font-semibold' : 'text-red-200'}`}>Contact</p>
          </div>
          <div className="flex-1 h-0.5 bg-primary-dark/80 mx-2 mb-4">
            <div className={`h-full bg-white transition-all duration-300`} style={{ width: step > 1 ? '100%' : '0%' }}></div>
          </div>
          <div className="flex items-center flex-col relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold mb-1 ${step >= 2 ? 'bg-white text-primary shadow' : 'bg-primary-dark/80'}`}>2</div>
            <p className={`${step >= 2 ? 'text-white font-semibold' : 'text-red-200'}`}>Details</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <form onSubmit={nextStep} className="space-y-4">
            <h4 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">Step 1: Contact Details</h4>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={100}
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Rohan Sharma"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                maxLength={254}
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rohan@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">WhatsApp / Phone</label>
              <input
                type="tel"
                name="phone"
                required
                pattern="[0-9+\s\-]{10,15}"
                title="Please enter a valid 10 to 15 digit phone or WhatsApp number"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition mt-2 cursor-pointer shadow-md"
            >
              Continue to Details →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitForm} className="space-y-4">
            <h4 className="text-base font-bold text-gray-900 mb-2 uppercase tracking-wide">Step 2: Dates & Travelers</h4>

            {/* Travel Date restricted to 2 months (60 days) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Preferred Travel Date
                </label>
                <span className="text-[10px] text-primary font-bold">Within next 60 days</span>
              </div>
              <input
                type="date"
                name="travelDate"
                required
                min={minDate}
                max={maxDate}
                value={formData.travelDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              />
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                Bookings are accepted up to 2 months (60 days) in advance. Past dates are disabled.
              </p>
            </div>

            {/* Single PAX field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Total Passengers (PAX)
              </label>
              <div className="flex items-center justify-between border border-gray-200 p-3.5 rounded-xl bg-gray-50/60">
                <div>
                  <p className="font-bold text-sm text-gray-900">PAX Count</p>
                  <p className="text-xs text-gray-500">Max 20 passengers per booking</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handlePaxChange(false)}
                    disabled={formData.pax <= 1}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold transition cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    name="pax"
                    value={formData.pax}
                    onChange={(e) => setFormData(prev => ({ ...prev, pax: Math.min(20, Math.max(1, parseInt(e.target.value) || 1)) }))}
                    className="w-14 text-center font-black text-gray-900 border border-gray-200 rounded-lg py-1 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handlePaxChange(true)}
                    disabled={formData.pax >= 20}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-gray-900 font-bold transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Special Notes / Requests (Optional)</label>
              <textarea
                name="specialRequests"
                rows={2}
                maxLength={500}
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Vegetarian meals, senior citizen assistance, extra bed..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm"
              />
            </div>

            {/* Authoritative Server-Side Quote Breakdown */}
            <div className="bg-red-50/60 border border-primary/20 p-4 rounded-xl space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Base Price per PAX</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Total PAX</span>
                <span>{formData.pax} Passenger{formData.pax > 1 ? 's' : ''}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Base Subtotal</span>
                <span>₹{(quote?.baseAmount || (basePrice * formData.pax)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>GST (5% Tour Operator Rate)</span>
                <span>₹{(quote?.gstAmount || Math.round(basePrice * formData.pax * 0.05)).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-primary pt-2 border-t border-primary/10">
                <span>Total Quote (GST Included)</span>
                <span>₹{(quote?.totalAmount || Math.round(basePrice * formData.pax * 1.05)).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="w-1/3 py-3 border border-gray-300 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-gray-50 transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Submitting...' : 'Submit Enquiry'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
