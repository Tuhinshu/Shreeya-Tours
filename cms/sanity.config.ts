import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { tourPackage } from './schemas/tourPackage';
import { itinerary } from './schemas/itinerary';
import { faq } from './schemas/faq';

export default defineConfig({
  name: 'default',
  title: 'Tours & Travels CMS',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'shreeya-tours-cms',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool()],

  schema: {
    types: [tourPackage, itinerary, faq],
  },
});
