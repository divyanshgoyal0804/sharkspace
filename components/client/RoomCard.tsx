
'use client';

import { Room } from '@/lib/types';
import Button from '@/components/ui/Button';

interface RoomCardProps {
  room: Room;
  onBookNow: (room: Room) => void;
  userBookings: number;
}

export default function RoomCard({ room, onBookNow, userBookings }: RoomCardProps) {
  const remainingMinutes = 60 - userBookings;
  const progressPercentage = (userBookings / 60) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
        />
        
        <div className="absolute top-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium">
            {remainingMinutes}m left
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{room.name}</h3>
        <p className="text-gray-600 mb-4 text-sm">{room.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Usage</span>
            <span className="text-sm text-gray-500">{userBookings}/60 min</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercentage < 50 ? 'bg-green-500' : 
                progressPercentage < 80 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <Button
          onClick={() => onBookNow(room)}
          disabled={remainingMinutes <= 0}
          className="w-full cursor-pointer whitespace-nowrap"
          icon={<i className="ri-calendar-check-line"></i>}
        >
          {remainingMinutes <= 0 ? 'Limit Reached' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
}
