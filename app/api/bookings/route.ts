// app/api/bookings/route.ts
import { NextRequest } from 'next/server';
import { storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from '@/lib/types'; // Ensure we use the correct type

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    let bookings: Booking[];
    if (userId) {
      bookings = await storage.getUserBookings(userId);
    } else {
      bookings = await storage.getBookings();
    }
    if (!Array.isArray(bookings)) {
      bookings = [];
    }
    return Response.json(bookings);
  } catch (error: any) {
    console.error("[GET /api/bookings] Error:", error);
    return Response.json([], { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { roomId, userId, username, roomName, startTime, endTime } = body;

    // ✅ Validate required fields
    if (!roomId || !userId || !username || !roomName || !startTime || !endTime) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Backend validation: only allow booking within next 5 days
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    // Remove time part for comparison
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 4);
    if (start < today || start > maxDate || end < today || end > maxDate) {
      return Response.json({ error: 'Bookings can only be made for the next 5 days.' }, { status: 400 });
    }

    // ✅ Cast status to correct literal type
    const booking: Booking = {
      id: uuidv4(),
      roomId,
      userId,
      username,
      roomName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60),
      status: 'active', // ✅ Now safe — will be narrowed if `Booking` uses literal
      createdAt: new Date(),
    };

    const bookings = await storage.getBookings();
    bookings.push(booking);
    await storage.setBookings(bookings);

    return Response.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return Response.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}