
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
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                <i className={`${stat.icon} text-white text-xl`}></i>
              </div>
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            <i className="ri-calendar-check-line mr-2 text-blue-600"></i>
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.roomName}</p>
                    <p className="text-sm text-gray-500">{booking.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{booking.duration}m</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent bookings</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            <i className="ri-building-line mr-2 text-green-600"></i>
            Room Usage
          </h3>
          <div className="space-y-3">
            {topRooms.map((room) => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{room.name}</p>
                  <p className="text-sm text-gray-500">{room.bookingCount} bookings</p>
                </div>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((room.bookingCount / Math.max(...topRooms.map(r => r.bookingCount), 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <i className="ri-calendar-line text-3xl text-blue-600 mb-3"></i>
          <h4 className="text-lg font-bold text-gray-900">This Week</h4>
          <p className="text-2xl font-bold text-blue-600">{thisWeekBookings.length}</p>
          <p className="text-sm text-gray-500">Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <i className="ri-calendar-2-line text-3xl text-purple-600 mb-3"></i>
          <h4 className="text-lg font-bold text-gray-900">This Month</h4>
          <p className="text-2xl font-bold text-purple-600">{thisMonthBookings.length}</p>
          <p className="text-sm text-gray-500">Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center"
        >
          <i className="ri-time-line text-3xl text-orange-600 mb-3"></i>
          <h4 className="text-lg font-bold text-gray-900">Avg Duration</h4>
          <p className="text-2xl font-bold text-orange-600">{avgBookingDuration}m</p>
          <p className="text-sm text-gray-500">Per Booking</p>
        </motion.div>
      </div>
    </div>
  );
}
