'use client';

import React, { useRef, useEffect } from 'react';

interface Review {
  name: string;
  rating: number;
  text: string;
  avatar: string;
  trip: string;
  role?: string;
}

const REVIEWS: Review[] = [
  {
    name: "Shiwani Riswadkar",
    rating: 5,
    text: "My parents recently had the pleasure of traveling with Travel Company, Shreeya Tours to Chandigarh, Kullu, Manali, Sissu, Dalhousie, Amritsar and Wagah Border. The entire experience was exceptional! The service was prompt and efficient, with proper food and ACB facilities provided throughout the journey. The hotels selected were also top-notch, providing comfortable stays for my parents who are in their 60's. What truly impressed me was the seamless planning and execution from start to end.",
    avatar: "SR",
    trip: "Chandigarh, Kullu, Manali & Amritsar"
  },
  {
    name: "Josiah Binnema",
    rating: 5,
    text: "Our Kerala trip was amazing and stress free. Shreeya Tours provided great communication and trip suggestions so that we could enjoy our traveling without worrying about the planning.",
    avatar: "JB",
    trip: "Kerala Leisure Tour"
  },
  {
    name: "Isha Thosar",
    rating: 5,
    text: "The trip was very well planned, and all our preferences were taken care of. Everything went smooth from bookings to local travel. The arrangements were perfect, and we didn't face any problems anywhere. We really enjoyed our trip and felt completely relaxed. We would strongly recommend Shreeya Tours to anyone planning their own trip.",
    avatar: "IT",
    trip: "Customized Tour Package"
  },
  {
    name: "Vaishali Moghe",
    rating: 5,
    text: "We booked our Dwarka, Somnath and Girnar trip through Shreeya tours. We had a wonderful experience and the hotels that were booked were very good with great meals. The car for our 5 day trip was in very good condition. All in all, we had a very good private trip, just like we wanted. I highly recommend Shreeya tours for all your trips and it's needs.",
    avatar: "VM",
    trip: "Dwarka, Somnath & Girnar"
  },
  {
    name: "Swaraj Gurav",
    rating: 5,
    text: "We had an amazing Gujarat trip with Shreeya Tours company. The entire tour was well planned and smoothly executed. The accommodations were good, transportation was comfortable, and all sightseeing spots were covered as promised. The team was supportive and responsive during the journey. Overall, a great and hassle-free travel experience.",
    avatar: "SG",
    trip: "Classic Gujarat Tour",
    role: "Local Guide"
  },
  {
    name: "Nandini Sarwade",
    rating: 5,
    text: "We had a wonderful tour of Rann Utsav! Shreeya tours managed everything for us. The accommodation, food, sight seeing, all was enjoyable. We had a memorable tour. Thanks Rohini and team!!",
    avatar: "NS",
    trip: "Rann Utsav Special"
  },
  {
    name: "Virendra Vishwakarma",
    rating: 4,
    text: "Everything was so well-planned and organized that I just had to pack. The whole trip was seamless!",
    avatar: "VV",
    trip: "Custom Itinerary Tour"
  },
  {
    name: "Alka Sardeshpande",
    rating: 4,
    text: "Our SOU, Vadodara and Ahmedabad trip was beautifully planned by Shreeya Tours. The Ertiga car was in good condition and the driver provided excellent service. The hotels booked by Shreeya Tours were great. Breakfast and dinner superb. I highly suggest 'plan your tour with Shreeya tours'!",
    avatar: "AS",
    trip: "Statue of Unity & Ahmedabad",
    role: "Local Guide"
  }
];

