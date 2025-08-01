// lib/storage.ts
// ⚠️ WARNING: This file must NOT be imported in client components
// It uses Mongoose and Node.js features — only for server/API routes

import mongoose from 'mongoose';

// Prevent accidental browser bundling
if (typeof window !== 'undefined') {
  throw new Error('Do not import "lib/storage" in client components');
}

import { hashPassword } from './auth';
import { User, Room, Booking, BlockedSlot } from './types';

// ===== Connect to MongoDB =====
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/room-booking';

let conn: typeof mongoose | null = null;

export async function connectDB() {
  if (conn) return conn;

  try {
    conn = await mongoose.connect(MONGODB_URI, {
      // Avoid deprecation warnings
      autoIndex: true,
    });
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    conn = null;
    throw error;
  }
}

// ===== Schemas =====

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['client', 'admin'], required: true },
  createdAt: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const bookingSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  roomId: { type: String, required: true },
  roomName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const blockedSlotSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  roomId: { type: String, required: true },
  roomName: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  reason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// ===== Models =====
// Use type assertions to fix Mongoose typing issues

const UserModel = (mongoose.models.User as mongoose.Model<User & mongoose.Document>) ||
  mongoose.model<User & mongoose.Document>('User', userSchema);

const RoomModel = (mongoose.models.Room as mongoose.Model<Room & mongoose.Document>) ||
  mongoose.model<Room & mongoose.Document>('Room', roomSchema);

const BookingModel = (mongoose.models.Booking as mongoose.Model<Booking & mongoose.Document>) ||
  mongoose.model<Booking & mongoose.Document>('Booking', bookingSchema);

const BlockedSlotModel = (mongoose.models.BlockedSlot as mongoose.Model<BlockedSlot & mongoose.Document>) ||
  mongoose.model<BlockedSlot & mongoose.Document>('BlockedSlot', blockedSlotSchema);

// ===== Initialization =====
export async function initializeData(): Promise<void> {
  await connectDB();

  // Create default users if none exist
  const userCount = await UserModel.countDocuments().exec();
  if (userCount === 0) {
    const hashedPassword = await hashPassword('password');
    await UserModel.insertMany([
      {
        id: '1',
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
      },
      {
        id: '2',
        username: 'client1',
        password: hashedPassword,
        role: 'client',
        createdAt: new Date(),
      },
    ]);
    console.log('✅ Default users created');
  }

  // Create default rooms if none exist
  const roomCount = await RoomModel.countDocuments().exec();
  if (roomCount === 0) {
    await RoomModel.insertMany([
      {
        id: '1',
        name: 'Conference Room A',
        description: 'Large conference room with projector and video conferencing.',
        image: 'https://readdy.ai/api/search-image?...conf-room-a',
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Private Office',
        description: 'Quiet private office space with high-speed internet.',
        image: 'https://readdy.ai/api/search-image?...private-office',
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Creative Studio',
        description: 'Open creative space with whiteboards and mood lighting.',
        image: 'https://readdy.ai/api/search-image?...creative-studio',
        createdAt: new Date(),
      },
    ]);
    console.log('✅ Default rooms created');
  }
}

// ===== Storage Manager =====
class StorageManager {

    [key: string]: any;

  // ---------- Users ----------
  async getUsers(): Promise<User[]> {
    await connectDB();
    return (await UserModel.find({}, { _id: 0, __v: 0 }).lean()) as unknown as User[];
  }

  async setUsers(users: User[]): Promise<void> {
    await connectDB();
    await UserModel.deleteMany({});
    await UserModel.insertMany(users.map((u) => ({ ...u, password: u.password }))); // ensure hash
  }

  // ---------- Rooms ----------
  async getRooms(): Promise<Room[]> {
    await connectDB();
    return (await RoomModel.find({}, { _id: 0, __v: 0 }).lean()) as unknown as Room[];
  }

  async getRoomById(id: string): Promise<Room | null> {
    await connectDB();
    return (await RoomModel.findOne({ id }, { _id: 0, __v: 0 }).lean()) as unknown as Room | null;
  }

  async addRoom(room: Room): Promise<void> {
    await connectDB();
    await RoomModel.create(room);
  }

  async updateRoom(room: Room): Promise<void> {
    await connectDB();
    await RoomModel.updateOne({ id: room.id }, room);
  }

  async deleteRoom(id: string): Promise<void> {
    await connectDB();
    await RoomModel.deleteOne({ id });
  }

  async setRooms(rooms: Room[]): Promise<void> {
    await connectDB();
    await RoomModel.deleteMany({});
    await RoomModel.insertMany(rooms);
  }

  // ---------- Bookings ----------
  async getBookings(): Promise<Booking[]> {
    await connectDB();
    return (await BookingModel.find({}, { _id: 0, __v: 0 }).lean()) as unknown as Booking[];
  }

  async setBookings(bookings: Booking[]): Promise<void> {
    await connectDB();
    await BookingModel.deleteMany({});
    await BookingModel.insertMany(bookings);
  }

  // ---------- Blocked Slots ----------
  async getBlockedSlots(): Promise<BlockedSlot[]> {
    await connectDB();
    return (await BlockedSlotModel.find({}, { _id: 0, __v: 0 }).lean()) as unknown as BlockedSlot[];
  }

  async setBlockedSlots(slots: BlockedSlot[]): Promise<void> {
    await connectDB();
    await BlockedSlotModel.deleteMany({});
    await BlockedSlotModel.insertMany(slots);
  }

  // ---------- Utility ----------
  async getUserBookings(userId: string): Promise<Booking[]> {
    await connectDB();
    return (await BookingModel.find({ userId }, { _id: 0, __v: 0 }).lean()) as unknown as Booking[];
  }

  async getRoomBookings(roomId: string): Promise<Booking[]> {
    await connectDB();
    return (await BookingModel.find({ roomId }, { _id: 0, __v: 0 }).lean()) as unknown as Booking[];
  }

  async getUserDailyBookingTime(userId: string, roomId: string, date: Date): Promise<number> {
    await connectDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await BookingModel.find(
      {
        userId,
        roomId,
        startTime: { $gte: startOfDay, $lte: endOfDay },
      },
      { _id: 0, __v: 0 }
    ).lean();

    return (bookings as any[]).reduce((total, b: Booking) => total + b.duration, 0);
  }

  async isTimeSlotAvailable(roomId: string, startTime: Date, endTime: Date): Promise<boolean> {
    await connectDB();

    const overlappingBooking = await BookingModel.findOne({
      roomId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).exec();

    const overlappingBlock = await BlockedSlotModel.findOne({
      roomId,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }).exec();

    return !overlappingBooking && !overlappingBlock;
  }
}

export const storage = new StorageManager();