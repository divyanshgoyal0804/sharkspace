import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export async function GET() {
  try {
    await connectDB();
    const bookings = await storage.getBookings();
    return Response.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return Response.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const booking = await request.json();
    await storage.addBooking(booking);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating booking:', error);
    return Response.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
