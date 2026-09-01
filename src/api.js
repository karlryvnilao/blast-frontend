// ─── api.js — Updated req function ───────────────────────────────────────────
import { API_BASE } from './firebase.js';

let _token = null;

try {
  const saved = localStorage.getItem('blast_token');
  if (saved) _token = saved;
} catch(_) {}

async function req(method, path, body) {
  // Debug log: verify where requests are sending
  console.log(`[API Request] ${method} ${API_BASE}${path}`);

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return data;
  // Removed catch block so actual errors bubble up to UI components
}

// ... Keep your export functions identical below this

// ─── TOKEN ────────────────────────────────────────────────────────────────────
export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('blast_token', t);
  else   localStorage.removeItem('blast_token');
}
export function getToken()  { return _token; }
export function hasToken()  { return !!_token; }

// ─── TEACHER AUTH ─────────────────────────────────────────────────────────────
export async function teacherRegister(name, email, password, schoolName) {
  const data = await req('POST', '/api/teacher/register', { name, email, password, schoolName });
  if (data?.token) setToken(data.token);
  return data;
}

export async function teacherLogin(email, password) {
  const data = await req('POST', '/api/teacher/login', { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

export const getTeacherMe  = ()    => req('GET',  '/api/teacher/me');
export const verifyPin     = (pin) => req('POST', '/api/teacher/verify-pin', { pin });
export const changePin     = (pin) => req('PUT',  '/api/teacher/pin', { pin });

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
export const getStudents      = ()                  => req('GET',    '/api/students');
export const createStudent    = (name, avatar, pin) => req('POST',   '/api/students', { name, avatar, pin });
export const updateStudent    = (id, data)          => req('PUT',    `/api/students/${id}`, data);
export const earnStarAPI      = (id, amount = 1)    => req('POST',   `/api/students/${id}/earn`, { amount });
export const deleteStudentAPI = (id)                => req('DELETE', `/api/students/${id}`);

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
export const startSession  = (student_id, category, mode)         => req('POST', '/api/sessions', { student_id, category, mode });
export const finishSession = (id, student_id, score, total, dur)  => req('PUT',  `/api/sessions/${id}`, { student_id, score, total, duration_s: dur });
export const saveAnswers   = (sessionId, student_id, answers)     => req('POST', `/api/sessions/${sessionId}/answers`, { student_id, answers });

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getLeaderboard      = (limit = 10) => req('GET', `/api/leaderboard?limit=${limit}`);
export const getOverview         = ()           => req('GET', '/api/analytics/overview');
export const getCategoryStats    = ()           => req('GET', '/api/analytics/category');
export const getStudentAnalytics = (id)         => req('GET', `/api/analytics/student/${id}`);
