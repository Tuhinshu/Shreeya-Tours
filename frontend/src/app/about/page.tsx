'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { SITE_CONFIG } from '@/config/site';

const TEAM_MEMBERS = [
  {
    name: "Rohini Vishwakarma",
    role: "Founder & Managing Director",
    bio: "Founded Shreeya Tours with a vision to make domestic travel in India seamless, transparent, and memorable. Rohini oversees all custom itineraries, partnerships, and client relations.",
    avatar: "RV",
    color: "bg-[#92000A]"
  },
  {
    name: "Sanjay Sharma",
    role: "Tour Operations Lead",
    bio: "Sanjay coordinates with on-ground transport, hotels, and local guides, ensuring that logistics are perfectly managed so your trip remains stress-free.",
    avatar: "SS",
    color: "bg-[#6B923D]"
  },
  {
    name: "Vikram Patel",
    role: "Senior Destination Specialist",
    bio: "A walking encyclopedia of Western and Northern India travel. Vikram designs our flagship Statue of Unity, Rajasthan, and Gujarat heritage itineraries.",
    avatar: "VP",
    color: "bg-secondary-dark"
  }
];

const HAPPY_CUSTOMER_IMAGES = [
  "/reviews/image1.png",
  "/reviews/image2.png",
  "/reviews/image3.png",
  "/reviews/image4.png",
  "/reviews/image5.png",
  "/reviews/image6.png",
  "/reviews/image7.png",
  "/reviews/image8.png"
];

