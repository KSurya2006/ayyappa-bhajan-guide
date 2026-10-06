import { Bhajan, Announcement, NelloreArea, AdminStats, AuditLog } from '../types';

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

async function safeFetch(url: string, options?: RequestInit): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err: any) {
    throw new Error('Backend server is currently offline or unreachable. Please check Render backend status.');
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    if (res.status === 404 || text.includes('<!DOCTYPE')) {
      throw new Error(`Backend server on Render is waking up or not yet connected (${res.status}). Please wait ~30 seconds for Render spin-up and try again.`);
    }
    throw new Error(`Server returned unexpected format (${res.status}).`);
  }

  return res.json();
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
    return json.data || [];
  } catch (err: any) {
    console.warn('Could not load remote bhajans:', err.message);
    return [];
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
