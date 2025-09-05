// lib/security.ts
import { NextRequest } from 'next/server';

// Simple rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): RateLimitResult {
  const now = Date.now();
  
  // Clean up old entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
  
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || entry.resetTime < now) {
    // New window
    const resetTime = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }
  
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }
  
  entry.count++;
  rateLimitStore.set(identifier, entry);
  
  return { 
    allowed: true, 
    remaining: maxRequests - entry.count, 
    resetTime: entry.resetTime 
  };
}

export function getRateLimitIdentifier(request: NextRequest): string {
  // Use IP address as primary identifier
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  return ip;
}

export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Allow same-origin requests
  const url = new URL(request.url);
  const allowedOrigins = [
    `${url.protocol}//${url.host}`,
    'http://localhost:3000',
    'https://localhost:3000'
  ];
  
  // Add production URLs if available
  if (process.env.NEXT_PUBLIC_APP_URL) {
    allowedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
  }
  
  return !origin || allowedOrigins.includes(origin) || 
         !referer || allowedOrigins.some(allowed => referer.startsWith(allowed));
}

export function detectSuspiciousActivity(request: NextRequest): { suspicious: boolean; reason?: string } {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  // Check for common attack patterns
  const suspiciousPatterns = [
    /\.\.\//, // Path traversal
    /<script/i, // XSS attempts
    /javascript:/i, // JavaScript protocol
    /on\w+=/i, // Event handlers
    /union.*select/i, // SQL injection
    /drop.*table/i, // SQL injection
  ];
  
  // Check URL path
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(pathname) || pattern.test(url.search)) {
      return { suspicious: true, reason: 'Suspicious URL pattern detected' };
    }
  }
  
  return { suspicious: false };
}

export function logSecurityEvent(event: {
  type: 'rate_limit' | 'invalid_token' | 'suspicious_activity' | 'unauthorized_access';
  identifier: string;
  details: Record<string, any>;
  timestamp?: Date;
}) {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
  };
  
  // In production, send to proper logging service
  console.warn('Security Event:', JSON.stringify(logEntry, null, 2));
}
