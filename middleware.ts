import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DecodedToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Skip for non-API routes
  if (!request.url.includes('/api/')) {
    return NextResponse.next();
  }

  // Allow public routes
  if (
    request.url.includes('/api/auth/') ||
    request.url.includes('/api/init') ||
    request.url.includes('/api/rooms') ||
    request.url.includes('/api/bookings')
  ) {
    return NextResponse.next();
  }

  // For admin routes, use hardcoded admin check for now
  if (request.url.includes('/api/admin/')) {
    // Extract username from request headers or cookies
    const username = request.headers.get('x-user') || 'admin'; // Default to 'admin' for testing

    if (username !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Default response for other routes
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
}
