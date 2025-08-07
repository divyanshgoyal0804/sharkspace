import { NextRequest } from 'next/server';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = getTokenFromRequest(request);
  const decoded = token && verifyToken(token);
  if (!decoded) {
    return Response.json({ user: null }, { status: 200 });
  }
  return Response.json({ user: decoded });
}