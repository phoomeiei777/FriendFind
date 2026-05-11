import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiFetch, authHeaders, getApiBase } from '../services/api';

const STORAGE_SUBJECT = '@friendfind_active_subject';
const STORAGE_TOKEN   = '@friendfind_token';
const STORAGE_USER    = '@friendfind_user';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeSubject, setActiveSubjectState] = useState(null);
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const [subJson, tok, userJson] = await Promise.all([
          AsyncStorage.getItem(STORAGE_SUBJECT),
          AsyncStorage.getItem(STORAGE_TOKEN),
          AsyncStorage.getItem(STORAGE_USER),
        ]);
        if (subJson)  setActiveSubjectState(JSON.parse(subJson));
        if (tok)      setToken(tok);
        if (userJson) setUser(JSON.parse(userJson));
      } catch (e) {
        console.warn('Restore session failed', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Active Subject ────────────────────────────────────────────
  const setActiveSubject = useCallback(async (subject) => {
    setActiveSubjectState(subject);
    try {
      if (subject) {
        await AsyncStorage.setItem(STORAGE_SUBJECT, JSON.stringify(subject));
      } else {
        await AsyncStorage.removeItem(STORAGE_SUBJECT);
      }
    } catch (e) {
      console.warn('AsyncStorage error:', e);
    }
  }, []);

  // ─── Auth ──────────────────────────────────────────────────────
  const login = useCallback(async (identity, password) => {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identity, password }),
    });
    setToken(data.token);
    setUser(data.user);
    try {
      await AsyncStorage.setItem(STORAGE_TOKEN, data.token);
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
    } catch (e) {
      console.warn('AsyncStorage error:', e);
    }
    return data;
  }, []);

  const register = useCallback(async ({ username, email, password, phone, faculty, year, interests, profile_image_url }) => {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, phone, faculty, year, interests, profile_image_url }),
    });
  }, []);

  const mockSetUser = useCallback(async (userData) => {
    setUser(userData);
    try {
      await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(userData));
    } catch (e) {
      console.warn('AsyncStorage error:', e);
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      await AsyncStorage.multiRemove([STORAGE_TOKEN, STORAGE_USER]);
    } catch (e) {
      console.warn('AsyncStorage error:', e);
    }
  }, []);

  // ─── Subjects & Users ─────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    return apiFetch('/api/subjects');
  }, []);

  const fetchAllUsers = useCallback(async () => {
    return apiFetch('/api/users', { headers: authHeaders(token) });
  }, [token]);

  const fetchUsersByActiveSubject = useCallback(async (subjectCode) => {
    return apiFetch(`/api/users/active-subject/${encodeURIComponent(subjectCode)}`);
  }, []);

  const fetchUsersBySubject = useCallback(async (subjectCode) => {
    return apiFetch(`/api/users/active-subject/${encodeURIComponent(subjectCode)}`, { headers: authHeaders(token) });
  }, [token]);

  // ─── Enrollments ──────────────────────────────────────────────
  const enrollSubject = useCallback(async (subjectId) => {
    return apiFetch(`/api/enrollments/${subjectId}/enroll`, {
      method: 'POST',
      headers: authHeaders(token),
    });
  }, [token]);

  const fetchMyEnrollments = useCallback(async () => {
    return apiFetch('/api/enrollments/my', { headers: authHeaders(token) });
  }, [token]);

  const fetchMyApprovedSubjects = useCallback(async () => {
    return apiFetch('/api/enrollments/my-approved', { headers: authHeaders(token) });
  }, [token]);

  // ─── Groups ───────────────────────────────────────────────────
  const fetchGroups = useCallback(async (subjectId) => {
    const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return apiFetch(`/api/groups${q}`);
  }, []);

  const fetchMyGroups = useCallback(async (subjectId) => {
    const q = subjectId ? `?subject_id=${encodeURIComponent(subjectId)}` : '';
    return apiFetch(`/api/groups/my${q}`, { headers: authHeaders(token) });
  }, [token]);

  const createGroup = useCallback(async (body) => {
    return apiFetch('/api/groups', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
  }, [token]);

  const joinGroup = useCallback(async (groupId) => {
    return apiFetch(`/api/groups/${groupId}/join`, {
      method: 'POST',
      headers: authHeaders(token),
    });
  }, [token]);

  const fetchGroupMembers = useCallback(async (groupId, status) => {
    const q = status ? `?status=${status}` : '';
    return apiFetch(`/api/groups/${groupId}/members${q}`, { headers: authHeaders(token) });
  }, [token]);

  const updateMemberStatus = useCallback(async (groupId, userId, status) => {
    return apiFetch(`/api/groups/${groupId}/members/${userId}`, {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ join_status: status }),
    });
  }, [token]);

  const deleteGroup = useCallback(async (groupId) => {
    return apiFetch(`/api/groups/${groupId}`, {
      method: 'DELETE',
      headers: authHeaders(token),
    });
  }, [token]);

  const leaveGroup = useCallback(async (groupId) => {
    return apiFetch(`/api/groups/${groupId}/leave`, {
      method: 'POST',
      headers: authHeaders(token),
    });
  }, [token]);

  // ─── Matches ──────────────────────────────────────────────────
  const recordSwipe = useCallback(async (targetId, direction) => {
    return apiFetch('/api/matches/swipe', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ target_id: targetId, direction }),
    });
  }, [token]);

  const fetchMatches = useCallback(async () => {
    return apiFetch('/api/matches', { headers: authHeaders(token) });
  }, [token]);

  // ─── Messages ─────────────────────────────────────────────────
  const sendMessage = useCallback(async ({ room_id, target_user_id, content, image_url }) => {
    return apiFetch('/api/messages', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ room_id, target_user_id, content, image_url }),
    });
  }, [token]);

  const fetchMessages = useCallback(async ({ room_id, target_user_id }) => {
    const params = new URLSearchParams();
    if (room_id)       params.append('room_id', room_id);
    if (target_user_id) params.append('target_user_id', target_user_id);
    return apiFetch(`/api/messages?${params.toString()}`, { headers: authHeaders(token) });
  }, [token]);

  // ─── Profile ──────────────────────────────────────────────────
  const updateProfile = useCallback(async (fields) => {
    const data = await apiFetch('/api/users/profile', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify(fields),
    });
    if (data.user) {
      setUser(data.user);
      try {
        await AsyncStorage.setItem(STORAGE_USER, JSON.stringify(data.user));
      } catch (e) {
        console.warn('AsyncStorage error:', e);
      }
    }
    return data;
  }, [token]);

  // ─── Context Value ────────────────────────────────────────────
  const value = useMemo(() => ({
    loading,
    activeSubject,
    setActiveSubject,
    token,
    user,
    login,
    register,
    mockSetUser,
    logout,
    fetchSubjects,
    fetchAllUsers,
    fetchUsersByActiveSubject,
    fetchUsersBySubject,
    fetchGroups,
    fetchMyGroups,
    createGroup,
    joinGroup,
    fetchGroupMembers,
    updateMemberStatus,
    deleteGroup,
    leaveGroup,
    recordSwipe,
    fetchMatches,
    sendMessage,
    fetchMessages,
    updateProfile,
    enrollSubject,
    fetchMyEnrollments,
    fetchMyApprovedSubjects,
    apiBase: getApiBase(),
    apiFetch,
    authHeaders,
  }), [
    loading, activeSubject, setActiveSubject, token, user,
    login, register, mockSetUser, logout,
    fetchSubjects, fetchAllUsers, fetchUsersByActiveSubject, fetchUsersBySubject,
    fetchGroups, fetchMyGroups, createGroup, joinGroup,
    fetchGroupMembers, updateMemberStatus, deleteGroup, leaveGroup,
    recordSwipe, fetchMatches, sendMessage, fetchMessages, updateProfile,
    enrollSubject, fetchMyEnrollments, fetchMyApprovedSubjects,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
