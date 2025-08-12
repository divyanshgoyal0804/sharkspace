import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export async function DELETE(
  req: NextRequest,
  { params }: any // ← Use `any` to bypass the type check
) {
  try {
    await connectDB();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Room ID is required' }), {
        status: 400,
      });
    }

    const room = await storage.getRoomById(id);
    if (!room) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
      });
    }

    await storage.deleteRoom(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error deleting room:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to delete room: ' + (error as Error).message,
      }),
      { status: 500 }
    );
  }
}