
'use client';

import { motion } from 'framer-motion';
import { format, isAfter } from 'date-fns';
import { Booking } from '@/lib/storage';
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
      className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
        isPast ? 'border-gray-300' : 'border-blue-500'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{booking.roomName}</h3>
          <p className="text-sm text-gray-500">
            {format(new Date(booking.startTime), 'MMM dd, yyyy')}
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isPast 
            ? 'bg-gray-100 text-gray-600' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {isPast ? 'Completed' : 'Active'}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Time:</span>
          <span className="text-sm font-medium">
            {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Duration:</span>
          <span className="text-sm font-medium">{minutesToHours(booking.duration)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Booked on:</span>
          <span className="text-sm font-medium">
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
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            <i className="ri-calendar-check-line mr-2 text-blue-600"></i>
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          <i className="ri-history-line mr-2 text-gray-600"></i>
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
            className="text-center py-12 bg-gray-50 rounded-xl"
          >
            <i className="ri-calendar-line text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-500">No past bookings yet</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
