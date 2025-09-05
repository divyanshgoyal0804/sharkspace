import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const response = Response.json({
      message: 'Logged out successfully'
    });

    // Clear HTTP-only cookie
    response.headers.set('Set-Cookie', 
      'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    );

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
