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
      case 'west_india': return 'West India';
      case 'south_india': return 'South India';
      case 'north_india': return 'North India';
      case 'east_india': return 'East India & Islands';
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
      {/* Catalog Hero Banner with Authentic Travel Backdrop and Red Gradient Overlay */}
      <div className="relative text-white py-20 px-4 text-center overflow-hidden bg-[#590006]">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1477584322904-487a38530416?auto=format&fit=crop&w=1920&q=85"
            alt="Incredible India Tour Packages"
            className="w-full h-full object-cover object-center scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/92 via-[#92000A]/85 to-[#730008]/90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-3">
          <span className="inline-block bg-secondary/20 border border-secondary/40 text-secondary text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
            Handpicked Itineraries
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase drop-shadow-md">
            Indian Tour Packages Catalog
          </h1>
          <p className="mt-3 text-base sm:text-lg text-red-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
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
            {/* Region Filter - Removed International */}
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2.5">Filter by Region</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'west_india', 'south_india', 'north_india', 'east_india'].map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedRegion === reg
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {reg === 'all' ? 'All Regions' : regionLabel(reg)}
                  </button>
                ))}
              </div>
            </div>

            {/* Tour Type Filter */}
            <div>
              <span className="block text-sm font-semibold text-gray-700 mb-2.5">Tour Category</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'heritage', 'adventure', 'leisure', 'pilgrimage'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedType === type
                        ? 'bg-secondary text-primary shadow-sm font-extrabold'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    {type === 'all' ? 'All Categories' : typeLabel(type)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm font-bold text-gray-500">
            Showing <span className="text-gray-900 font-extrabold">{filteredTours.length}</span> Tour Packages
          </p>
          {(selectedRegion !== 'all' || selectedType !== 'all' || searchQuery) && (
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
              We couldn&apos;t find any tour packages matching your search criteria. Try modifying your filter options.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-white rounded-2xl shadow border border-gray-150 overflow-hidden flex flex-col group hover:shadow-lg transition-all"
              >
                {/* Image Container */}
                <div className="h-56 w-full relative overflow-hidden bg-gray-100">
                  <img
                    src={tour.featuredImage}
                    alt={tour.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
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
                    <span className="flex items-center text-yellow-500 font-bold">
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
                      className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
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
