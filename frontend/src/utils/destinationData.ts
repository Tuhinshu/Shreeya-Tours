export interface TourCategoryItem {
  name: string;
  href: string;
}

export interface DestinationCategory {
  name: string;
  slug: string;
  tours: TourCategoryItem[];
}

export const DESTINATION_CATEGORIES: DestinationCategory[] = [
  {
    name: 'Great Gujarat',
    slug: 'gujarat',
    tours: [
      { name: 'Statue of Unity & Poicha (2 Days)', href: '/tours/gujarat-sou-poicha-1n' },
      { name: 'White Desert Ranotsav (2 Days)', href: '/tours/gujarat-kutch-ranotsav-1n' },
      { name: 'Statue of Unity & Vadodara (3 Days)', href: '/tours/gujarat-sou-vadodara-2n' },
      { name: 'Dwarka & Somnath Darshan (3 Days)', href: '/tours/gujarat-dwarka-somnath-2n' },
      { name: 'Dwarka, Somnath & Gir Safari (4 Days)', href: '/tours/gujarat-dwarka-somnath-gir-3n' },
      { name: 'Statue of Unity, Ahmedabad & Patan (5 Days)', href: '/tours/gujarat-sou-ahmedabad-patan-4n' },
      { name: 'Statue of Unity & Royal Gujarat (7 Days)', href: '/tours/royal-gujarat-heritage' },
      { name: 'Grand Royal Gujarat Odyssey (9 Days)', href: '/tours/gujarat-grand-royal-odyssey-8n' },
    ],
  },
  {
    name: 'Andaman Islands',
    slug: 'andaman',
    tours: [
      { name: 'Scenic Andaman Express (4 Days)', href: '/tours/andaman-express-pb-3n' },
      { name: 'Exotic Andaman Swaraj Escape (5 Days)', href: '/tours/andaman-swaraj-escape-4n' },
      { name: 'Premium Andaman Explorer (6 Days)', href: '/tours/andaman-premium-explorer-5n' },
    ],
  },
  {
    name: 'Goa Beach Tours',
    slug: 'goa',
    tours: [
      { name: 'Goa Beach Romance & Heritage (4 Days)', href: '/tours/goa-beach-romance-3n' },
    ],
  },
  {
    name: 'Karnataka Wonders',
    slug: 'karnataka',
    tours: [
      { name: 'Coorg & Mysore Escapade (5 Days)', href: '/tours/karnataka-wonders-coorg-mysore' },
      { name: 'Mysore & Kabini Wildlife (4 Days)', href: '/tours/karnataka-mysore-kabini-3n' },
      { name: 'Chikmagalur Coffee Escape (4 Days)', href: '/tours/karnataka-chikmagalur-coffee-3n' },
      { name: 'Mysore & Bandipur Tiger Sanctuary (4 Days)', href: '/tours/karnataka-mysore-bandipur-3n' },
      { name: 'Hampi & Badami Ruins Heritage (4 Days)', href: '/tours/karnataka-hampi-badami-3n' },
      { name: 'Hampi, Badami & Dandeli Adventure (5 Days)', href: '/tours/karnataka-hampi-dandeli-5d' },
      { name: 'Coastal Karnataka & Gokarna (6 Days)', href: '/tours/karnataka-coastal-gokarna-5n' },
      { name: 'Complete Wilderness & Coastal (10 Days)', href: '/tours/karnataka-coast-wilderness-9n' },
    ],
  },
  {
    name: 'Kerala Backwaters',
    slug: 'kerala',
    tours: [
      { name: 'Munnar Hills & Kumarakom Lake (5 Days)', href: '/tours/kerala-hills-lake-escape-4n' },
      { name: 'Munnar Hills & Periyar Forest (5 Days)', href: '/tours/kerala-tea-hills-forest-4n' },
      { name: 'Houseboat & Kovalam Beach (5 Days)', href: '/tours/kerala-houseboat-beach-4n' },
      { name: 'Houseboat & Hills Escape (7 Days)', href: '/tours/kerala-houseboat-hills-6n' },
      { name: 'Complete Kerala backwaters & Hills (8 Days)', href: '/tours/complete-kerala-backwater-hills' },
      { name: 'Grand Kerala Backwater & Kovalam (9 Days)', href: '/tours/kerala-grand-backwater-8n' },
    ],
  },
  {
    name: 'Imperial Rajasthan',
    slug: 'rajasthan',
    tours: [
      { name: 'Jodhpur & Jaisalmer Desert Tents (5 Days)', href: '/tours/rajasthan-desert-tents-4n' },
      { name: 'Jaipur, Pushkar & Udaipur (6 Days)', href: '/tours/rajasthan-jaipur-pushkar-udaipur-5n' },
      { name: 'Imperial Rajasthan Forts & Lakes (7 Days)', href: '/tours/imperial-rajasthan-forts-desert' },
    ],
  },
  {
    name: 'Tamil Nadu Heritage',
    slug: 'tamilnadu',
    tours: [
      { name: 'Madurai, Rameswaram & Kanyakumari (5 Days)', href: '/tours/tamilnadu-temple-coast-4n' },
      { name: 'Complete Tamil Nadu Temples (8 Days)', href: '/tours/tamilnadu-grand-temples-7n' },
    ],
  },
  {
    name: 'Himalayan Escapes',
    slug: 'himalayas',
    tours: [
      { name: 'Kashmir Paradise & Dal Lake (5 Days)', href: '/tours/himalayas-kashmir-paradise-4n' },
      { name: 'Ladakh High Passes & Pangong (6 Days)', href: '/tours/himalayas-ladakh-passes-5n' },
      { name: 'Himachal Scenic Escape (Shimla & Manali) (6 Days)', href: '/tours/himalayas-shimla-manali-6d' },
    ],
  },
];