export default function ReviewsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Tripled list of reviews to create an infinite circular scrolling queue
  const tripledReviews = [...REVIEWS, ...REVIEWS, ...REVIEWS];

  const scrollNext = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.firstElementChild as HTMLElement;
      const cardWidth = card?.getBoundingClientRect().width || 350;
      const gap = 24; // gap-6 is 24px
      scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    }
  };

  const scrollPrev = () => {
    if (scrollRef.current) {
      const card = scrollRef.current.firstElementChild as HTMLElement;
      const cardWidth = card?.getBoundingClientRect().width || 350;
      const gap = 24; // gap-6 is 24px
      scrollRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  // Infinite Scroll Boundary Reset
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft } = scrollRef.current;
    
    const card = scrollRef.current.firstElementChild as HTMLElement;
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = 24;
    const singleSetWidth = (cardWidth + gap) * REVIEWS.length;

    // If we scroll into the 3rd set, wrap back to the 2nd set instantly
    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft = scrollLeft - singleSetWidth;
      scrollRef.current.style.scrollBehavior = 'smooth';
    } 
    // If we scroll before the 2nd set, wrap forward to the 2nd set instantly
    else if (scrollLeft <= cardWidth / 2) {
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft = scrollLeft + singleSetWidth;
      scrollRef.current.style.scrollBehavior = 'smooth';
    }
  };

  // Initialize scroll position to the start of the middle set
  useEffect(() => {
    const initializePosition = () => {
      if (scrollRef.current) {
        const card = scrollRef.current.firstElementChild as HTMLElement;
        if (card) {
          const cardWidth = card.getBoundingClientRect().width;
          const gap = 24;
          const singleSetWidth = (cardWidth + gap) * REVIEWS.length;
          scrollRef.current.style.scrollBehavior = 'auto';
          scrollRef.current.scrollLeft = singleSetWidth;
          scrollRef.current.style.scrollBehavior = 'smooth';
        }
      }
    };

    // Small delay to ensure render layout is complete
    const timeout = setTimeout(initializePosition, 100);

    // Auto-scroll loop
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const card = scrollRef.current.firstElementChild as HTMLElement;
        const cardWidth = card?.getBoundingClientRect().width || 350;
        const gap = 24;
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Navigation Buttons */}
      <div className="absolute top-1/2 -left-4 sm:-left-6 z-20 -translate-y-1/2">
        <button
          onClick={scrollPrev}
          className="w-10 h-10 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition cursor-pointer"
          aria-label="Previous review"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      <div className="absolute top-1/2 -right-4 sm:-right-6 z-20 -translate-y-1/2">
        <button
          onClick={scrollNext}
          className="w-10 h-10 rounded-full bg-white border border-gray-150 shadow-md flex items-center justify-center text-primary hover:bg-gray-50 active:scale-95 transition cursor-pointer"
          aria-label="Next review"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Scrolling Track */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-6 pb-6 pt-2 px-1 no-scrollbar scroll-snap-x scroll-smooth snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tripledReviews.map((review, idx) => (
          <div
            key={idx}
            className="w-[300px] sm:w-[350px] md:w-[380px] flex-shrink-0 bg-white p-6 rounded-2xl shadow-md border border-gray-100 flex flex-col justify-between scroll-snap-align-start snap-always hover-card-pop"
          >
            <div className="space-y-4">
              {/* Rating stars & Google tag */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-base font-black ${
                        i < review.rating ? 'text-yellow-500' : 'text-gray-200'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-500 font-extrabold uppercase px-2 py-0.5 rounded flex items-center space-x-1">
                  <span>Google Review</span>
                </span>
              </div>

              {/* Review Text - Now Black for readability */}
              <p className="text-xs text-black italic font-semibold leading-relaxed line-clamp-6">
                &ldquo;{review.text}&rdquo;
              </p>
            </div>

            {/* Author Profile */}
            <div className="pt-4 mt-4 border-t border-gray-50">
              <div className="min-w-0">
                <h4 className="text-xs font-black text-gray-900 uppercase truncate">{review.name}</h4>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[9px] font-bold text-gray-400 truncate max-w-[150px]">{review.trip}</span>
                  {review.role && (
                    <span className="text-[8px] bg-secondary-light text-[#6B923D] font-extrabold px-1.5 py-0.2 rounded shrink-0">
                      {review.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
