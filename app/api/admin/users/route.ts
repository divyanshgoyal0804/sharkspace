import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';

export async function GET() {
  try {
    await connectDB();
    const users = await storage.getUsers();
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await request.json();
    await storage.addUser(user);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
