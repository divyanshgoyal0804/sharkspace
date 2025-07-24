// client/src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCTEfyvPuoer9cKSoJ9P08BRvWVQmLJZko",
  authDomain: "booking-app-auth-db152.firebaseapp.com	",
  projectId: "booking-app-auth-db152",
  appId: "1:126738190527:web:d1652877958b5978f1760a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);