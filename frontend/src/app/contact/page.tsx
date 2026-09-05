'use client';

import React, { useState } from 'react';
import { SITE_CONFIG } from '@/config/site';
import { MOCK_TOURS } from '@/utils/mockData';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    destination: 'Statue of Unity',
    travelDate: '',
    travelers: 1,
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(SITE_CONFIG.email);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 3000);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const start = Date.now();
      window.location.href = `googlegmail:///co?to=${SITE_CONFIG.email}`;
      setTimeout(() => {
        if (Date.now() - start < 1500) {
          window.location.href = SITE_CONFIG.getMailtoUrl();
        }
      }, 500);
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${SITE_CONFIG.email}`, '_blank');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 13) {
      alert('Please enter a valid 10-13 digit phone number.');
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send enquiry');
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Error sending message. Please try again.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* Hero Header */}
      <section className="relative text-white py-16 px-4 text-center overflow-hidden bg-[#90000A]">
        <div className="relative z-10 max-w-4xl mx-auto space-y-3">
          <span className="text-secondary font-black tracking-widest uppercase text-xs">Get In Touch</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight uppercase">
            Contact Shreeya Tours
          </h1>
          <p className="mt-2 text-sm sm:text-base text-red-100 max-w-2xl mx-auto leading-relaxed">
            Planning a trip? Our specialists are available 24/7 to design customized packages for you.
          </p>
        </div>
      </section>

      {/* Main Two-Column Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Details (Separate Sections) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Address */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover-card-pop">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Office Address</h3>
                <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                  A-102, Krishna Empire, Near Yoginagar Township, Opp. Ramakaka Dery, Behind Shell Petrol Pump, Chhani, Vadodara - 391740, Gujarat, India.
                </p>
              </div>
            </div>

            {/* Section 2: Whatsapp */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover-card-pop">
              <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center text-[#6B923D] shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742c.083-.247.3-.416.563-.416h5.506c.263 0 .48.169.563.416l1.25 3.75A.75.75 0 0115.897 15H8.103a.75.75 0 01-.71-.842l1.25-3.75z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 1.2-.4 2.3-1 3.2C18.3 18.3 15.4 20 12 20c-1.3 0-2.5-.3-3.6-.8L4 20l.8-4.4C4.3 14.5 4 13.3 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
                </svg>
              </div>
              <div className="space-y-2 flex-grow">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">WhatsApp & Support Lines</h3>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Direct Chat / Active Helpline</p>
                    <p className="text-base font-black text-primary mt-0.5">+{SITE_CONFIG.phone.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3')}</p>
                  </div>
                  <a 
                    href={SITE_CONFIG.getWhatsAppUrl('Hi! I want to enquire about tour packages.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-secondary hover:bg-secondary-hover text-primary font-black px-4 py-2.5 rounded-xl text-xs transition border border-primary/10 tracking-wider uppercase shrink-0"
                  >
                    Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Section 3: Email */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover-card-pop">
              <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="space-y-2 flex-grow">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Email Address</h3>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">General & Booking Enquiries</p>
                    <p className="text-sm font-bold text-primary mt-0.5">{SITE_CONFIG.email}</p>
                  </div>
                  <button 
                    onClick={handleCopyEmail}
                    className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md tracking-wider uppercase shrink-0 cursor-pointer"
                  >
                    {emailCopied ? 'Email Copied!' : 'Email Us'}
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Social Media Handles */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start space-x-4 hover-card-pop">
              <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center text-primary shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186l.543-.271a2.25 2.25 0 012.25 0l.543.271m-3.336 2.186l.543.271a2.25 2.25 0 002.25 0l.543-.271m-6 2.285A2.25 2.25 0 015.07 14.8l2.685-1.342a2.25 2.25 0 000-2.016L5.07 10.1a2.25 2.25 0 01-1.07-1.916V5.25A2.25 2.25 0 016.25 3h1.5a2.25 2.25 0 012.25 2.25v2.934a2.25 2.25 0 01-1.07 1.916l-2.685 1.342a2.25 2.25 0 000 2.016l2.685 1.342a2.25 2.25 0 011.07 1.916v2.934a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25v-2.007z" />
                </svg>
              </div>
              <div className="space-y-3 flex-grow">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Social Media Handles</h3>
                <div className="flex flex-wrap gap-2.5">
                  <a 
                    href="https://www.instagram.com/shreeyatours/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 border border-black hover:bg-black hover:text-white text-black rounded-xl text-xs font-bold transition duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                  <a 
                    href="https://facebook.com/shreeyatours" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-4 py-2 border border-black hover:bg-black hover:text-white text-black rounded-xl text-xs font-bold transition duration-200 shadow-sm"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                    <span>Facebook</span>
                  </a>

                </div>
              </div>
            </div>

            {/* Section 5: Google Maps Embed */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover-card-pop">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider px-2">Google Maps Location</h3>
              <div className="w-full h-[320px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                <iframe
                  title="Shreeya Tours Location Map"
                  src="https://maps.google.com/maps?q=Shreeya%20Tours,%20Chhani,%20Vadodara&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>

          </div>

          {/* Right Column: Enquiry Form (Right side of screen) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 space-y-6">
              
              <div className="space-y-1">
                <h2 className="text-lg font-black text-gray-900 uppercase">Quick Enquiry Form</h2>
                <p className="text-xs text-gray-500 font-semibold">Fill out this quick form and our specialists will plan your itinerary.</p>
              </div>

              {submitted ? (
                <div className="text-center py-8 space-y-4 animate-fade-in">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Enquiry Received!</h3>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                    Thank you, <span className="font-bold text-gray-900">{formData.name}</span>. Your enquiry for <span className="text-primary font-black">{formData.destination}</span> has been received. Our team will contact you on <span className="text-primary font-black">{formData.phone}</span> shortly!
                  </p>

                  <a
                    href={SITE_CONFIG.getWhatsAppUrl(
                      `Hi Shreeya Tours! I just submitted an enquiry for ${formData.destination} (${formData.travelers} PAX) for ${formData.travelDate}.\n\nName: ${formData.name}\nPhone: ${formData.phone}${formData.message ? `\nNotes: ${formData.message}` : ''}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center space-x-2 border border-primary/10"
                  >
                    <span>Chat on WhatsApp Directly ➔</span>
                  </a>

                  <button 
                    onClick={() => setSubmitted(false)}
                    className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition shadow-sm"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
                  
                  <div>
                    <label className="block text-gray-600 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      required 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Vikram Patel" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="vikram@example.com" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">WhatsApp / Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      pattern="[0-9+\s\-]{10,15}"
                      title="Please enter a valid 10 to 15 digit phone or WhatsApp number"
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="+91 98765 43210" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 mb-1">Destination / Package</label>
                      <select 
                        name="destination" 
                        value={formData.destination} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm bg-white"
                      >
                        <option value="Custom Itinerary / Pan-India">Custom Tour (Pan-India)</option>
                        <optgroup label="West India & Gujarat">
                          {MOCK_TOURS.filter(t => t.region === 'west_india').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="South India">
                          {MOCK_TOURS.filter(t => t.region === 'south_india').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="North India & Himalayas">
                          {MOCK_TOURS.filter(t => t.region === 'north_india').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                        <optgroup label="East India & Andaman">
                          {MOCK_TOURS.filter(t => t.region === 'east_india').map(t => (
                            <option key={t.id} value={t.name}>{t.name}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-600 mb-1">Travel Date</label>
                      <input 
                        type="date" 
                        name="travelDate" 
                        required 
                        value={formData.travelDate} 
                        onChange={handleInputChange} 
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Travelers count (PAX)</label>
                    <input 
                      type="number" 
                      name="travelers" 
                      min="1" 
                      required 
                      value={formData.travelers} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-600 mb-1">Special Preferences</label>
                    <textarea 
                      name="message" 
                      rows={3} 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      placeholder="Vegetarian food, standard hotel preference, etc." 
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition text-xs shadow-md uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Send Enquiry</span>
                    )}
                  </button>

                </form>
              )}

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

