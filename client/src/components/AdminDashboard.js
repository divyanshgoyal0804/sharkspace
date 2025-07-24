// client/src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({});
  const [form, setForm] = useState({
    room: 'Room A',
    date: '',
    startTime: '',
    endTime: '',
    reason: 'Maintenance'
  });

  const user = auth.currentUser; // Get current logged-in user

  const logout = () => {
    signOut(auth)
      .then(() => {
        alert('Logged out successfully');
        // Optionally: redirect handled by App.js re-render
      })
      .catch((err) => {
        console.error('Logout error:', err);
        alert('Failed to log out');
      });
  };

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = () => {
    api.get('/bookings')
      .then((res) => setBookings(res.data))
      .catch((err) => console.error('Fetch bookings error:', err));
  };

  const fetchStats = () => {
    api.get('/bookings/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Fetch stats error:', err));
  };

  const blockSlot = () => {
    if (!form.date || !form.startTime || !form.endTime) {
      alert('Please fill in date, start, and end time');
      return;
    }

    api.post('/bookings/block', form)
      .then(() => {
        fetchBookings();
        alert('Slot blocked successfully');
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Failed to block slot');
      });
  };

  const exportCSV = () => {
    api.get('/bookings/export/csv', { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'bookings.csv');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => alert('Export failed'));
  };

  const deleteBooking = (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      api.delete(`/bookings/${id}`)
        .then(() => fetchBookings())
        .catch(() => alert('Delete failed'));
    }
  };

  return (
    <div style={styles.container}>
      {/* Header with Logout */}
      <header style={styles.header}>
        <h2>Admin Dashboard</h2>
        <div style={styles.userSection}>
          <span>Welcome, <strong>{user?.email}</strong></span>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      {/* Block Slot Section */}
      <section style={styles.section}>
        <h3>🔧 Block Time Slot</h3>
        <div style={styles.formRow}>
          <input
            type="date"
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            style={styles.input}
          />
          <input
            type="time"
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            style={styles.input}
          />
          <input
            type="time"
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            style={styles.input}
          />
          <select
            onChange={(e) => setForm({ ...form, room: e.target.value })}
            style={styles.input}
          >
            <option value="Room A">Room A</option>
            <option value="Room B">Room B</option>
          </select>
          <input
            placeholder="Reason (e.g. Maintenance)"
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            style={styles.input}
            defaultValue="Maintenance"
          />
          <button onClick={blockSlot} style={styles.button}>
            Block Slot
          </button>
        </div>
      </section>

      {/* Stats */}
      <section style={styles.section}>
        <h3>📊 Dashboard Stats</h3>
        <p>Total Bookings: <strong>{stats.totalBookings || 0}</strong></p>
        <p>Peak Booking Times: <strong>{stats.peakHours?.map(p => p._id).join(', ') || '—'}</strong></p>
      </section>

      {/* All Bookings List */}
      <section style={styles.section}>
        <h3>📋 All Bookings</h3>
        <button onClick={exportCSV} style={styles.exportButton}>
          📥 Export to CSV
        </button>
        <ul style={styles.list}>
          {bookings.length === 0 ? (
            <li style={styles.listItem}>No bookings found.</li>
          ) : (
            bookings.map((b) => (
              <li key={b._id} style={styles.listItem}>
                <div>
                  <strong>{b.date}</strong> | {b.startTime} – {b.endTime} | {b.room}
                  <br />
                  <small>
                    {b.isBlocked ? (
                      <span style={{ color: '#FF6B6B' }}>🔴 Blocked: {b.reason}</span>
                    ) : (
                      <span style={{ color: '#1CA8C9' }}>✅ Booked by: {b.userName}</span>
                    )}
                  </small>
                </div>
                <button
                  onClick={() => deleteBooking(b._id)}
                  style={styles.deleteBtn}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
};

// === Styles ===
const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Poppins, sans-serif',
    backgroundColor: '#fff',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    marginBottom: '20px',
    borderBottom: '1px solid #E5E5E5',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B', // Soft Coral
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '14px',
    transition: 'background-color 0.2s',
  },
  section: {
    marginBottom: '30px',
    padding: '15px',
    border: '1px solid #E5E5E5',
    borderRadius: '8px',
    backgroundColor: '#fafafa',
  },
  formRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    alignItems: 'center',
  },
  input: {
    padding: '10px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#1CA8C9', // Teal Blue
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#8A8A8A',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
    marginBottom: '10px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  listItem: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  deleteBtn: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AdminDashboard;