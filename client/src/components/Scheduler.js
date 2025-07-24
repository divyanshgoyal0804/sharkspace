// client/src/components/Scheduler.js
import React, { useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Scheduler = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bookings, setBookings] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalHour, setModalHour] = useState(0);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const now = new Date();
  const isToday = date === now.toISOString().split('T')[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token);
        setUser(user);
        fetchBookings(date);
      } else {
        setUser(null);
        setAuthToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchBookings = async (selectedDate) => {
    try {
      const res = await api.get('/bookings');
      const filtered = res.data.filter(b => b.date === selectedDate);
      setBookings(filtered);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  useEffect(() => {
    if (user) fetchBookings(date);
  }, [date, user]);

  // Format 24h → 12h for labels
  const to12Hour = (hour24) => {
    const h = parseInt(hour24, 10);
    if (h === 0) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  const pad = (num) => num.toString().padStart(2, '0');

  const isBooked = (hour) => {
    return bookings.some(b => parseInt(b.startTime.split(':')[0], 10) === hour);
  };

  const getLabel = (hour) => {
    const booking = bookings.find(b => parseInt(b.startTime.split(':')[0], 10) === hour);
    if (!booking) return '';
    return `${booking.startTime} - ${booking.endTime}`;
  };

  // Check if a time range overlaps with any booking
  const hasOverlap = (start, end) => {
    return bookings.some(b => {
      const bStart = new Date(`${date}T${b.startTime}`);
      const bEnd = new Date(`${date}T${b.endTime}`);
      return start < bEnd && end > bStart;
    });
  };

  // Check if time is in the past (for today only)
  const isPastTime = (hour) => {
    if (!isToday) return false;
    return hour < now.getHours();
  };

  // Open modal on block click
  const handleBlockClick = (hour) => {
    if (!user || isBooked(hour) || isPastTime(hour)) return;

    const defaultStart = `${pad(hour)}:00`;
    const defaultEnd = `${pad(hour)}:30`; // Default 30 min

    setModalHour(hour);
    setStartTime(defaultStart);
    setEndTime(defaultEnd);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmBooking = async () => {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      alert('Invalid time.');
      return;
    }

    if (end <= start) {
      alert('End time must be after start time.');
      return;
    }

    const duration = (end - start) / (1000 * 60);
    if (duration > 60) {
      alert('Maximum booking duration is 60 minutes.');
      return;
    }

    if (hasOverlap(start, end)) {
      alert('This time range overlaps with an existing booking.');
      return;
    }

    // Check if user already has a booking today
    const userHasBooking = bookings.some(b => b.userId === user.uid);
    if (userHasBooking) {
      alert('You can only book one time slot per day.');
      return;
    }

    if (window.confirm(`Book from ${startTime} to ${endTime}?`)) {
      try {
        await api.post('/bookings', {
          userId: user.uid,
          userName: user.email.split('@')[0],
          room: 'Room A',
          date,
          startTime,
          endTime,
        });
        alert('✅ Booking confirmed!');
        fetchBookings(date);
        closeModal();
      } catch (err) {
        alert(err.response?.data?.message || 'Booking failed.');
      }
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      fetchBookings(date);
    } catch (err) {
      alert('Login failed. Try again.');
    }
  };

  const logout = () => {
    signOut(auth).then(() => alert('Logged out.'));
  };

  const renderTimeRow = (start, end, label) => {
    const hours = Array.from({ length: 12 }, (_, i) => start + i);
    return (
      <div key={label} style={styles.row}>
        <div style={styles.label}>{label}</div>
        <div style={styles.bar}>
          {hours.map(hour => {
            const booked = isBooked(hour);
            const past = isPastTime(hour);
            const isClickable = !booked && !past && user;

            return (
              <div
                key={hour}
                style={{
                  ...styles.block,
                  backgroundColor: booked
                    ? '#CCCCCC'
                    : past
                    ? '#E5E5E5'
                    : '#1CA8C9',
                  cursor: isClickable ? 'pointer' : 'not-allowed',
                  opacity: isClickable ? 1 : 0.6,
                  position: 'relative'
                }}
                onClick={() => isClickable && handleBlockClick(hour)}
              >
                {booked && (
                  <span style={styles.timeLabel}>
                    {getLabel(hour)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1>⏰ Book a Time Slot</h1>
        {user ? (
          <div style={styles.userSection}>
            <span>Hi, <strong>{user.email.split('@')[0]}</strong></span>
            <button onClick={logout} style={styles.logoutButton}>Logout</button>
          </div>
        ) : (
          <form onSubmit={login} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button type="submit" style={styles.loginButton}>Login</button>
          </form>
        )}
      </header>

      {/* Date Selector */}
      {user && (
        <div style={styles.datePicker}>
          <label style={styles.dateLabel}>
            Select Date:
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={styles.dateInput}
            />
          </label>
        </div>
      )}

      {/* Time Bars */}
      {user && (
        <div style={styles.scheduler}>
          {renderTimeRow(0, 11, '🕛 Midnight – Noon')}
          {renderTimeRow(12, 23, '🕐 Noon – Midnight')}
        </div>
      )}

      {/* Minute-Accurate Booking Modal */}
      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={closeModal}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>⏱️ Set Booking Time</h3>

            <div style={styles.field}>
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={styles.timeInput}
              />
            </div>

            <div style={styles.field}>
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                style={styles.timeInput}
              />
            </div>

            {/* Duration Preview */}
            <div style={styles.duration}>
              Duration: <strong>{(() => {
                const start = new Date(`2025-01-01T${startTime}`);
                const end = new Date(`2025-01-01T${endTime}`);
                const mins = (end - start) / (1000 * 60);
                if (isNaN(mins) || mins <= 0) return '--';
                return `${Math.round(mins)} min`;
              })()}</strong>
              {(() => {
                const start = new Date(`2025-01-01T${startTime}`);
                const end = new Date(`2025-01-01T${endTime}`);
                const mins = (end - start) / (1000 * 60);
                if (mins > 60) return (
                  <span style={{ color: '#FF6B6B', marginLeft: '8px' }}>
                    ⚠️ Max 60 min
                  </span>
                );
                return null;
              })()}
            </div>

            {/* Buttons */}
            <div style={styles.modalButtons}>
              <button onClick={closeModal} style={styles.cancelBtn}>Cancel</button>
              <button onClick={confirmBooking} style={styles.confirmBtn}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {user && (
        <div style={styles.footer}>
          <p style={styles.footerText}>
            💡 Click any <strong>blue</strong> block to set exact time. Max 60 minutes.
          </p>
        </div>
      )}
    </div>
  );
};

// === STYLES ===
const styles = {
  container: {
    fontFamily: 'Poppins, sans-serif',
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 0',
    borderBottom: '1px solid #E5E5E5',
    flexWrap: 'wrap',
    gap: '10px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  form: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  input: {
    padding: '10px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    width: '180px',
  },
  loginButton: {
    backgroundColor: '#1CA8C9',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  datePicker: {
    margin: '20px 0',
    textAlign: 'center',
  },
  dateLabel: {
    fontSize: '14px',
    color: '#1A1A1A',
  },
  dateInput: {
    marginLeft: '10px',
    padding: '8px',
    border: '1px solid #1CA8C9',
    borderRadius: '4px',
  },
  scheduler: {
    marginTop: '20px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px',
  },
  label: {
    width: '120px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1A1A1A',
    textAlign: 'right',
    paddingRight: '10px',
  },
  bar: {
    display: 'flex',
    flex: 1,
    gap: '4px',
  },
  block: {
    flex: 1,
    height: '60px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '500',
    fontSize: '12px',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  timeLabel: {
    position: 'absolute',
    top: '8px',
    left: 0,
    right: 0,
    fontSize: '10px',
    color: '#000',
    fontWeight: 'normal',
    whiteSpace: 'nowrap',
    textShadow: '0 0 2px white',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    padding: '15px',
    borderTop: '1px solid #E5E5E5',
    marginTop: '30px',
  },
  footerText: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },

  // Modal
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '400px',
    padding: '20px',
    fontFamily: 'Poppins, sans-serif',
  },
  modalTitle: {
    margin: '0 0 15px 0',
    fontSize: '18px',
    color: '#1A1A1A',
  },
  field: {
    marginBottom: '15px',
  },
  timeInput: {
    marginTop: '5px',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #E5E5E5',
    borderRadius: '8px',
    width: '100%',
    fontFamily: 'monospace',
  },
  duration: {
    fontSize: '14px',
    color: '#1A1A1A',
    marginBottom: '20px',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    backgroundColor: '#E5E5E5',
    color: '#1A1A1A',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  confirmBtn: {
    backgroundColor: '#1CA8C9',
    color: 'white',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

export default Scheduler;