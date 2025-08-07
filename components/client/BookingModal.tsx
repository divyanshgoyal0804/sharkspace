'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Room, Booking } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';

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
  selectedDate: initialDate,
  user
}: BookingModalProps & { user: { id: string; username: string; role: string } }) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);

  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getUserDailyUsage();
      setDailyUsage(usage);
    };
    if (isOpen) fetchUsage();
  }, [isOpen, selectedDate]);

  const createDateTimeFromTime = (time: string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
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
      isSameDay(new Date(b.startTime), selectedDate)
    );

    const usedMinutes = todayBookings.reduce((total, b) => total + b.duration, 0);
    if (usedMinutes + duration > 60) {
      setError(`You can only book ${60 - usedMinutes} more minutes on this day`);
      return false;
    }

    const overlappingBookings = bookings.filter(b =>
      b.roomId === room.id &&
      new Date(b.startTime) < endDateTime &&
      new Date(b.endTime) > startDateTime
    );

    if (overlappingBookings.length > 0) {
      setError('This time slot is not available');
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

  const getUserDailyUsage = async (): Promise<number> => {
    const res = await fetch('/api/bookings', {
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) return 0;
    const bookings: Booking[] = await res.json();

    const todayBookings = bookings.filter((b) =>
      b.userId === user.id &&
      b.roomId === room.id &&
      isSameDay(new Date(b.startTime), selectedDate)
    );

    return todayBookings.reduce((total, b) => total + b.duration, 0);
  };

  const nextFiveDays = Array.from({ length: 5 }, (_, i) => addDays(new Date(), i));

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md w-full rounded bg-white p-6 space-y-4">
          <Dialog.Title className="text-xl font-semibold">
            Book Room: {room.name}
          </Dialog.Title>

          {/* 📅 Date Picker Dropdown */}
          <div className="flex flex-col space-y-2">
            <label htmlFor="date">Select Date:</label>
            <select
              id="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border rounded p-2"
            >
              {nextFiveDays.map((date) => (
                <option key={date.toISOString()} value={format(date, 'yyyy-MM-dd')}>
                  {format(date, 'PPP')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col space-y-2">
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
              You’ve used {dailyUsage} out of 60 minutes on {format(selectedDate, 'PPP')}.
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
