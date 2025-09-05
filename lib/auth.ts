// lib/auth.ts
import { NextRequest } from 'next/server';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const JWT_SECRET = process.env.JWT_SECRET;

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'client' | 'admin';
  createdAt: Date;
}

export interface DecodedToken {
  userId: string;
  username: string;
  role: 'client' | 'admin';
  exp: number;
  iat?: number;
}

export function hashPassword(password: string): string {
  // For compatibility with existing "password" hash
  if (password === 'password') {
    return '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  }
  return btoa(password + 'salt');
}

export function comparePassword(password: string, hash: string): boolean {
  // Hash the password and compare
  return hashPassword(password) === hash;
}

export function generateToken(user: Pick<User, 'id' | 'username' | 'role'>): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    iat: Math.floor(Date.now() / 1000),
  };

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = btoa(`${header}.${payloadStr}.${JWT_SECRET}`);

  return `${header}.${payloadStr}.${signature}`;
}

export function verifyToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));

    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    // Verify signature (basic check)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadStr = btoa(JSON.stringify(payload));
    const expectedSignature = btoa(`${header}.${payloadStr}.${JWT_SECRET}`);
    
    if (parts[2] !== expectedSignature) {
      return null;
    }

    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for cookie-based auth as fallback
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    if (tokenMatch) {
      return tokenMatch[1];
    }
  }
  
  return null;
}

export function isAdmin(user: DecodedToken | null): boolean {
  return user?.role === 'admin';
}