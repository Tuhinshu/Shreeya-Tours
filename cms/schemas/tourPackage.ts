export const tourPackage = {
  name: 'tourPackage',
  title: 'Tour Package',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Package Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'region',
      title: 'Region',
      type: 'string',
      options: {
        list: [
          { title: 'North India', value: 'north_india' },
          { title: 'South India', value: 'south_india' },
          { title: 'East India', value: 'east_india' },
          { title: 'West India', value: 'west_india' },
          { title: 'International', value: 'international' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'tourType',
      title: 'Tour Type',
      type: 'string',
      options: {
        list: [
          { title: 'Cultural & Heritage', value: 'heritage' },
          { title: 'Trekking & Adventure', value: 'adventure' },
          { title: 'Beach & Leisure', value: 'leisure' },
          { title: 'Luxury Tour', value: 'luxury' },
          { title: 'Religious & Pilgrimage', value: 'pilgrimage' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'durationDays',
      title: 'Duration (Days)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'basePrice',
      title: 'Base Price (INR)',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    {
      name: 'gstType',
      title: 'GST Type / Classification',
      type: 'string',
      options: {
        list: [
          { title: 'Standard Tour (5% GST)', value: 'standard_tour' },
          { title: 'Hotel Inclusive (12% GST)', value: 'hotel_inclusive' },
          { title: 'Agent Service / Luxury Custom (18% GST)', value: 'agent_service' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'featuredImage',
      title: 'Featured Image (Cloudinary)',
      type: 'url',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'gallery',
      title: 'Photo Gallery (Cloudinary URLs)',
      type: 'array',
      of: [{ type: 'url' }],
    },
    {
      name: 'inclusions',
      title: 'Inclusions',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'exclusions',
      title: 'Exclusions',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'itinerary',
      title: 'Itinerary Days',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'itineraryDay' }] }],
    },
    {
      name: 'rating',
      title: 'User Rating',
      type: 'number',
      validation: (Rule: any) => Rule.min(1).max(5),
    },
    {
      name: 'reviewsCount',
      title: 'Reviews Count',
      type: 'number',
    }
  ],
};
