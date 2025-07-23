// server/scripts/createUsers.js
const admin = require('firebase-admin');
const serviceAccount = require('../config/serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function createUsers() {
  const users = [
    { email: 'admin@example.com', password: 'password123', displayName: 'Admin User' },
    { email: 'client@example.com', password: 'password123', displayName: 'Client User' }
  ];

  for (const user of users) {
    try {
      const userRecord = await admin.auth().createUser(user);
      console.log('✅ Created user:', userRecord.email);
    } catch (err) {
      if (err.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists:', user.email);
      } else {
        console.error('❌ Error creating user:', user.email, err.message);
      }
    }
  }

  process.exit(0);
}

createUsers();