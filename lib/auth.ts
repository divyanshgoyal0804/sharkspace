
import { NextRequest } from 'next/server';

const JWT_SECRET = 'your-secret-key-change-in-production';

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
}

export function hashPassword(password: string): string {
  // Simple hash function for demo - in production use proper hashing
  return btoa(password + 'salt');
}

export function comparePassword(password: string, hash: string): boolean {
  // For demo accounts, check direct comparison first
  if (hash === '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') {
    return password === 'password';
  }
  // For new accounts, use simple comparison
  return hashPassword(password) === hash;
}

export function generateToken(user: Pick<User, 'id' | 'username' | 'role'>): string {
  const payload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple JWT-like token for demo
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
    
    // Check expiration
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }
    
    return {
      userId: payload.userId,
      username: payload.username,
      role: payload.role
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
  return null;
}
