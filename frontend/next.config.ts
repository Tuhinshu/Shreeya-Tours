import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
let apiOrigin = '';
if (apiUrl) {
  try {
    apiOrigin = new URL(apiUrl).origin;
  } catch {
    // Ignore malformed URL
  }
}

const connectSrc = [
  "'self'",
  "ws:",
  "wss:",
  "https://sandbox.cashfree.com",
  "https://api.cashfree.com",
  apiOrigin,
  !isProd ? "http://localhost:5000 http://127.0.0.1:5000" : ""
].filter(Boolean).join(' ');

const scriptSrc = [
  "'self'",
  !isProd ? "'unsafe-eval'" : "",
  "'unsafe-inline'",
  "https://sdk.cashfree.com"
].filter(Boolean).join(' ');

const ContentSecurityPolicy = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com data:;
  img-src 'self' https://images.unsplash.com https://res.cloudinary.com https://*.cloudinary.com data: blob:;
  connect-src ${connectSrc};
  frame-src 'self' https://sdk.cashfree.com https://www.google.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  ${isProd ? 'upgrade-insecure-requests;' : ''}
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;