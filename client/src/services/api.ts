import { Bhajan, Announcement, NelloreArea, AdminStats, AuditLog } from '../types';

const DIRECT_RENDER_URL = 'https://ayyappa-bhajan-guide-backend.onrender.com';
const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${BACKEND_URL}/api`;

export const DEFAULT_NELLORE_AREAS: NelloreArea[] = [
  { id: 'stonehousepet', en: 'Stonehousepet', te: 'స్టోన్‌హౌస్‌పేట' },
  { id: 'vrc_centre', en: 'VRC Centre', te: 'వి.ఆర్.సి సెంటర్' },
  { id: 'dargamitta', en: 'Dargamitta', te: 'దర్గామిట్ట' },
  { id: 'vedayapalem', en: 'Vedayapalem', te: 'వేదాయపాలెం' },
  { id: 'magunta_layout', en: 'Magunta Layout', te: 'మాగుంట లేఅవుట్' },
  { id: 'nawabpet', en: 'Nawabpet', te: 'నవాబుపేట' },
  { id: 'podalakur_road', en: 'Podalakur Road', te: 'పొదలకూరు రోడ్' },
  { id: 'fathekhanpet', en: 'Fathekhanpet', te: 'ఫతేఖాన్‌పేట' },
  { id: 'kovur', en: 'Kovur (Nellore Suburb)', te: 'కోవూరు' },
  { id: 'buchireddypalem', en: 'Buchireddypalem (Near Nellore)', te: 'బుచ్చిరెడ్డిపాలెం' }
];

export const DEFAULT_NELLORE_BHAJANS: Bhajan[] = [
  {
    id: 1,
    name: 'Deeparadhana & Saranu Gosha Bhajan',
    name_te: 'దీపారాధన & శరణు ఘోష భజన',
    date: new Date().toISOString().split('T')[0],
    start_time: '07:00 PM',
    venue: 'VRC Centre Kalyana Mandapam, Nellore',
    venue_te: 'వి.ఆర్.సి సెంటర్ కళ్యాణ మండపం, నెల్లూరు',
    area: 'VRC Centre, Nellore',
    area_te: 'వి.ఆర్.సి సెంటర్, నెల్లూరు',
    map_url: 'https://maps.google.com/?q=14.4445,79.9878',
    latitude: 14.4445,
    longitude: 79.9878,
    organizer_name: 'Nellore Ayyappa Seva Samithi',
    contact_number: '9848054321',
    description: 'Samuhika Saranu Gosha, Divya Nama Sankeerthana, and Prasadam distribution.',
    description_te: 'సామూహిక శరణు ఘోష, దివ్య నామ సంకీర్తన మరియు ప్రసాద వితరణ.',
    status: 'approved',
    is_published: 1,
    is_sample: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Maha Padi Pooja & Sangeetha Bhajan',
    name_te: 'మహా పడిపూజ & సంగీత భజన',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    start_time: '06:30 PM',
    venue: 'Sri Ayyappa Swamy Temple, Stonehousepet',
    venue_te: 'శ్రీ అయ్యప్ప స్వామి దేవాలయం, స్టోన్‌హౌస్‌పేట',
    area: 'Stonehousepet, Nellore',
    area_te: 'స్టోన్‌హౌస్‌పేట, నెల్లూరు',
    map_url: 'https://maps.google.com/?q=14.4426,79.9865',
    latitude: 14.4426,
    longitude: 79.9865,
    organizer_name: 'Suresh Guruswami',
    contact_number: '9848012345',
    description: 'Special 18 step Padi Pooja with devotional songs, Harivarasanam, and Anna Dhanam afterwards.',
    description_te: 'భక్తిగీతాలు, హరివరాసనం మరియు అన్నదానంతో కూడిన ప్రత్యేక 18 మెట్ల పడిపూజ.',
    status: 'approved',
    is_published: 1,
    is_sample: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Thiruvabharanam & Padi Pooja Bhajan',
    name_te: 'తిరువాభరణం & పడిపూజ భజన',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    start_time: '06:00 PM',
    venue: 'Sri Raja Rajeswari Temple Mandapam, Dargamitta',
    venue_te: 'శ్రీ రాజరాజేశ్వరి ఆలయ మండపం, దర్గామిట్ట',
    area: 'Dargamitta, Nellore',
    area_te: 'దర్గామిట్ట, నెల్లూరు',
    map_url: 'https://maps.google.com/?q=14.4398,79.9792',
    latitude: 14.4398,
    longitude: 79.9792,
    organizer_name: 'Rajesh Guruswami',
    contact_number: '9440112233',
    description: 'Ayyappa Sannidhi decoration, Padi pooja, and Maha Mangala Harathi.',
    description_te: 'అయ్యప్ప సన్నిధి అలంకరణ, పడిపూజ మరియు మహా మంగళ హారతి.',
    status: 'approved',
    is_published: 1,
    is_sample: 1,
    created_at: new Date().toISOString()
  }
];

let authToken: string | null = typeof window !== 'undefined' ? sessionStorage.getItem('admin_token_jwt') : null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    sessionStorage.setItem('admin_token_jwt', token);
  } else {
    sessionStorage.removeItem('admin_token_jwt');
  }
}

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// Wake up notification system to allow UI to display a friendly status badge during Render cold-boot
type WakeUpListener = (isWaking: boolean, attempt: number) => void;
const wakeUpListeners: Set<WakeUpListener> = new Set();

export function onWakeUpStatusChange(listener: WakeUpListener) {
  wakeUpListeners.add(listener);
  return () => wakeUpListeners.delete(listener);
}

function notifyWakeUp(isWaking: boolean, attempt = 0) {
  wakeUpListeners.forEach(fn => {
    try {
      fn(isWaking, attempt);
    } catch (e) {
      // ignore
    }
  });
}

async function safeFetch(url: string, options?: RequestInit, maxRetries = 4): Promise<any> {
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      let currentUrl = url;
      // If we failed twice through proxy, try connecting directly to backend
      if (attempt >= 2 && currentUrl.startsWith('/api') && DIRECT_RENDER_URL) {
        currentUrl = `${DIRECT_RENDER_URL}${url}`;
      }

      const res = await fetch(currentUrl, options);

      // Render cold boot or gateway timeout (502, 503, 504)
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        if (attempt < maxRetries) {
          attempt++;
          notifyWakeUp(true, attempt);
          console.warn(`[Render] Server waking up (${res.status}). Retrying attempt ${attempt}/${maxRetries} in 3.5s...`);
          await new Promise(r => setTimeout(r, 3500));
          continue;
        }
        notifyWakeUp(false);
        throw new Error(`Backend server on Render is waking up (${res.status}). Please wait a few seconds and try again.`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        if (res.status === 404 || text.includes('<!DOCTYPE')) {
          if (attempt < maxRetries) {
            attempt++;
            notifyWakeUp(true, attempt);
            console.warn(`[Render] Gateway returned HTML (${res.status}). Retrying attempt ${attempt}/${maxRetries} in 3.5s...`);
            await new Promise(r => setTimeout(r, 3500));
            continue;
          }
          notifyWakeUp(false);
          throw new Error(`Backend server on Render is waking up (${res.status}). Please wait ~20 seconds for Render spin-up and try again.`);
        }
        notifyWakeUp(false);
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      const json = await res.json();
      notifyWakeUp(false);
      return json;
    } catch (err: any) {
      // Auto retry network disconnects during container startup (unless it's an intentional client abort)
      if (attempt < maxRetries && (!err.message || (!err.message.includes('Authentication failed') && !err.message.includes('Invalid credentials')))) {
        attempt++;
        notifyWakeUp(true, attempt);
        console.warn(`[Render] Connection attempt ${attempt}/${maxRetries} failed. Retrying in 3.5s...`);
        await new Promise(r => setTimeout(r, 3500));
        continue;
      }
      notifyWakeUp(false);
      throw err;
    }
  }
}

// ==================== PUBLIC APIS ====================

export async function fetchBhajans(params?: { area?: string; date?: string; filter?: string }): Promise<Bhajan[]> {
  const query = new URLSearchParams();
  if (params?.area) query.append('area', params.area);
  if (params?.date) query.append('date', params.date);
  if (params?.filter) query.append('filter', params.filter);

  try {
    const json = await safeFetch(`${API_BASE}/bhajans?${query.toString()}`);
    if (!json.success) throw new Error(json.error || 'Failed to fetch bhajans');
    return json.data && json.data.length > 0 ? json.data : DEFAULT_NELLORE_BHAJANS;
  } catch (err: any) {
    console.warn('Could not load remote bhajans, serving Nellore pilot data:', err.message);
    return DEFAULT_NELLORE_BHAJANS;
  }
}

export async function fetchBhajanById(id: number): Promise<Bhajan> {
  const json = await safeFetch(`${API_BASE}/bhajans/${id}`);
  if (!json.success) throw new Error(json.error || 'Bhajan not found');
  return json.data;
}

export async function submitBhajan(data: Partial<Bhajan>): Promise<{ message: string; submissionId: number }> {
  const json = await safeFetch(`${API_BASE}/bhajans/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!json.success) throw new Error(json.error || 'Failed to submit bhajan');
  return json;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const json = await safeFetch(`${API_BASE}/announcements`);
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAreas(): Promise<NelloreArea[]> {
  try {
    const json = await safeFetch(`${API_BASE}/areas`);
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return DEFAULT_NELLORE_AREAS;
  } catch (err) {
    return DEFAULT_NELLORE_AREAS;
  }
}

