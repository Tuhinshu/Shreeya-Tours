'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface NavDropdownProps {
  title: string;
  categories: {
    name: string;
    slug: string;
    tours: { name: string; href: string }[];
  }[];
  isOpen: boolean;
  onToggle: () => void;
}

function NavDropdown({ title, categories, isOpen, onToggle }: NavDropdownProps) {
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

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(name);
    }
  };

  const toggleSubDropdown = (name: string) => {
    if (activeSubDropdown === name) {
      setActiveSubDropdown(null);
    } else {
      setActiveSubDropdown(name);
    }
  };

  const destinationCategories = [
    {
      name: 'Great Gujarat',
      slug: 'gujarat',
      tours: [
        { name: 'Statue of Unity & Poicha (2 Days)', href: '/tours/gujarat-sou-poicha-1n' },
        { name: 'White Desert Ranotsav (2 Days)', href: '/tours/gujarat-kutch-ranotsav-1n' },
        { name: 'Statue of Unity & Vadodara (3 Days)', href: '/tours/gujarat-sou-vadodara-2n' },
        { name: 'Dwarka & Somnath Darshan (3 Days)', href: '/tours/gujarat-dwarka-somnath-2n' },
        { name: 'Dwarka, Somnath & Gir Safari (4 Days)', href: '/tours/gujarat-dwarka-somnath-gir-3n' },
        { name: 'Statue of Unity, Ahmedabad & Patan (5 Days)', href: '/tours/gujarat-sou-ahmedabad-patan-4n' },
        { name: 'Statue of Unity & Royal Gujarat (7 Days)', href: '/tours/royal-gujarat-heritage' },
        { name: 'Grand Royal Gujarat Odyssey (9 Days)', href: '/tours/gujarat-grand-royal-odyssey-8n' },
      ],
    },
    {
      name: 'Andaman Islands',
      slug: 'andaman',
      tours: [
        { name: 'Scenic Andaman Express (4 Days)', href: '/tours/andaman-express-pb-3n' },
        { name: 'Exotic Andaman Swaraj Escape (5 Days)', href: '/tours/andaman-swaraj-escape-4n' },
        { name: 'Premium Andaman Explorer (6 Days)', href: '/tours/andaman-premium-explorer-5n' },
      ],
    },
    {
      name: 'Goa Beach Tours',
      slug: 'goa',
      tours: [
        { name: 'Goa Beach Romance & Heritage (4 Days)', href: '/tours/goa-beach-romance-3n' },
      ],
    },
    {
      name: 'Karnataka Wonders',
      slug: 'karnataka',
      tours: [
        { name: 'Coorg & Mysore Escapade (5 Days)', href: '/tours/karnataka-wonders-coorg-mysore' },
        { name: 'Mysore & Kabini Wildlife (4 Days)', href: '/tours/karnataka-mysore-kabini-3n' },
        { name: 'Chikmagalur Coffee Escape (4 Days)', href: '/tours/karnataka-chikmagalur-coffee-3n' },
        { name: 'Mysore & Bandipur Tiger Sanctuary (4 Days)', href: '/tours/karnataka-mysore-bandipur-3n' },
        { name: 'Hampi & Badami Ruins Heritage (4 Days)', href: '/tours/karnataka-hampi-badami-3n' },
        { name: 'Hampi, Badami & Dandeli Adventure (5 Days)', href: '/tours/karnataka-hampi-dandeli-5d' },
        { name: 'Coastal Karnataka & Gokarna (6 Days)', href: '/tours/karnataka-coastal-gokarna-5n' },
        { name: 'Complete Wilderness & Coastal (10 Days)', href: '/tours/karnataka-coast-wilderness-9n' },
      ],
    },
    {
      name: 'Kerala Backwaters',
      slug: 'kerala',
      tours: [
        { name: 'Munnar Hills & Kumarakom Lake (5 Days)', href: '/tours/kerala-hills-lake-escape-4n' },
        { name: 'Munnar Hills & Periyar Forest (5 Days)', href: '/tours/kerala-tea-hills-forest-4n' },
        { name: 'Houseboat & Kovalam Beach (5 Days)', href: '/tours/kerala-houseboat-beach-4n' },
        { name: 'Houseboat & Hills Escape (7 Days)', href: '/tours/kerala-houseboat-hills-6n' },
        { name: 'Complete Kerala backwaters & Hills (8 Days)', href: '/tours/complete-kerala-backwater-hills' },
        { name: 'Grand Kerala Backwater & Kovalam (9 Days)', href: '/tours/kerala-grand-backwater-8n' },
      ],
    },
    {
      name: 'Imperial Rajasthan',
      slug: 'rajasthan',
      tours: [
        { name: 'Jodhpur & Jaisalmer Desert Tents (5 Days)', href: '/tours/rajasthan-desert-tents-4n' },
        { name: 'Jaipur, Pushkar & Udaipur (6 Days)', href: '/tours/rajasthan-jaipur-pushkar-udaipur-5n' },
        { name: 'Imperial Rajasthan Forts & Lakes (7 Days)', href: '/tours/imperial-rajasthan-forts-desert' },
      ],
    },
    {
      name: 'Tamil Nadu Heritage',
      slug: 'tamilnadu',
      tours: [
        { name: 'Madurai & Rameswaram Spiritual (4 Days)', href: '/tours/tamilnadu-madurai-rameswaram-3n' },
        { name: 'Royal Temples Heritage (6 Days)', href: '/tours/tamilnadu-royal-temples-5n' },
        { name: 'Coimbatore, Ooty & Kodaikanal (6 Days)', href: '/tours/tamilnadu-ooty-kodaikanal-5n' },
      ],
    },
    {
      name: 'The Himalayas',
      slug: 'himalayas',
      tours: [
        { name: 'Leh Ladakh Pangong Adventure (6 Days)', href: '/tours/himalayas-ladakh-adventure-6d' },
        { name: 'Himachal Scenic Escape (6 Days)', href: '/tours/himalayas-shimla-manali-6d' },
      ],
    },
  ];

  return (
    <header className="bg-white text-gray-800 shadow-md sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo Branding Area */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="Shreeya Tours" className="h-20 w-auto object-contain py-0.5" />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link href="/" className="text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200">
              Home
            </Link>

            <NavDropdown
              title="Begin Your Journey"
              categories={destinationCategories}
              isOpen={activeDropdown === 'destinations'}
              onToggle={() => toggleDropdown('destinations')}
            />

            <Link href="/tours" className="text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200">
              Tour Packages
            </Link>
            <Link href="/about" className="text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200">
              About Us
            </Link>
            <Link href="/contact" className="text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200">
              Contact Us
            </Link>
          </nav>

          {/* Call-to-action button */}
          <div className="hidden lg:flex items-center space-x-3">
            <a
              href="https://wa.me/916353818605?text=Hi!%20I%20want%20to%20enquire%20about%20Gujarat%20tourism%20packages."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary hover:bg-secondary-hover text-primary font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-sm hover:scale-105 active:scale-95 flex items-center space-x-1.5 border border-primary/10"
            >
              <span>WhatsApp Inquiry</span>
            </a>
            <Link
              href="/tours"
              className="bg-primary hover:bg-primary-hover text-white font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-md hover:scale-105 active:scale-95"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-150 shadow-inner max-h-[85vh] overflow-y-auto animate-slide-down">
          <div className="px-4 pt-3 pb-6 space-y-2 text-sm font-semibold text-gray-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 border-b border-gray-50 text-gray-800 hover:text-primary transition-colors"
            >
              Home
            </Link>

            {/* Accordion 2: Begin Your Journey */}
            <div className="border-b border-gray-50 py-1">
              <button
                onClick={() => toggleDropdown('m-destinations')}
                className="w-full flex justify-between items-center py-2 text-gray-850 hover:text-primary font-bold text-left"
              >
                <span>Begin Your Journey</span>
                <svg
                  className={`h-4 w-4 transition-transform ${activeDropdown === 'm-destinations' ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'm-destinations' && (
                <div className="pl-2 py-1.5 space-y-1 bg-gray-50/50 rounded-lg mt-1 max-h-[50vh] overflow-y-auto">
                  {destinationCategories.map((category) => {
                    const isSubOpen = activeSubDropdown === category.slug;
                    return (
                      <div key={category.slug} className="border-b border-gray-100/50 last:border-b-0">
                        <button
                          onClick={() => toggleSubDropdown(category.slug)}
                          className="w-full flex justify-between items-center py-2 px-2 text-xs font-bold text-gray-700 hover:text-primary text-left"
                        >
                          <span>{category.name}</span>
                          <svg
                            className={`h-3 w-3 transition-transform ${isSubOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {isSubOpen && (
                          <div className="pl-4 pb-2 space-y-1.5">
                            {category.tours.map((tour, idx) => (
                              <Link
                                key={idx}
                                href={tour.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-1 text-[11px] font-medium text-gray-600 hover:text-primary"
                              >
                                {tour.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              href="/tours"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 border-b border-gray-50 text-gray-800 hover:text-primary transition-colors"
            >
              Tour Packages
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 border-b border-gray-50 text-gray-800 hover:text-primary transition-colors"
            >
              About Us
            </Link>

            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 border-b border-gray-50 text-gray-800 hover:text-primary transition-colors"
            >
              Contact Us
            </Link>

            <div className="pt-4 flex flex-col gap-3">
              <Link
                href="/tours"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-xl transition shadow-md"
              >
                Book Now
              </Link>
              <a
                href="https://wa.me/916353818605?text=Hi!%20I%20want%20to%20enquire%20about%20Gujarat%20tourism%20packages."
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-secondary hover:bg-secondary-hover text-primary font-extrabold py-3 rounded-xl transition shadow-sm border border-primary/10"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
