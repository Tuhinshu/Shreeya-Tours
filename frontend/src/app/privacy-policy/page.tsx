import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

export const metadata = {
  title: 'Privacy Policy | Shreeya Tours',
  description: 'Understand how Shreeya Tours collects, protects, and manages your personal information when booking tour packages across India.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Banner */}
      <section className="relative bg-[#590006] text-white py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/95 via-[#92000A]/85 to-[#730008]/90 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <span className="inline-block bg-secondary/20 border border-secondary/40 text-secondary text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">
            Legal & Transparency
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-red-100 max-w-xl mx-auto leading-relaxed">
            Your privacy is of paramount importance to Shreeya Tours. This policy outlines our commitment to safeguarding your personal data.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed text-sm">
          
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Effective Date: January 1, 2025</span>
            <h2 className="text-xl font-black text-gray-900 mt-2 uppercase tracking-wide">1. Introduction</h2>
            <p className="mt-2">
              Shreeya Tours (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates domestic tour packages and travel logistics registered at Vadodara, Gujarat (GSTIN: 24AWSPP5907BIZF). This Privacy Policy informs travelers and website visitors about our policies regarding the collection, use, and disclosure of personal data when you interact with our website or book our services.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">2. Information We Collect</h2>
            <p className="mt-2">
              To design customized itineraries and issue official travel vouchers, we may collect the following information:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li><strong>Contact Information:</strong> Full name, email address, WhatsApp/phone number, and billing address.</li>
              <li><strong>Travel Details:</strong> Travel dates, passenger count (PAX), pick-up/drop-off locations, flight/train details, and special dietary/room preferences.</li>
              <li><strong>Identification Documents:</strong> Government-issued photo IDs (Aadhaar, Passport, or Voter ID) strictly required for inner-line permits (e.g., Andaman, Ladakh, Lakshadweep) or hotel check-in compliance.</li>
              <li><strong>Billing & Tax Info:</strong> GST identification number (for corporate or B2B invoicing).</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">3. How We Use Your Data</h2>
            <p className="mt-2">
              We process your personal information strictly for legitimate operational purposes:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li>Issuing hotel reservations, ferry/cruise tickets, and vehicle coordination vouchers.</li>
              <li>Generating GST-compliant tax invoices as mandated by the Government of India.</li>
              <li>Sharing essential transit and safety updates via WhatsApp, SMS, or phone calls during your tour.</li>
              <li>Providing 24/7 on-ground customer helpline support in case of emergencies or route changes.</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">4. Sharing With Third-Party Vendors</h2>
            <p className="mt-2">
              We do <strong>not</strong> sell, rent, or trade your personal information to third-party marketing firms. Information is disclosed solely to verified operational partners directly involved in your journey:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li>Contracted drivers and local vehicle operators for airport transfers and sightseeing.</li>
              <li>Hotels, resorts, and homestays for guest registration.</li>
              <li>Ferry operators (such as Makruzz/Green Ocean in the Andaman Islands) and wildlife safari authorities (e.g., Sasan Gir forest department).</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">5. Data Security</h2>
            <p className="mt-2">
              We employ industry-standard organizational and technological security safeguards to protect your personal details from unauthorized access, alteration, or disclosure. All digital transmissions on our website are protected through Secure Sockets Layer (SSL) encryption.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">6. Contact & Grievance Redressal</h2>
            <p className="mt-2">
              If you have any questions, wish to review or update your personal details, or have concerns regarding this policy, please contact our grievance officer:
            </p>
            <div className="mt-4 bg-gray-50 border border-gray-200 p-5 rounded-xl space-y-1 text-xs font-medium">
              <p className="font-bold text-sm text-gray-900">{SITE_CONFIG.name}</p>
              <p>Email: <a href={SITE_CONFIG.getMailtoUrl()} className="text-primary font-semibold hover:underline">{SITE_CONFIG.email}</a></p>
              <p>Phone: <span className="text-gray-900 font-semibold">+{SITE_CONFIG.phone.replace(/(\d{2})(\d{5})(\d{5})/, '$1 $2 $3')}</span></p>
              <p>Office: A-102, Krishna Empire, Near Yoginagar Township, Opp. Ramakaka Dery, Behind Shell Petrol Pump, Chhani, Vadodara, Gujarat - 391740</p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link href="/" className="text-primary font-bold hover:underline">
              ← Return to Home
            </Link>
            <Link href="/terms-of-booking" className="text-primary font-bold hover:underline">
              View Terms of Booking →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