// ==================== SUPER ADMIN APIS ====================

export async function adminLogin(username: string, password: string) {
  const json = await safeFetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  if (!json.success) throw new Error(json.error || 'Authentication failed');
  if (json.token) {
    setAuthToken(json.token);
  }
  return json;
}

export async function adminLogout() {
  setAuthToken(null);
  try {
    const json = await safeFetch(`${API_BASE}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    return json;
  } catch (err) {
    return { success: true };
  }
}

export async function checkAdminAuth() {
  try {
    const json = await safeFetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return json.success && json.authenticated ? json.user : null;
  } catch (err) {
    return null;
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const json = await safeFetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to fetch admin stats');
  return json.data;
}

export async function fetchAdminBhajans(status?: string): Promise<Bhajan[]> {
  const query = status ? `?status=${status}` : '';
  const json = await safeFetch(`${API_BASE}/admin/bhajans${query}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to fetch admin bhajans');
  return json.data;
}

export async function adminCreateBhajan(data: Partial<Bhajan>) {
  const json = await safeFetch(`${API_BASE}/admin/bhajans`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!json.success) throw new Error(json.error || 'Failed to create bhajan');
  return json;
}

export async function adminUpdateBhajan(id: number, data: Partial<Bhajan>) {
  const json = await safeFetch(`${API_BASE}/admin/bhajans/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!json.success) throw new Error(json.error || 'Failed to update bhajan');
  return json;
}

export async function adminPatchStatus(id: number, action: 'approve' | 'reject' | 'publish' | 'unpublish' | 'cancel' | 'complete') {
  const json = await safeFetch(`${API_BASE}/admin/bhajans/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ action })
  });
  if (!json.success) throw new Error(json.error || 'Failed to update status');
  return json;
}

