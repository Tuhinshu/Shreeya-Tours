'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SITE_CONFIG } from '@/config/site';
import NavDropdown from '@/components/NavDropdown';
import { DESTINATION_CATEGORIES } from '@/utils/destinationData';

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

  return (
    <header className="bg-white text-gray-800 shadow-md sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Logo Branding Area */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Shreeya Tours"
                width={180}
                height={60}
                priority
                className="h-20 w-auto object-contain py-0.5"
              />
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-7">
            <Link href="/" className="text-primary hover:text-primary-hover font-bold text-sm transition-colors duration-200">
              Home
            </Link>

            <NavDropdown
              title="Begin Your Journey"
              categories={DESTINATION_CATEGORIES}
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
              href={SITE_CONFIG.getWhatsAppUrl('Hi! I want to enquire about Gujarat tourism packages.')}
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
                  {DESTINATION_CATEGORIES.map((category) => {
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
                href={SITE_CONFIG.getWhatsAppUrl('Hi! I want to enquire about Gujarat tourism packages.')}
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
