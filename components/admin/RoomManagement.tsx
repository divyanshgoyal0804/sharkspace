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
        <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
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
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="h-48 overflow-hidden">
              <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{room.description}</p>
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
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            required
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
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
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
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
