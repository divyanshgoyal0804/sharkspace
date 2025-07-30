
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Booking, Room, storage } from '@/lib/storage';
import { minutesToHours } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface BookingManagementProps {
  bookings: Booking[];
  rooms: Room[];
  onUpdate: () => void;
}

export default function BookingManagement({ bookings, rooms, onUpdate }: BookingManagementProps) {
  const [filterDate, setFilterDate] = useState('');
  const [filterRoom, setFilterRoom] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const filteredBookings = bookings.filter(booking => {
    const matchesDate = !filterDate || format(new Date(booking.startTime), 'yyyy-MM-dd') === filterDate;
    const matchesRoom = !filterRoom || booking.roomId === filterRoom;
    const matchesUser = !filterUser || booking.username.toLowerCase().includes(filterUser.toLowerCase());
    
    return matchesDate && matchesRoom && matchesUser;
  });

  const handleDelete = (bookingId: string) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
      storage.setBookings(updatedBookings);
      onUpdate();
    }
  };

  const exportToCSV = () => {
    const headers = ['Room', 'User', 'Date', 'Start Time', 'End Time', 'Duration', 'Status', 'Created'];
    const csvData = filteredBookings.map(booking => [
      booking.roomName,
      booking.username,
      format(new Date(booking.startTime), 'yyyy-MM-dd'),
      format(new Date(booking.startTime), 'HH:mm'),
      format(new Date(booking.endTime), 'HH:mm'),
      minutesToHours(booking.duration),
      booking.status,
      format(new Date(booking.createdAt), 'yyyy-MM-dd HH:mm')
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sharkspace-bookings-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Booking Management</h2>
        <Button
          onClick={exportToCSV}
          icon={<i className="ri-download-line"></i>}
        >
          Export CSV
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Input
            label="Filter by Date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            placeholder="Select date"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Room
            </label>
            <select
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
            >
              <option value="">All Rooms</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>{room.name}</option>
              ))}
            </select>
          </div>
          
          <Input
            label="Filter by User"
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            placeholder="Search by username"
          />
        </div>

        <div className="text-sm text-gray-600 mb-4">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking, index) => (
                <motion.tr
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.roomName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{minutesToHours(booking.duration)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      booking.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : booking.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(booking.id)}
                      icon={<i className="ri-delete-bin-line"></i>}
                    >
                      Delete
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-gray-50 rounded-xl"
        >
          <i className="ri-calendar-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No bookings found</p>
        </motion.div>
      )}
    </div>
  );
}
