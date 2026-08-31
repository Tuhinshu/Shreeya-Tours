import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { tourPackage } from './schemas/tourPackage';
import { itinerary } from './schemas/itinerary';
import { faq } from './schemas/faq';

export default defineConfig({
  name: 'default',
  title: 'Tours & Travels CMS',

  projectId: 'your-project-id',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: [tourPackage, itinerary, faq],
  },
});
