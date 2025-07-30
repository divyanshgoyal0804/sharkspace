
'use client';

import { useState, useEffect } from 'react';
import { storage, Room, Booking, User, BlockedSlot } from '@/lib/storage';
import Layout from '@/components/Layout';
import RoomManagement from '@/components/admin/RoomManagement';
import UserManagement from '@/components/admin/UserManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import BlockedSlotManagement from '@/components/admin/BlockedSlotManagement';
import AdminStats from '@/components/admin/AdminStats';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'users' | 'bookings' | 'blocked'>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  useEffect(() => {
    // Initialize storage and load data
    storage.initializeData();
    loadData();
  }, []);

  const loadData = () => {
    setRooms(storage.getRooms());
    setUsers(storage.getUsers());
    setBookings(storage.getBookings());
    setBlockedSlots(storage.getBlockedSlots());
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { key: 'rooms', label: 'Rooms', icon: 'ri-building-line' },
    { key: 'users', label: 'Users', icon: 'ri-user-line' },
    { key: 'bookings', label: 'Bookings', icon: 'ri-calendar-check-line' },
    { key: 'blocked', label: 'Blocked Slots', icon: 'ri-forbid-line' }
  ];

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
              onClick={() => setActiveTab(tab.key as any)}
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
            <RoomManagement rooms={rooms} onUpdate={loadData} />
          )}
          
          {activeTab === 'users' && (
            <UserManagement users={users} onUpdate={loadData} />
          )}
          
          {activeTab === 'bookings' && (
            <BookingManagement bookings={bookings} rooms={rooms} onUpdate={loadData} />
          )}
          
          {activeTab === 'blocked' && (
            <BlockedSlotManagement 
              blockedSlots={blockedSlots} 
              rooms={rooms} 
              onUpdate={loadData} 
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
