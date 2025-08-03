'use client';

import { useState, useEffect } from 'react';
import { Room, Booking, User, BlockedSlot } from '@/lib/types';
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
  const [loading, setLoading] = useState(true);
  const [cache, setCache] = useState<Record<string, { data: any; timestamp: number }>>({});

  const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  
  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { key: 'rooms', label: 'Rooms', icon: 'ri-building-line' },
    { key: 'users', label: 'Users', icon: 'ri-user-line' },
    { key: 'bookings', label: 'Bookings', icon: 'ri-calendar-check-line' },
    { key: 'blocked', label: 'Blocked Slots', icon: 'ri-forbid-line' }
  ];

  const isCacheValid = (key: string) => {
    if (!cache[key]) return false;
    const now = Date.now();
    return now - cache[key].timestamp < CACHE_DURATION;
  };

  const refreshData = async () => {
    try {
      setLoading(true);
      const fetchOptions = {
        headers: {
          'Content-Type': 'application/json',
          'x-user': 'admin'
        }
      };

      // Check cache first
      if (isCacheValid(activeTab)) {
        switch (activeTab) {
          case 'rooms':
            setRooms(cache[activeTab].data);
            break;
          case 'users':
            setUsers(cache[activeTab].data);
            break;
          case 'bookings':
            setBookings(cache[activeTab].data);
            break;
          case 'blocked':
            setBlockedSlots(cache[activeTab].data);
            break;
          case 'overview':
            if (isCacheValid('rooms')) setRooms(cache['rooms'].data);
            if (isCacheValid('users')) setUsers(cache['users'].data);
            if (isCacheValid('bookings')) setBookings(cache['bookings'].data);
            if (isCacheValid('blocked')) setBlockedSlots(cache['blocked'].data);
            break;
        }
        setLoading(false);
        return;
      }

      switch (activeTab) {
        case 'rooms': {
          const response = await fetch('/api/admin/rooms', fetchOptions);
          if (!response.ok) throw new Error('Failed to fetch rooms');
          const data = await response.json();
          setRooms(data);
          setCache(prev => ({ ...prev, rooms: { data, timestamp: Date.now() } }));
          break;
        }
        case 'users': {
          const response = await fetch('/api/admin/users', fetchOptions);
          if (!response.ok) throw new Error('Failed to fetch users');
          const data = await response.json();
          setUsers(data);
          setCache(prev => ({ ...prev, users: { data, timestamp: Date.now() } }));
          break;
        }
        case 'bookings': {
          const response = await fetch('/api/admin/bookings', fetchOptions);
          if (!response.ok) throw new Error('Failed to fetch bookings');
          const data = await response.json();
          setBookings(data);
          setCache(prev => ({ ...prev, bookings: { data, timestamp: Date.now() } }));
          break;
        }
        case 'blocked': {
          const response = await fetch('/api/admin/blocked-slots', fetchOptions);
          if (!response.ok) throw new Error('Failed to fetch blocked slots');
          const data = await response.json();
          setBlockedSlots(data);
          setCache(prev => ({ ...prev, blocked: { data, timestamp: Date.now() } }));
          break;
        }
        case 'overview': {
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

          // Update cache for all overview data
          setCache(prev => ({
            ...prev,
            rooms: { data: roomsData, timestamp: Date.now() },
            users: { data: usersData, timestamp: Date.now() },
            bookings: { data: bookingsData, timestamp: Date.now() },
            blocked: { data: blockedData, timestamp: Date.now() }
          }));
          break;
        }
      }
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
  }, [activeTab]);

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
