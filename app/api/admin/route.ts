// app/api/admin/route.ts
import { NextRequest } from 'next/server';
import { initializeData } from '@/lib/storage';
import { storage } from '@/lib/storage';
import { getTokenFromRequest, verifyToken } from '@/lib/auth';

type Resource = 'rooms' | 'users' | 'bookings' | 'blockedSlots';
type Action = 'get' | 'create' | 'update' | 'delete';

const getterMap = {
  rooms: 'getRooms',
  users: 'getUsers',
  bookings: 'getBookings',
  blockedSlots: 'getBlockedSlots',
};

const setterMap = {
  rooms: 'setRooms',
  users: 'setUsers',
  bookings: 'setBookings',
  blockedSlots: 'setBlockedSlots',
};

export async function GET(request: NextRequest) {
  // Fallback JWT verification
  const token = getTokenFromRequest(request);
  const decoded = token && verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource') as Resource;

    if (!resource || !getterMap[resource]) {
      return Response.json({ error: 'Invalid or missing ?resource' }, { status: 400 });
    }

    await initializeData();

    const method = getterMap[resource];
    const data = await storage[method]();

    return Response.json(data);
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  // Fallback JWT verification
  const token = getTokenFromRequest(request);
  const decoded = token && verifyToken(token);
  if (!decoded || decoded.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const resource = body.resource as Resource;
    const action = body.action as Action;
    const data = body.data;

    if (!resource || !action || !getterMap[resource] || !setterMap[resource]) {
      return Response.json({ error: 'Invalid resource or action' }, { status: 400 });
    }

    await initializeData();

    const getter = storage[getterMap[resource]];
    const setter = storage[setterMap[resource]];

    const list = await getter();
    let result;

    switch (action) {
      case 'create':
        result = [...list, { ...data, id: crypto.randomUUID?.() || Date.now().toString() }];
        break;
      case 'update':
        result = list.map((item: any) => item.id === data.id ? { ...item, ...data } : item);
        break;
      case 'delete':
        result = list.filter((item: any) => item.id !== data.id);
        break;
      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }

    await setter(result);
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}