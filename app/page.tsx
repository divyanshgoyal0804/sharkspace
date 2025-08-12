
'use client';

import LoginForm from '@/components/LoginForm';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="absolute top-8 right-8">
          <ThemeToggle />
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
                Welcome to{' '}
                <span className="text-blue-600">SharkSpace</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Modern coworking space in Noida with flexible room booking system. 
                Book your perfect workspace with just a few clicks.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
                  <i className="ri-time-line text-blue-600"></i>
                  <span className="text-sm font-medium">Flexible Booking</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
                  <i className="ri-shield-check-line text-green-600"></i>
                  <span className="text-sm font-medium">Secure Access</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-lg">
                  <i className="ri-calendar-check-line text-purple-600"></i>
                  <span className="text-sm font-medium">Easy Management</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto lg:mx-0">
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">3</div>
                <div className="text-sm text-gray-600">Rooms</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">60</div>
                <div className="text-sm text-gray-600">Min/Day</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Access</div>
              </div>
            </div>
          </div>
          
          <div>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
