import { NextRequest } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 401 });
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      return Response.json({ error: 'Invalid token' }, { status: 401 });
    }

    return Response.json({ 
      valid: true, 
      user: {
        id: decodedToken.userId,
        username: decodedToken.username,
        role: decodedToken.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return Response.json({ error: 'Token verification failed' }, { status: 401 });
  }
}
