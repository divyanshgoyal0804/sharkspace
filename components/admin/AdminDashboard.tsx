'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Room, Booking, User, BlockedSlot } from '@/lib/types';
import Layout from '@/components/Layout';
import RoomManagement from '@/components/admin/RoomManagement';
import UserManagement from '@/components/admin/UserManagement';
import BookingManagement from '@/components/admin/BookingManagement';
import BlockedSlotManagement from '@/components/admin/BlockedSlotManagement';
import AdminStats from '@/components/admin/AdminStats';

const tabVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

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
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-2xl p-6 text-white shadow-xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Admin Control Panel
          </motion.h2>
          <motion.p 
            className="text-purple-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Manage rooms, users, and bookings for SharkSpace Noida
          </motion.p>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto transition-colors duration-300"
        >
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`px-4 py-2 rounded-md font-medium transition-all cursor-pointer whitespace-nowrap relative ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-md shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">
                <motion.i 
                  className={`${tab.icon} mr-2`}
                  animate={{ rotate: activeTab === tab.key ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                />
                {tab.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Layout>
  );
}
