import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { checkRateLimit, getRateLimitIdentifier, validateOrigin, detectSuspiciousActivity, logSecurityEvent } from '@/lib/security';

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Add security headers for all responses
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') && !pathname.startsWith('/api/')
  ) {
    return response;
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const identifier = getRateLimitIdentifier(request);
    const isAuthRoute = pathname.includes('/auth/');
    const rateLimit = checkRateLimit(identifier, isAuthRoute ? 10 : 100);

    if (!rateLimit.allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        identifier,
        details: { pathname, userAgent: request.headers.get('user-agent') }
      });
      
      return NextResponse.json(
        { error: 'Rate limit exceeded' }, 
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  }

  // Detect suspicious activity
  const suspiciousCheck = detectSuspiciousActivity(request);
  if (suspiciousCheck.suspicious) {
    logSecurityEvent({
      type: 'suspicious_activity',
      identifier: getRateLimitIdentifier(request),
      details: { reason: suspiciousCheck.reason, pathname }
    });
    
    return NextResponse.json(
      { error: 'Request blocked for security reasons' },
      { status: 403 }
    );
  }

  // Validate origin for non-GET API requests (CSRF protection)
  if (pathname.startsWith('/api/') && request.method !== 'GET') {
    if (!validateOrigin(request)) {
      return NextResponse.json(
        { error: 'Invalid origin' },
        { status: 403 }
      );
    }
  }

  // Protected page routes - no authentication required anymore
  if (pathname === '/admin' || pathname === '/client') {
    return response;
  }

  // API route protection - only keep rate limiting and security checks
  if (pathname.startsWith('/api/')) {
    // All API routes are now public, no authentication required
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
