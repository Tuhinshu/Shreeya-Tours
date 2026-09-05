const { calculateGST } = require('../utils/gstInvoice');

/**
 * Authoritative Server-Side Tour Package Registry
 * Single source of truth for tour definitions, base pricing, and duration.
 */
const PACKAGES = [
  {
    id: "andaman-pb-3n",
    slug: "andaman-express-pb-3n",
    name: "Scenic Andaman Express (Port Blair)",
    basePrice: 11150,
    durationDays: 4,
    region: "east_india"
  },
  {
    id: "andaman-pb-h-n-4n",
    slug: "andaman-swaraj-escape-4n",
    name: "Exotic Andaman Swaraj Escape (Port Blair, Havelock & Neil)",
    basePrice: 14350,
    durationDays: 5,
    region: "east_india"
  },
  {
    id: "andaman-pb-h-n-5n",
    slug: "andaman-premium-explorer-5n",
    name: "Premium Andaman Explorer (Port Blair, Swaraj Dweep & Shaheed Dweep)",
    basePrice: 16520,
    durationDays: 6,
    region: "east_india"
  },
  {
    id: "goa-3n4d",
    slug: "goa-beach-romance-3n",
    name: "Goa Beach Romance & Heritage Getaway",
    basePrice: 9999,
    durationDays: 4,
    region: "west_india"
  },
  {
    id: "gujarat-sou-poicha-1n",
    slug: "gujarat-sou-poicha-1n",
    name: "Statue of Unity & Poicha Day Tour",
    basePrice: 4999,
    durationDays: 2,
    region: "west_india"
  },
  {
    id: "gujarat-kutch-ranotsav-1n",
    slug: "gujarat-kutch-ranotsav-1n",
    name: "White Desert Kutch Ranotsav Getaway",
    basePrice: 5499,
    durationDays: 2,
    region: "west_india"
  },
  {
    id: "gujarat-sou-vadodara-2n",
    slug: "gujarat-sou-vadodara-2n",
    name: "Statue of Unity & Vadodara Weekend Heritage",
    basePrice: 7999,
    durationDays: 3,
    region: "west_india"
  },
  {
    id: "gujarat-dwarka-somnath-2n",
    slug: "gujarat-dwarka-somnath-2n",
    name: "Dwarka & Somnath Jyotirlinga Darshan",
    basePrice: 8999,
    durationDays: 3,
    region: "west_india"
  },
  {
    id: "gujarat-dwarka-somnath-gir-3n",
    slug: "gujarat-dwarka-somnath-gir-3n",
    name: "Dwarka, Somnath & Sasan Gir Wildlife Escape",
    basePrice: 12999,
    durationDays: 4,
    region: "west_india"
  },
  {
    id: "gujarat-sou-ahmedabad-patan-4n",
    slug: "gujarat-sou-ahmedabad-patan-4n",
    name: "Statue of Unity, Ahmedabad & Patan Stepwell Tour",
    basePrice: 15999,
    durationDays: 5,
    region: "west_india"
  },
  {
    id: "gujarat-royal-heritage-6n",
    slug: "royal-gujarat-heritage",
    name: "Statue of Unity & Royal Gujarat Heritage (UNESCO & Pilgrimage)",
    basePrice: 22999,
    durationDays: 7,
    region: "west_india"
  },
  {
    id: "gujarat-grand-royal-odyssey-8n",
    slug: "gujarat-grand-royal-odyssey-8n",
    name: "Grand Royal Gujarat Odyssey (with Diu Beaches & Gir Lion Safari)",
    basePrice: 28999,
    durationDays: 9,
    region: "west_india"
  },
  {
    id: "karnataka-coorg-mysore-4n",
    slug: "karnataka-wonders-coorg-mysore",
    name: "Coorg & Mysore Escapade (Mysore, Coorg & Bangalore)",
    basePrice: 15499,
    durationDays: 5,
    region: "south_india"
  },
  {
    id: "karnataka-mysore-kabini-3n",
    slug: "karnataka-mysore-kabini-3n",
    name: "Mysore & Kabini Wildlife Safari (Kabini Jungle Lodge Loop)",
    basePrice: 13999,
    durationDays: 4,
    region: "south_india"
  },
  {
    id: "karnataka-chikmagalur-3n",
    slug: "karnataka-chikmagalur-coffee-3n",
    name: "Chikmagalur Coffee Estate Escape (Chikmagalur & Hassan)",
    basePrice: 12999,
    durationDays: 4,
    region: "south_india"
  },
  {
    id: "karnataka-mysore-bandipur-3n",
    slug: "karnataka-mysore-bandipur-3n",
    name: "Mysore & Bandipur Tiger Sanctuary Tour",
    basePrice: 13499,
    durationDays: 4,
    region: "south_india"
  },
  {
    id: "karnataka-hampi-badami-3n",
    slug: "karnataka-hampi-badami-3n",
    name: "Hampi & Badami Ruins Heritage (Hubli / Hospet Loop)",
    basePrice: 11999,
    durationDays: 4,
    region: "south_india"
  },
  {
    id: "karnataka-hampi-dandeli-5d",
    slug: "karnataka-hampi-dandeli-5d",
    name: "Hampi, Badami & Dandeli Adventure Tour",
    basePrice: 14999,
    durationDays: 5,
    region: "south_india"
  },
  {
    id: "karnataka-coastal-gokarna-5n",
    slug: "karnataka-coastal-gokarna-5n",
    name: "Coastal Karnataka & Gokarna Beach Tour (Mangalore to Hubli)",
    basePrice: 16999,
    durationDays: 6,
    region: "south_india"
  },
  {
    id: "karnataka-coast-wilderness-9n",
    slug: "karnataka-coast-wilderness-9n",
    name: "Complete Karnataka Wilderness & Coastal Tour (10 Days)",
    basePrice: 29999,
    durationDays: 10,
    region: "south_india"
  },
  {
    id: "kerala-hills-lake-escape-4n",
    slug: "kerala-hills-lake-escape-4n",
    name: "Munnar Hills & Kumarakom Lake Escape",
    basePrice: 14999,
    durationDays: 5,
    region: "south_india"
  },
  {
    id: "kerala-tea-hills-forest-4n",
    slug: "kerala-tea-hills-forest-4n",
    name: "Munnar Tea Hills & Periyar Forest Sanctuary",
    basePrice: 15999,
    durationDays: 5,
    region: "south_india"
  },
  {
    id: "kerala-houseboat-beach-4n",
    slug: "kerala-houseboat-beach-4n",
    name: "Kerala Houseboat Cruise & Kovalam Beach Getaway",
    basePrice: 16999,
    durationDays: 5,
    region: "south_india"
  },
  {
    id: "kerala-houseboat-hills-6n",
    slug: "kerala-houseboat-hills-6n",
    name: "Kerala Houseboat & Hills (Munnar, Thekkady & Alleppey Houseboat)",
    basePrice: 22999,
    durationDays: 7,
    region: "south_india"
  },
  {
    id: "kerala-complete-hills-beach-7n",
    slug: "complete-kerala-backwater-hills",
    name: "Complete Kerala Backwaters, Houseboat & Hills (Munnar, Thekkady, Alleppey & Kovalam)",
    basePrice: 26999,
    durationDays: 8,
    region: "south_india"
  },
  {
    id: "kerala-grand-backwater-8n",
    slug: "kerala-grand-backwater-8n",
    name: "Grand Kerala Backwater & Kovalam beach Retreat (9 Days)",
    basePrice: 28999,
    durationDays: 9,
    region: "south_india"
  },
  {
    id: "rajasthan-jodhpur-jaisalmer-5d",
    slug: "rajasthan-desert-tents-4n",
    name: "Jodhpur & Jaisalmer Desert Tents Explorer",
    basePrice: 14999,
    durationDays: 5,
    region: "west_india"
  },
  {
    id: "rajasthan-jaipur-pushkar-udaipur-5n",
    slug: "rajasthan-jaipur-pushkar-udaipur-5n",
    name: "Jaipur, Pushkar & Udaipur Romantic Gateway",
    basePrice: 18999,
    durationDays: 6,
    region: "west_india"
  },
  {
    id: "rajasthan-jaipur-jodhpur-udaipur-6n",
    slug: "imperial-rajasthan-forts-desert",
    name: "Imperial Rajasthan Forts, Lakes & Palaces (Jaipur, Jodhpur & Udaipur)",
    basePrice: 22999,
    durationDays: 7,
    region: "west_india"
  },
  {
    id: "tamilnadu-madurai-rameswaram-4d",
    slug: "tamilnadu-madurai-rameswaram-3n",
    name: "Madurai & Rameswaram Spiritual Heritage",
    basePrice: 11999,
    durationDays: 4,
    region: "south_india"
  },
  {
    id: "tamilnadu-heritage-temples-6d",
    slug: "tamilnadu-royal-temples-5n",
    name: "Tamil Nadu Royal Temples Heritage (Chennai to Madurai)",
    basePrice: 16999,
    durationDays: 6,
    region: "south_india"
  },
  {
    id: "tamilnadu-ooty-kodaikanal-6d",
    slug: "tamilnadu-ooty-kodaikanal-5n",
    name: "Coimbatore, Ooty & Kodaikanal Hill Retreat",
    basePrice: 15999,
    durationDays: 6,
    region: "south_india"
  },
  {
    id: "himalayas-ladakh-6d",
    slug: "himalayas-ladakh-adventure-6d",
    name: "Leh Ladakh Pangong Lake Adventure",
    basePrice: 24999,
    durationDays: 6,
    region: "north_india"
  },
  {
    id: "himalayas-shimla-manali-6d",
    slug: "himalayas-shimla-manali-6d",
    name: "Himachal Scenic Escape (Shimla & Manali)",
    basePrice: 18999,
    durationDays: 6,
    region: "north_india"
  }
];

