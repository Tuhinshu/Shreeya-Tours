'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

import { MOCK_TOURS } from '@/utils/mockData';

export default function TourCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  const filteredTours = useMemo(() => {
    return MOCK_TOURS.filter((tour) => {
      const matchesSearch = tour.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tour.region.toLowerCase().replace('_', ' ').includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'all' || tour.region === selectedRegion;
      const matchesType = selectedType === 'all' || tour.tourType === selectedType;
      
      return matchesSearch && matchesRegion && matchesType;
    });
  }, [searchQuery, selectedRegion, selectedType]);

  const regionLabel = (region: string) => {
    switch (region) {
      case 'north_india': return 'North India';
      case 'south_india': return 'South India';
      case 'east_india': return 'East India';
      case 'west_india': return 'West India';
      case 'international': return 'International';
      default: return region;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'heritage': return 'Cultural & Heritage';
      case 'adventure': return 'Trekking & Adventure';
      case 'leisure': return 'Beach & Leisure';
      case 'luxury': return 'Luxury Tour';
      case 'pilgrimage': return 'Religious & Pilgrimage';
      default: return type;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Catalog Hero Banner */}
      <div className="relative text-white py-16 px-4 text-center overflow-hidden bg-[#90000A]">
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Indian Tour Packages Catalog
          </h1>
          <p className="mt-4 text-base sm:text-lg text-red-100 max-w-2xl mx-auto">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search Packages</label>
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
                placeholder="Search by destination or package name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Region Filter */}
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2.5">Filter by Region</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'north_india', 'south_india', 'west_india', 'international'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedRegion === reg
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {reg === 'all' ? 'All Regions' : regionLabel(reg)}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2.5">Filter by Tour Type</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'heritage', 'adventure', 'leisure', 'luxury', 'pilgrimage'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedType(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedType === t
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'all' ? 'All Types' : typeLabel(t)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-medium text-gray-500">
            Showing {filteredTours.length} {filteredTours.length === 1 ? 'package' : 'packages'}
          </p>
        </div>

        {/* Tour Packages Grid */}
        {filteredTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col group h-full hover-card-pop"
              >
                {/* Image Section */}
                <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={tour.featuredImage}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold shadow">
                    {tour.durationDays} Days
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white text-primary px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider shadow border border-primary/20">
                    ★ {tour.rating} ({tour.reviewsCount})
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-primary transition-colors">
                    {tour.name}
                  </h3>

                  {/* Highlights Bullet List */}
                  <ul className="mt-3.5 space-y-1.5 text-xs text-gray-600 list-disc list-inside flex-grow">
                    {tour.inclusions.slice(0, 3).map((inc, index) => (
                      <li key={index} className="truncate">{inc}</li>
                    ))}
                  </ul>

                  {/* Price and CTA */}
                  <div className="mt-6 pt-5 border-t border-gray-100 flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">Starting from</p>
                      <p className="text-2xl font-black text-primary">
                        ₹{tour.basePrice.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <Link
                      href={`/tours/${tour.slug}`}
                      className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition hover:scale-105 active:scale-95 shadow-md"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow">
            <div className="flex justify-center text-gray-300 mb-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">No packages found</h3>
            <p className="text-gray-500 mt-1.5 text-sm max-w-sm mx-auto">
              We couldn&apos;t find any tour packages matching your search filters. Try adjusting your query or resetting your selections.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedRegion('all'); setSelectedType('all'); }}
              className="mt-6 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

