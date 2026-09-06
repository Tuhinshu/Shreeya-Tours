'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { SITE_CONFIG } from '@/config/site';

interface BookingFormProps {
  packageId?: string;
  packageName?: string;
  onSuccess?: () => void;
}

interface QuoteDetails {
  baseAmount: number;
  gstAmount: number;
  gstRate: number;
  totalAmount: number;
}

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function BookingForm({
  packageId = 'andaman-pb-3n',
  packageName = 'Scenic Andaman Express (Port Blair)',
  onSuccess,
}: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    pax: 2,
    state: 'Gujarat',
    specialRequests: '',
  });

  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [quoteLoading, setQuoteLoading] = useState<boolean>(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [submitted, setSubmitted] = useState(false);
  const [submittedBookingId, setSubmittedBookingId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Online Payment state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<{
    orderId: string;
    orderToken?: string;
    amount: number;
    mode: string;
    paymentSessionId: string;
    paymentStatus: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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

  const [quoteRetryCount, setQuoteRetryCount] = useState(0);

  // Authoritative server-side quote fetching (No local fallback calculation)
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function fetchQuote() {
      try {
        const res = await fetch('/api/bookings/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            packageId,
            pax: formData.pax,
            state: formData.state,
          }),
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.quote) {
          throw new Error(data.message || 'Pricing quote rejected by server.');
        }

        if (!isCancelled) {
          setQuote({
            baseAmount: data.quote.baseAmount,
            gstAmount: data.quote.gstAmount,
            gstRate: data.quote.gstRate,
            totalAmount: data.quote.totalAmount,
          });
          setQuoteError(null);
          setQuoteLoading(false);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          if (err instanceof Error && err.name === 'AbortError') return;
          setQuote(null);
          setQuoteLoading(false);
          const errMsg = err instanceof Error ? err.message : 'Unable to connect to pricing server.';
          setQuoteError(errMsg);
        }
      }
    }

    fetchQuote();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [packageId, formData.pax, formData.state, quoteRetryCount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setQuoteLoading(true);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePaxChange = (increment: boolean) => {
    setQuoteLoading(true);
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

    if (!quote) {
      alert('Cannot submit booking without an authoritative server price quote. Please retry quote generation.');
      return;
    }

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
      state: formData.state,
      specialRequests: formData.specialRequests.trim() || undefined,
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

  // Payment order creation handler
  const handleInitiatePayment = async () => {
    if (!submittedBookingId) return;
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: submittedBookingId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Failed to initiate payment');
      }

      setPaymentInfo({
        orderId: data.orderId,
        orderToken: data.orderToken,
        amount: data.amount,
        mode: data.mode,
        paymentSessionId: data.paymentSessionId,
        paymentStatus: 'PENDING',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment initiation failed';
      setPaymentError(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Dev/Test simulation helper: marks order complete on provider then fetches authoritative backend status
  const handleSimulatePaymentSuccess = async () => {
    if (!paymentInfo?.orderId) return;
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const res = await fetch('/api/payments/mock-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: paymentInfo.orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete mock transaction');
      }

      // Authoritative verification: Fetch backend payment status using order token
      const tokenQuery = paymentInfo.orderToken ? `&token=${encodeURIComponent(paymentInfo.orderToken)}` : '';
      const statusRes = await fetch(`/api/payments/status?orderId=${encodeURIComponent(paymentInfo.orderId)}${tokenQuery}`);
      const statusData = await statusRes.json();

      if (statusRes.ok && statusData.paymentStatus === 'SUCCESS') {
        setPaymentInfo((prev) => (prev ? { ...prev, paymentStatus: 'SUCCESS' } : null));
      } else {
        setPaymentInfo((prev) => (prev ? { ...prev, paymentStatus: statusData.paymentStatus || 'PENDING' } : null));
        throw new Error(`Payment not confirmed. Current status: ${statusData.paymentStatus || 'PENDING'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Mock payment verification failed';
      setPaymentError(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Authoritative status check for pending payments
  const handleCheckPaymentStatus = async () => {
    if (!paymentInfo?.orderId) return;
    setPaymentLoading(true);
    setPaymentError(null);

    try {
      const tokenQuery = paymentInfo.orderToken ? `&token=${encodeURIComponent(paymentInfo.orderToken)}` : '';
      const statusRes = await fetch(`/api/payments/status?orderId=${encodeURIComponent(paymentInfo.orderId)}${tokenQuery}`);
      const statusData = await statusRes.json();

      if (statusRes.ok && statusData.paymentStatus) {
        setPaymentInfo((prev) => (prev ? { ...prev, paymentStatus: statusData.paymentStatus } : null));
      } else {
        throw new Error(statusData.error || 'Failed to check status');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not retrieve payment status';
      setPaymentError(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  if (submitted) {
    // Minimized PII in WhatsApp URL: only Reference ID, package name, and PAX count
    const whatsappMessage = `Hi Shreeya Tours! I have submitted a booking enquiry (Reference ID: ${submittedBookingId}) for ${packageName} (${formData.pax} PAX). Please assist with verification.`;

    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-auto border border-gray-100 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Registered!</h3>
        <p className="text-gray-600 mb-2 text-sm leading-relaxed">
          Your booking enquiry for <span className="font-semibold">{packageName}</span> ({formData.pax} PAX) has been received with Reference ID:
        </p>
        <div className="bg-gray-100 py-2 px-4 rounded-xl inline-block my-2">
          <span className="font-mono font-bold text-primary text-base">{submittedBookingId}</span>
        </div>
        <p className="text-gray-500 mb-6 text-xs">
          Authoritative Quote: <span className="font-bold text-gray-800">₹{quote?.totalAmount.toLocaleString('en-IN')}</span> (incl. GST)
        </p>

        {/* Online Payment Section */}
        <div className="border-t border-gray-100 pt-5 mb-5 text-left">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Payment Options
          </h4>

          {paymentError && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg mb-3 border border-red-200">
              {paymentError}
            </div>
          )}

          {paymentInfo?.paymentStatus === 'SUCCESS' ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center mb-3">
              <span className="text-xl block mb-1">✓</span>
              <p className="font-bold text-sm">Payment Confirmed!</p>
              <p className="text-xs text-green-700 mt-1">
                Order <span className="font-mono font-semibold">{paymentInfo.orderId}</span> is PAID. Your booking is confirmed.
              </p>
            </div>
          ) : paymentInfo ? (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-bold text-gray-900">{paymentInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">₹{paymentInfo.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-bold text-amber-700 uppercase">{paymentInfo.paymentStatus}</span>
              </div>

              {paymentInfo.mode === 'MOCK' ? (
                <div className="pt-2 border-t border-amber-200 space-y-2">
                  <p className="text-[11px] text-amber-800 mb-1">
                    Sandbox / Demo Mode active: Test verified server payment confirmation.
                  </p>
                  <button
                    onClick={handleSimulatePaymentSuccess}
                    disabled={paymentLoading}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs cursor-pointer shadow disabled:opacity-60"
                  >
                    {paymentLoading ? 'Verifying with Server...' : 'Simulate & Verify Server Payment'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={paymentLoading}
                    className="w-full py-1.5 bg-white border border-amber-300 text-amber-900 font-semibold rounded-lg hover:bg-amber-50 transition text-xs cursor-pointer"
                  >
                    {paymentLoading ? 'Checking...' : '🔄 Check Server Payment Status'}
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-amber-200 space-y-2">
                  <p className="text-[11px] text-gray-600">
                    CashFree session ready. Complete transaction through your preferred UPI / card method.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckPaymentStatus}
                    disabled={paymentLoading}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition text-xs cursor-pointer"
                  >
                    {paymentLoading ? 'Verifying...' : '🔄 Verify Payment Status'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleInitiatePayment}
              disabled={paymentLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md mb-3 flex items-center justify-center space-x-1.5 disabled:opacity-60"
            >
              <span>💳</span>
              <span>{paymentLoading ? 'Connecting to Gateway...' : 'Pay Online (UPI / Card / NetBanking)'}</span>
            </button>
          )}
        </div>

        {/* WhatsApp Handoff Button (Minimized PII) */}
        <a
          href={SITE_CONFIG.getWhatsAppUrl(whatsappMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm flex items-center justify-center space-x-2 border border-primary/10 mb-3"
        >
          <span>Chat on WhatsApp with Reference ➔</span>
        </a>

        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setPaymentInfo(null);
          }}
          className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
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
        <p className="text-xs text-red-100 mt-1">Official server pricing & verified travel reservations</p>

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

            {/* Indian State / UT Selection for dynamic GST handling */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Billing State / Union Territory (for GST)
              </label>
              <select
                name="state"
                required
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm bg-white"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-1 font-medium">
                Tax calculation and GST compliance are determined by your customer billing state.
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

            {/* Authoritative Server-Side Quote Breakdown (No Client-Side Estimation Fallback) */}
            {quoteLoading ? (
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-center space-y-2">
                <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-xs text-gray-600 font-semibold">Calculating authoritative quote from server...</p>
              </div>
            ) : quoteError ? (
              <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
                <p className="text-xs text-red-700 font-bold">Pricing Server Error</p>
                <p className="text-xs text-red-600">{quoteError}</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuoteLoading(true);
                    setQuoteRetryCount((c) => c + 1);
                  }}
                  className="text-xs bg-red-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-red-700 transition cursor-pointer"
                >
                  Retry Quote
                </button>
              </div>
            ) : quote ? (
              <div className="bg-red-50/60 border border-primary/20 p-4 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Base Price per PAX</span>
                  <span>₹{Math.round(quote.baseAmount / (formData.pax || 1)).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Total PAX</span>
                  <span>{formData.pax} Passenger{formData.pax > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>Base Subtotal</span>
                  <span>₹{quote.baseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 font-medium">
                  <span>GST ({quote.gstRate}% Rate - {formData.state})</span>
                  <span>₹{quote.gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-primary pt-2 border-t border-primary/10">
                  <span>Total Quote (GST Included)</span>
                  <span>₹{quote.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : null}

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
                disabled={loading || quoteLoading || !quote || Boolean(quoteError)}
                className="w-2/3 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
