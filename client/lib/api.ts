import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '') || 'http://localhost:5000';

function resolveUploadUrl(pathOrUrl: string | undefined | null): string {
  if (!pathOrUrl) return '';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    try {
      const u = new URL(pathOrUrl);
      if (u.pathname.includes('/uploads/')) {
        const afterUploads = u.pathname.split('/uploads/').pop() || '';
        return `${API_ORIGIN}/uploads/${afterUploads}${u.search}`;
      }
    } catch (_) {}
    return pathOrUrl;
  }
  if (pathOrUrl.includes('/uploads/')) {
    const afterUploads = pathOrUrl.split('/uploads/').pop() || '';
    return `${API_ORIGIN}/uploads/${afterUploads}`;
  }
  return `${API_ORIGIN}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/* ✅ FIXED AXIOS INSTANCE — NO /public */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* AUTH API (kept separate if you want auth isolation) */
const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;