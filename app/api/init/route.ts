// app/api/init/route.ts
import { NextRequest } from 'next/server';
import { initializeData } from '@/lib/storage'; // This can now run on server

export async function GET(request: NextRequest) {
  try {
    await initializeData();
    return Response.json({ success: true, message: 'Database initialized' });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}