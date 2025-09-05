
'use client';

import { motion } from 'framer-motion';
import type { Room, User, Booking, BlockedSlot } from '@/lib/types';

import { isToday, isThisWeek, isThisMonth } from 'date-fns';

interface AdminStatsProps {
  rooms: Room[];
  users: User[];
  bookings: Booking[];
  blockedSlots: BlockedSlot[];
}

export default function AdminStats({ rooms, users, bookings, blockedSlots }: AdminStatsProps) {
  const todayBookings = bookings.filter(b => isToday(new Date(b.startTime)));
  const thisWeekBookings = bookings.filter(b => isThisWeek(new Date(b.startTime)));
  const thisMonthBookings = bookings.filter(b => isThisMonth(new Date(b.startTime)));
  
  const clientUsers = users.filter(u => u.role === 'client');
  const totalDuration = bookings.reduce((sum, b) => sum + b.duration, 0);
  const avgBookingDuration = bookings.length > 0 ? Math.round(totalDuration / bookings.length) : 0;

  const stats = [
    {
      title: 'Total Rooms',
      value: rooms.length,
      icon: 'ri-building-line',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: clientUsers.length,
      icon: 'ri-user-line',
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Today\'s Bookings',
      value: todayBookings.length,
      icon: 'ri-calendar-check-line',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    },
    {
      title: 'Blocked Slots',
      value: blockedSlots.length,
      icon: 'ri-forbid-line',
      color: 'from-red-500 to-red-600',
      textColor: 'text-red-600'
    }
  ];

  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const topRooms = rooms.map(room => ({
    ...room,
    bookingCount: bookings.filter(b => b.roomId === room.id).length
  })).sort((a, b) => b.bookingCount - a.bookingCount);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg`}>
                <motion.i 
                  className={`${stat.icon} text-white text-xl`}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                />
              </div>
              <div className={`text-2xl font-bold ${stat.textColor} dark:text-opacity-90`}>
                {stat.value}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300">{stat.title}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            <i className="ri-calendar-check-line mr-2 text-blue-600 dark:text-blue-400"></i>
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <motion.div 
                  key={booking.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors duration-300"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{booking.roomName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{booking.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">{booking.duration}m</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 transition-colors duration-300">No recent bookings</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            <i className="ri-building-line mr-2 text-green-600 dark:text-green-400"></i>
            Room Usage
          </h3>
          <div className="space-y-3">
            {topRooms.map((room, index) => (
              <motion.div 
                key={room.id} 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600 transition-colors duration-300"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{room.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">{room.bookingCount} bookings</p>
                </div>
                <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <motion.div 
                    className="bg-green-500 dark:bg-green-400 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((room.bookingCount / Math.max(...topRooms.map(r => r.bookingCount), 1)) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 * index }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <motion.i 
            className="ri-calendar-line text-3xl text-blue-600 dark:text-blue-400 mb-3 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">This Week</h4>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{thisWeekBookings.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <motion.i 
            className="ri-calendar-2-line text-3xl text-purple-600 dark:text-purple-400 mb-3 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">This Month</h4>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{thisMonthBookings.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center border border-gray-200 dark:border-gray-700 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
        >
          <motion.i 
            className="ri-time-line text-3xl text-orange-600 dark:text-orange-400 mb-3 block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
          />
          <h4 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-300">Avg Duration</h4>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{avgBookingDuration}m</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">Per Booking</p>
        </motion.div>
      </div>
    </div>
  );
}
