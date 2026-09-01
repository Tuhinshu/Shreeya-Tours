'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_TOURS } from '@/utils/mockData';
import ReviewsCarousel from '@/components/ReviewsCarousel';

const HERO_CAROUSEL_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1920&q=85',
    title: 'Aravali Hills & Royal Forts',
    subtitle: 'Rugged Ridges & Historic Bastions'
  },
  {
    url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=85',
    title: 'Munnar & Alleppey Backwaters',
    subtitle: "God's Own Country in Kerala"
  },
  {
    url: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1920&q=85',
    title: 'Lakes & Palaces of Udaipur',
    subtitle: 'Heritage & Grandeur of Rajasthan'
  },
  {
    url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1920&q=85',
    title: 'Himalayan High Passes',
    subtitle: 'Pangong Tso & Leh Ladakh'
  },
  {
    url: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1920&q=85',
    title: 'Western Heritage & Landscapes',
    subtitle: 'Gujarat, Diu & Statue of Unity'
  }
];

export default function HomePage() {
  const [activeRegion, setActiveRegion] = useState<'all' | 'west_india' | 'south_india' | 'himalayas' | 'islands'>('all');
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [showAllTours, setShowAllTours] = useState(false);

  // Auto-advance hero carousel background every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Filter mock tours
  const filteredTours = MOCK_TOURS.filter((tour) => {
    if (activeRegion === 'all') return true;
    if (activeRegion === 'west_india') return tour.region === 'west_india';
    if (activeRegion === 'south_india') return tour.region === 'south_india';
    if (activeRegion === 'himalayas') return tour.region === 'north_india';
    if (activeRegion === 'islands') return tour.region === 'east_india';
    return true;
  });

  // Display top 6 initially, or all if toggled
  const displayedTours = showAllTours ? filteredTours : filteredTours.slice(0, 6);

  return (
    <div className="bg-[#FAF9F6] pb-24 overflow-x-hidden">
      
      {/* 1. HERO CAROUSEL HEADER BANNER WITH LIGHTER, SEMI-TRANSPARENT RED GRADIENT OVERLAY */}
      <section className="relative h-[85vh] min-h-[540px] w-full overflow-hidden bg-[#590006] text-white">
        
        {/* Background Image Carousel */}
        {HERO_CAROUSEL_IMAGES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentHeroSlide ? 'opacity-100 scale-105 transition-transform duration-10000' : 'opacity-0 scale-100 pointer-events-none'
            }`}
          >
            <img
              src={slide.url}
              alt={slide.title}
              className="h-full w-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1920&q=85';
              }}
            />
          </div>
        ))}

        {/* Lighter, Semi-Transparent Red Gradient Overlay so Background Carousel Photos are Clearly Visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/65 via-[#92000A]/40 to-[#730008]/55 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25 z-10"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center z-20">
          <div className="max-w-3xl space-y-6 flex flex-col items-center">
            
            {/* Tagline */}
            <div className="inline-flex items-center space-x-2 bg-black/40 border border-secondary/50 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-secondary tracking-widest uppercase shadow-md">
              <span>TRUSTED INDIAN TRAVEL PARTNER</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none text-white uppercase drop-shadow-xl">
              Uncover the <br className="sm:hidden" />
              <span className="text-secondary font-black bg-clip-text">Magic of India</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white font-medium max-w-xl mx-auto leading-relaxed drop-shadow-md">
              Experience ancient temples, wild safari reserves, sun-kissed beaches, and timeless architectural marvels. Enjoy hand-crafted tour packages, verified luxury stays, transparent pricing, and 24/7 on-ground support across India.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Link
                href="/tours"
                className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white text-xs font-black tracking-wider uppercase px-8 py-4.5 rounded-xl transition duration-300 shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer border border-white/20"
              >
                <span>Find Your Destination</span>
                <span>➔</span>
              </Link>
              <a
                href="https://wa.me/916353818605?text=Hi!%20I%20want%20to%20enquire%20about%20tour%20packages%20in%20India."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-secondary hover:bg-secondary-hover text-primary text-xs font-black tracking-wider uppercase px-8 py-4.5 rounded-xl transition duration-300 shadow-xl hover:shadow-secondary/30 hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Speak to a Travel Expert</span>
              </a>
            </div>

            {/* Carousel Slide Indicators */}
            <div className="pt-6 flex items-center space-x-2.5 z-30">
              {HERO_CAROUSEL_IMAGES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentHeroSlide(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    dotIdx === currentHeroSlide
                      ? 'w-8 h-2.5 bg-secondary shadow-lg'
                      : 'w-2.5 h-2.5 bg-white/60 hover:bg-white/90 shadow'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>

      </section>

      {/* 2. STATS BAR / TRUST MARKERS */}
      <section className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-10 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100 text-center hover-card-pop">
          
          <div className="flex flex-col justify-center py-2 md:py-0">
            <span className="text-3xl sm:text-4xl font-black text-primary">15,000+</span>
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-500 mt-2">Happy Travelers</span>
          </div>

          <div className="flex flex-col justify-center pt-6 md:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-[#6B923D]">4.9 ★</span>
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-500 mt-2">Google Verified Reviews</span>
          </div>

          <div className="flex flex-col justify-center pt-6 md:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-primary">100%</span>
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-500 mt-2">GST Invoicing</span>
          </div>

          <div className="flex flex-col justify-center pt-6 md:pt-0">
            <span className="text-3xl sm:text-4xl font-black text-[#6B923D]">24/7</span>
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-500 mt-2">On-Trip Assistance</span>
          </div>

        </div>
      </section>

      {/* 3. FEATURED PACKAGES (Filterable) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        
        {/* Section Title */}
        <div className="text-center mb-12">
          <span className="text-primary font-black tracking-widest uppercase text-xs">Signature Trips</span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 uppercase tracking-tight">
            Our Popular Tour Packages
          </h2>
          <div className="h-1 w-20 bg-secondary mx-auto mt-3 rounded-full"></div>
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-8">
            {[
              { id: 'all', label: 'All Packages' },
              { id: 'west_india', label: 'West India' },
              { id: 'south_india', label: 'South India' },
              { id: 'himalayas', label: 'The Himalayas' },
              { id: 'islands', label: 'Islands' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveRegion(tab.id as 'all' | 'west_india' | 'south_india' | 'himalayas' | 'islands');
                  setShowAllTours(false);
                }}
                className={`px-4.5 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition cursor-pointer ${
                  activeRegion === tab.id
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white hover:bg-gray-100 border border-gray-150 text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Packages Grid (Top 6 initially, or expanded) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedTours.map((tour) => (
            <div
              key={tour.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group h-full hover-card-pop"
            >
              {/* Image Container */}
              <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                <img
                  src={tour.featuredImage}
                  alt={tour.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                  {tour.durationDays} Days
                </div>
              </div>

              {/* Contents */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-end items-center text-[10px] text-gray-400 font-extrabold uppercase mb-2">
                  <span className="flex items-center text-secondary font-black">
                    ★ <span className="ml-1 text-gray-700">{tour.rating}</span>
                  </span>
                </div>

                <h3 className="text-base font-black text-gray-900 leading-snug group-hover:text-primary transition-colors uppercase">
                  {tour.name}
                </h3>

                <ul className="mt-4 space-y-1.5 text-xs text-gray-500 list-disc list-inside flex-grow">
                  {tour.inclusions.slice(0, 3).map((inc, i) => (
                    <li key={i} className="truncate font-semibold">{inc}</li>
                  ))}
                </ul>

                <div className="mt-6 pt-5 border-t border-gray-100 flex items-end justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Starting from</p>
                    <p className="text-xl font-black text-primary">
                      ₹{tour.basePrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <Link
                    href={`/tours/${tour.slug}`}
                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition shadow-sm cursor-pointer"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More / Show Less Button */}
        {filteredTours.length > 6 && (
          <div className="text-center mt-12">
            <button
              onClick={() => setShowAllTours(!showAllTours)}
              className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-hover text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl transition duration-300 shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{showAllTours ? 'Show Less' : `Show More (${filteredTours.length - 6} More Tours)`}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showAllTours ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}

      </section>

      {/* 4. REVIEWS & TESTIMONIALS */}
      <section className="bg-secondary-light py-20 mt-28 border-y border-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-md mx-auto mb-16">
            <span className="text-primary font-black tracking-widest uppercase text-xs">Customer Trust</span>
            <h2 className="text-3xl font-black text-gray-900 mt-2 uppercase tracking-tight">
              What Travelers Say
            </h2>
            <div className="h-1 w-12 bg-secondary mx-auto mt-4 rounded-full"></div>
          </div>

          <ReviewsCarousel />
        </div>
      </section>

    </div>
  );
}
