'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/site';

interface PaymentStatusData {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' | 'AMOUNT_MISMATCH' | string;
  bookingStatus: 'PAID' | 'PENDING_PAYMENT' | 'PAYMENT_FAILED' | 'CANCELLED' | string;
  bookingId: string;
}

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId');
  const token = searchParams.get('token');

  const validationError = !orderId
    ? 'Missing order identifier in callback URL.'
    : !token
    ? 'Missing secure access token in callback URL. Payment status cannot be verified without authorization.'
    : null;

  const [data, setData] = useState<PaymentStatusData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const activeError = validationError || fetchError;
  const loading = !activeError && !data;

  const handleManualRetry = () => {
    setData(null);
    setFetchError(null);
    setPollCount(0);
  };

  useEffect(() => {
    if (validationError) {
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/payments/status?orderId=${encodeURIComponent(orderId as string)}&token=${encodeURIComponent(token as string)}`,
          { signal: controller.signal }
        );
        const result = await res.json();

        if (isCancelled) return;

        if (!res.ok) {
          throw new Error(result.error || result.message || 'Unable to retrieve payment verification status.');
        }

        setData(result);

        // If still pending and polled less than 3 times, retry in 3 seconds
        if (result.paymentStatus === 'PENDING' && pollCount < 3) {
          setTimeout(() => {
            if (!isCancelled) {
              setPollCount(prev => prev + 1);
            }
          }, 3000);
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        if (err instanceof Error && err.name === 'AbortError') return;
        const msg = err instanceof Error ? err.message : 'Failed to verify transaction with server.';
        setFetchError(msg);
      }
    }

    checkStatus();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [orderId, token, pollCount, validationError]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Payment Status</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Connecting to secure travel server to confirm your transaction details...
          </p>
        </div>
      </div>
    );
  }

  if (activeError || !data) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-red-100 animate-fade-in">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
            ✕
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-sm text-red-700 bg-red-50 p-4 rounded-xl mb-6 border border-red-200">
            {activeError || 'Unable to verify payment record.'}
          </p>
          <div className="space-y-3">
            <button
              onClick={handleManualRetry}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow"
            >
              🔄 Retry Verification
            </button>
            <a
              href={SITE_CONFIG.getWhatsAppUrl(`Hi Shreeya Tours, I need help verifying payment for order ${orderId || 'unknown'}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 border border-primary/10"
            >
              <span>Contact Support on WhatsApp</span>
            </a>
            <Link
              href="/"
              className="block w-full py-2.5 text-xs text-gray-600 hover:text-gray-900 font-semibold"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isSuccess = data.paymentStatus === 'SUCCESS' && data.bookingStatus === 'PAID';
  const isPending = data.paymentStatus === 'PENDING';

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100 animate-fade-in">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Payment Confirmed!
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Your travel reservation is officially secured with Shreeya Tours.
            </p>

            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-5 mb-6 text-left space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Booking ID:</span>
                <span className="font-mono font-bold text-gray-900 text-sm">{data.bookingId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Gateway Order ID:</span>
                <span className="font-mono font-semibold text-gray-700">{data.orderId}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-gray-500 font-medium">Amount Confirmed:</span>
                <span className="font-extrabold text-primary text-sm">₹{data.amount.toLocaleString('en-IN')} {data.currency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Payment State:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                  ● {data.paymentStatus}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={SITE_CONFIG.getWhatsAppUrl(`Hi Shreeya Tours, my payment for booking ${data.bookingId} is confirmed. Please send my trip itinerary & vouchers.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md flex items-center justify-center space-x-2"
              >
                <span>💬 Receive Vouchers on WhatsApp</span>
              </a>
              <Link
                href="/tours"
                className="block w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Explore More Tours
              </Link>
            </div>
          </>
        ) : isPending ? (
          <>
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold">⏳</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Payment In Progress
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We are waiting for final confirmation from your bank / payment provider.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-bold text-gray-900">{data.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">₹{data.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className="font-bold text-amber-700 uppercase">{data.paymentStatus}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleManualRetry}
                disabled={loading}
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow disabled:opacity-60"
              >
                {loading ? 'Checking Server...' : '🔄 Refresh Status Now'}
              </button>
              <a
                href={SITE_CONFIG.getWhatsAppUrl(`Hi Shreeya Tours, my payment for order ${data.orderId} is showing as pending. Please help check status.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 border border-primary/10"
              >
                <span>Help on WhatsApp</span>
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              ✕
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
              Payment Not Successful
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Your transaction was not completed or the provider reported a failure.
            </p>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-mono font-bold text-gray-900">{data.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reported Status:</span>
                <span className="font-bold text-red-700 uppercase">{data.paymentStatus}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/tours"
                className="block w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow"
              >
                Try Booking Again
              </Link>
              <a
                href={SITE_CONFIG.getWhatsAppUrl(`Hi Shreeya Tours, my payment for order ${data.orderId} failed with status ${data.paymentStatus}. Please assist.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-secondary hover:bg-secondary-hover text-primary font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer flex items-center justify-center space-x-2 border border-primary/10"
              >
                <span>Get Help on WhatsApp</span>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
