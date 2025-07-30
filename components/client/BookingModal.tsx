
'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { Room, Booking, BlockedSlot, storage } from '@/lib/storage';
import { generateTimeSlots, calculateDuration, minutesToHours } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  onBookingComplete: () => void;
}

export default function BookingModal({ isOpen, onClose, room, onBookingComplete }: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState('');
  
  // Simple user object for demo
  const user = { userId: 'client1', username: 'client1', role: 'client' };
  
  const today = startOfDay(new Date());

  useEffect(() => {
    if (isOpen) {
      setError('');
      setStartTime('09:00');
      setEndTime('10:00');
    }
  }, [isOpen]);

  const createDateTimeFromTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(selectedDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const validateBooking = () => {
    const startDateTime = createDateTimeFromTime(startTime);
    const endDateTime = createDateTimeFromTime(endTime);
    
    if (!user) {
      setError('User not logged in');
      return false;
    }
    
    if (startDateTime >= endDateTime) {
      setError('End time must be after start time');
      return false;
    }
    
    const duration = calculateDuration(startDateTime, endDateTime);
    if (duration > 60) {
      setError('Booking duration cannot exceed 60 minutes');
      return false;
    }
    
    // Check daily limit
    const bookings = storage.getBookings();
    const todayBookings = bookings.filter(b => 
      b.userId === user.userId && 
      b.roomId === room.id && 
      isSameDay(new Date(b.startTime), selectedDate)
    );
    
    const usedMinutes = todayBookings.reduce((total, booking) => total + booking.duration, 0);
    if (usedMinutes + duration > 60) {
      setError(`You can only book ${60 - usedMinutes} more minutes today for this room`);
      return false;
    }
    
    // Check if time slot is available
    const isAvailable = storage.isTimeSlotAvailable(room.id, startDateTime, endDateTime);
    if (!isAvailable) {
      setError('This time slot is not available');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleBooking = async () => {
    if (!validateBooking()) return;
    
    setIsBooking(true);
    
    try {
      const startDateTime = createDateTimeFromTime(startTime);
      const endDateTime = createDateTimeFromTime(endTime);
      
      const booking: Booking = {
        id: uuidv4(),
        roomId: room.id,
        userId: user.userId,
        username: user.username,
        roomName: room.name,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: calculateDuration(startDateTime, endDateTime),
        status: 'active',
        createdAt: new Date()
      };
      
      const bookings = storage.getBookings();
      bookings.push(booking);
      storage.setBookings(bookings);
      
      onBookingComplete();
      onClose();
    } catch (error) {
      console.error('Booking failed:', error);
      setError('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const getUserDailyUsage = () => {
    const bookings = storage.getBookings();
    const todayBookings = bookings.filter(b => 
      b.userId === user.userId && 
      b.roomId === room.id && 
      isSameDay(new Date(b.startTime), selectedDate)
    );
    
    return todayBookings.reduce((total, booking) => total + booking.duration, 0);
  };

  const dailyUsage = getUserDailyUsage();
  const remainingMinutes = 60 - dailyUsage;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book ${room.name}`} maxWidth="lg">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = addDays(today, i);
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div>{format(date, 'EEE')}</div>
                  <div>{format(date, 'dd')}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              min="09:00"
              max="18:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              min="09:00"
              max="18:00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Daily Usage Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Used today:</span>
              <span className="font-medium">{dailyUsage} minutes</span>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <span className="font-medium text-green-600">{remainingMinutes} minutes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  dailyUsage < 30 ? 'bg-green-500' : 
                  dailyUsage < 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${(dailyUsage / 60) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {startTime && endTime && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Booking Summary</h4>
            <div className="space-y-1 text-sm text-blue-800">
              <p>Room: {room.name}</p>
              <p>Date: {format(selectedDate, 'MMM dd, yyyy')}</p>
              <p>Time: {startTime} - {endTime}</p>
              <p>Duration: {calculateDuration(createDateTimeFromTime(startTime), createDateTimeFromTime(endTime))} minutes</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleBooking}
            disabled={remainingMinutes <= 0}
            loading={isBooking}
            icon={<i className="ri-calendar-check-line"></i>}
          >
            {remainingMinutes <= 0 ? 'Daily Limit Reached' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
