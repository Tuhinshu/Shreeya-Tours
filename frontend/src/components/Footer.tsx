import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-red-100 mt-auto border-t border-primary/20">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Agency pitch */}
          <div className="space-y-4">
            <Link href="/" className="inline-block bg-white p-3 rounded-xl shadow-md hover:opacity-95 transition-opacity">
              <img src="/logo.png" alt="Shreeya Tours" className="h-18 w-auto object-contain" />
            </Link>
            <p className="text-xs text-red-200 leading-relaxed">
              Experience the Difference. Explore cultural heritage, adventure routes, pilgrimage tours, and luxury beach holidays across India. Registered with Ministry of Tourism.
            </p>
            <div className="text-xs border border-primary/30 p-2.5 rounded-lg bg-primary/10">
              <span className="flex items-center space-x-1.5 font-bold text-white mb-1">
                <svg className="w-3.5 h-3.5 text-red-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
                <span>GST Registration Details</span>
              </span>
              GSTIN: 24AWSPP5907BIZF<br/>
              Ministry Approved Agency
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/tours" className="hover:text-white transition-colors">Explore Packages</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Enquiries</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-booking" className="hover:text-white transition-colors">Terms of Booking</Link></li>
            </ul>
          </div>

          {/* Core Offerings */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Tour Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tours?type=heritage" className="hover:text-white transition-colors">Cultural & Heritage</Link></li>
              <li><Link href="/tours?type=adventure" className="hover:text-white transition-colors">Trekking & Adventure</Link></li>
              <li><Link href="/tours?type=leisure" className="hover:text-white transition-colors">Beach & Leisure</Link></li>
              <li><Link href="/tours?type=pilgrimage" className="hover:text-white transition-colors">Religious & Pilgrimage</Link></li>
            </ul>
          </div>

          {/* Support & Contacts */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Emergency Support</h4>
            <p className="text-xs text-red-200">
              Active tour helpline available 24/7.
            </p>
            <div className="text-sm space-y-1">
              <p className="flex items-center space-x-2">
                <svg className="w-3.5 h-3.5 text-red-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.44-5.19-3.806-6.633-6.633l1.293-1.03a1.125 1.125 0 00.417-1.173L6.763 2.22a1.125 1.125 0 00-1.091-.852H3.75A2.25 2.25 0 001.5 3.75v3h.75z" />
                </svg>
                <span className="text-white font-semibold">+{SITE_CONFIG.phone.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3')}</span>
              </p>
              <p className="flex items-center space-x-2">
                <svg className="w-3.5 h-3.5 text-red-200 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <span className="text-red-100 hover:text-white">{SITE_CONFIG.email}</span>
              </p>
              <p className="text-xs text-red-200 pt-1 leading-relaxed">
                A-102, Krishna Empire, Near Yoginagar Township, Opp. Ramakaka Dery, Behind Shell Petrol Pump, Chhani, Vadodara - 391740.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary/20 text-center text-xs text-red-200 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Shreeya Tours. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-booking" className="hover:text-white transition-colors">Terms of Booking</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
