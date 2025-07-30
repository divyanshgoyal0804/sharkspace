
import { hashPassword } from './auth';

export interface Room {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'client' | 'admin';
  createdAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  username: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface BlockedSlot {
  id: string;
  roomId: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  reason: string;
  createdAt: Date;
}

class StorageManager {
  private initialized = false;

  initializeData() {
    console.log('Storage initializeData called, initialized:', this.initialized);

    // Always reinitialize to ensure data is there
    this.initialized = false;

    try {
      // Always create default users
      const defaultUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          password: hashPassword('password'),
          role: 'admin',
          createdAt: new Date()
        },
        {
          id: '2',
          username: 'client1',
          password: hashPassword('password'),
          role: 'client',
          createdAt: new Date()
        }
      ];

      console.log('Setting default users:', defaultUsers);
      this.setUsers(defaultUsers);

      // Always create default rooms
      const defaultRooms: Room[] = [
        {
          id: '1',
          name: 'Conference Room A',
          description: 'Large conference room with projector and whiteboard, perfect for team meetings and presentations.',
          image: 'https://readdy.ai/api/search-image?query=modern%20conference%20room%20with%20large%20table%2C%20projector%20screen%2C%20whiteboard%2C%20professional%20lighting%2C%20clean%20minimalist%20design%2C%20business%20meeting%20space&width=800&height=600&seq=conf-room-a&orientation=landscape',
          createdAt: new Date()
        },
        {
          id: '2',
          name: 'Private Office',
          description: 'Quiet private office space ideal for focused work, calls, and small meetings.',
          image: 'https://readdy.ai/api/search-image?query=private%20office%20space%20with%20desk%2C%20chair%2C%20computer%2C%20good%20lighting%2C%20quiet%20workspace%2C%20professional%20environment%2C%20modern%20furniture&width=800&height=600&seq=private-office&orientation=landscape',
          createdAt: new Date()
        },
        {
          id: '3',
          name: 'Creative Studio',
          description: 'Open creative space with flexible seating, ideal for brainstorming and collaborative work.',
          image: 'https://readdy.ai/api/search-image?query=creative%20studio%20workspace%20with%20flexible%20seating%2C%20whiteboard%2C%20bright%20colors%2C%20collaborative%20space%2C%20modern%20design%2C%20creative%20environment&width=800&height=600&seq=creative-studio&orientation=landscape',
          createdAt: new Date()
        }
      ];

      this.setRooms(defaultRooms);

      // Initialize empty arrays for bookings and blocked slots if they don't exist
      if (!localStorage.getItem('bookings')) {
        this.setBookings([]);
      }
      if (!localStorage.getItem('blockedSlots')) {
        this.setBlockedSlots([]);
      }

      this.initialized = true;
      console.log('Storage initialization complete');

      // Verify the data was set
      const users = this.getUsers();
      console.log('Verification - Users after initialization:', users);

    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // User management
  getUsers(): User[] {
    try {
      const users = localStorage.getItem('users');
      const result = users ? JSON.parse(users) : [];
      console.log('getUsers returning:', result);
      return result;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  setUsers(users: User[]) {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('setUsers called with:', users);
    } catch (error) {
      console.error('Error setting users:', error);
    }
  }

  // Room management
  getRooms(): Room[] {
    try {
      const rooms = localStorage.getItem('rooms');
      return rooms ? JSON.parse(rooms) : [];
    } catch {
      return [];
    }
  }

  setRooms(rooms: Room[]) {
    localStorage.setItem('rooms', JSON.stringify(rooms));
  }

  // Booking management
  getBookings(): Booking[] {
    try {
      const bookings = localStorage.getItem('bookings');
      return bookings ? JSON.parse(bookings) : [];
    } catch {
      return [];
    }
  }

  setBookings(bookings: Booking[]) {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }

  // Blocked slots management
  getBlockedSlots(): BlockedSlot[] {
    try {
      const blockedSlots = localStorage.getItem('blockedSlots');
      return blockedSlots ? JSON.parse(blockedSlots) : [];
    } catch {
      return [];
    }
  }

  setBlockedSlots(blockedSlots: BlockedSlot[]) {
    localStorage.setItem('blockedSlots', JSON.stringify(blockedSlots));
  }

  // Utility methods
  getUserBookings(userId: string): Booking[] {
    return this.getBookings().filter(booking => booking.userId === userId);
  }

  getRoomBookings(roomId: string): Booking[] {
    return this.getBookings().filter(booking => booking.roomId === roomId);
  }

  getUserDailyBookingTime(userId: string, roomId: string, date: Date): number {
    const bookings = this.getBookings();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return bookings
      .filter(booking => 
        booking.userId === userId && 
        booking.roomId === roomId &&
        new Date(booking.startTime) >= startOfDay &&
        new Date(booking.startTime) <= endOfDay
      )
      .reduce((total, booking) => total + booking.duration, 0);
  }

  isTimeSlotAvailable(roomId: string, startTime: Date, endTime: Date): boolean {
    const bookings = this.getBookings();
    const blockedSlots = this.getBlockedSlots();

    // Check against existing bookings
    const conflictingBooking = bookings.find(booking => {
      if (booking.roomId !== roomId) return false;
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return (startTime < bookingEnd && endTime > bookingStart);
    });

    // Check against blocked slots
    const conflictingBlock = blockedSlots.find(slot => {
      if (slot.roomId !== roomId) return false;
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return (startTime < slotEnd && endTime > slotStart);
    });

    return !conflictingBooking && !conflictingBlock;
  }
}

export const storage = new StorageManager();
