'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Room, Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

interface BookingModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
  selectedDate: Date;
}

const BookingModal = ({
  room,
  isOpen,
  onClose,
  onBookingComplete,
  selectedDate,
  user // <-- Add user prop
}: BookingModalProps & { user: { id: string; username: string; role: string } }) => {
  // Remove hardcoded user
  // const user = { userId: 'client1', username: 'client1', role: 'client' };
  const [startDate, setStartDate] = useState(selectedDate);
  const [endDate, setEndDate] = useState(selectedDate);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);

  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getUserDailyUsage();
      setDailyUsage(usage);
    };
    if (isOpen) fetchUsage();
  }, [isOpen, selectedDate]);

  // Create a Date object from a date and time string
  const createDateTimeFromDateAndTime = (date: Date, time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  };

  // Helper to get all dates in range
  const getDatesInRange = (start: Date, end: Date) => {
    const dates = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
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
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return false;
    }
    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      setError('End date must be after or same as start date');
      return false;
    }
    // Ensure booking is within next 5 days
    const now = new Date();
    const maxDate = new Date(now);
    maxDate.setDate(now.getDate() + 5);
    if (startDate < now || endDate > maxDate) {
      setError('You can only book within the next five days');
      return false;
    }

    // Multi-day validation: check each day for usage and overlaps
    const bookingsRes = await fetch('/api/bookings', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!bookingsRes.ok) {
      setError('Failed to fetch bookings');
      return false;
    }
    const bookings: Booking[] = await bookingsRes.json();
    const dates = getDatesInRange(startDate, endDate);
    for (const date of dates) {
      const startDateTime = createDateTimeFromDateAndTime(date, startTime);
      const endDateTime = createDateTimeFromDateAndTime(date, endTime);
      if (startDateTime >= endDateTime) {
        setError('End time must be after start time for all days');
        return false;
      }
      const duration = calculateDuration(startDateTime, endDateTime);
      if (duration > 60) {
        setError('Booking duration cannot exceed 60 minutes per day');
        return false;
      }
      // Check daily usage
      const dayBookings = bookings.filter((b) =>
        b.userId === user.id &&
        b.roomId === room.id &&
        isSameDay(new Date(b.startTime), date)
      );
      const usedMinutes = dayBookings.reduce((total, b) => total + b.duration, 0);
      if (usedMinutes + duration > 60) {
        setError(`You can only book ${60 - usedMinutes} more minutes on ${format(date, 'PPP')}`);
        return false;
      }
      // Check overlap
      const overlappingBookings = bookings.filter(b => 
        b.roomId === room.id &&
        isSameDay(new Date(b.startTime), date) &&
        new Date(b.startTime) < endDateTime &&
        new Date(b.endTime) > startDateTime
      );
      if (overlappingBookings.length > 0) {
        setError(`This time slot is not available on ${format(date, 'PPP')}`);
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleBooking = async () => {
    if (!startTime || !endTime) {
      setError('Please select both start and end time');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    const isValid = await validateBooking();
    if (!isValid) return;
    setIsBooking(true);
    setError('');
    try {
      const dates = getDatesInRange(startDate, endDate);
      let allOk = true;
      for (const date of dates) {
        const startDateTime = createDateTimeFromDateAndTime(date, startTime);
        const endDateTime = createDateTimeFromDateAndTime(date, endTime);
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
        if (!res.ok) {
          allOk = false;
        }
      }
      if (allOk) {
        onBookingComplete();
        onClose();
      } else {
        setError('Booking failed for one or more days. Please try again.');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const getUserDailyUsage = async (): Promise<number> => {
    const res = await fetch('/api/bookings', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) return 0;
    const bookings: Booking[] = await res.json();

    const todayBookings = bookings.filter((b) =>
      b.userId === user.id && // Use logged-in user's id
      b.roomId === room.id &&
      isSameDay(new Date(b.startTime), selectedDate)
    );

    return todayBookings.reduce((total, b) => total + b.duration, 0);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded bg-white p-6 space-y-4">
          <Dialog.Title className="text-xl font-semibold">
            Book Room: {room.name}
          </Dialog.Title>
          <div className="flex flex-col space-y-2">
            <label>Start Date:</label>
            <input
              type="date"
              value={format(startDate, 'yyyy-MM-dd')}
              min={format(new Date(), 'yyyy-MM-dd')}
              max={format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd')}
              onChange={e => setStartDate(new Date(e.target.value))}
              className="border rounded p-2"
            />
            <label>End Date:</label>
            <input
              type="date"
              value={format(endDate, 'yyyy-MM-dd')}
              min={format(startDate, 'yyyy-MM-dd')}
              max={format(new Date(new Date().setDate(new Date().getDate() + 5)), 'yyyy-MM-dd')}
              onChange={e => setEndDate(new Date(e.target.value))}
              className="border rounded p-2"
            />
            <label>Start Time:</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded p-2"
            />
            <label>End Time:</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded p-2"
            />
            <p className="text-sm text-gray-500">
              You’ve used {dailyUsage} out of 60 minutes today.
            </p>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
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