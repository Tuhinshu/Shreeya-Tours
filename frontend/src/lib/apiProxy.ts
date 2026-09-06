import { NextResponse } from 'next/server';

/**
 * Returns the validated authoritative backend API URL.
 * Throws a configuration error in production if NEXT_PUBLIC_API_URL is missing.
 */
export function getBackendApiUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const url = process.env.NEXT_PUBLIC_API_URL || (!isProd ? 'http://localhost:5000' : '');
  if (isProd && !url) {
    throw new Error('Configuration Error: Production backend API URL (NEXT_PUBLIC_API_URL) is not configured.');
  }
  return (url || 'http://localhost:5000').replace(/\/+$/, '');
}

export interface ProxyOptions {
  path: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Shared proxy utility forwarding requests from Next.js API routes to the Express backend.
 * Provides unified timeout, configuration checks, and error responses.
 */
export async function proxyToBackend({
  path,
  method = 'GET',
  body,
  headers = {},
  timeoutMs = 8000
}: ProxyOptions): Promise<NextResponse> {
  let backendUrl: string;
  try {
    backendUrl = getBackendApiUrl();
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Backend API configuration error';
    console.error('[API Proxy Config Error]', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${backendUrl}${cleanPath}`;

    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    };

    const fetchOptions: RequestInit = {
      method,
      headers: reqHeaders,
      signal: controller.signal
    };

    if (body !== undefined && body !== null && method !== 'GET') {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const res = await fetch(fullUrl, fetchOptions);
    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({ message: 'Invalid JSON response from backend' }));

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.message || data.error || `Backend returned HTTP status ${res.status}`
        },
        { status: res.status }
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const errMsg = isAbort
      ? 'Backend request timed out'
      : err instanceof Error
      ? err.message
      : 'Backend service unavailable';

    console.error(`[API Proxy Error] ${method} ${path}:`, errMsg);
    return NextResponse.json(
      {
        success: false,
        error: isAbort
          ? 'The travel service is currently taking longer than expected to respond. Please try again or reach out on WhatsApp.'
          : 'The travel service is temporarily unavailable. Please try again or connect via WhatsApp.'
      },
      { status: 502 }
    );
  }
}
