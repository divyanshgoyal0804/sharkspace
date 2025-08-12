'use client';

import { useState, useEffect } from 'react';
import type { Room, Booking } from '@/lib/types';
import Layout from '@/components/Layout';
import RoomCard from '@/components/client/RoomCard';
import BookingModal from '@/components/client/BookingModal';
import BookingHistory from '@/components/client/BookingHistory';
import { startOfDay, isSameDay } from 'date-fns';

export default function ClientDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');
  const [loading, setLoading] = useState(true);

  // Get user from localStorage
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  // ✅ Load data from API, not direct storage
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const fetchOptions = {
          headers: {
            'Content-Type': 'application/json',
          }
        };
        const roomsRes = await fetch('/api/rooms', fetchOptions);
        const bookingsRes = await fetch(`/api/bookings?userId=${user.id}`, fetchOptions);
        if (!roomsRes.ok) {
          throw new Error(`Failed to fetch rooms: ${roomsRes.status} ${roomsRes.statusText}`);
        }
        if (!bookingsRes.ok) {
          throw new Error(`Failed to fetch bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
        }
        const roomsData = await roomsRes.json();
        const bookingsData = await bookingsRes.json();
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (error) {
        console.error('Failed to load data:', error);
        setRooms([]);
        setBookings([]);
        alert(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadData();
    }
  }, [user]);

  // ✅ Refresh data after booking
  const handleBookingComplete = () => {
    fetch('/api/bookings', {
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setBookings(data) : setBookings([]))
      .catch(error => {
        console.error('Error refreshing bookings:', error);
        setBookings([]);
      });
  };

  const getUserBookingsForRoom = (roomId: string) => {
    const today = startOfDay(new Date());
    return bookings
      .filter(b => 
        b.userId === user.id && 
        b.roomId === roomId && 
        isSameDay(new Date(b.startTime), today)
      )
      .reduce((total, booking) => total + booking.duration, 0);
  };

  const handleBookNow = (room: Room) => {
    setSelectedRoom(room);
    setIsBookingModalOpen(true);
  };

  if (loading) {
    return (
      <Layout title="Client Dashboard">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading rooms and bookings...</p>
        </div>
      </Layout>
    );
  }

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
              {rooms.length === 0 ? (
                <p className="col-span-full text-gray-500">No rooms available</p>
              ) : (
                rooms.map((room) => (
                  <div key={room.id}>
                    <RoomCard
                      room={room}
                      onBookNow={handleBookNow}
                      userBookings={getUserBookingsForRoom(room.id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div>
            <BookingHistory bookings={bookings.filter(b => b.userId === user.id)} />
          </div>
        )}
      </div>

      {selectedRoom && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          room={selectedRoom}
          onBookingComplete={handleBookingComplete}
          selectedDate={new Date()} // pass if needed
          user={user} // Pass the logged-in user
        />
      )}
    </Layout>
  );
}