export async function adminDeleteBhajan(id: number) {
  const json = await safeFetch(`${API_BASE}/admin/bhajans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to delete bhajan');
  return json;
}

export async function adminCleanDemoData(): Promise<{ deletedCount: number; message: string }> {
  const json = await safeFetch(`${API_BASE}/admin/clean-demo-data`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to clean demo data');
  return json;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const json = await safeFetch(`${API_BASE}/admin/audit-logs`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to fetch audit logs');
  return json.data;
}

export async function adminCreateAnnouncement(data: { title_en: string; title_te: string; content_en: string; content_te: string; is_published: boolean }) {
  const json = await safeFetch(`${API_BASE}/admin/announcements`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!json.success) throw new Error(json.error || 'Failed to create announcement');
  return json;
}

export async function adminDeleteAnnouncement(id: number) {
  const json = await safeFetch(`${API_BASE}/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!json.success) throw new Error(json.error || 'Failed to delete announcement');
  return json;
}

export async function fetchContentBlocks() {
  try {
    const json = await safeFetch(`${API_BASE}/admin/content`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchContentByKey(key: string) {
  try {
    const json = await safeFetch(`${API_BASE}/content/${key}`);
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function adminUpdateContent(key: string, data: { title_en?: string; title_te?: string; content_en: string; content_te: string }) {
  const json = await safeFetch(`${API_BASE}/admin/content/${key}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!json.success) throw new Error(json.error || 'Failed to update content');
  return json;
}
