// client/src/App.js
import React from 'react';
import Scheduler from './components/Scheduler';
import AdminDashboard from './components/AdminDashboard';
import { auth } from './firebase';
import { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      // Simulate admin check (in real app, store role in DB or Firebase claims)
      setIsAdmin(user && user.email === 'admin@example.com');
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      {!user ? (
        <Scheduler />
      ) : isAdmin ? (
        <AdminDashboard />
      ) : (
        <Scheduler />
      )}
    </div>
  );
}

export default App;