import { PACKAGES } from '@/data/packages';

export interface TourCategoryItem {
  name: string;
  href: string;
}

export interface DestinationCategory {
  name: string;
  slug: string;
  tours: TourCategoryItem[];
}

const CATEGORY_MAP: { idPrefix: string; name: string; slug: string }[] = [
  { idPrefix: 'gujarat', name: 'Great Gujarat', slug: 'gujarat' },
  { idPrefix: 'andaman', name: 'Andaman Islands', slug: 'andaman' },
  { idPrefix: 'goa', name: 'Goa Beach Tours', slug: 'goa' },
  { idPrefix: 'karnataka', name: 'Karnataka Wonders', slug: 'karnataka' },
  { idPrefix: 'kerala', name: 'Kerala Backwaters', slug: 'kerala' },
  { idPrefix: 'rajasthan', name: 'Imperial Rajasthan', slug: 'rajasthan' },
  { idPrefix: 'tamilnadu', name: 'Tamil Nadu Heritage', slug: 'tamilnadu' },
  { idPrefix: 'himalayas', name: 'Himalayan Escapes', slug: 'himalayas' },
];

/**
 * Dynamically derives destination navigation categories from PACKAGES.
 * Ensures zero stale links and automatic sync when tours are added, renamed, or modified.
 */
export const DESTINATION_CATEGORIES: DestinationCategory[] = CATEGORY_MAP.map((cat) => {
  const matchingTours = PACKAGES.filter((tour) => tour.id.startsWith(cat.idPrefix));
  return {
    name: cat.name,
    slug: cat.slug,
    tours: matchingTours.map((tour) => ({
      name: `${tour.name} (${tour.durationDays} Days)`,
      href: `/tours/${tour.slug}`,
    })),
  };
}).filter((cat) => cat.tours.length > 0);
