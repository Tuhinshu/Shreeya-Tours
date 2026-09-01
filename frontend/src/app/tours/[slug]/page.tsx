'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_TOURS, TourPackage } from '@/utils/mockData';
import BookingForm from '@/components/BookingForm';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';

export default function TourDetail({ params }: { params: Promise<{ slug: string }> }) {
  const [resolvedParams, setResolvedParams] = useState<{ slug: string } | null>(null);
  const [tour, setTour] = useState<TourPackage | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(1); // Open Day 1 by default
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    params.then((p) => {
      setResolvedParams(p);
      const foundTour = MOCK_TOURS.find((t) => t.slug === p.slug);
      if (foundTour) {
        setTour(foundTour);
        setSelectedImage(foundTour.featuredImage || DEFAULT_FALLBACK_IMAGE);
      }
    });
  }, [params]);

  if (!resolvedParams || !tour) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading tour itinerary...</p>
      </div>
    );
  }

  // Schema Markup injection
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Tour',
    'name': tour.name,
    'description': `Explore ${tour.name} in ${tour.region}. Included inclusions: ${tour.inclusions.slice(0, 3).join(', ')}`,
    'image': tour.featuredImage,
    'touristType': tour.tourType,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': tour.basePrice.toString(),
      'valueAddedTaxIncluded': 'true',
    },
    'itinerary': tour.itinerary.map((day) => ({
      '@type': 'HowToStep',
      'name': `Day ${day.dayNumber}: ${day.title}`,
      'text': day.description,
    })),
  };

  const toggleAccordion = (dayNum: number) => {
    setActiveDay(activeDay === dayNum ? null : dayNum);
  };

  // Ensure gallery has at least the featured image if empty
  const galleryImages = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.featuredImage || DEFAULT_FALLBACK_IMAGE];

  return (
    <div className="bg-gray-50 pb-16">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Detail Header Banner with Authentic Destination Image Backdrop & Semi-Transparent Red Gradient */}
      <div className="relative text-white py-16 px-4 overflow-hidden bg-[#590006]">
        <div className="absolute inset-0 z-0">
          <img
            src={tour.featuredImage || DEFAULT_FALLBACK_IMAGE}
            alt={tour.name}
            className="w-full h-full object-cover object-center scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
            }}
          />
          {/* Lighter, Semi-Transparent Red Gradient Overlay so Tour Image is clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/75 via-[#92000A]/55 to-[#730008]/65"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/tours" className="text-white/80 hover:text-white font-semibold text-xs flex items-center space-x-1.5 mb-4 transition-colors">
            <span>←</span> <span>Back to Catalog</span>
          </Link>
          <div className="flex flex-wrap items-center space-x-2 text-xs text-secondary font-bold uppercase tracking-wider mb-2">
            <span className="text-secondary bg-black/40 border border-secondary/40 px-2.5 py-0.5 rounded text-[10px] uppercase font-black">{tour.tourType} tour</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight uppercase drop-shadow-md">
            {tour.name}
          </h1>
          <div className="flex items-center space-x-4 mt-3 text-sm text-red-100">
            <span>{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
            <span>|</span>
            <span className="flex items-center">
              ★ <strong className="text-white ml-1">{tour.rating}</strong>
              <span className="text-red-200 ml-1">({tour.reviewsCount} reviews)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Middle: Details, Accordion, Inclusions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Visual Photo Gallery (Supports local assets or props cleanly) */}
            <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 space-y-3">
              <div className="h-[300px] sm:h-[400px] rounded-xl overflow-hidden bg-gray-150 relative">
                <img
                  src={selectedImage}
                  alt={tour.name}
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                  }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`h-20 sm:h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      selectedImage === imgUrl ? 'border-primary opacity-100 scale-95 shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Inclusions */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase">Inclusions</h2>
              
              <div className="text-sm">
                <div className="space-y-3">
                  <h3 className="font-semibold text-green-600 flex items-center space-x-1.5">
                    <span>What&apos;s Included</span>
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    {tour.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-2 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Day-by-Day Accordion Itinerary */}
            <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase">Day-by-Day Itinerary</h2>
              
              <div className="space-y-3">
                {tour.itinerary.map((day) => {
                  const isOpen = activeDay === day.dayNumber;
                  return (
                    <div
                      key={day.dayNumber}
                      className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300"
                    >
                      <button
                        onClick={() => toggleAccordion(day.dayNumber)}
                        className={`w-full flex justify-between items-center p-4 text-left font-bold text-gray-950 transition-colors cursor-pointer ${
                          isOpen ? 'bg-primary-light text-primary' : 'bg-white hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm sm:text-base">
                          Day {day.dayNumber}: {day.title}
                        </span>
                        <span className="text-xs transition-transform duration-300">
                          {isOpen ? '▲' : '▼'}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-4 bg-white border-t border-gray-200 text-sm text-gray-700 space-y-3 leading-relaxed animate-slide-down">
                          <p>{day.description}</p>
                          
                          {/* Stay / Meals metadata */}
                          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100 text-xs font-semibold">
                            {day.accommodation && (
                              <div className="flex items-center space-x-1.5 text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                                <span>Stay:</span>
                                <span className="text-gray-800">{day.accommodation}</span>
                              </div>
                            )}
                            {day.mealsProvided && day.mealsProvided.length > 0 && (
                              <div className="flex items-center space-x-1.5 text-gray-500 bg-gray-100 px-2.5 py-1 rounded">
                                <span>Meals:</span>
                                <span className="text-gray-800 capitalize">{day.mealsProvided.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Sidebar: Sticky Booking Panel */}
          <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
            <BookingForm
              packageId={tour.id}
              packageName={tour.name}
              basePrice={tour.basePrice}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
