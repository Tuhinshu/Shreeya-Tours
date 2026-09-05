'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DestinationCategory } from '@/utils/destinationData';

interface NavDropdownProps {
  title: string;
  categories: DestinationCategory[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function NavDropdown({ title, categories, isOpen, onToggle }: NavDropdownProps) {
  const [hoveredCategory, setHoveredCategory] = useState(categories[0]?.slug || '');

  const activeCategory = categories.find(c => c.slug === hoveredCategory) || categories[0];

  return (
    <div className="relative group py-2">
      <button
        onClick={onToggle}
        className="flex items-center text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200 cursor-pointer"
      >
        <span>{title}</span>
        <svg
          className={`ml-1 h-4 w-4 transition-transform duration-250 ${isOpen ? 'rotate-180' : 'group-hover:rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Desktop Mega Menu Dropdown: Left pane for destinations, Right pane for tours */}
      <div className="absolute left-0 mt-2 w-[580px] bg-white rounded-2xl shadow-2xl border border-gray-100 hidden group-hover:flex z-50 overflow-hidden animate-fade-in divide-x divide-gray-100">
        {/* Left Pane - Destinations */}
        <div className="w-[200px] bg-gray-50/50 py-3 flex flex-col">
          {categories.map((category) => (
            <button
              key={category.slug}
              onMouseEnter={() => setHoveredCategory(category.slug)}
              className={`w-full text-left px-5 py-3 text-xs font-bold transition-all flex justify-between items-center ${
                hoveredCategory === category.slug
                  ? 'bg-white text-primary border-l-4 border-primary pl-4'
                  : 'text-gray-600 hover:bg-gray-100/50'
              }`}
            >
              <span>{category.name}</span>
              <svg
                className={`h-3.5 w-3.5 text-gray-400 ${
                  hoveredCategory === category.slug ? 'text-primary translate-x-1 transition-transform' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Right Pane - Tours under hovered destination */}
        <div className="flex-1 p-5 bg-white max-h-[420px] overflow-y-auto space-y-1">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2.5 px-2">
            Available itineraries for {activeCategory?.name}
          </h4>
          <div className="grid grid-cols-1 gap-1">
            {activeCategory?.tours.map((tour, idx) => (
              <Link
                key={idx}
                href={tour.href}
                className="block px-3 py-2.5 rounded-xl hover:bg-primary-light text-xs font-semibold text-gray-700 hover:text-primary transition-all leading-snug border border-transparent hover:border-primary/10"
              >
                {tour.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
