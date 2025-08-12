// lib/types.ts

export type Room = {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
};

export type User = {
  id: string;
  username: string;
  password: string;
  role: 'client' | 'admin';
  createdAt: Date;
};

export type BookingStatus = 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  username: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: BookingStatus;
  createdAt: Date;
}

export type BlockedSlot = {
  id: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  createdAt: Date;
};
