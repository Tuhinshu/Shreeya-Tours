# Project Rules: Tours & Travels Website

Welcome to the Tours & Travels Website project. This repository contains the mobile-first travel platform tailored for Indian consumers. Below are the rules, technical requirements, and architecture constraints that all agent interactions must adhere to.

---

## 1. Core Technology Stack
All development must use the following stack:
- **Frontend:** Next.js (SEO-friendly Server-Side Rendering/Static Site Generation).
- **Styling:** Tailwind CSS (mobile-first, highly responsive).
- **CMS:** Sanity or Strapi for tour packages, pricing, itineraries, and blog content.
- **Backend:** Node.js + Express for lightweight, secure, and fast API layers.
- **Database:** PostgreSQL (hosted on Supabase) for structured booking and tour data.
- **Authentication:** NextAuth.js for secure session-based authentication.
- **Hosting:** Vercel (frontend) and Supabase (database + auth).
- **Version Control:** GitHub.

---

## 2. Design & Usability Guidelines (Mobile-First)
- **Mobile-First UX:** Since over 70% of the target audience uses mobile devices, all layouts, navigation drawers, and checkouts must be designed and optimized for mobile screens first.
- **WhatsApp Integration:** Prioritize direct WhatsApp communication over complex web forms. Embed the WhatsApp CTA (anchored floating action button on bottom-right for mobile) on every page.
- **Visuals:** Optimize all images/videos using Next.js Image Component (`next/image`) and Cloudinary transformations (lazy-loaded, compressed).

---

## 3. External Integrations & APIs
- **Payment Gateway:** 
  - **CashFree** is the primary payment gateway. It must support India-first payment methods: UPI, Credit/Debit cards, Net Banking.
  - Keep the payment module flexible so that **Razorpay** can be configured as a backup/alternative.
- **Communication APIs:**
  - **WhatsApp API:** WATI or WhatsApp Cloud API for automated confirmations/leads.
  - **Transactional Email:** SendGrid for bookings, invoices, and enquiries.
- **Mapping & Media:**
  - **Google Maps API:** Embed maps for location coverage of Indian destinations.
  - **Cloudinary:** Auto-optimization and delivery of high-res travel photography.
  - **Instagram Basic Display API:** Showcase dynamic social feeds.
- **Trust & Credibility:**
  - **Google Places API:** Embed Google Reviews dynamically.

---

## 4. Invoicing & Compliance
- **GST Invoicing:** Generate GST-compliant invoices for Indian B2C travel bookings. Tax calculations must range dynamically from 5% to 18% based on the booking type.

---

## 5. SEO & Analytics Requirements
- **Structured Data:** Implement JSON-LD schema markup on relevant pages:
  - `TourPackage` schema on Tour Detail pages.
  - `FAQPage` schema on FAQ sections.
  - `Review` schema on testmonials/reviews.
- **Tracking & Analytics:** Implement Google Analytics 4 (GA4) and Hotjar (heatmaps and funnels).
- **SEO & Rankings:** Optimize for high-intent keywords (e.g., "Kerala backwater tour") and verify against Google Search Console / Semrush guidelines.
- **Local SEO:** Integrate Google Business Profile mappings.
