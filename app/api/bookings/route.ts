// app/api/bookings/route.ts
import { NextRequest } from 'next/server';
import { storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import { Booking } from '@/lib/types';
import { validateBookingData, sanitizeObject } from '@/lib/validation';

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
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);
    
    const validation = validateBookingData(sanitizedData);
    if (!validation.success) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { roomId, startTime, endTime, userId, username } = validation.data!;

    // Use default values if userId and username are not provided
    const bookingUserId = userId || 'anonymous';
    const bookingUsername = username || 'Anonymous User';

    // Additional validation
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    // Check if booking is in the future
    if (start <= now) {
      return Response.json({ error: 'Booking must be in the future' }, { status: 400 });
    }

    // Check booking duration (max 8 hours)
    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    if (durationHours > 8) {
      return Response.json({ error: 'Booking duration cannot exceed 8 hours' }, { status: 400 });
    }

    // Check if booking is within allowed timeframe (next 30 days)
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + 30);
    if (start > maxDate) {
      return Response.json({ error: 'Bookings can only be made up to 30 days in advance' }, { status: 400 });
    }

    // Verify room exists
    const room = await storage.getRoomById(roomId);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Check for conflicts with existing bookings
    const existingBookings = await storage.getBookings();
    const hasConflict = existingBookings.some(booking => 
      booking.roomId === roomId &&
      booking.status === 'active' &&
      (
        (start >= booking.startTime && start < booking.endTime) ||
        (end > booking.startTime && end <= booking.endTime) ||
        (start <= booking.startTime && end >= booking.endTime)
      )
    );

    if (hasConflict) {
      return Response.json({ error: 'Room is already booked for the selected time' }, { status: 409 });
    }

    // Check for blocked slots
    const blockedSlots = await storage.getBlockedSlots();
    const isBlocked = blockedSlots.some(slot => 
      slot.roomId === roomId &&
      (
        (start >= slot.startTime && start < slot.endTime) ||
        (end > slot.startTime && end <= slot.endTime) ||
        (start <= slot.startTime && end >= slot.endTime)
      )
    );

    if (isBlocked) {
      return Response.json({ error: 'Room is blocked for the selected time' }, { status: 409 });
    }

    // Create booking
    const booking: Booking = {
      id: uuidv4(),
      roomId,
      userId: bookingUserId,
      username: bookingUsername,
      roomName: room.name,
      startTime: start,
      endTime: end,
      duration: Math.round(durationMs / (1000 * 60)), // duration in minutes
      status: 'active',
      createdAt: new Date(),
    };

    const bookings = await storage.getBookings();
    bookings.push(booking);
    await storage.setBookings(bookings);

    return Response.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking creation failed:', error);
    return Response.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}