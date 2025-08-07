import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // Declare all variables once at the top
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/');
  const cookieHeader: string | null = request.headers.get('cookie');
  let token: string | null = null;
  let decoded: any = null;

  // Allow public API routes
  if (
    request.url.includes('/api/auth/') ||
    request.url.includes('/api/init') ||
    request.url.includes('/api/rooms') ||
    request.url.includes('/api/bookings')
  ) {
    return NextResponse.next();
  }

  // Extract JWT from cookies
  if (cookieHeader) {
    const match = cookieHeader.match(/token=([^;]+)/);
    if (match) token = match[1];
  }
  if (token) {
    decoded = verifyToken(token);
  }

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    } else if (isAdminRoute) {
      // Redirect to root login with redirect param
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }
  if (!decoded) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    } else if (isAdminRoute) {
      // Redirect to root login with redirect param
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Role-based access for admin routes
  if (isAdminRoute) {
    if (decoded.role !== 'admin') {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Attach user info to request if needed (future enhancement)
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/api/:path*',
    '/admin',
    '/admin/:path*',
  ],
}
