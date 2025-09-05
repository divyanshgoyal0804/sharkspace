import { NextRequest } from 'next/server';
import { storage, connectDB } from '@/lib/storage';
import { comparePassword, generateToken } from '@/lib/auth';
import { validateLoginData, sanitizeObject } from '@/lib/validation';
import { logSecurityEvent, getRateLimitIdentifier } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Parse and validate input
    const rawData = await request.json();
    const sanitizedData = sanitizeObject(rawData);
    
    const validation = validateLoginData(sanitizedData);
    if (!validation.success) {
      return Response.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { username, password } = validation.data!;

    // Get user from database
    const users = await storage.getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      // Log failed login attempt
      logSecurityEvent({
        type: 'unauthorized_access',
        identifier: getRateLimitIdentifier(request),
        details: { 
          reason: 'User not found', 
          username: username.substring(0, 3) + '***'
        }
      });

      // Use generic error message to prevent username enumeration
      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = comparePassword(password, user.password);

    if (!isValidPassword) {
      logSecurityEvent({
        type: 'unauthorized_access',
        identifier: getRateLimitIdentifier(request),
        details: { 
          reason: 'Invalid password', 
          username: username.substring(0, 3) + '***'
        }
      });

      return Response.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Set secure cookie and return response
    const response = Response.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

    // Set HTTP-only cookie for additional security
    response.headers.set('Set-Cookie', 
      `token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    logSecurityEvent({
      type: 'unauthorized_access',
      identifier: getRateLimitIdentifier(request),
      details: { 
        reason: 'Login system error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });

    return Response.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
