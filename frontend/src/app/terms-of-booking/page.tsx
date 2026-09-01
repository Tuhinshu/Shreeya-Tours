import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Booking | Shreeya Tours',
  description: 'Terms and conditions, payment schedules, cancellation policies, and GST invoicing terms for Shreeya Tours travel packages.',
};

export default function TermsOfBookingPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Banner */}
      <section className="relative bg-[#590006] text-white py-16 px-4 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/95 via-[#92000A]/85 to-[#730008]/90 z-0"></div>
        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <span className="inline-block bg-secondary/20 border border-secondary/40 text-secondary text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full">
            Customer Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
            Terms of Booking
          </h1>
          <p className="text-sm text-red-100 max-w-xl mx-auto leading-relaxed">
            Please review the standard terms, payment milestones, cancellation policies, and service guidelines that govern all Shreeya Tours packages.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-8 sm:p-12 space-y-8 text-gray-700 leading-relaxed text-sm">
          
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Last Updated: January 2025</span>
            <h2 className="text-xl font-black text-gray-900 mt-2 uppercase tracking-wide">1. Booking Confirmation & Payment Terms</h2>
            <p className="mt-2">
              All bookings with Shreeya Tours (Ministry Approved Agency, GSTIN: 24AWSPP5907BIZF) are subject to availability at the time of reservation. A booking is considered confirmed only upon receipt of the advance payment and issuance of an official booking voucher.
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li><strong>Advance Deposit:</strong> 30% to 50% of the total tour cost is required at the time of booking to block hotels, permits, and private transport.</li>
              <li><strong>Balance Payment:</strong> The remaining balance must be cleared at least 7 days prior to the date of arrival, or upon check-in on Day 1 (as mutually agreed in your customized voucher).</li>
              <li><strong>Peak Season:</strong> For travel during Diwali, Christmas, New Year, and Rann Utsav peak periods, 100% advance payment may be required as per hotel policies.</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">2. Cancellation & Refund Policy</h2>
            <p className="mt-2">
              If you need to cancel your booked tour, written notification must be sent to our official email (<a href="mailto:shreeyatours19@gmail.com" className="text-primary font-semibold hover:underline">shreeyatours19@gmail.com</a>) or WhatsApp helpline. Cancellation charges are calculated as follows:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-100 font-bold text-gray-900 uppercase">
                  <tr>
                    <th className="p-3 border-b">Notice Period Prior to Travel</th>
                    <th className="p-3 border-b">Cancellation Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-medium">
                  <tr>
                    <td className="p-3">30 days or more before departure</td>
                    <td className="p-3 text-green-700 font-bold">10% service charge + non-refundable ticket fees</td>
                  </tr>
                  <tr>
                    <td className="p-3">15 to 29 days before departure</td>
                    <td className="p-3 text-amber-700 font-bold">30% of total tour package cost</td>
                  </tr>
                  <tr>
                    <td className="p-3">7 to 14 days before departure</td>
                    <td className="p-3 text-orange-700 font-bold">50% of total tour package cost</td>
                  </tr>
                  <tr>
                    <td className="p-3">Less than 7 days or No Show</td>
                    <td className="p-3 text-red-700 font-bold">100% of tour cost (No refund)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              * Note: High-demand permits (e.g., Cellular Jail sound & light show, Sasan Gir safari permits, and cruise transfers in Andaman) are non-refundable per government and cruise operator rules.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">3. GST Compliance & Billing</h2>
            <p className="mt-2">
              In strict accordance with the Central Goods and Services Tax (CGST) and State Goods and Services Tax (SGST) acts:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li>All domestic tour packages include 5% GST (or applicable rate) without input tax credit for pure tour services.</li>
              <li>A digital GST tax invoice will be generated and shared with the traveler upon completion of payment.</li>
              <li>If you require B2B invoicing with Input Tax Credit, valid GSTIN and registered company details must be provided at the time of initial inquiry.</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">4. Transport & Vehicle Usage</h2>
            <p className="mt-2">
              Private air-conditioned vehicles (Swift Dzire, Ertiga, Innova, or Tempo Traveller) are arranged based on party size:
            </p>
            <ul className="list-disc list-inside mt-3 space-y-1.5 pl-2 font-medium">
              <li>Air conditioning will remain active during transit on plains and highways, but will be switched off in steep hill station ascents (e.g., Munnar, Ooty, Shimla) to prevent vehicle engine overheating as per regional transport standards.</li>
              <li>Vehicles are allocated for point-to-point transfers and predetermined sightseeing as outlined in your confirmed itinerary. Extra non-itinerary detours or late-night disposals may incur additional local charges.</li>
              <li>Toll tax, state border road taxes, and driver allowances are included in the package price unless explicitly excluded in your quotation.</li>
            </ul>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">5. Unforeseen Events (Force Majeure)</h2>
            <p className="mt-2">
              Shreeya Tours is not liable for itinerary disruptions, flight delays, ferry cancellations due to cyclonic weather, political strikes, or road blockages caused by landslides. In such events, our 24/7 team will make all reasonable efforts to arrange alternative accommodations or routes, and any supplementary expenses incurred will be payable directly by the traveler.
            </p>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">6. Jurisdiction</h2>
            <p className="mt-2">
              Any dispute, controversy, or claim arising out of or relating to your tour booking shall be governed by the laws of India and subject exclusively to the jurisdiction of the competent courts in <strong>Vadodara, Gujarat</strong>.
            </p>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link href="/" className="text-primary font-bold hover:underline">
              ← Return to Home
            </Link>
            <Link href="/privacy-policy" className="text-primary font-bold hover:underline">
              View Privacy Policy →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