function getPackageById(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  return PACKAGES.find(p => p.id.toLowerCase() === cleanId || p.slug.toLowerCase() === cleanId) || null;
}

function getAllPackages() {
  return PACKAGES;
}

function calculatePackageQuote(packageId, pax, state = 'Gujarat', gstType = 'standard_tour') {
  const pkg = getPackageById(packageId);
  if (!pkg) {
    throw new Error(`Invalid package identifier: ${packageId}`);
  }

  const validPax = Math.max(1, parseInt(pax, 10) || 1);
  const baseAmount = pkg.basePrice * validPax;
  const gstBreakdown = calculateGST(baseAmount, gstType, state);

  return {
    packageId: pkg.id,
    packageName: pkg.name,
    basePrice: pkg.basePrice,
    pax: validPax,
    baseAmount: gstBreakdown.baseAmount,
    gstAmount: gstBreakdown.gstAmount,
    gstRate: gstBreakdown.gstRate * 100,
    totalAmount: gstBreakdown.totalAmount,
    taxDetails: gstBreakdown.taxDetails,
    customerState: state,
    officeState: gstBreakdown.officeState,
    invoiceDate: gstBreakdown.invoiceDate
  };
}

module.exports = {
  PACKAGES,
  getPackageById,
  getAllPackages,
  calculatePackageQuote
};
