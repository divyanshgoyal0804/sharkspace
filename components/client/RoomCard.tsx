
'use client';

import { Room } from '@/lib/types';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface RoomCardProps {
  room: Room;
  onBookNow: (room: Room) => void;
  userBookings: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export default function RoomCard({ room, onBookNow, userBookings }: RoomCardProps) {
  const remainingMinutes = 60 - userBookings;
  const progressPercentage = (userBookings / 60) * 100;

  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -10, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300"
    >
      <div className="relative h-48 overflow-hidden">
        <motion.img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover object-top"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        />
        
        <motion.div 
          className="absolute top-4 right-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          <motion.div 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.7)",
                "0 0 0 10px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {remainingMinutes}m left
          </motion.div>
        </motion.div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="p-6">
        <motion.h3 
          className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {room.name}
        </motion.h3>
        <motion.p 
          className="text-gray-600 dark:text-gray-300 mb-4 text-sm transition-colors duration-300"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {room.description}
        </motion.p>
        
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's Usage</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{userBookings}/60 min</span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              className={`h-2 rounded-full ${
                progressPercentage < 50 ? 'bg-green-500 dark:bg-green-400' : 
                progressPercentage < 80 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-red-500 dark:bg-red-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => onBookNow(room)}
            disabled={remainingMinutes <= 0}
            className="w-full cursor-pointer whitespace-nowrap"
            icon={<i className="ri-calendar-check-line"></i>}
          >
            {remainingMinutes <= 0 ? 'Limit Reached' : 'Book Now'}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
