'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { TourPackage } from '@/utils/mockData';
import BookingForm from '@/components/BookingForm';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';

interface TourDetailClientProps {
  tour: TourPackage;
}

export default function TourDetailClient({ tour }: TourDetailClientProps) {
  const [activeDay, setActiveDay] = useState<number | null>(1); // Open Day 1 by default
  const galleryImages = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.featuredImage || DEFAULT_FALLBACK_IMAGE];
  const [selectedImage, setSelectedImage] = useState<string>(tour.featuredImage || galleryImages[0] || DEFAULT_FALLBACK_IMAGE);

  const toggleAccordion = (dayNum: number) => {
    setActiveDay(activeDay === dayNum ? null : dayNum);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left / Middle: Gallery, Accordion Itinerary, Inclusions */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Visual Photo Gallery (5-Photo Responsive Layout) */}
        <div className="bg-white rounded-2xl p-4 shadow border border-gray-100 space-y-3">
          <div className="h-[320px] sm:h-[420px] rounded-xl overflow-hidden bg-gray-100 relative group">
            <Image
              src={selectedImage}
              alt={tour.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-cover transition-all duration-300"
              priority
              onError={() => {
                setSelectedImage(DEFAULT_FALLBACK_IMAGE);
              }}
            />
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
              Photo {galleryImages.indexOf(selectedImage) !== -1 ? galleryImages.indexOf(selectedImage) + 1 : 1} of {Math.min(galleryImages.length, 5)}
            </div>
          </div>

          {/* 5-Column Responsive Thumbnail Selector */}
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {galleryImages.slice(0, 5).map((imgUrl, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(imgUrl)}
                aria-label={"View photo " + (index + 1)}
                className={"relative h-16 sm:h-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer " + (
                  selectedImage === imgUrl
                    ? "border-primary ring-2 ring-primary/30 opacity-100 scale-95 shadow-md"
                    : "border-transparent opacity-70 hover:opacity-100 hover:scale-[1.02]"
                )}
              >
                <Image
                  src={imgUrl}
                  alt={tour.name + " Photo " + (index + 1)}
                  fill
                  sizes="(max-width: 768px) 20vw, 150px"
                  className="object-cover"
                />
              </button>
            ))}
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

        {/* Inclusions & Exclusions */}
        <div className="bg-white rounded-2xl p-6 shadow border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 uppercase">Package Inclusions</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {tour.inclusions.map((inc, i) => (
              <li key={i} className="flex items-center space-x-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{inc}</span>
              </li>
            ))}
          </ul>
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
  );
}
