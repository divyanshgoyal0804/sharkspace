
'use client';

import { motion } from 'framer-motion';
import { format, isAfter } from 'date-fns';
import type { Booking } from '@/lib/types';
import { minutesToHours } from '@/lib/utils';

interface BookingHistoryProps {
  bookings: Booking[];
}

export default function BookingHistory({ bookings }: BookingHistoryProps) {
  const currentBookings = bookings.filter(b => 
    isAfter(new Date(b.endTime), new Date()) && b.status === 'active'
  );
  
  const pastBookings = bookings.filter(b => 
    !isAfter(new Date(b.endTime), new Date()) || b.status !== 'active'
  );

  const BookingCard = ({ booking, isPast }: { booking: Booking; isPast: boolean }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 transition-colors duration-300 ${
        isPast ? 'border-gray-300 dark:border-gray-600' : 'border-blue-500 dark:border-blue-400'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">{booking.roomName}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {format(new Date(booking.startTime), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
          isPast 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
            : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
        }`}>
          {isPast ? 'Completed' : 'Active'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Time:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Duration:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{minutesToHours(booking.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Booked on:</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {format(new Date(booking.createdAt), 'MMM dd, HH:mm')}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {currentBookings.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            <i className="ri-calendar-check-line mr-2 text-blue-600 dark:text-blue-400"></i>
            Current Bookings
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast={false} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
          <i className="ri-history-line mr-2 text-gray-600 dark:text-gray-400"></i>
          Booking History
        </h3>
        {pastBookings.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isPast={true} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl transition-colors duration-300"
          >
            <i className="ri-calendar-line text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <p className="text-gray-500 dark:text-gray-400">No past bookings yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
