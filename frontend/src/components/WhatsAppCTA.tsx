'use client';

import React from 'react';
import { SITE_CONFIG } from '@/config/site';

interface WhatsAppCTAProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export default function WhatsAppCTA({
  phoneNumber = SITE_CONFIG.phone,
  defaultMessage = 'Hi! I am interested in booking a tour package.',
}: WhatsAppCTAProps) {
  const encodedText = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center bg-secondary text-primary p-4 rounded-full shadow-2xl hover:bg-secondary-hover transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-secondary/50 group border border-primary/10"
      aria-label="Contact us on WhatsApp"
    >
      {/* WhatsApp Icon */}
      <svg
        className="w-7 h-7 fill-current transition-transform duration-300 group-hover:rotate-6"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.803-4.386 9.807-9.78.002-2.613-1.013-5.071-2.861-6.918C16.374 2.06 13.921.843 11.3.843c-5.41 0-9.813 4.39-9.817 9.784-.002 1.902.5 3.753 1.456 5.378L1.93 21.65l5.882-1.53c1.602-.008 1.637-.01 2.835-.926z" />
      </svg>

      {/* Mini badge / Tooltip on hover */}
      <span className="absolute right-16 scale-0 transition-all rounded bg-gray-900 p-2 text-xs text-white group-hover:scale-100 whitespace-nowrap shadow-lg">
        Chat with us
      </span>
    </a>
  );
}
