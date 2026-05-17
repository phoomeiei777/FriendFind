import { Platform } from 'react-native';
import Constants from 'expo-constants';

/** พอร์ตเดียวกับ backend (docker-compose BACKEND_PORT / server PORT) */
const DEFAULT_PORT = 5001;
const DEFAULT_WEB = `http://127.0.0.1:${DEFAULT_PORT}`;

/**
 * ลำดับการเลือก API base:
 * 1) EXPO_PUBLIC_API_URL — override ทุกแพลตฟอร์ม (เช่น มือถือจริงชี้ IP เครื่อง dev)
 * 2) Web: extra.apiBaseWeb หรือ http://localhost:PORT (รัน Web + Docker backend บนเครื่องเดียวกัน)
 * 3) Native: extra.apiBase ถ้ามี ไม่เช่นนั้นใช้ค่าเริ่มต้นตาม OS (iOS sim / Android emu)
 */
function getDefaultNativeBase() {
  if (Platform.OS === 'android') return `http://10.0.2.2:${DEFAULT_PORT}`;
  return DEFAULT_WEB;
}

export function getApiBase() {
  const fromEnv =
    typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  // ดึง IP ของเครื่องคอมพิวเตอร์แบบไดนามิกเมื่อรันผ่าน Expo Go ในวง LAN
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // hostUri มักจะมีรูปแบบเช่น '192.168.1.100:8081'
    const ip = hostUri.split(':')[0];
    // ถ้าไม่ใช่ localhost ให้ใช้ IP ของเครื่อง dev นั้นๆ
    if (ip && ip !== '127.0.0.1' && ip !== 'localhost') {
      return `http://${ip}:${DEFAULT_PORT}`;
    }
  }

  const extra = Constants.expoConfig?.extra || {};

  if (Platform.OS === 'web') {
    // เบราว์เซอร์บนเครื่องเดียวกับ Docker: map พอร์ต host เช่น 5000:5000 → ใช้ localhost
    return extra.apiBaseWeb || DEFAULT_WEB;
  }

  if (extra.apiBase) return extra.apiBase;

  return getDefaultNativeBase();
}

async function parseJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Invalid response' };
  }
}

export async function apiFetch(path, options = {}) {
  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const data = await parseJson(res);
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export function authHeaders(token) {
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function uploadImage(uri, token) {
  if (!uri) return null;
  // If it's already a remote URL, just return it
  if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;

  const base = getApiBase();
  const url = `${base}/api/upload`;
  
  const filename = uri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('image', {
    uri,
    name: filename,
    type
  });

  const headers = authHeaders(token);
  // Do not set Content-Type to application/json, fetch will automatically set multipart/form-data with boundary

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    const data = await parseJson(res);
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    
    // Convert relative path /uploads/filename.jpg to absolute URL http://192.168.1.100:5001/uploads/filename.jpg
    return `${base}${data.url}`;
  } catch (err) {
    console.error('Image upload error:', err);
    throw err;
  }
}
