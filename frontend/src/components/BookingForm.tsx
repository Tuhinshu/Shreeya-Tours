'use client';

import React, { useState } from 'react';

interface BookingFormProps {
  packageId?: string;
  packageName?: string;
  basePrice?: number;
  onSuccess?: () => void;
}

export default function BookingForm({
  packageId = '1',
  packageName = 'Magical Kerala Backwaters',
  basePrice = 24999,
  onSuccess,
}: BookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    travelDate: '',
    adults: 2,
    children: 0,
    infants: 0,
    specialRequests: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (name: 'adults' | 'children' | 'infants', increment: boolean) => {
    setFormData((prev) => {
      const val = prev[name];
      const newVal = increment ? val + 1 : Math.max(name === 'adults' ? 1 : 0, val - 1);
      return { ...prev, [name]: newVal };
    });
  };

  const nextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setStep((prev) => prev - 1);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const totalSum = basePrice * formData.adults + (basePrice * 0.5 * formData.children);

    const payload = {
      ...formData,
      packageId,
      packageName,
      basePrice,
      totalAmount: totalSum,
    };

    try {
      // In production, we'd POST to backend /api/bookings
      console.log('Submitting booking payload:', payload);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Booking submission error:', err);
      alert('Error submitting enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-auto border border-gray-100 animate-fade-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Thank you, <span className="font-semibold">{formData.name}</span>. Our tour specialists will contact you shortly on <span className="font-semibold">{formData.phone}</span> to finalize your trip to {packageName}.
        </p>
        <button
          onClick={() => { setSubmitted(false); setStep(1); }}
          className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition"
        >
          Book Another Tour
        </button>
      </div>
    );
  }

  const totalSum = basePrice * formData.adults + (basePrice * 0.5 * formData.children);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg mx-auto overflow-hidden">
      {/* Header and Step Indicators */}
      <div className="bg-primary text-white p-6">
        <h3 className="text-xl font-bold">Book Your Adventure</h3>
        <p className="text-xs text-red-100 mt-1">Fill out the form below to initiate booking</p>
        
        {/* Progress Bar */}
        <div className="flex items-center justify-between mt-6 text-xs text-red-100 max-w-xs mx-auto">
          <div className="flex items-center flex-col relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold mb-1 ${step >= 1 ? 'bg-white text-primary shadow' : 'bg-primary-dark/80'}`}>1</div>
            <p className={`${step >= 1 ? 'text-white font-semibold' : 'text-red-200'}`}>Contact</p>
          </div>
          <div className="flex-1 h-0.5 bg-primary-dark/80 mx-2 mb-4">
            <div className={`h-full bg-white transition-all duration-300`} style={{ width: step > 1 ? '100%' : '0%' }}></div>
          </div>
          <div className="flex items-center flex-col relative">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold mb-1 ${step >= 2 ? 'bg-white text-primary shadow' : 'bg-primary-dark/80'}`}>2</div>
            <p className={`${step >= 2 ? 'text-white font-semibold' : 'text-red-200'}`}>Details</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {step === 1 && (
          <form onSubmit={nextStep} className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Contact Details</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Rohan Sharma"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="rohan@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Phone</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="9999999999"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition mt-2"
            >
              Continue to Details
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={submitForm} className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Step 2: Dates & Travelers</h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Travel Date</label>
              <input
                type="date"
                name="travelDate"
                required
                value={formData.travelDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Number of Travelers (PAX)</label>
              
              {/* Adults */}
              <div className="flex items-center justify-between border border-gray-200 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Adults</p>
                  <p className="text-xs text-gray-500">Ages 18+</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('adults', false)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-900">{formData.adults}</span>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('adults', true)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between border border-gray-200 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Children</p>
                  <p className="text-xs text-gray-500">Ages 5-17 (50% charge)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('children', false)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-900">{formData.children}</span>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('children', true)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Infants */}
              <div className="flex items-center justify-between border border-gray-200 p-3 rounded-xl">
                <div>
                  <p className="font-semibold text-sm text-gray-800">Infants</p>
                  <p className="text-xs text-gray-500">Ages 0-4 (Free)</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleNumberChange('infants', false)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    -
                  </button>
                  <span className="font-semibold text-gray-900">{formData.infants}</span>
                  <button
                    type="button"
                    onClick={() => handleNumberChange('infants', true)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-900"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Preferences / Requests</label>
              <textarea
                name="specialRequests"
                rows={2}
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Vegetarian food, specific flight timings, room custom requests..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            {/* Estimated Price Display */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Base Price (per Adult)</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-primary border-t border-gray-200 pt-2 mt-2">
                <span>Estimated Cost (All-incl.)</span>
                <span>₹{totalSum.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                * Rates are inclusive of all service taxes and fees. Final booking subject to availability.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.travelDate}
                className="flex-grow py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Submit Booking Enquiry</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