export default function AboutUs() {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(SITE_CONFIG.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

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
  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      
      {/* 1. HERO HEADER */}
      <section className="relative text-white py-20 px-4 text-center overflow-hidden bg-[#90000A]">
        <div className="relative z-10 max-w-4xl mx-auto space-y-4">
          <span className="text-secondary font-black tracking-widest uppercase text-xs">Shreeya Tours</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase">
            Experience the Difference
          </h1>
          <p className="mt-4 text-base sm:text-lg text-red-100 max-w-2xl mx-auto leading-relaxed">
            We craft personalized domestic tour packages with absolute transparency, verified hotel stays, and 24/7 active helpline support.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-24">
        
        {/* 2. HOW DID WE BEGIN? (Origin Story) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-primary font-black tracking-widest uppercase text-xs">Our Journey</span>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
              How Did We Begin?
            </h2>
            <div className="h-1 w-16 bg-secondary rounded-full"></div>
            
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Shreeya Tours began in 2019 in Vadodara, Gujarat, with a simple yet powerful mission: to redefine domestic tourism in India. We saw that travelers often faced hidden costs, unreliable hotels, and unprofessional drivers. Our founder, **Rohini Vishwakarma**, envisioned a travel agency where transparency and traveler comfort came first.
            </p>
            
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              We started by organizing customized local heritage trips to the **Statue of Unity** and the historic palaces of Vadodara. Word of our commitment to quality spread quickly. By prioritizing verified hospitality, dynamic GST-compliant invoicing, and direct, responsive communication through WhatsApp, Shreeya Tours grew into a Ministry-approved tourism partner.
            </p>
            
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Today, our footprints cover Gujarat, Kerala backwaters, Karnataka, Tamil Nadu, Rajasthan, and the Himalayan trails. Even as we expand, our core promise remains unchanged: to handle every detail of your journey so you can simply pack your bags and enjoy the magic of travel.
            </p>
          </div>
          
          <div className="lg:col-span-5 relative bg-white p-4 rounded-3xl shadow-lg border border-gray-100 flex flex-col justify-center items-center">
            <div className="relative w-full h-[320px] rounded-2xl overflow-hidden bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1506461883276-594a12b11db3?auto=format&fit=crop&w=800&q=85" 
                alt="Taj Mahal heritage tourism" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-secondary text-primary px-6 py-4.5 rounded-2xl shadow-xl border border-primary/10 hidden sm:block text-center">
              <p className="text-2xl font-black">2019</p>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-700 mt-1">Established</p>
            </div>
          </div>
        </section>

        {/* 3. OUR TEAM */}
        <section className="space-y-12">
          <div className="text-center max-w-md mx-auto space-y-3">
            <span className="text-primary font-black tracking-widest uppercase text-xs">The Experts</span>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Our Core Team</h2>
            <div className="h-1 w-12 bg-secondary mx-auto rounded-full"></div>
            <p className="text-xs text-gray-500 font-semibold">Meet the travel specialists working behind the scenes to craft your dream vacations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-md flex flex-col items-center text-center space-y-4 hover-card-pop">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg text-white ${member.color}`}>
                  {member.avatar}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 uppercase">{member.name}</h3>
                  <p className="text-xs text-[#6B923D] font-extrabold mt-0.5">{member.role}</p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold flex-grow">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. IMAGES OF HAPPY CUSTOMERS (Social Proof) */}
        <section className="space-y-12">
          <div className="text-center max-w-md mx-auto space-y-3">
            <span className="text-primary font-black tracking-widest uppercase text-xs">Social Proof</span>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Our Happy Customers</h2>
            <div className="h-1 w-12 bg-secondary mx-auto rounded-full"></div>
            <p className="text-xs text-gray-500 font-semibold">Real feedback screenshots shared by families and travelers who toured with us.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HAPPY_CUSTOMER_IMAGES.map((imgSrc, idx) => (
              <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-150 p-2 hover-card-pop">
                <div className="relative w-full h-[150px] bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                  <Image 
                    src={imgSrc} 
                    alt={`Google Review screenshot ${idx + 1}`} 
                    fill
                    className="object-contain" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. CONTACT US OPTIONS */}
        <section className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 sm:p-12 space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-[#6B923D] font-black tracking-widest uppercase text-xs">Reach Out</span>
            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Start Planning Your Journey</h2>
            <div className="h-1 w-12 bg-secondary mx-auto rounded-full"></div>
            <p className="text-xs text-gray-500 font-semibold">Ready to explore? Connect with our dedicated support team or visit us at our offices.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* WhatsApp Contact Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4 hover-card-pop">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742c.083-.247.3-.416.563-.416h5.506c.263 0 .48.169.563.416l1.25 3.75A.75.75 0 0115.897 15H8.103a.75.75 0 01-.71-.842l1.25-3.75z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 1.2-.4 2.3-1 3.2C18.3 18.3 15.4 20 12 20c-1.3 0-2.5-.3-3.6-.8L4 20l.8-4.4C4.3 14.5 4 13.3 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase">WhatsApp Chat</h3>
                <p className="text-xs text-gray-500 font-semibold">Immediate inquiry response & customizable pricing quotes.</p>
              </div>
              <a 
                href={SITE_CONFIG.getWhatsAppUrl('Hi! I want to enquire about tour packages.')}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-secondary hover:bg-secondary-hover text-primary font-extrabold py-3 rounded-xl transition text-xs border border-primary/10 uppercase tracking-wider"
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Email Support Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4 hover-card-pop">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase">Email Support</h3>
                <p className="text-xs text-gray-500 font-semibold">Drop us a line for business deals, itineraries, and tax invoices.</p>
              </div>
              <button 
                onClick={handleCopyEmail}
                className="w-full text-center bg-primary hover:bg-primary-hover text-white font-extrabold py-3 rounded-xl transition text-xs shadow-md uppercase tracking-wider cursor-pointer"
              >
                {copied ? 'Email Copied!' : 'Send an Email'}
              </button>
            </div>

            {/* Office Address Card */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-between space-y-4 hover-card-pop">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-secondary-light flex items-center justify-center text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-black text-gray-900 uppercase">Our Office</h3>
                <p className="text-xs text-gray-500 font-semibold">Vadodara head office. Visit us for tea and direct booking discussions.</p>
              </div>
              <a 
                href="https://maps.google.com/?q=Shreeya+Tours+Chhani+Vadodara"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-white hover:bg-gray-100 text-gray-700 font-extrabold py-3 rounded-xl transition text-xs border border-gray-200 uppercase tracking-wider"
              >
                Get Directions
              </a>
            </div>

          </div>

          {/* Quick Helplines */}
          <div className="border-t border-gray-150 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-gray-500 gap-4 text-center">
            <p>ðŸ“ž Emergency Active Tour Helpline: <span className="text-primary font-black">+91 63538 18605</span></p>
            <p>ðŸ¢ Registered Office: A-102, Krishna Empire, Chhani, Vadodara - 391740</p>
          </div>
        </section>

      </div>
    </div>
  );
}


