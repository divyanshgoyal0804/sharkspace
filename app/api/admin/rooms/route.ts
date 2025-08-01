import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function GET() {
  try {
    await connectDB();
    const rooms = await storage.getRooms();
    return Response.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return Response.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const image = formData.get('image');
    const id = formData.get('id');

    if (!name || typeof name !== 'string') {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required' }, { status: 400 });
    }

    let imageData = '';
    if (image instanceof Blob) {
      const buffer = Buffer.from(await image.arrayBuffer());
      imageData = `data:${image.type};base64,${buffer.toString('base64')}`;
    }

    if (id) {
      // Updating existing room
      const existingRoom = await storage.getRoomById(id as string);
      if (!existingRoom) {
        return Response.json({ error: 'Room not found' }, { status: 404 });
      }

      const updatedRoom = {
        ...existingRoom,
        name,
        description,
        image: imageData || existingRoom.image
      };

      await storage.updateRoom(updatedRoom);
      return Response.json({ success: true, data: updatedRoom });
    } else {
      // Creating new room
      const newRoom = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        description,
        image: imageData || 'https://via.placeholder.com/400x300?text=Room+Image',
        createdAt: new Date()
      };

      await storage.addRoom(newRoom);
      return Response.json({ success: true, data: newRoom });
    }
  } catch (error) {
    console.error('Error handling room:', error);
    return Response.json(
      { error: 'Failed to handle room: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
