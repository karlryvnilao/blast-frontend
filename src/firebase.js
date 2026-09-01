// ─── firebase.js ─────────────────────────────────────────────────────────────
// Set this to your Render backend URL after deploying.
// Example: https://blast-backend.onrender.com
//
// For local testing:
//   Android emulator → http://10.0.2.2:3001
//   Real phone (WiFi) → http://YOUR_PC_IP:3001

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://blast-backend-7x2d.onrender.com';

// Firebase Configuration - Update with your Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
