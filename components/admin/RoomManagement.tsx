'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Room } from '@/lib/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface RoomManagementProps {
  rooms: Room[];
  onUpdate: () => void;
}

export default function RoomManagement({ rooms: initialRooms, onUpdate }: RoomManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null as File | null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      if (editingRoom?.id) {
        formDataToSend.append('id', editingRoom.id);
      }

      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create/update room');
      }

      await onUpdate();
      setIsModalOpen(false);
      setFormData({
        name: '',
        description: '',
        image: null
      });
    } catch (error) {
      console.error('Error submitting room:', error);
      alert(error instanceof Error ? error.message : 'Failed to create/update room');
    }
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Delete this room?')) return;

    try {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete room');
      }
      
      await onUpdate();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete room');
    }

    onUpdate();
  };

  const openModal = (room?: Room) => {
    setEditingRoom(room || null);
    setFormData({
      name: room?.name || '',
      description: room?.description || '',
      image: null
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Room Management</h2>
        <Button onClick={() => openModal()} icon={<i className="ri-add-line"></i>}>
          Add Room
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-300"
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="h-48 overflow-hidden">
              <motion.img 
                src={room.image} 
                alt={room.name} 
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{room.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 transition-colors duration-300">{room.description}</p>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => openModal(room)} icon={<i className="ri-edit-line"></i>}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(room.id)} icon={<i className="ri-delete-bin-line"></i>}>Delete</Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRoom ? 'Edit Room' : 'Add Room'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
              Description
            </label>
            <textarea
              placeholder="Enter room description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
              rows={3}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
              Room Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFormData({ ...formData, image: file });
                }
              }}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 dark:file:bg-blue-900 file:text-blue-700 dark:file:text-blue-200
                hover:file:bg-blue-100 dark:hover:file:bg-blue-800 file:transition-colors file:duration-300"
              required={!editingRoom?.image}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingRoom ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
