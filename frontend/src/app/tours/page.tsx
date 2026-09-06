'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PACKAGES } from '@/data/packages';

function TourCatalogContent() {
  const searchParams = useSearchParams();
  const paramType = searchParams.get('type');
  const paramRegion = searchParams.get('region');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Derive active region and type (defaulting to URL param or 'all')
  const activeRegion = selectedRegion || paramRegion || 'all';
  const activeType = selectedType || paramType || 'all';

  const filteredTours = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return PACKAGES.filter((tour) => {
      // 1. Search Query Match
      const matchesSearch = !query || 
        tour.name.toLowerCase().includes(query) || 
        tour.region.toLowerCase().replace(/_/g, ' ').includes(query) ||
        tour.tourType.toLowerCase().includes(query) ||
        tour.inclusions.some((inc) => inc.toLowerCase().includes(query)) ||
        tour.itinerary.some((day) => 
          day.title.toLowerCase().includes(query) || 
          day.description.toLowerCase().includes(query)
        );

      // 2. Region Match
      const matchesRegion = activeRegion === 'all' || tour.region === activeRegion;

      // 3. Tour Type Match
      const matchesType = activeType === 'all' || tour.tourType === activeType;

      return matchesSearch && matchesRegion && matchesType;
    });
  }, [searchQuery, activeRegion, activeType]);

  const regionLabel = (region: string) => {
    switch (region) {
      case 'west_india': return 'West India';
      case 'south_india': return 'South India';
      case 'north_india': return 'North India';
      case 'east_india': return 'East India & Islands';
      default: return region;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Catalog Hero Banner with Authentic Travel Backdrop and Red Gradient Overlay */}
      <div className="relative text-white py-20 px-4 text-center overflow-hidden bg-[#590006]">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1920&q=85"
            alt="Incredible India Tour Packages"
            fill
            sizes="100vw"
            priority
            className="object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/75 via-[#92000A]/60 to-[#730008]/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-3">
          <span className="inline-block bg-black/40 border border-secondary/50 text-secondary text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-md">
            Handpicked Itineraries
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase drop-shadow-lg">
            Indian Tour Packages Catalog
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white font-medium max-w-2xl mx-auto leading-relaxed drop-shadow">
            Browse our curated hand-crafted tour packages. All bookings include direct WhatsApp support and GST-compliant invoicing.
          </p>
        </div>
      </div>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Search & Filter Dashboard */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-150 p-6 space-y-6 mb-10">
          
          {/* Search bar */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Search Packages</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by state, city, landmark, or package name (e.g. Rajasthan, Goa, Kerala, Temple)..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Region Filter */}
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">Filter by Region</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Regions' },
                  { id: 'west_india', label: 'West India' },
                  { id: 'south_india', label: 'South India' },
                  { id: 'north_india', label: 'North India' },
                  { id: 'east_india', label: 'East India & Islands' },
                ].map((reg) => (
                  <button
                    key={reg.id}
                    onClick={() => setSelectedRegion(reg.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeRegion === reg.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {reg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Type Filter */}
            <div>
              <span className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2.5">Tour Category</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'heritage', label: 'Cultural & Heritage' },
                  { id: 'adventure', label: 'Trekking & Adventure' },
                  { id: 'leisure', label: 'Beach & Leisure' },
                  { id: 'pilgrimage', label: 'Religious & Pilgrimage' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      activeType === type.id
                        ? 'bg-secondary text-primary shadow-md font-extrabold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-bold text-gray-600">
            Showing <span className="text-primary font-black">{filteredTours.length}</span> Tour Packages
          </p>
          {(activeRegion !== 'all' || activeType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Packages Grid */}
        {filteredTours.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-150 shadow-sm max-w-lg mx-auto">
            <p className="text-lg font-bold text-gray-800">No packages found</p>
            <p className="text-xs text-gray-500 mt-2">
              We couldn&apos;t find any tour packages matching your search criteria. Try modifying your filter options or clearing search keywords.
            </p>
            <button
              onClick={() => {
                setSelectedRegion('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow cursor-pointer hover:bg-primary-hover transition"
            >
              Show All Packages
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl shadow border border-gray-150 overflow-hidden flex flex-col group hover:shadow-lg transition-all hover-card-pop"
              >
                {/* Image Container */}
                <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                  <Image
                    src={tour.featuredImage}
                    alt={tour.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {tour.durationDays} Days
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {tour.tourType}
                  </div>
                </div>

                {/* Contents */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase mb-2">
                    <span>{regionLabel(tour.region)}</span>
                    <span className="flex items-center text-amber-500 font-bold">
                      ★ <span className="ml-1 text-gray-700">{tour.rating}</span>
                      <span className="text-gray-400 font-normal ml-0.5">({tour.reviewsCount})</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>

                  <ul className="mt-4 space-y-1.5 text-xs text-gray-500 list-disc list-inside flex-grow">
                    {tour.inclusions.slice(0, 3).map((inc, i) => (
                      <li key={i} className="truncate font-medium">{inc}</li>
                    ))}
                  </ul>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Starting from</p>
                      <p className="text-xl font-extrabold text-primary">
                        ₹{tour.basePrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function TourCatalog() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    }>
      <TourCatalogContent />
    </Suspense>
  );
}
