import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, password } = await request.json();
    console.log('Login attempt:', { username, password });

    // Get all users and find the matching one
    const users = await storage.getUsers();
    console.log('All users:', users);
    
    const user = users.find(u => u.username === username);
    console.log('Found user:', user);

    const isValidPassword = user ? comparePassword(password, user.password) : false;
    console.log('Password check:', { 
      inputHash: hashPassword(password),
      storedHash: user?.password,
      isValid: isValidPassword 
    });

    if (!user || !isValidPassword) {
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    return Response.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
