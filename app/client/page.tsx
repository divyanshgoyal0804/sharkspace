
'use client';

import { useState, useEffect } from 'react';
import { storage, Room, Booking } from '@/lib/storage';
import { isSameDay, startOfDay } from 'date-fns';
import Layout from '@/components/Layout';
import RoomCard from '@/components/client/RoomCard';
import BookingModal from '@/components/client/BookingModal';
import BookingHistory from '@/components/client/BookingHistory';

export default function ClientDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');

  // Simple user object for demo
  const user = { userId: 'client1', username: 'client1', role: 'client' };

  useEffect(() => {
    // Initialize storage and load data
    storage.initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setRooms(storage.getRooms());
    setBookings(storage.getBookings());
  };

  const getUserBookingsForRoom = (roomId: string) => {
    const today = startOfDay(new Date());
    return bookings
      .filter(b => 
        b.userId === user.userId && 
        b.roomId === roomId && 
        isSameDay(new Date(b.startTime), today)
      )
      .reduce((total, booking) => total + booking.duration, 0);
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = () => {
    loadData();
  };

  return (
    <Layout title="Client Dashboard">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user.username}!</h2>
          <p className="text-blue-100">Ready to book your perfect workspace today?</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'rooms'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-building-line mr-2"></i>
            Available Rooms
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-calendar-check-line mr-2"></i>
            My Bookings
          </button>
        </div>

        {activeTab === 'rooms' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id}>
                  <RoomCard
                    room={room}
                    onBookNow={handleBookNow}
                    userBookings={getUserBookingsForRoom(room.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <BookingHistory bookings={bookings.filter(b => b.userId === user.userId)} />
          </div>
        )}
      </div>

      {selectedRoom && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          room={selectedRoom}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </Layout>
  );
}
