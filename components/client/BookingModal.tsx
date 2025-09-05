'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Room, Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Helper to get date string yyyy-MM-dd
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper to add days
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
  user: { id: string; username: string; role: string };
  selectedDate?: Date;
}

const BookingModal = ({
  room,
  isOpen,
  onClose,
  onBookingComplete,
  user
}: BookingModalProps) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getDateString(today));
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);

  // Update usage for current selectedDate only
  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getUserDailyUsage(new Date(selectedDate));
      setDailyUsage(usage);
    };
    if (isOpen) fetchUsage();
  }, [isOpen, selectedDate]);

  const createDateTimeFromTime = (time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const d = new Date(selectedDate);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const calculateDuration = (start: Date, end: Date): number => {
    return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
  };

  const isSameDay = (d1: Date, d2: Date): boolean => {
    return d1.toDateString() === d2.toDateString();
  };

  const validateBooking = async (): Promise<boolean> => {
    if (!startTime || !endTime) {
      setError('Please select both start and end time');
      return false;
    }
    const bookingDate = new Date(selectedDate);
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(minDate);
    maxDate.setDate(maxDate.getDate() + 4);
    if (bookingDate < minDate || bookingDate > maxDate) {
      setError('You can only book for today or the next 4 days');
      return false;
    }
    const startDateTime = createDateTimeFromTime(startTime);
    const endDateTime = createDateTimeFromTime(endTime);
    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      return false;
    }
    const duration = calculateDuration(startDateTime, endDateTime);
    if (duration > 60) {
      setError('Booking duration cannot exceed 60 minutes');
      return false;
    }
    const bookingsRes = await fetch('/api/bookings', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!bookingsRes.ok) {
      setError('Failed to fetch bookings');
      return false;
    }
    const bookings: Booking[] = await bookingsRes.json();
    const todayBookings = bookings.filter((b) =>
      b.userId === user.id &&
      b.roomId === room.id &&
      isSameDay(new Date(b.startTime), bookingDate)
    );
    const usedMinutes = todayBookings.reduce((total, b) => total + b.duration, 0);
    if (usedMinutes + duration > 60) {
      setError(`You can only book ${60 - usedMinutes} more minutes on ${format(bookingDate, 'PPP')}`);
      return false;
    }
    const overlappingBookings = bookings.filter(b =>
      b.roomId === room.id &&
      isSameDay(new Date(b.startTime), bookingDate) &&
      new Date(b.startTime) < endDateTime &&
      new Date(b.endTime) > startDateTime
    );
    if (overlappingBookings.length > 0) {
      setError(`Time slot not available on ${format(bookingDate, 'PPP')}`);
      return false;
    }
    setError('');
    return true;
  };

  const handleBooking = async () => {
    if (!startTime || !endTime) {
      setError('Please select both start and end time');
      return;
    }
    const isValid = await validateBooking();
    if (!isValid) return;
    setIsBooking(true);
    setError('');
    try {
      const startDateTime = createDateTimeFromTime(startTime);
      const endDateTime = createDateTimeFromTime(endTime);
      const booking: Booking = {
        id: uuidv4(),
        roomId: room.id,
        userId: user.id,
        username: user.username,
        roomName: room.name,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: calculateDuration(startDateTime, endDateTime),
        status: 'active',
        createdAt: new Date(),
      };
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
      });
      if (res.ok) {
        onBookingComplete();
        onClose();
      } else {
        setError('Booking failed. Please try again.');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const getUserDailyUsage = async (date: Date): Promise<number> => {
    const res = await fetch('/api/bookings', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return 0;
    const bookings: Booking[] = await res.json();
    const todayBookings = bookings.filter((b) =>
      b.userId === user.id &&
      b.roomId === room.id &&
      isSameDay(new Date(b.startTime), date)
    );
    return todayBookings.reduce((total, b) => total + b.duration, 0);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-md w-full rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 space-y-4 transition-colors duration-300">
          <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
            Book Room: {room.name}
          </Dialog.Title>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date:</label>
            <DatePicker
              selected={new Date(selectedDate)}
              onChange={(date) => setSelectedDate(getDateString(date as Date))}
              minDate={today}
              maxDate={addDays(today, 4)}
              dateFormat="yyyy-MM-dd"
              className="border border-gray-300 dark:border-gray-600 rounded p-2 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-blue-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300 focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You've used {dailyUsage} out of 60 minutes on {format(new Date(selectedDate), 'PPP')}.
            </p>
            {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-300 disabled:opacity-50"
            >
              {isBooking ? 'Booking...' : 'Book'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BookingModal;
