import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';
import { hashPassword } from '@/lib/auth';

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
    
    // Hash the password before storing
    const hashedPassword = hashPassword(user.password);
    const userWithHashedPassword = {
      ...user,
      password: hashedPassword,
      id: user.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
    };
    
    await storage.addUser(userWithHashedPassword);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
