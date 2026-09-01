// ─── api.js — Updated req function ───────────────────────────────────────────
import { API_BASE, db } from './firebase.js';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

let _token = null;
let _userId = null;

// ─── Initialize token from Firestore ──────────────────────────────────────────
async function initializeToken() {
  try {
    // Try to get the stored user ID and token from Firestore
    const appStateDoc = await getDoc(doc(db, 'appState', 'currentUser'));
    if (appStateDoc.exists()) {
      const data = appStateDoc.data();
      _token = data.token;
      _userId = data.userId;
    }
  } catch (err) {
    console.warn('[Firestore] Could not load token:', err.message);
  }
}

// Initialize on module load
initializeToken();

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
export async function setToken(t, userId = null) {
  _token = t;
  _userId = userId;
  try {
    if (t) {
      // Save token to Firestore
      await setDoc(doc(db, 'appState', 'currentUser'), {
        token: t,
        userId: userId,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Clear token from Firestore
      await setDoc(doc(db, 'appState', 'currentUser'), {
        token: null,
        userId: null,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[Firestore] Error saving token:', err.message);
  }
}
export function getToken()  { return _token; }
export function hasToken()  { return !!_token; }
export function getUserId() { return _userId; }

// ─── TEACHER AUTH ─────────────────────────────────────────────────────────────
export async function teacherRegister(name, email, password, schoolName) {
  const data = await req('POST', '/api/teacher/register', { name, email, password, schoolName });
  if (data?.token) {
    await setToken(data.token, data.id);
    // Save teacher info to Firestore
    await syncTeacherData(data);
  }
  return data;
}

export async function teacherLogin(email, password) {
  const data = await req('POST', '/api/teacher/login', { email, password });
  if (data?.token) {
    await setToken(data.token, data.id);
    // Save teacher info to Firestore
    await syncTeacherData(data);
  }
  return data;
}

export async function guestLogin() {
  const data = await req('POST', '/api/guest-login', {});
  if (data?.token) {
    await setToken(data.token, data.id);
  }
  return data;
}

// ─── Firestore Sync Functions ─────────────────────────────────────────────────
async function syncTeacherData(teacherData) {
  try {
    await setDoc(doc(db, 'teachers', teacherData.id), {
      id: teacherData.id,
      name: teacherData.name,
      email: teacherData.email,
      schoolName: teacherData.schoolName,
      pin: teacherData.pin,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Firestore] Error syncing teacher data:', err.message);
  }
}

async function syncStudentData(studentData, teacherId) {
  try {
    await setDoc(doc(db, 'teachers', teacherId, 'students', studentData.id), {
      id: studentData.id,
      name: studentData.name,
      avatar: studentData.avatar,
      pin: studentData.pin,
      stars: studentData.stars || 0,
      createdAt: studentData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Firestore] Error syncing student data:', err.message);
  }
}

export const getTeacherMe  = ()    => req('GET',  '/api/teacher/me');
export const verifyPin     = (pin) => req('POST', '/api/teacher/verify-pin', { pin });
export const changePin     = (pin) => req('PUT',  '/api/teacher/pin', { pin });

// ─── STUDENTS ─────────────────────────────────────────────────────────────────
export const getStudents = () => req('GET', '/api/students');

export async function createStudent(name, avatar, pin) {
  const data = await req('POST', '/api/students', { name, avatar, pin });
  if (_userId && data?.id) {
    await syncStudentData(data, _userId);
  }
  return data;
}

export async function updateStudent(id, data) {
  const result = await req('PUT', `/api/students/${id}`, data);
  if (_userId && result?.id) {
    await syncStudentData(result, _userId);
  }
  return result;
}

export async function earnStarAPI(id, amount = 1) {
  const result = await req('POST', `/api/students/${id}/earn`, { amount });
  if (_userId && result?.id) {
    await syncStudentData(result, _userId);
  }
  return result;
}

export async function deleteStudentAPI(id) {
  const result = await req('DELETE', `/api/students/${id}`);
  if (_userId) {
    try {
      // Remove from Firestore
      const docRef = doc(db, 'teachers', _userId, 'students', id);
      await setDoc(docRef, { deleted: true, updatedAt: new Date().toISOString() }, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error deleting student:', err.message);
    }
  }
  return result;
}

// ─── SESSIONS ─────────────────────────────────────────────────────────────────
export async function startSession(student_id, category, mode) {
  const result = await req('POST', '/api/sessions', { student_id, category, mode });
  if (_userId && result?.id) {
    try {
      await setDoc(doc(db, 'teachers', _userId, 'sessions', result.id), {
        id: result.id,
        student_id,
        category,
        mode,
        startedAt: new Date().toISOString(),
        status: 'active',
      });
    } catch (err) {
      console.error('[Firestore] Error saving session:', err.message);
    }
  }
  return result;
}

export async function finishSession(id, student_id, score, total, dur) {
  const result = await req('PUT', `/api/sessions/${id}`, { student_id, score, total, duration_s: dur });
  if (_userId && result?.id) {
    try {
      await setDoc(doc(db, 'teachers', _userId, 'sessions', id), {
        id,
        student_id,
        score,
        total,
        duration_s: dur,
        completedAt: new Date().toISOString(),
        status: 'completed',
      }, { merge: true });
    } catch (err) {
      console.error('[Firestore] Error finishing session:', err.message);
    }
  }
  return result;
}

export const saveAnswers = (sessionId, student_id, answers) => req('POST', `/api/sessions/${sessionId}/answers`, { student_id, answers });

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
export const getLeaderboard      = (limit = 10) => req('GET', `/api/leaderboard?limit=${limit}`);
export const getOverview         = ()           => req('GET', '/api/analytics/overview');
export const getCategoryStats    = ()           => req('GET', '/api/analytics/category');
export const getStudentAnalytics = (id)         => req('GET', `/api/analytics/student/${id}`);
