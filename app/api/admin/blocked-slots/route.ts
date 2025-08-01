import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export async function GET() {
  try {
    await connectDB();
    const blockedSlots = await storage.getBlockedSlots();
    return Response.json(blockedSlots);
  } catch (error) {
    console.error('Error fetching blocked slots:', error);
    return Response.json(
      { error: 'Failed to fetch blocked slots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const blockedSlot = await request.json();
    await storage.addBlockedSlot(blockedSlot);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating blocked slot:', error);
    return Response.json(
      { error: 'Failed to create blocked slot' },
      { status: 500 }
    );
  }
}
