
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Room, storage } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface RoomManagementProps {
  rooms: Room[];
  onUpdate: () => void;
}

export default function RoomManagement({ rooms, onUpdate }: RoomManagementProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imagePrompt: ''
  });

  const handleAdd = () => {
    setEditingRoom(null);
    setFormData({ name: '', description: '', imagePrompt: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description,
      imagePrompt: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const imageUrl = formData.imagePrompt 
      ? `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28formData.imagePrompt%29%7D&width=800&height=600&seq=${uuidv4()}&orientation=landscape`
      : editingRoom?.image || '';

    if (editingRoom) {
      const updatedRooms = rooms.map(room => 
        room.id === editingRoom.id 
          ? { ...room, name: formData.name, description: formData.description, image: imageUrl }
          : room
      );
      storage.setRooms(updatedRooms);
    } else {
      const newRoom: Room = {
        id: uuidv4(),
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        createdAt: new Date()
      };
      storage.setRooms([...rooms, newRoom]);
    }
    
    onUpdate();
    setIsModalOpen(false);
  };

  const handleDelete = (roomId: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter(room => room.id !== roomId);
      storage.setRooms(updatedRooms);
      onUpdate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Room Management</h2>
        <Button
          onClick={handleAdd}
          icon={<i className="ri-add-line"></i>}
        >
          Add Room
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={room.image}
                alt={room.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">{room.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{room.description}</p>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(room)}
                  icon={<i className="ri-edit-line"></i>}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(room.id)}
                  icon={<i className="ri-delete-bin-line"></i>}
                >
                  Delete
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Room' : 'Add New Room'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Room Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter room name"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room description"
            />
          </div>
          
          <Input
            label="Image Description (Optional)"
            value={formData.imagePrompt}
            onChange={(e) => setFormData({ ...formData, imagePrompt: e.target.value })}
            placeholder="Describe the room image you want to generate"
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingRoom ? 'Update' : 'Create'} Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
