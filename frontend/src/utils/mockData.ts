export interface ItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
  accommodation?: string;
  mealsProvided?: string[];
}

export interface TourPackage {
  id: string;
  name: string;
  slug: string;
  region: 'north_india' | 'south_india' | 'east_india' | 'west_india' | 'international';
  tourType: 'heritage' | 'adventure' | 'leisure' | 'luxury' | 'pilgrimage';
  durationDays: number;
  basePrice: number;
  featuredImage: string;
  gallery: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  rating: number;
  reviewsCount: number;
}

export const MOCK_TOURS: TourPackage[] = [
  // ==========================================
  // ANDAMAN ISLANDS
  // ==========================================
  {
    id: 'andaman-pb-3n',
    name: 'Scenic Andaman Express (Port Blair)',
    slug: 'andaman-express-pb-3n',
    region: 'east_india',
    tourType: 'leisure',
    durationDays: 4,
    basePrice: 11150,
    featuredImage: 'https://images.unsplash.com/photo-1589392682842-db34c7b65d2b?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589392682842-db34c7b65d2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '3 Nights accommodation in Port Blair in selected base category rooms',
      'Private AC Swift Dzire / Ertiga / Xylo for all transfers and sightseeing',
      'Daily breakfast at hotel',
      'All entry permits, tickets, parking, and boat/ferry tokens to Ross and North Bay'
    ],
    exclusions: [
      'Airfare or Ship tickets to/from Port Blair',
      'Guide at Cellular jail',
      'Optional water sports (Scuba diving, Snorkeling, Sea walk)',
      'Personal expenses, tips, and laundry'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive in Port Blair & Cellular Jail Light Show',
        description: 'On arrival at Port Blair airport, meet our representative and transfer to the hotel. After check-in and relax, proceed to Corbyn’s Cove Beach and the historic Cellular Jail. In the evening, witness the enthralling Light and Sound Show at Cellular Jail.',
        accommodation: 'Mount View Pristine / Hill View / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Ross Island & North Bay Coral Excursion',
        description: 'After breakfast catch a ferry from Andaman Water Sports Complex for Ross Island (historic British capital) and North Bay Island (the Gateway to Port Blair, famous for coral beds, snorkeling, glass bottom boat rides, and scuba).',
        accommodation: 'Mount View Pristine / Hill View / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Port Blair to Baratang Island Day Trip',
        description: 'Early morning expedition to Baratang Island, famous for its natural wonders, dense mangrove creeks, impressive Limestone Caves, and fascinating Mud Volcanoes.',
        accommodation: 'Mount View Pristine / Hill View / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Airport Dropping',
        description: 'Check out of the hotel and transfer to Port Blair airport for your onward flight with wonderful island holiday memories.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 42
  },
  {
    id: 'andaman-pb-h-n-4n',
    name: 'Exotic Andaman Swaraj Escape (Port Blair, Havelock & Neil)',
    slug: 'andaman-swaraj-escape-4n',
    region: 'east_india',
    tourType: 'leisure',
    durationDays: 5,
    basePrice: 14350,
    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473116763269-25541579ffb7?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '4 Nights accommodation (2N Port Blair, 1N Swaraj Dweep / Havelock, 1N Shaheed Dweep / Neil)',
      'Premium cruise transfers (Makruzz / Green Ocean Cruise) for Neil & Havelock',
      'Private AC Swift Dzire / Ertiga / Xylo for all transfers and sightseeing',
      'Daily breakfast at all hotels/resorts',
      'All entry permits, tickets, parking, and boat/ferry tokens'
    ],
    exclusions: [
      'Airfare or Ship tickets to/from Port Blair',
      'Optional water sports (Scuba diving, Snorkeling, Sea walk, Glass bottom boat)',
      'Personal expenses, tips, and laundry'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive in Port Blair & Cellular Jail Light Show',
        description: 'On arrival at Port Blair airport, meet our representative and transfer to the hotel. After check-in and relax, proceed to Corbyn’s Cove Beach and the historic Cellular Jail. In the evening, witness the enthralling Light and Sound Show at Cellular Jail.',
        accommodation: 'Mount View Pristine / Hotel Vedant / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Cruise to Swaraj Dweep (Havelock Island) & Radhanagar Beach',
        description: 'Board the early morning premium cruise to Swaraj Dweep (Havelock Island). Our representative will escort you to check-in at the beach resort. Later, visit the world-famous Radhanagar Beach, rated as one of Asia’s most beautiful beaches, ideal for a tranquil sunset.',
        accommodation: 'Radha Krishna Resort / Eldorado Beach Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Havelock to Shaheed Dweep (Neil Island) Sightseeing',
        description: 'Board the cruise sailing to Neil Island. Check-in to your resort. Proceed to visit the iconic Natural Rock Bridge (Howrah Bridge), Laxmanpur Beach (popular for sunset views), and Bharatpur Beach (famous for shallow waters and water sports).',
        accommodation: 'CS Empire / Lakshmi Continental / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Neil Island to Port Blair & Local Marketing',
        description: 'Have breakfast and board the Green Ocean / Makruzz cruise back to Port Blair. Enjoy the evening free for shopping at Sagarika government emporium for local handicrafts and wood carvings.',
        accommodation: 'Mount View Pristine / Hotel Vedant / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Port Blair Airport Dropping',
        description: 'Check out of the hotel and transfer to Port Blair airport for your onward flight with wonderful island holiday memories.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 154
  },
  {
    id: 'andaman-pb-h-n-5n',
    name: 'Premium Andaman Explorer (Port Blair, Swaraj Dweep & Shaheed Dweep)',
    slug: 'andaman-premium-explorer-5n',
    region: 'east_india',
    tourType: 'leisure',
    durationDays: 6,
    basePrice: 16520,
    featuredImage: 'https://images.unsplash.com/photo-1473116763269-25541579ffb7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1473116763269-25541579ffb7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1589392682842-db34c7b65d2b?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '5 Nights accommodation (3N Port Blair, 1N Swaraj Dweep / Havelock, 1N Shaheed Dweep / Neil)',
      'Premium cruise transfers (Makruzz / Green Ocean Cruise) for Neil & Havelock',
      'Private AC Swift Dzire / Ertiga / Xylo for all transfers and sightseeing',
      'Daily breakfast at all hotels/resorts',
      'All entry permits, tickets, parking, and boat/ferry tokens'
    ],
    exclusions: [
      'Airfare or Ship tickets to/from Port Blair',
      'Optional water sports (Scuba diving, Snorkeling, Sea walk, Glass bottom boat)',
      'Personal expenses, tips, and laundry'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive in Port Blair & Cellular Jail Light Show',
        description: 'On arrival at Port Blair airport, meet our representative and transfer to the hotel. After check-in and relax, proceed to Corbyn’s Cove Beach and the historic Cellular Jail. In the evening, witness the enthralling Light and Sound Show at Cellular Jail.',
        accommodation: 'Mount View Pristine / Hotel Vedant / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Ross Island & North Bay Coral Excursion',
        description: 'After breakfast catch a ferry from Andaman Water Sports Complex for Ross Island (historic British capital) and North Bay Island (Gateway to Port Blair, famous for coral beds, snorkeling, glass bottom boat, and scuba).',
        accommodation: 'Mount View Pristine / Hotel Vedant / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Cruise to Swaraj Dweep (Havelock Island) & Radhanagar Beach',
        description: 'Board the early morning premium cruise to Swaraj Dweep (Havelock Island). Our representative will escort you to check-in at the beach resort. Later, visit the world-famous Radhanagar Beach, rated as one of Asia’s most beautiful beaches, ideal for a tranquil sunset.',
        accommodation: 'Radha Krishna Resort / Eldorado Beach Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Havelock to Shaheed Dweep (Neil Island) Sightseeing',
        description: 'Board the cruise sailing to Neil Island. Check-in to your resort. Proceed to visit the iconic Natural Rock Bridge (Howrah Bridge), Laxmanpur Beach (popular for sunset views), and Bharatpur Beach (famous for shallow waters and water sports).',
        accommodation: 'CS Empire / Lakshmi Continental / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Neil Island to Port Blair & Local Marketing',
        description: 'Have breakfast and board the Green Ocean / Makruzz cruise back to Port Blair. Enjoy the evening free for shopping at Sagarika government emporium for local handicrafts and wood carvings.',
        accommodation: 'Mount View Pristine / Hotel Vedant / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 6,
        title: 'Port Blair Airport Dropping',
        description: 'Check out of the hotel and transfer to Port Blair airport for your onward flight with wonderful island holiday memories.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.9,
    reviewsCount: 98
  },

  // ==========================================
  // GOA
  // ==========================================
  {
    id: 'goa-3n4d',
    name: 'Goa Beach Romance & Heritage Getaway',
    slug: 'goa-beach-romance-3n',
    region: 'west_india',
    tourType: 'leisure',
    durationDays: 4,
    basePrice: 9999,
    featuredImage: 'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506461883276-594a12b11cc3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '3 Nights accommodation in a 3-Star beach-side resort',
      'Daily buffet breakfast',
      'North Goa sightseeing on Private AC Tempo Traveller',
      'South Goa sightseeing on Private AC Tempo Traveller',
      'Extreme South Goa beach-hop on Private AC Tempo Traveller'
    ],
    exclusions: [
      'Airfare or Train tickets to Goa',
      'Mandovi River cruise tickets',
      'Fort Aguada entry fees',
      'Lunch and Dinner meals'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival in Goa & Beach Relaxation',
        description: 'Arrive at Goa Airport or Railway Station. Meet our representative and transfer to your resort. Rest of the day is free to explore the sandy beaches near the resort or relax by the pool.',
        accommodation: 'Resort De Alturas / Ocean Palms Goa / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'North Goa Sightseeing on Private Tempo Traveller',
        description: 'Proceed for a full-day private tour of North Goa. Key attractions include Fort Aguada (scenic views), Sinquerim Dolphin Trip, Baga Beach, Chapora Fort, and Anjuna Beach.',
        accommodation: 'Resort De Alturas / Ocean Palms Goa / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'South Goa Heritage & River Cruise',
        description: 'Explore the culture of South Goa. Visit Old Goa Churches (Basilica of Bom Jesus & Se Cathedral), Spice Plantation (optional lunch), Miramar Beach, and end with a 1-hour Mandovi River Sunset Cruise.',
        accommodation: 'Resort De Alturas / Ocean Palms Goa / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Extreme South Beach Tour & Departure',
        description: 'Discover the gorgeous pristine beaches of extreme South Goa: Cabo de Rama beach, Cola beach, Agonda beach, and Butterfly beach. Later, transfer to airport/station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 112
  },

  // ==========================================
  // GUJARAT
  // ==========================================
  {
    id: 'gujarat-sou-poicha-1n',
    name: 'Statue of Unity & Poicha Day Tour',
    slug: 'gujarat-sou-poicha-1n',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 2,
    basePrice: 4999,
    featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '1 Night accommodation in Vadodara/Kevadia in comfortable 3* hotel',
      'Daily breakfast at hotel',
      'Private AC Sedan for transfers and Statue of Unity sightseeing',
      'Statue of Unity entry tickets and viewing gallery passes'
    ],
    exclusions: [
      'Meals not specified',
      'Camera charges, guide fees',
      'Laser show tickets (can be added optionally)'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Vadodara / Kevadia & Poicha Temple',
        description: 'Arrive at Vadodara, meet our representative and drive to Kevadia. Visit the beautiful Nilkanthdham Swaminarayan Temple at Poicha. Check in at hotel. Overnight in Kevadia / Vadodara.',
        accommodation: 'Hotel Grand Mercure / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Statue of Unity & Departure',
        description: 'Visit the world\'s tallest Statue of Unity, the Valley of Flowers, Museum, and Viewing Gallery. Later transfer to Vadodara airport / railway station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.6,
    reviewsCount: 23
  },
  {
    id: 'gujarat-kutch-ranotsav-1n',
    name: 'White Desert Kutch Ranotsav Getaway',
    slug: 'gujarat-kutch-ranotsav-1n',
    region: 'west_india',
    tourType: 'leisure',
    durationDays: 2,
    basePrice: 5499,
    featuredImage: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '1 Night accommodation in premium Tent/Bhunga at Rann of Kutch',
      'Daily breakfast and traditional dinner',
      'Private AC Sedan for Bhuj to Rann transfers and local sightseeing',
      'All state border permits and toll taxes'
    ],
    exclusions: [
      'Rann Utsav activities like para-motoring, ATV rides',
      'Camera permits',
      'Lunch meals'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Bhuj to Rann of Kutch & Desert Sunset',
        description: 'Arrive at Bhuj, transfer to the Rann of Kutch. Check in at your traditional Tent or Bhunga. Spend the evening experiencing the mesmerizing sunset over the white salt desert of Great Rann.',
        accommodation: 'Ranotsav Tent Resort / Traditional Bhungas',
        mealsProvided: ['Breakfast', 'Dinner']
      },
      {
        dayNumber: 2,
        title: 'Bhuj Local Sightseeing & Departure',
        description: 'After breakfast, drive back to Bhuj. Visit Aina Mahal, Prag Mahal, and Swaminarayan Temple. Later, transfer to Bhuj airport or railway station for your onward journey.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 39
  },
  {
    id: 'gujarat-sou-vadodara-2n',
    name: 'Statue of Unity & Vadodara Weekend Heritage',
    slug: 'gujarat-sou-vadodara-2n',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 3,
    basePrice: 7999,
    featuredImage: 'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '2 Nights accommodation in a premium 3* hotel in Vadodara',
      'Daily breakfast at hotel',
      'Private AC Sedan for transfers and local Vadodara & Kevadia sightseeing',
      'Statue of Unity entry tickets and viewing gallery passes'
    ],
    exclusions: [
      'Monuments entry fees (Laxmi Vilas Palace interior tickets, etc.)',
      'Optional activities and meals'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Vadodara & Laxmi Vilas Palace Tour',
        description: 'Arrive in Vadodara. Meet our chauffeur and transfer to your hotel. Visit the grand Laxmi Vilas Palace (residence of the Gaekwads) and the adjacent Maharaja Fateh Singh Museum. Overnight in Vadodara.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Statue of Unity & Poicha Swaminarayan Temple',
        description: 'Drive to Kevadia to visit the Statue of Unity. Tour the Valley of Flowers, Museum, Exhibition Hall, and watch the evening Laser Show. En-route back, visit Poicha Swaminarayan Mandir.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Vadodara Sightseeing & Departure',
        description: 'Visit Sayaji Baug (Kamati Baug), Baroda Museum & Picture Gallery. Later, transfer to Vadodara Airport or Railway Station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 51
  },
  {
    id: 'gujarat-dwarka-somnath-2n',
    name: 'Dwarka & Somnath Jyotirlinga Darshan',
    slug: 'gujarat-dwarka-somnath-2n',
    region: 'west_india',
    tourType: 'pilgrimage',
    durationDays: 3,
    basePrice: 8999,
    featuredImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '1 Night accommodation in Dwarka, 1 Night in Somnath (Comfortable 3* hotels)',
      'Daily breakfast at hotels',
      'Private AC Sedan for transport starting from Rajkot/Ahmedabad and returning',
      'Ferry crossing tokens to Bet Dwarka'
    ],
    exclusions: [
      'Temple VIP darshan tickets or special pujas',
      'Meals other than breakfast',
      'Tips and driver allowances'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Dwarka & Evening Aarti',
        description: 'Arrive at Rajkot / Dwarka. Check into your hotel. In the evening, attend the majestic Sandhya Aarti at the Dwarkadhish Temple (Jagat Mandir) on the banks of Gomti River. Overnight stay in Dwarka.',
        accommodation: 'Hotel Dwarika Inn / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Bet Dwarka Tour & Drive to Somnath via Porbandar',
        description: 'Visit Bet Dwarka (via ferry), Nageshwar Jyotirlinga, Rukmini Temple, and Gopi Talav. Drive to Somnath. En-route stop at Porbandar to visit Kirti Mandir (birthplace of Mahatma Gandhi). In Somnath, attend the evening temple light show.',
        accommodation: 'The Fern Residency Somnath / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Somnath Temple Darshan & Departure',
        description: 'Early morning prayers at Somnath Jyotirlinga temple. Visit Triveni Sangam, Geeta Mandir, and Bhalka Tirth. Later drive to Rajkot / Ahmedabad for your departure flight / train.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.9,
    reviewsCount: 142
  },
  {
    id: 'gujarat-dwarka-somnath-gir-3n',
    name: 'Dwarka, Somnath & Sasan Gir Wildlife Escape',
    slug: 'gujarat-dwarka-somnath-gir-3n',
    region: 'west_india',
    tourType: 'pilgrimage',
    durationDays: 4,
    basePrice: 12999,
    featuredImage: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights stay (1N Dwarka, 1N Somnath, 1N Sasan Gir Wildlife Resort)',
      'Daily breakfast at all hotels/resorts',
      'Private AC Sedan for transfers and temple visits',
      'Ferry charges to Bet Dwarka'
    ],
    exclusions: [
      'Sasan Gir safari booking charges (must be booked online in advance)',
      'Monuments entry fees',
      'Meals other than breakfast'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Dwarka & Temple Visit',
        description: 'Arrive at Rajkot / Ahmedabad and drive to Dwarka. Check-in to hotel. Spend the evening visiting Dwarkadhish temple and exploring the holy ghats of Gomti River. Overnight stay in Dwarka.',
        accommodation: 'Hotel Dwarika Inn / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Bet Dwarka & Nageshwar to Somnath Drive',
        description: 'Take a ferry ride to Bet Dwarka. Visit Nageshwar Jyotirlinga, Gopi Talav, and Rukmini Temple. Later, drive to Somnath via Porbandar (visit Kirti Mandir). Visit Somnath temple and watch the light show. Overnight in Somnath.',
        accommodation: 'The Fern Residency Somnath / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Somnath to Sasan Gir Forest Transfer & Safari',
        description: 'Drive to Sasan Gir, the last home of the Asiatic Lions. In the afternoon, enjoy a thrilling Jeep Safari (optional, subject to permit availability) in Gir National Park. Overnight stay at wildlife resort in Gir.',
        accommodation: 'Gir Jungle Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Gir to Rajkot / Ahmedabad Departure',
        description: 'After a relaxed breakfast, check out and drive back to Rajkot or Ahmedabad for your onward return journey.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 65
  },
  {
    id: 'gujarat-sou-ahmedabad-patan-4n',
    name: 'Statue of Unity, Ahmedabad & Patan Stepwell Tour',
    slug: 'gujarat-sou-ahmedabad-patan-4n',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 5,
    basePrice: 15999,
    featuredImage: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (2N Vadodara, 2N Ahmedabad in 3-Star hotels)',
      'Daily breakfast buffet',
      'Private AC Sedan for transfers and sightseeing tours',
      'Statue of Unity entry passes and viewing gallery tickets',
      'All toll taxes, state permits, and driver allowances'
    ],
    exclusions: [
      'Flights/trains to Vadodara or Ahmedabad',
      'Monuments entry fees and camera charges',
      'Lunch and Dinner meals'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival in Vadodara & Laxmi Vilas Palace',
        description: 'Arrive in Vadodara. Transfer to your hotel. Visit the grand Laxmi Vilas Palace, residence of the royal Gaekwad family, and the adjacent Maharaja Fateh Singh Museum. Overnight in Vadodara.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Statue of Unity & Poicha Swaminarayan Temple',
        description: 'Drive to Kevadia to visit the Statue of Unity (world\'s tallest statue). Tour the Valley of Flowers, Museum, Exhibition Hall, and watch the evening Laser Show. En-route, visit Poicha Swaminarayan Mandir.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Champaner Heritage & Ahmedabad Transfer',
        description: 'Drive to Ahmedabad. En-route, visit Champaner-Pavagadh Archaeological Park (UNESCO World Heritage Site), Dakor Ranchhodray Temple, and Anand Amul Dairy. Overnight in Ahmedabad.',
        accommodation: 'Hyatt Regency Ahmedabad / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Rani ki Vav, Sun Temple & Patan Heritage',
        description: 'Drive to Patan to see the majestic Rani ki Vav (UNESCO stepwell) and the Sun Temple of Modhera. Return to Ahmedabad for overnight stay.',
        accommodation: 'Hyatt Regency Ahmedabad / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Ahmedabad Local Sightseeing & Departure',
        description: 'Visit Sabarmati Ashram, Adalaj Stepwell, and Jhulta Minar. Later, transfer to Ahmedabad airport / railway station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 44
  },
  {
    id: 'gujarat-royal-heritage-6n',
    name: 'Statue of Unity & Royal Gujarat Heritage (UNESCO & Pilgrimage)',
    slug: 'royal-gujarat-heritage',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 7,
    basePrice: 22999,
    featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=800&q=80',
    ],
    inclusions: [
      '6 Nights accommodation in premium 3* and heritage stays (2N Vadodara, 1N Ahmedabad, 2N Dwarka, 1N Somnath)',
      'Daily buffet breakfast',
      'Private AC Sedan for transfers and sightseeing',
      'Statue of Unity entry passes and viewing gallery tickets',
      'All toll taxes, state permits, and driver allowances'
    ],
    exclusions: [
      'Flights/trains to Vadodara or Ahmedabad',
      'Sasan Gir safari booking charges',
      'Monuments entry fees and camera charges',
      'Lunch and Dinner meals'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrival in Vadodara & Laxmi Vilas Palace',
        description: 'Arrive in Vadodara. Transfer to your hotel. Visit the grand Laxmi Vilas Palace, residence of the royal Gaekwad family, and the adjacent Maharaja Fateh Singh Museum.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Statue of Unity & Poicha Swaminarayan Temple',
        description: 'Drive to Kevadia to visit the Statue of Unity (world\'s tallest statue). Tour the Valley of Flowers, Museum, Exhibition Hall, and watch the evening Laser Show. En-route, visit Poicha Swaminarayan Mandir.',
        accommodation: 'Grand Mercure Vadodara / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Champaner Heritage & Ahmedabad Transfer',
        description: 'Drive to Ahmedabad. En-route, visit Champaner-Pavagadh Archaeological Park (UNESCO World Heritage Site), Dakor Ranchhodray Temple, and Anand Amul Dairy.',
        accommodation: 'Hyatt Regency Ahmedabad / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Rani ki Vav, Sun Temple & Dwarka Journey',
        description: 'Drive to Dwarka. En-route, stop in Patan to see the majestic Rani ki Vav (UNESCO stepwell) and the Sun Temple of Modhera. Reach Dwarka in the evening.',
        accommodation: 'Hotel Dwarika Inn / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Dwarka, Bet Dwarka & Jyotirlinga Tour',
        description: 'Spend the day in Dwarka. Visit Dwarkadhish Temple, take a ferry to Bet Dwarka, see Nageshwar Jyotirlinga, Gopi Talav, and Rukmini Temple.',
        accommodation: 'Hotel Dwarika Inn / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 6,
        title: 'Dwarka to Somnath via Porbandar',
        description: 'Drive to Somnath. Stop at Porbandar to visit Kirti Mandir (birthplace of Mahatma Gandhi). In Somnath, visit the holy Jyotirlinga temple and watch the light show.',
        accommodation: 'The Fern Residency Somnath / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 7,
        title: 'Somnath to Ahmedabad / Rajkot Departure',
        description: 'After a morning temple visit, check out of your hotel and transfer back to Ahmedabad / Rajkot for your onward departure flight / train.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.9,
    reviewsCount: 89
  },
  {
    id: 'gujarat-grand-royal-odyssey-8n',
    name: 'Grand Royal Gujarat Odyssey (with Diu Beaches & Gir Lion Safari)',
    slug: 'gujarat-grand-royal-odyssey-8n',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 9,
    basePrice: 28999,
    featuredImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '8 Nights stay in premium 3*/4* hotels (2N Vadodara, 1N Ahmedabad, 2N Dwarka, 1N Somnath, 1N Diu, 1N Sasan Gir)',
      'Daily breakfast at all hotels/resorts',
      'Private AC Sedan for the entire loop tour',
      'Statue of Unity viewing gallery entry tickets',
      'Diu beach visit & Gir safari transfer facilitation'
    ],
    exclusions: [
      'Flights/trains to Vadodara or Ahmedabad',
      'Gir safari permit costs (must be booked online)',
      'Meals not specified'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrival Vadodara & Laxmi Vilas Palace', description: 'Arrive Vadodara. Meet driver and transfer to hotel. Visit Laxmi Vilas Palace.', accommodation: 'Grand Mercure Vadodara / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Statue of Unity & Poicha Swaminarayan Mandir', description: 'Explore Statue of Unity and watch the light show. Visit Poicha Swaminarayan Mandir.', accommodation: 'Grand Mercure Vadodara / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Champaner Heritage & Ahmedabad Transfer', description: 'Drive to Ahmedabad. Visit Champaner-Pavagadh archaeological site.', accommodation: 'Hyatt Regency Ahmedabad / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Sun Temple & Rani ki Vav to Dwarka Drive', description: 'Drive to Patan (Rani ki Vav) and Modhera Sun Temple. Continue driving to Dwarka.', accommodation: 'Hotel Dwarika Inn / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Dwarka & Bet Dwarka Pilgrimage', description: 'Visit Dwarkadhish temple, Bet Dwarka (by ferry), and Nageshwar Jyotirlinga.', accommodation: 'Hotel Dwarika Inn / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Dwarka to Somnath via Porbandar', description: 'Drive to Somnath. Visit Gandhiji\'s birthplace at Porbandar. Visit Somnath temple light show.', accommodation: 'The Fern Residency Somnath / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 7, title: 'Somnath to Diu Beach Resort Transfer', description: 'Drive to Diu. Check in at beach resort. Visit Naida Caves, Diu Fort, and Nagoa Beach.', accommodation: 'Diu Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 8, title: 'Diu to Sasan Gir Tiger & Lion Sanctuary', description: 'Drive to Sasan Gir Forest. Participate in afternoon Jeep Safari in the reserve.', accommodation: 'Gir Jungle Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 9, title: 'Gir to Ahmedabad / Rajkot Departure', description: 'Check out and drive back to Ahmedabad/Rajkot for your flight / train departure.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.9,
    reviewsCount: 77
  },

  // ==========================================
  // KARNATAKA
  // ==========================================
  {
    id: 'karnataka-coorg-mysore-4n',
    name: 'Coorg & Mysore Escapade (Mysore, Coorg & Bangalore)',
    slug: 'karnataka-wonders-coorg-mysore',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 5,
    basePrice: 15499,
    featuredImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '4 Nights accommodation in 3* hotels & hill resorts (1N Mysore, 2N Coorg, 1N Bangalore)',
      'Daily breakfast buffet',
      'Private AC Sedan for the entire tour and transfers from Bangalore',
      'All driver allowances, tolls, and state permit charges'
    ],
    exclusions: [
      'Airfare or Train tickets to Bangalore',
      'Entry fees at monuments and camera fees',
      'Personal expenses (tips, laundry, drinks)'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Bangalore Arrival & Drive to Mysore',
        description: 'Arrive at Bangalore airport/station, meet your chauffeur and proceed to Mysore. Visit the famous Mysore Maharaja’s Palace. In the evening, enjoy the light and music show at Brindavan Gardens.',
        accommodation: 'Hotel Grand Maurya Mysore / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Mysore to Coorg via Bylekuppe Golden Temple',
        description: 'Check out of the hotel and drive to Coorg. En-route, visit the famous Buddhist Monastery and the Golden Buddha Temple located in Bylekuppe.',
        accommodation: 'Coorg Cliff Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Coorg Sightseeing & Waterfalls',
        description: 'Enjoy a full-day sightseeing tour of Coorg. Visit Bhagamandala (confluence of rivers), Omkareshwara Temple, Madikeri Fort, Abbey Falls, and the scenic Raja\'s Seat.',
        accommodation: 'Coorg Cliff Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Coorg to Bangalore City Tour',
        description: 'Drive back to Bangalore. Check-in to your hotel. Later, enjoy a city tour of Bangalore visiting Vidhana Soudha, Lalbagh Botanical Garden, and Tipu Sultan’s Summer Palace.',
        accommodation: 'The Pride Hotel Bangalore / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Depart Bangalore',
        description: 'Enjoy breakfast. Time free for leisure or shopping. Check out by noon and transfer to Bangalore Airport or Railway Station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.6,
    reviewsCount: 96
  },
  {
    id: 'karnataka-mysore-kabini-3n',
    name: 'Mysore & Kabini Wildlife Safari (Kabini Jungle Lodge Loop)',
    slug: 'karnataka-mysore-kabini-3n',
    region: 'south_india',
    tourType: 'adventure',
    durationDays: 4,
    basePrice: 13999,
    featuredImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights stay (1N Mysore in comfortable 3* hotel, 2N Kabini jungle resort)',
      'Daily breakfast at hotels, lunch & dinner included at Kabini resort',
      'Private AC Sedan for transfers from Bangalore/Mysore'
    ],
    exclusions: [
      'Kabini Jungle Safari (boat safari or jeep safari) charges',
      'Monument entry charges'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Bangalore to Mysore & Palace Visit',
        description: 'Arrive Bangalore, transfer to Mysore. Check in. Visit Mysore Palace and Brindavan Gardens (Sound & Light show). Overnight in Mysore.',
        accommodation: 'Hotel Grand Maurya / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Mysore to Kabini Forest Resort',
        description: 'Drive to Kabini in the morning. Check in. Afternoon options for jungle canter safari (optional). Overnight in Kabini resort.',
        accommodation: 'Kabini River Lodge / Similar',
        mealsProvided: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        dayNumber: 3,
        title: 'Kabini Jungle Boating Safari',
        description: 'Early morning Boat Safari on Kabini River to spot wild elephants, crocodiles, and exotic birds. Day free for resort activities. Overnight in Kabini.',
        accommodation: 'Kabini River Lodge / Similar',
        mealsProvided: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        dayNumber: 4,
        title: 'Kabini to Bangalore Departure',
        description: 'Check out after breakfast and drive back to Bangalore for your departure airport / railway station dropping.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 54
  },
  {
    id: 'karnataka-chikmagalur-3n',
    name: 'Chikmagalur Coffee Estate Escape (Chikmagalur & Hassan)',
    slug: 'karnataka-chikmagalur-coffee-3n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 4,
    basePrice: 12999,
    featuredImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights stay (1N Hassan, 2N Chikmagalur coffee resort)',
      'Daily breakfast at hotels',
      'Private AC Sedan for transfers and Mullayanagiri hills tour'
    ],
    exclusions: [
      'Monuments entry fee at Belur / Halebidu temples',
      'Personal tour guide'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Bangalore to Hassan via Shravanabelagola',
        description: 'Arrive Bangalore, meet driver and drive to Hassan. En-route visit Shravanabelagola Jain temple. Check in at Hassan. Overnight stay.',
        accommodation: 'Hassan Gateway Hotel / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Hassan to Chikmagalur via Belur & Halebidu temples',
        description: 'Check out, visit Belur Chennakesava Temple and Halebidu Hoysaleswara Temple. Drive to Chikmagalur and check in. Overnight stay.',
        accommodation: 'Chikmagalur Coffee Valley Resort',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Mullayanagiri Peak & Coffee Estate Walk',
        description: 'Visit Mullayanagiri Peak (highest in Karnataka), Baba Budangiri Hills, and take a guided walk in a lush green coffee estate. Overnight in Chikmagalur.',
        accommodation: 'Chikmagalur Coffee Valley Resort',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Chikmagalur to Bangalore Drop',
        description: 'After breakfast, check out and drive back to Bangalore railway station / airport for dropping.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 38
  },
  {
    id: 'karnataka-mysore-bandipur-3n',
    name: 'Mysore & Bandipur Tiger Sanctuary Tour',
    slug: 'karnataka-mysore-bandipur-3n',
    region: 'south_india',
    tourType: 'adventure',
    durationDays: 4,
    basePrice: 13499,
    featuredImage: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights stay (1N Mysore, 2N Bandipur Wildlife Lodge)',
      'Daily breakfast, lunch & dinner included at Bandipur',
      'Private AC Sedan for Bangalore-Mysore-Bandipur-Bangalore route'
    ],
    exclusions: [
      'Bandipur Tiger reserve safari fee',
      'Camera fee'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Bangalore to Mysore Palace Tour', description: 'Arrive Bangalore, transfer to Mysore. Visit Palace and Brindavan Gardens.', accommodation: 'Hotel Grand Maurya / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Mysore to Bandipur Jungle Drive', description: 'Drive to Bandipur Tiger reserve. Afternoon safari. Overnight in Bandipur.', accommodation: 'Bandipur Safari Resort / Similar', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 3, title: 'Bandipur Forest Lodge Experience', description: 'Relax at resort, take morning and evening forest walks or safari. Overnight in Bandipur.', accommodation: 'Bandipur Safari Resort / Similar', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 4, title: 'Bandipur to Bangalore Departure', description: 'Drive back to Bangalore and drop at airport/station.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.5,
    reviewsCount: 29
  },
  {
    id: 'karnataka-hampi-badami-3n',
    name: 'Hampi & Badami Ruins Heritage (Hubli / Hospet Loop)',
    slug: 'karnataka-hampi-badami-3n',
    region: 'south_india',
    tourType: 'heritage',
    durationDays: 4,
    basePrice: 11999,
    featuredImage: 'https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights accommodation (2N Hospet/Hampi, 1N Badami in 3* hotels)',
      'Daily breakfast at hotel',
      'Private AC Sedan for Hubli-Hospet-Badami loop'
    ],
    exclusions: [
      'Monuments entry fees at Hampi ruins and Badami Caves',
      'Local guide charges'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Hubli to Hospet & Anegundi',
        description: 'Arrive Hubli, drive to Hospet. Visit Anegundi (historic Vijayanagara capital) and Anjanadri Hill (Lord Hanuman birthplace). Overnight stay in Hospet.',
        accommodation: 'Hotel Malligi Hospet / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Full Day Hampi Ruins Sightseeing',
        description: 'Full-day tour of UNESCO site Hampi: Virupaksha Temple, Stone Chariot at Vittala Temple, King\'s Balance, Queen\'s Bath, and Lotus Mahal. Overnight in Hospet.',
        accommodation: 'Hotel Malligi Hospet / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Hospet to Badami Caves',
        description: 'Drive to Badami. Visit the famous Rock-cut Cave Temples of Badami, Bhutanatha Temples, and Badami Fort. Overnight in Badami.',
        accommodation: 'Hotel Badami Court / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Badami to Hubli Departure',
        description: 'After breakfast, check out and transfer to Hubli airport/railway station for onward journey.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 57
  },
  {
    id: 'karnataka-hampi-dandeli-5d',
    name: 'Hampi, Badami & Dandeli Adventure Tour',
    slug: 'karnataka-hampi-dandeli-5d',
    region: 'south_india',
    tourType: 'adventure',
    durationDays: 5,
    basePrice: 14999,
    featuredImage: 'https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (2N Hospet, 1N Badami, 1N Dandeli river resort)',
      'Daily breakfast at hotels, lunch and dinner included in Dandeli',
      'Private AC Sedan for all transfers and tours'
    ],
    exclusions: [
      'Water rafting or zipline activity charges in Dandeli',
      'Monument tickets'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Hubli to Hospet Anegundi Tour', description: 'Arrive Hubli, transfer to Hospet. Visit Anjanadri hill. Overnight in Hospet.', accommodation: 'Hotel Malligi / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Hampi Heritage Tour', description: 'UNESCO ruins tour: Vittala temple, Virupaksha temple, Lotus Mahal. Overnight in Hospet.', accommodation: 'Hotel Malligi / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Hospet to Badami Caves', description: 'Drive to Badami, visit Badami Cave temples and Pattadakal ruins. Overnight in Badami.', accommodation: 'Hotel Badami Court / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Badami to Dandeli River Resort', description: 'Drive to Dandeli. Check in at jungle camp on Kali River. Afternoon river safari. Overnight in Dandeli.', accommodation: 'Dandeli Jungle Camp / Similar', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 5, title: 'Dandeli to Hubli Departure', description: 'Enjoy morning jungle activities, check out and drive back to Hubli for dropping.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.7,
    reviewsCount: 41
  },
  {
    id: 'karnataka-coastal-gokarna-5n',
    name: 'Coastal Karnataka & Gokarna Beach Tour (Mangalore to Hubli)',
    slug: 'karnataka-coastal-gokarna-5n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 6,
    basePrice: 16999,
    featuredImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights stay (1N Mangalore, 1N Udupi, 1N Murudeshwara, 2N Gokarna in 3* properties)',
      'Daily breakfast at hotels',
      'Private AC Sedan for coastal highway tour from Mangalore to Hubli'
    ],
    exclusions: [
      'Temple special queue tickets',
      'Meals not specified'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrive Mangalore & Sightseeing', description: 'Arrive Mangalore, check in. Visit Kadri Manjunath temple, Mangaladevi temple, and Panambur beach.', accommodation: 'Hotel Ocean Pearl / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Mangalore to Udupi & Malpe Beach', description: 'Drive to Udupi. Visit Sri Krishna Temple, St. Mary\'s Island, and Malpe beach. Overnight in Udupi.', accommodation: 'Hotel Kediyoor / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Udupi to Murudeshwara (Giant Shiva Temple)', description: 'Drive to Murudeshwara. Visit the famous Murudeshwara temple on beach, containing the world\'s second-tallest Shiva statue.', accommodation: 'Murudeshwara Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Murudeshwara to Gokarna Temple & Beaches', description: 'Drive to Gokarna. Check in. Visit Mahabaleshwar Temple (Atmalinga) and Kudle beach.', accommodation: 'Gokarna Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Gokarna Beach Hopping Day', description: 'Spend the day hopping popular Gokarna beaches: Om Beach (shaped like Om), Half Moon Beach, and Paradise Beach.', accommodation: 'Gokarna Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Gokarna to Hubli Departure', description: 'Check out and drive to Hubli airport/railway station for your onward return journey.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.8,
    reviewsCount: 63
  },
  {
    id: 'karnataka-coast-wilderness-9n',
    name: 'Complete Karnataka Wilderness & Coastal Tour (10 Days)',
    slug: 'karnataka-coast-wilderness-9n',
    region: 'south_india',
    tourType: 'adventure',
    durationDays: 10,
    basePrice: 29999,
    featuredImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '9 Nights stay (2N Hospet/Hampi, 1N Badami, 1N Dandeli, 1N Karwar, 1N Murudeshwara, 1N Udupi, 2N Mangalore)',
      'Daily breakfast at hotels, lunch and dinner included in Dandeli',
      'Private AC Sedan for the complete 10-day tour starting from Hubli and returning'
    ],
    exclusions: [
      'Airfare or train tickets',
      'Activity charges like rafting, jeep safari, temple special entry'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrive Hubli & Drive to Hospet', description: 'Meet chauffeur at Hubli, drive to Hospet. Check in.', accommodation: 'Hotel Malligi / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Hampi UNESCO Ruins Sightseeing', description: 'Explore Stone Chariot, Virupaksha temple, Elephant Stables.', accommodation: 'Hotel Malligi / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Hospet to Badami Caves', description: 'Drive to Badami. Visit Cave temples, Bhutanatha temple, and Pattadakal.', accommodation: 'Hotel Badami Court / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Badami to Dandeli River Resort', description: 'Drive to Dandeli. Check in at jungle resort. Enjoy Kali river boating.', accommodation: 'Dandeli Jungle Resort / Similar', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 5, title: 'Dandeli to Karwar Beaches', description: 'Check out and drive to Karwar. Visit Devbagh Beach and Sadashivgad Fort.', accommodation: 'Karwar Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Karwar to Murudeshwara Temple', description: 'Drive to Murudeshwara. Visit giant Shiva statue and beach.', accommodation: 'Murudeshwara Beach Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 7, title: 'Murudeshwara to Udupi Temple & Beach', description: 'Drive to Udupi. Visit Krishna temple and Malpe beach.', accommodation: 'Hotel Kediyoor / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 8, title: 'Udupi to Mangalore City Tour', description: 'Drive to Mangalore. Visit local temples and beaches.', accommodation: 'Hotel Ocean Pearl / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 9, title: 'Kukke Subramanya Day Excursion', description: 'Take day trip to holy Kukke Subramanya & Dharmastala temples.', accommodation: 'Hotel Ocean Pearl / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 10, title: 'Mangalore Departure', description: 'Check out and transfer to Mangalore airport/railway station for departure.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.9,
    reviewsCount: 34
  },

  // ==========================================
  // KERALA
  // ==========================================
  {
    id: 'kerala-hills-lake-escape-4n',
    name: 'Munnar Hills & Kumarakom Lake Escape',
    slug: 'kerala-hills-lake-escape-4n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 5,
    basePrice: 14999,
    featuredImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (2N Munnar, 1N Kumarakom, 1N Cochin in comfortable 3* hotels)',
      'Daily breakfast at all hotels/resorts',
      'Private AC Sedan for transfers and Cochin sightseeing'
    ],
    exclusions: [
      'Houseboat cruise (can be added optionally)',
      'Personal expenses'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Cochin & Drive to Munnar Hills',
        description: 'Arrive Cochin airport/station, drive up the mountain highway to Munnar, passing beautiful waterfalls. Check in. Overnight in Munnar.',
        accommodation: 'Grand Plaza Munnar / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Munnar Tea Hills Tour',
        description: 'Visit Eravikulam National Park (to see the Nilgiri Tahr), Mattupetty Dam, Echo Point, Tea Museum, and Munnar market. Overnight in Munnar.',
        accommodation: 'Grand Plaza Munnar / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Munnar to Kumarakom Lake Resort',
        description: 'Drive to Kumarakom, check into your lake-front resort. Spend the day enjoying resort activities on Vembanad Lake. Overnight in Kumarakom.',
        accommodation: 'Kumarakom Lake Resort / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Kumarakom to Cochin City Tour',
        description: 'Drive back to Cochin. Enjoy a city tour: Fort Cochin, Dutch Palace, Jewish Synagogue, and Chinese Fishing Nets. Overnight in Cochin.',
        accommodation: 'Dutch Bungalow Cochin / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Cochin Departure',
        description: 'After breakfast check out and transfer to Cochin airport/station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.7,
    reviewsCount: 31
  },
  {
    id: 'kerala-tea-hills-forest-4n',
    name: 'Munnar Tea Hills & Periyar Forest Sanctuary',
    slug: 'kerala-tea-hills-forest-4n',
    region: 'south_india',
    tourType: 'adventure',
    durationDays: 5,
    basePrice: 15999,
    featuredImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (2N Munnar, 1N Thekkady, 1N Kumarakom/Cochin)',
      'Daily breakfast at all hotels/resorts',
      'Private AC Sedan for transfers and spice plantation visits'
    ],
    exclusions: [
      'Periyar Lake boating safari tickets',
      'Kathakali / Kalaripayattu show entry'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Cochin to Munnar Drive', description: 'Arrive Cochin, drive to Munnar. Overnights stay.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Munnar Local Sightseeing', description: 'Visit Eravikulam National Park, tea museum, and Mattupetty dam. Overnight in Munnar.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Munnar to Thekkady (Periyar Forest)', description: 'Drive to Thekkady. Visit spice plantations and tribal museum. Boating on Periyar Lake. Overnight in Thekkady.', accommodation: 'Elephant Court Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Thekkady to Kumarakom Lake Resort', description: 'Drive to Kumarakom. Check in. Free day for relaxation or boating. Overnight in Kumarakom.', accommodation: 'Kumarakom Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Kumarakom to Cochin Departure', description: 'Check out and transfer to Cochin rail station / airport.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.6,
    reviewsCount: 22
  },
  {
    id: 'kerala-houseboat-beach-4n',
    name: 'Kerala Houseboat Cruise & Kovalam Beach Getaway',
    slug: 'kerala-houseboat-beach-4n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 5,
    basePrice: 16999,
    featuredImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (1N Kumarakom, 1N Private Premium Houseboat in Alleppey, 2N Kovalam beach resort)',
      'All meals (lunch, dinner, breakfast) included on Houseboat stay',
      'Daily breakfast at other hotels/resorts',
      'Private AC Sedan for transfers from Cochin to Trivandrum'
    ],
    exclusions: [
      'Optional sightseeing activities',
      'Tips and porterage'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Cochin to Kumarakom Lake Resort', description: 'Arrive Cochin, transfer to Kumarakom. Resort overnight stay.', accommodation: 'Kumarakom Lake Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Alleppey Private Houseboat Cruise', description: 'Transfer to Alleppey. Board your private houseboat at noon. Cruise the backwaters of Vembanad Lake. Overnight on Houseboat.', accommodation: 'Premium Alleppey Houseboat', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 3, title: 'Houseboat to Kovalam Beach Transfer', description: 'Disembark at Alleppey, drive to Kovalam beach town. Check in. Overnight stay in Kovalam.', accommodation: 'Soma Palmshore Kovalam / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Kovalam Beach Relaxation Day', description: 'Free day to explore or relax on the pristine Kovalam Lighthouse and Hawa beaches. Overnight in Kovalam.', accommodation: 'Soma Palmshore Kovalam / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Kovalam to Trivandrum Departure', description: 'Check out and transfer to Trivandrum Airport / Railway Station for dropping.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.8,
    reviewsCount: 74
  },
  {
    id: 'kerala-houseboat-hills-6n',
    name: 'Kerala Houseboat & Hills (Munnar, Thekkady & Alleppey Houseboat)',
    slug: 'kerala-houseboat-hills-6n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 7,
    basePrice: 22999,
    featuredImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '6 Nights stay (1N Cochin, 2N Munnar, 1N Thekkady, 1N Private Houseboat in Alleppey, 1N Cochin)',
      'All meals on Houseboat, daily breakfast at other hotels',
      'Private AC Sedan for transfers and Munnar & Fort Cochin tours',
      'Spice plantation entry tickets'
    ],
    exclusions: [
      'Airfare or train tickets',
      'Kathakali show tickets',
      'Meals not specified'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrive Cochin', description: 'Arrive Cochin, check in. Fort Cochin tour.', accommodation: 'Dutch Bungalow Cochin / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Cochin to Munnar Hills', description: 'Drive to Munnar, enjoy Cheeyappara waterfalls on the way.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Munnar Sightseeing Tour', description: 'Explore Eravikulam National Park and tea gardens.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Munnar to Thekkady (Periyar)', description: 'Drive to Thekkady, visit spice plantations and boat ride on lake.', accommodation: 'Elephant Court Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Thekkady to Alleppey Houseboat Stay', description: 'Drive to Alleppey. Board premium backwater houseboat at noon.', accommodation: 'Premium Alleppey Houseboat', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 6, title: 'Houseboat to Cochin Transfer', description: 'Drive back to Cochin. Local shopping at emporiums. Overnight stay.', accommodation: 'Dutch Bungalow Cochin / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 7, title: 'Depart Cochin', description: 'Transfer to Cochin Airport/Station for onward journey.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.8,
    reviewsCount: 104
  },
  {
    id: 'kerala-complete-hills-beach-7n',
    name: 'Complete Kerala Backwaters, Houseboat & Hills (Munnar, Thekkady, Alleppey & Kovalam)',
    slug: 'complete-kerala-backwater-hills',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 8,
    basePrice: 26999,
    featuredImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '7 Nights stay (1N Cochin, 2N Munnar, 1N Thekkady, 1N Private Houseboat in Alleppey, 2N Kovalam)',
      'All meals (lunch, dinner, breakfast) during the Houseboat stay',
      'Daily breakfast at all other hotels/resorts',
      'Private AC Sedan for transfers and sightseeing'
    ],
    exclusions: [
      'Airfare or Train tickets to Cochin/Trivandrum',
      'Optional activities (Kathakali show, elephant rides)',
      'Personal expenses, tips, and laundry'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive in Cochin & City Tour',
        description: 'Arrive at Cochin airport/station. Meet our chauffeur and transfer to the hotel. Visit Fort Cochin, Dutch Palace, St. Francis Church, Jewish Synagogue, and the iconic Chinese Fishing Nets.',
        accommodation: 'Dutch Bungalow Cochin / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Cochin to Munnar Hills Transfer',
        description: 'Drive to Munnar, enjoying scenic viewpoints and the lush Valara and Cheeyappara waterfalls along the mountain highway.',
        accommodation: 'Grand Plaza Munnar / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Munnar Sightseeing Tour',
        description: 'Explore Munnar. Visit Eravikulam National Park (habitat of Nilgiri Tahr), Mattupetty Dam, Echo Point, Tea Museum, and Old Munnar town.',
        accommodation: 'Grand Plaza Munnar / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Munnar to Thekkady (Periyar Forest)',
        description: 'Drive to Thekkady. En-route, tour spice plantations. Enjoy an afternoon boat ride on Periyar Lake to view wild elephants and bison.',
        accommodation: 'Elephant Court Resort / Similar',
        mealsProvided: ['Breakfast', 'Dinner']
      },
      {
        dayNumber: 5,
        title: 'Alleppey Backwater Houseboat Stay',
        description: 'Drive to Alleppey. Board your private premium houseboat at noon. Cruise through the scenic canals of Vembanad Lake and enjoy freshly prepared traditional meals.',
        accommodation: 'Premium Alleppey Houseboat',
        mealsProvided: ['Breakfast', 'Lunch', 'Dinner']
      },
      {
        dayNumber: 6,
        title: 'Houseboat to Kovalam Beach Transfer',
        description: 'Disembark at Alleppey and drive to the beach town of Kovalam. Check-in to your resort and spend the evening enjoying the sand and surf.',
        accommodation: 'Soma Palmshore Kovalam / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 7,
        title: 'Kovalam Beach Relaxation & Trivandrum City Tour',
        description: 'Enjoy the day relaxing on Kovalam\'s clear beaches. Visit Padmanabhaswamy Temple in Trivandrum and Napier Museum.',
        accommodation: 'Soma Palmshore Kovalam / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 8,
        title: 'Trivandrum Airport/Railway Station Dropping',
        description: 'Breakfast at the hotel, check out by noon, and transfer to Trivandrum Airport or Railway Station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 182
  },
  {
    id: 'kerala-grand-backwater-8n',
    name: 'Grand Kerala Backwater & Kovalam beach Retreat (9 Days)',
    slug: 'kerala-grand-backwater-8n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 9,
    basePrice: 28999,
    featuredImage: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '8 Nights accommodation (1N Cochin, 2N Munnar, 1N Thekkady, 1N Kumarakom, 1N Alleppey Houseboat, 2N Kovalam)',
      'All meals on Houseboat, daily breakfast at other stays',
      'Private AC Sedan for transfers and complete loops'
    ],
    exclusions: [
      'Optional activities and temple entry fees',
      'Personal expenses'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Cochin Arrival & Tour', description: 'Arrive Cochin. Sightseeing Fort Cochin.', accommodation: 'Dutch Bungalow / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Cochin to Munnar Hills', description: 'Drive to Munnar. View waterfalls enroute.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Munnar tea Gardens Tour', description: 'Visit Eravikulam National park and Mattupetty dam.', accommodation: 'Grand Plaza Munnar / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Munnar to Thekkady Periyar', description: 'Drive to Thekkady. Boat safari on Periyar lake.', accommodation: 'Elephant Court Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Thekkady to Kumarakom Lake', description: 'Drive to Kumarakom. Check into lake resort.', accommodation: 'Kumarakom Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Alleppey Private Houseboat Cruise', description: 'Drive to Alleppey. Board houseboat at noon.', accommodation: 'Premium Alleppey Houseboat', mealsProvided: ['Breakfast', 'Lunch', 'Dinner'] },
      { dayNumber: 7, title: 'Alleppey to Kovalam Beach Resort', description: 'Drive to Kovalam. Beach relaxation.', accommodation: 'Soma Palmshore / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 8, title: 'Kovalam & Trivandrum City Tour', description: 'Visit Padmanabhaswamy temple and local beaches.', accommodation: 'Soma Palmshore / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 9, title: 'Trivandrum Airport Drop', description: 'Check out and transfer to Trivandrum airport for departure.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.9,
    reviewsCount: 84
  },

  // ==========================================
  // RAJASTHAN
  // ==========================================
  {
    id: 'rajasthan-jodhpur-jaisalmer-5d',
    name: 'Jodhpur & Jaisalmer Desert Tents Explorer',
    slug: 'rajasthan-desert-tents-4n',
    region: 'west_india',
    tourType: 'adventure',
    durationDays: 5,
    basePrice: 14999,
    featuredImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '4 Nights stay (2N Jodhpur heritage hotel, 1N Jaisalmer hotel, 1N Sam Sand Dunes Desert Camp)',
      'Traditional welcome, camel safari, and desert folk dance with dinner at Sam camp',
      'Daily breakfast at all hotels/camps',
      'Private AC Sedan for Jodhpur-Jaisalmer loop transfers'
    ],
    exclusions: [
      'Flights/train tickets',
      'Monuments entry fees'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Arrive Jodhpur & Jaisalmer Transfer',
        description: 'Arrive Jodhpur, transfer to Jaisalmer. En-route visit Jaisalmer War Museum. Check-in to Jaisalmer hotel. Overnight stay.',
        accommodation: 'Hotel Golden Haveli / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Jaisalmer Fort & Sam Sand Dunes Sunset Safari',
        description: 'Visit Jaisalmer Fort (Sonar Kella), Patwon-ki-haveli, and Gadisar Lake. Afternoon drive to Sam Sand Dunes. Enjoy camel safari, spectacular sunset, bonfire, Rajasthani folk dance and buffet dinner. Overnight in Camp.',
        accommodation: 'Desert Luxury Camp Tents',
        mealsProvided: ['Breakfast', 'Dinner']
      },
      {
        dayNumber: 3,
        title: 'Jaisalmer to Jodhpur Drive',
        description: 'Drive back to Jodhpur. Check-in to hotel. Free evening to stroll in local markets around Clock Tower. Overnight in Jodhpur.',
        accommodation: 'Haveli Inn Pal Jodhpur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Jodhpur City Sightseeing',
        description: 'Explore Umaid Bhawan Palace, Mehrangarh Fort (visit Moti Mahal & Phool Mahal), Jaswant Thada, and Kaylana Lake. Overnight stay in Jodhpur.',
        accommodation: 'Haveli Inn Pal Jodhpur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Jodhpur Airport/Station Departure',
        description: 'After breakfast check out and transfer to Jodhpur Airport or Railway Station for departure.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 55
  },
  {
    id: 'rajasthan-jaipur-pushkar-udaipur-5n',
    name: 'Jaipur, Pushkar & Udaipur Romantic Gateway',
    slug: 'rajasthan-jaipur-pushkar-udaipur-5n',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 6,
    basePrice: 18999,
    featuredImage: 'https://images.unsplash.com/photo-1477584322904-487a38530416?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1477584322904-487a38530416?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights stay (2N Jaipur, 1N Ajmer/Pushkar, 2N Udaipur lake-view stays)',
      'Daily breakfast at hotels',
      'Private AC Sedan for transport and transfers'
    ],
    exclusions: [
      'Monument entry and camera permit fees',
      'Lake Pichola boat tour charges'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Jaipur Arrival', description: 'Arrive Jaipur, transfer to hotel. In the evening, optionally visit Chokhi Dhani for ethnic food. Overnight stay in Jaipur.', accommodation: 'Alsisar Haveli / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Jaipur Local Sightseeing', description: 'Full-day tour of Jaipur: Amber Fort & Palace, photo-stop at Jal Mahal, City Palace & Museum, Jantar Mantar, and Hawa Mahal. Overnight in Jaipur.', accommodation: 'Alsisar Haveli / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Jaipur to Ajmer / Pushkar Pilgrimage', description: 'Drive to Ajmer. Visit Dargah-e-Sharief, Ana Sagar Lake. Continue to Pushkar, visit holy Pushkar Lake and Brahma Temple. Overnight in Pushkar.', accommodation: 'Pushkar Palace Hotel / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Pushkar to Udaipur (Beautiful Lake City)', description: 'Drive to Udaipur, en-route visit Nathdwara Shrinathji temple. Check into hotel. Evening boat tour over Lake Pichola (optional). Overnight in Udaipur.', accommodation: 'Lake Pichola Hotel Udaipur / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Udaipur Palace & Lakes Tour', description: 'Visit City Palace complex, Jagdish temple, Saheliyon-ki-Bari (Queen\'s resort gardens), and Fateh Sagar Lake. Overnight in Udaipur.', accommodation: 'Lake Pichola Hotel Udaipur / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Udaipur Airport / Station Drop', description: 'Check out after breakfast and transfer to Udaipur Airport or Station for departure.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.7,
    reviewsCount: 71
  },
  {
    id: 'rajasthan-jaipur-jodhpur-udaipur-6n',
    name: 'Imperial Rajasthan Forts, Lakes & Palaces (Jaipur, Jodhpur & Udaipur)',
    slug: 'imperial-rajasthan-forts-desert',
    region: 'west_india',
    tourType: 'heritage',
    durationDays: 7,
    basePrice: 22999,
    featuredImage: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1477584322904-487a38530416?auto=format&fit=crop&w=800&q=80'
    ],
    inclusions: [
      '6 Nights stay (2N Jaipur, 2N Jodhpur, 2N Udaipur in Heritage / 3-Star hotels)',
      'Daily breakfast at all hotels/resorts',
      'Private AC Sedan for transfers, tours, and intercity travel',
      'Local guides for Amber Fort and Udaipur City Palace'
    ],
    exclusions: [
      'Flights or Train tickets to Jaipur / Udaipur',
      'Entry fees at monuments and camera charges',
      'Boat ride charges in Udaipur (Lake Pichola)',
      'Personal expenses and tips'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Jaipur Arrival & Pink City Sightseeing',
        description: 'Arrive in Jaipur and check into your heritage hotel. Visit the iconic Hawa Mahal, Jantar Mantar observatory, and browse the colourful bazaar stalls at Johri Market.',
        accommodation: 'Alsisar Haveli Jaipur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Amber Fort & City Palace Tour',
        description: 'Visit the grand Amber Fort on the hill. Stop for photos at Jal Mahal (Water Palace) and explore the City Palace Museum to see royal garments and armory.',
        accommodation: 'Alsisar Haveli Jaipur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Jaipur to Jodhpur (The Blue City)',
        description: 'Drive to Jodhpur. Visit the imposing Mehrangarh Fort standing tall over the blue-hued city streets, and the serene Jaswant Thada cenotaph.',
        accommodation: 'Haveli Inn Pal Jodhpur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Jodhpur City Tour & Local Culture',
        description: 'Full-day tour of Jodhpur: visit Umaid Bhawan Palace museum, Kaylana Lake, Mandore Garden. Evening stroll in the colorful Sardar Bazaar.',
        accommodation: 'Haveli Inn Pal Jodhpur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 5,
        title: 'Jodhpur to Udaipur via Ranakpur Temple',
        description: 'Drive to Udaipur, en-route visit Ranakpur Marble Temple. Check into Udaipur hotel. Evening boat tour on Lake Pichola.',
        accommodation: 'Lake Pichola Hotel Udaipur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 6,
        title: 'Udaipur City Sightseeing',
        description: 'Tour Udaipur. Visit the majestic City Palace, the historic Jagdish Temple, Saheliyon-ki-Bari (the Queen\'s resort gardens), Fateh Sagar Lake, and the Folk Art Museum.',
        accommodation: 'Lake Pichola Hotel Udaipur / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 7,
        title: 'Udaipur Departure',
        description: 'Enjoy a relaxed breakfast. Check out by noon and transfer to Udaipur Airport or Railway Station for your departure flight/train.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 167
  },

  // ==========================================
  // TAMIL NADU
  // ==========================================
  {
    id: 'tamilnadu-madurai-rameswaram-4d',
    name: 'Madurai & Rameswaram Spiritual Heritage',
    slug: 'tamilnadu-madurai-rameswaram-3n',
    region: 'south_india',
    tourType: 'pilgrimage',
    durationDays: 4,
    basePrice: 11999,
    featuredImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '3 Nights stay (2N Rameswaram, 1N Madurai in comfortable 3* hotels)',
      'Daily breakfast at hotels',
      'Private AC Sedan for Madurai-Rameswaram-Madurai loop transfers',
      'Road taxes, toll gates, and driver allowance'
    ],
    exclusions: [
      'Special darshan tickets in Ramanathaswamy temple',
      'Meals not specified'
    ],
    itinerary: [
      {
        dayNumber: 1,
        title: 'Madurai Arrive & Drive to Rameswaram',
        description: 'Arrive at Madurai, meet chauffeur and drive to Rameswaram. Check in. Evening visit to Ramanathaswamy Temple for holy prayers. Overnight stay.',
        accommodation: 'Hotel Daiwik Rameswaram / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 2,
        title: 'Dhanushkodi Beach Excursion & Pamban Bridge',
        description: 'Take a day excursion to the ghost town Dhanushkodi Beach at edge of India. En-route visit Pamban Bridge and Five-Faced Hanuman Temple. Overnight in Rameswaram.',
        accommodation: 'Hotel Daiwik Rameswaram / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 3,
        title: 'Rameswaram to Madurai & Meenakshi Temple',
        description: 'Check out and drive back to Madurai. Check in. Evening visit to the magnificent Meenakshi Amman Temple. Local shopping. Overnight in Madurai.',
        accommodation: 'Heritage Madurai / Similar',
        mealsProvided: ['Breakfast']
      },
      {
        dayNumber: 4,
        title: 'Depart Madurai',
        description: 'Check out and transfer to Madurai station/airport for your onward return journey.',
        mealsProvided: ['Breakfast']
      }
    ],
    rating: 4.8,
    reviewsCount: 114
  },
  {
    id: 'tamilnadu-heritage-temples-6d',
    name: 'Tamil Nadu Royal Temples Heritage (Chennai to Madurai)',
    slug: 'tamilnadu-royal-temples-5n',
    region: 'south_india',
    tourType: 'heritage',
    durationDays: 6,
    basePrice: 16999,
    featuredImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights stay (1N Chennai, 1N Mahabalipuram, 1N Kumbakonam, 1N Tanjore, 1N Madurai)',
      'Daily breakfast at hotels',
      'Private AC Sedan for the complete Chennai-Mahabalipuram-Kumbakonam-Tanjore-Madurai loop'
    ],
    exclusions: [
      'Monument tickets and camera fees',
      'Guide charges'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrive Chennai & City Tour', description: 'Arrive Chennai, transfer to hotel. Visit Kapaleeshwarar temple and Marina Beach.', accommodation: 'Chennai Residency / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Chennai to Mahabalipuram Shore Temples', description: 'Drive to Mahabalipuram. Visit UNESCO Shore Temple, Pancha Rathas, and Arjuna\'s Penance.', accommodation: 'Mahabalipuram Beach Hotel / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Mahabalipuram to Kumbakonam temples', description: 'Drive to Kumbakonam. Visit Airavatesvara Temple and Adi Kumbeswarar Temple.', accommodation: 'Hotel Raya\'s Kumbakonam / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Kumbakonam to Tanjore Brihadeeswarar Temple', description: 'Drive to Tanjore. Visit the majestic Brihadeeswarar Temple (Big Temple), Palace and Art Gallery.', accommodation: 'Hotel Sangam Tanjore / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Tanjore to Madurai Temple Tour', description: 'Drive to Madurai. Visit Meenakshi Amman Temple and Alagar Koyil temple.', accommodation: 'Heritage Madurai / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Depart Madurai', description: 'Check out and transfer to Madurai Airport or Railway Station for departure.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.9,
    reviewsCount: 88
  },
  {
    id: 'tamilnadu-ooty-kodaikanal-6d',
    name: 'Coimbatore, Ooty & Kodaikanal Hill Retreat',
    slug: 'tamilnadu-ooty-kodaikanal-5n',
    region: 'south_india',
    tourType: 'leisure',
    durationDays: 6,
    basePrice: 15999,
    featuredImage: 'https://images.unsplash.com/photo-1626082895617-2c6de3476af7?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1626082895617-2c6de3476af7?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights stay (3N Ooty hill resort, 2N Kodaikanal resort)',
      'Daily breakfast at resorts',
      'Private AC Sedan for Coimbatore-Ooty-Coonoor-Kodaikanal-Coimbatore route'
    ],
    exclusions: [
      'Boating charges on Ooty and Kodai Lakes',
      'Toy Train booking (must be done in advance)'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Coimbatore to Ooty Hills', description: 'Arrive Coimbatore, drive to Ooty. Check in. Visit Ooty Botanical gardens.', accommodation: 'Ooty Lake Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 2, title: 'Coonoor Day Excursion', description: 'Visit Sim\'s park, Lamb\'s rock, and Dolphin\'s nose in Coonoor.', accommodation: 'Ooty Lake Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 3, title: 'Ooty Lake & Doddabetta Peak', description: 'Visit Doddabetta Peak, Tea Museum, Ooty Lake boating, and local market.', accommodation: 'Ooty Lake Resort / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 4, title: 'Ooty to Kodaikanal Hills Drive', description: 'Drive to Kodaikanal hill station. Check in. Evening stroll around star-shaped Kodai Lake.', accommodation: 'The Carlton Kodaikanal / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 5, title: 'Kodaikanal local Sightseeing', description: 'Visit Pillar Rocks, Fairy Falls, Coaker\'s Walk (enjoying mountain views), and Bryant Park.', accommodation: 'The Carlton Kodaikanal / Similar', mealsProvided: ['Breakfast'] },
      { dayNumber: 6, title: 'Kodaikanal to Coimbatore Departure', description: 'Check out and drive back to Coimbatore for airport/station dropping.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.7,
    reviewsCount: 92
  },

  // ==========================================
  // HIMALAYAS
  // ==========================================
  {
    id: 'himalayas-ladakh-6d',
    name: 'Leh Ladakh Pangong Lake Adventure',
    slug: 'himalayas-ladakh-adventure-6d',
    region: 'north_india',
    tourType: 'adventure',
    durationDays: 6,
    basePrice: 24999,
    featuredImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights accommodation in selected stays (3N Leh, 1N Nubra Valley, 1N Pangong Lake)',
      'Daily breakfast & dinner at all hotels/camps',
      'Private AC Scorpio / Xylo / Traveler for all transfers and sightseeings'
    ],
    exclusions: [
      'Inner Line Permits and environmental fees',
      'Leh Ladakh entry tickets and monument fees'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Arrive Leh & Acclimatization', description: 'Arrive Leh. Day free for complete rest to acclimatize to high altitude. Overnight in Leh.', accommodation: 'Hotel Singge Palace / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 2, title: 'Leh Local Sightseeing', description: 'Visit Shanti Stupa, Leh Palace, Hall of Fame, and Confluence of Indus & Zanskar rivers. Overnight in Leh.', accommodation: 'Hotel Singge Palace / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 3, title: 'Leh to Nubra Valley via Khardung La Pass', description: 'Drive to Nubra Valley via Khardung La Pass (highest motorable road). Visit Diskit Monastery. Camel safari in Hunder Sand Dunes. Overnight in Nubra.', accommodation: 'Nubra Valley Organic Camp', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 4, title: 'Nubra Valley to Pangong Lake via Shyok River route', description: 'Drive to Pangong Lake. Witness the changing colors of the beautiful high-altitude lake. Overnight stay at lakeside camp.', accommodation: 'Pangong Lake View Camp', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 5, title: 'Pangong Lake to Leh via Chang La Pass', description: 'Watch the sunrise at the lake, check out, and drive back to Leh via Chang La Pass. Overnight stay in Leh.', accommodation: 'Hotel Singge Palace / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 6, title: 'Leh Departure', description: 'Check out and transfer to Leh Kushok Bakula Rimpochee Airport for onward flight.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.9,
    reviewsCount: 120
  },
  {
    id: 'himalayas-shimla-manali-6d',
    name: 'Himachal Scenic Escape (Shimla & Manali)',
    slug: 'himalayas-shimla-manali-6d',
    region: 'north_india',
    tourType: 'leisure',
    durationDays: 6,
    basePrice: 18999,
    featuredImage: 'https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80',
    gallery: ['https://images.unsplash.com/photo-1600100397608-f010e42ec97c?auto=format&fit=crop&w=800&q=80'],
    inclusions: [
      '5 Nights accommodation (2N Shimla, 3N Manali in comfortable 3* hotels)',
      'Daily breakfast and dinner at hotels',
      'Private AC Sedan for transfers and local sightseeings from Delhi'
    ],
    exclusions: [
      'Solang Valley adventure sport activities (paragliding, zorbing)',
      'Rohtang Pass permission charges'
    ],
    itinerary: [
      { dayNumber: 1, title: 'Delhi to Shimla Drive', description: 'Meet driver at Delhi and proceed to Shimla hill station. Check in. Overnight stay in Shimla.', accommodation: 'Shimla Grand Resort / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 2, title: 'Kufri & Shimla Mall Road', description: 'Excursion to Kufri for scenic peak views. Evening walk on Ridge and Shimla Mall Road. Overnight in Shimla.', accommodation: 'Shimla Grand Resort / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 3, title: 'Shimla to Manali Hills via Kullu Valley', description: 'Drive to Manali. En-route stop at Kullu Valley to view mountain streams and visit local shawl factories. Overnight in Manali.', accommodation: 'Manali Heights / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 4, title: 'Manali Local Sightseeing', description: 'Visit Hadimba Temple, Vashisht Hot Springs, and Club House. Free evening. Overnight in Manali.', accommodation: 'Manali Heights / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 5, title: 'Solang Valley & Rohtang Pass', description: 'Excursion to Solang Valley for paragliding and scenic views of snow-capped peaks. Overnight in Manali.', accommodation: 'Manali Heights / Similar', mealsProvided: ['Breakfast', 'Dinner'] },
      { dayNumber: 6, title: 'Manali to Delhi Departure', description: 'Check out and drive back to Delhi for dropping at railway station / airport.', mealsProvided: ['Breakfast'] }
    ],
    rating: 4.8,
    reviewsCount: 95
  }
];
