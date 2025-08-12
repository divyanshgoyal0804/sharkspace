// app/api/rooms/route.ts
import { NextRequest } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  try {
    const rooms = await storage.getRooms();
    return Response.json(rooms);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}