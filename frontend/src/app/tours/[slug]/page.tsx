import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_TOURS } from '@/utils/mockData';
import TourDetailClient from './TourDetailClient';

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?auto=format&fit=crop&w=1200&q=80';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Statically pre-render all tour detail pages at build time
export async function generateStaticParams() {
  return MOCK_TOURS.map((tour) => ({
    slug: tour.slug,
  }));
}

// Generate dynamic SEO metadata for each tour package
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = MOCK_TOURS.find((t) => t.slug === slug);

  if (!tour) {
    return {
      title: 'Tour Not Found | Shreeya Tours',
      description: 'The requested tour package could not be found.',
    };
  }

  const title = `${tour.name} (${tour.durationDays}D/${tour.durationDays - 1}N) | Shreeya Tours`;
  const description = `Book ${tour.name} starting at ₹${tour.basePrice.toLocaleString('en-IN')}. Includes ${tour.inclusions.slice(0, 3).join(', ')}. Authentic Indian travel experience.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: tour.featuredImage || DEFAULT_FALLBACK_IMAGE,
          width: 1200,
          height: 800,
          alt: tour.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [tour.featuredImage || DEFAULT_FALLBACK_IMAGE],
    },
  };
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = MOCK_TOURS.find((t) => t.slug === slug);

  if (!tour) {
    notFound();
  }

  // Server-rendered Schema.org JSON-LD markup
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'TourPackage',
    'name': tour.name,
    'description': `Explore ${tour.name} in ${tour.region}. Inclusions: ${tour.inclusions.join(', ')}`,
    'image': tour.featuredImage,
    'touristType': tour.tourType,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'INR',
      'price': tour.basePrice.toString(),
      'valueAddedTaxIncluded': 'true',
    },
    'itinerary': tour.itinerary.map((day) => ({
      '@type': 'HowToStep',
      'name': `Day ${day.dayNumber}: ${day.title}`,
      'text': day.description,
    })),
  };

  return (
    <div className="bg-gray-50 pb-16">
      {/* Search Engine Server-Rendered JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Detail Header Banner with Authentic Destination Image Backdrop & Semi-Transparent Red Gradient */}
      <div className="relative text-white py-16 px-4 overflow-hidden bg-[#590006]">
        <div className="absolute inset-0 z-0">
          <img
            src={tour.featuredImage || DEFAULT_FALLBACK_IMAGE}
            alt={tour.name}
            className="w-full h-full object-cover object-center scale-105"
          />
          {/* Semi-Transparent Red Gradient Overlay so Tour Image is clearly visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#590006]/75 via-[#92000A]/55 to-[#730008]/65"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/tours" className="text-white/80 hover:text-white font-semibold text-xs flex items-center space-x-1.5 mb-4 transition-colors">
            <span>←</span> <span>Back to Catalog</span>
          </Link>
          <div className="flex flex-wrap items-center space-x-2 text-xs text-secondary font-bold uppercase tracking-wider mb-2">
            <span className="text-secondary bg-black/40 border border-secondary/40 px-2.5 py-0.5 rounded text-[10px] uppercase font-black">{tour.tourType} tour</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight uppercase drop-shadow-md">
            {tour.name}
          </h1>
          <div className="flex items-center space-x-4 mt-3 text-sm text-red-100">
            <span>{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
            <span>|</span>
            <span className="flex items-center">
              ★ <strong className="text-white ml-1">{tour.rating}</strong>
              <span className="text-red-200 ml-1">({tour.reviewsCount} reviews)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <TourDetailClient tour={tour} />
      </div>
    </div>
  );
}
