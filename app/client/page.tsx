'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { Room, Booking } from '@/lib/types';
import RoomCard from '@/components/client/RoomCard';
import BookingModal from '@/components/client/BookingModal';
import BookingHistory from '@/components/client/BookingHistory';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { startOfDay, isSameDay } from 'date-fns';

function ClientDashboard() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [roomsRes, bookingsRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/bookings')
        ]);

        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setBookings(bookingsData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBookingComplete = () => {
    setIsBookingModalOpen(false);
    setSelectedRoom(null);
    // Reload bookings
    const loadBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (error) {
        console.error('Error reloading bookings:', error);
      }
    };
    loadBookings();
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const getUserBookingsForRoom = (roomId: string): number => {
    if (!user) return 0;
    const today = startOfDay(new Date());
    return bookings
      .filter(booking => 
        booking.userId === user.id && 
        booking.roomId === roomId && 
        isSameDay(new Date(booking.startTime), today)
      )
      .reduce((total, booking) => total + booking.duration, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Header with Theme Toggle and Logout */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm transition-colors"
            >
              Logout
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-700">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-indigo-400/20 to-cyan-400/20 dark:from-blue-600/10 dark:via-indigo-600/10 dark:to-cyan-600/10"
          animate={{
            background: [
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
              'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
              'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1))',
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating geometric elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => {
          const positions = [
            { left: '92%', top: '16%', width: '25px', height: '25px' },
            { left: '31%', top: '37%', width: '28px', height: '28px' },
            { left: '62%', top: '26%', width: '31px', height: '31px' },
            { left: '4%', top: '71%', width: '34px', height: '34px' },
            { left: '32%', top: '94%', width: '37px', height: '37px' },
            { left: '67%', top: '25%', width: '40px', height: '40px' },
            { left: '82%', top: '74%', width: '43px', height: '43px' },
            { left: '18%', top: '36%', width: '46px', height: '46px' },
            { left: '66%', top: '11%', width: '49px', height: '49px' },
            { left: '14%', top: '1%', width: '52px', height: '52px' },
            { left: '35%', top: '18%', width: '55px', height: '55px' },
            { left: '75%', top: '6%', width: '58px', height: '58px' }
          ];
          
          const position = positions[i];
          
          return (
            <motion.div
              key={i}
              className={`absolute ${
                i % 3 === 0 ? 'border border-blue-300/20 dark:border-blue-400/30 rounded-full' :
                i % 3 === 1 ? 'bg-gradient-to-r from-blue-200/10 to-indigo-200/10 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg' :
                'bg-gradient-to-r from-indigo-200/10 to-cyan-200/10 dark:from-indigo-500/10 dark:to-cyan-500/10 rounded-xl'
              }`}
              style={position}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
              }}
            />
          );
        })}
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Welcome banner */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 dark:bg-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl" />
            
            <div className="relative p-12">
              <motion.h1 
                className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome, {user?.username}!
              </motion.h1>
              
              <motion.p 
                className="text-blue-100 dark:text-blue-200 text-xl mb-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Book your perfect workspace at SharkSpace Noida
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap justify-center gap-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <i className="ri-building-line text-2xl"></i>
                  <span className="font-semibold text-lg">{rooms.length} Rooms Available</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                  <i className="ri-calendar-check-line text-2xl"></i>
                  <span className="font-semibold text-lg">{bookings.filter(b => b.userId === user?.id).length} Your Bookings</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="flex space-x-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md p-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <motion.button
              onClick={() => setActiveTab('rooms')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-8 py-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'rooms'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {activeTab === 'rooms' && (
                <motion.div
                  layoutId="activeTabClient"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                <motion.i 
                  className="ri-building-line mr-2"
                  animate={{ rotate: activeTab === 'rooms' ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                />
                Available Rooms
              </span>
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('bookings')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-8 py-4 rounded-lg font-semibold transition-all duration-300 cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              {activeTab === 'bookings' && (
                <motion.div
                  layoutId="activeTabClient"
                  className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center">
                <motion.i 
                  className="ri-calendar-check-line mr-2"
                  animate={{ rotate: activeTab === 'bookings' ? [0, 10, -10, 0] : 0 }}
                  transition={{ duration: 0.5 }}
                />
                Your Bookings
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-cyan-50/50 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-cyan-950/20 rounded-2xl -z-10" />
            
            <div className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              {activeTab === 'rooms' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {rooms.length === 0 ? (
                    <div className="text-center py-16">
                      <i className="ri-building-line text-6xl text-gray-400 mb-4"></i>
                      <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">No rooms available</p>
                      <p className="text-gray-500 dark:text-gray-500">Check back later for available workspaces</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {rooms.map((room, index) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.5, 
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                        >
                          <RoomCard
                            room={room}
                            userBookings={getUserBookingsForRoom(room.id)}
                            onBookNow={(room: Room) => {
                              setSelectedRoom(room);
                              setIsBookingModalOpen(true);
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'bookings' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <BookingHistory bookings={bookings.filter(b => b.userId === user?.id)} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Booking Modal */}
      {selectedRoom && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          user={user}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </div>
  );
}

export default function Page() {
  return <ClientDashboard />;
}
