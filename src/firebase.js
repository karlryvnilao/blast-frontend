// ─── firebase.js ─────────────────────────────────────────────────────────────
// Set this to your Render backend URL after deploying.
// Example: https://blast-backend.onrender.com
//
// For local testing:
//   Android emulator → http://10.0.2.2:3001
//   Real phone (WiFi) → http://YOUR_PC_IP:3001

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://blast-backend.onrender.com';
