import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';
import { comparePassword, generateToken, hashPassword } from '@/lib/auth';
import { serialize } from 'cookie';

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
    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        },
        token
      }),
      {
        status: 200,
        headers: {
          'Set-Cookie': cookie,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
