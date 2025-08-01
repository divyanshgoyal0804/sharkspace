import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const id = context.params.id;
    
    if (!id) {
      return Response.json({ error: 'Room ID is required' }, { status: 400 });
    }

    const room = await storage.getRoomById(id);
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    await storage.deleteRoom(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return Response.json(
      { error: 'Failed to delete room: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
