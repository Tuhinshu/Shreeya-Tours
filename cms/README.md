# Shreeya Tours & Travels — Sanity CMS Studio

This directory contains the headless Sanity Studio schemas configured for Shreeya Tours.

## Schemas Configured
- `tourPackage.ts`: Tour packages, pricing, durations, categories, highlights, and gallery assets.
- `itinerary.ts`: Day-by-day itinerary with accommodation and meal plans.
- `faq.ts`: Tour FAQ accordion items with JSON-LD schema compatibility.

## Content Management Architecture
The website currently ships with **code-managed content** in `frontend/src/utils/mockData.ts`, enabling zero-cost, blazing-fast static generation without requiring an external paid Sanity subscription during development.

### How to Connect a Live Sanity Project
1. Create a project at [sanity.io/manage](https://www.sanity.io/manage).
2. Copy your Project ID.
3. Create `.env.local` in this folder (`cms/`):
   ```bash
   SANITY_STUDIO_PROJECT_ID="your_real_project_id"
   SANITY_STUDIO_DATASET="production"
   ```
4. Run the Studio locally:
   ```bash
   npm run dev
   ```
5. Deploy the Studio:
   ```bash
   npx sanity deploy
   ```
