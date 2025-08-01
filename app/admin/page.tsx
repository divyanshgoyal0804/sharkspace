'use client';

import { useState, useEffect, Suspense } from 'react';
import { Room, Booking, User, BlockedSlot } from '@/lib/types';
import Layout from '@/components/Layout';
import RoomManagement from '@/components/admin/RoomManagement';
import UserManagement from '@/components/admin/UserManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import BlockedSlotManagement from '@/components/admin/BlockedSlotManagement';
import AdminStats from '@/components/admin/AdminStats';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'users' | 'bookings' | 'blocked'>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { key: 'rooms', label: 'Rooms', icon: 'ri-building-line' },
    { key: 'users', label: 'Users', icon: 'ri-user-line' },
    { key: 'bookings', label: 'Bookings', icon: 'ri-calendar-check-line' },
    { key: 'blocked', label: 'Blocked Slots', icon: 'ri-forbid-line' }
  ];

  const refreshData = async () => {
    try {
      setLoading(true);
      const fetchOptions = {
        headers: {
          'Content-Type': 'application/json',
          'x-user': 'admin'
        }
      };

      const [roomsRes, usersRes, bookingsRes, blockedRes] = await Promise.all([
        fetch('/api/admin/rooms', fetchOptions),
        fetch('/api/admin/users', fetchOptions),
        fetch('/api/admin/bookings', fetchOptions),
        fetch('/api/admin/blocked-slots', fetchOptions),
      ]);

      if (!roomsRes.ok || !usersRes.ok || !bookingsRes.ok || !blockedRes.ok) {
        throw new Error('Failed to refresh admin data');
      }

      const [roomsData, usersData, bookingsData, blockedData] = await Promise.all([
        roomsRes.json(),
        usersRes.json(),
        bookingsRes.json(),
        blockedRes.json(),
      ]);

      setRooms(roomsData);
      setUsers(usersData);
      setBookings(bookingsData);
      setBlockedSlots(blockedData);
    } catch (error) {
      console.error('Failed to refresh admin data:', error);
      setRooms([]);
      setUsers([]);
      setBookings([]);
      setBlockedSlots([]);
      alert('Failed to refresh data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  if (loading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-600">Loading admin data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Admin Control Panel</h2>
          <p className="text-purple-100">Manage rooms, users, and bookings for SharkSpace Noida</p>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div>
          {activeTab === 'overview' && (
            <AdminStats 
              rooms={rooms} 
              users={users} 
              bookings={bookings} 
              blockedSlots={blockedSlots}
            />
          )}
          
          {activeTab === 'rooms' && (
            <RoomManagement rooms={rooms} onUpdate={refreshData} />
          )}
          
          {activeTab === 'users' && (
            <UserManagement users={users} onUpdate={refreshData} />
          )}
          
          {activeTab === 'bookings' && (
            <BookingManagement bookings={bookings} rooms={rooms} onUpdate={refreshData} />
          )}
          
          {activeTab === 'blocked' && (
            <BlockedSlotManagement 
              blockedSlots={blockedSlots} 
              rooms={rooms} 
              onUpdate={refreshData} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
}