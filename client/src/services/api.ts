import { Bhajan, Announcement, NelloreArea, AdminStats, AuditLog } from '../types';

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = `${BACKEND_URL}/api`;

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

export async function fetchBhajans(params?: { area?: string; date?: string; filter?: string }): Promise<Bhajan[]> {
  const query = new URLSearchParams();
  if (params?.area) query.append('area', params.area);
  if (params?.date) query.append('date', params.date);
  if (params?.filter) query.append('filter', params.filter);

  const res = await fetch(`${API_BASE}/bhajans?${query.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch bhajans');
  return json.data;
}

export async function fetchBhajanById(id: number): Promise<Bhajan> {
  const res = await fetch(`${API_BASE}/bhajans/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Bhajan not found');
  return json.data;
}

export async function submitBhajan(data: Partial<Bhajan>): Promise<{ message: string; submissionId: number }> {
  const res = await fetch(`${API_BASE}/bhajans/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to submit bhajan');
  return json;
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchAreas(): Promise<NelloreArea[]> {
  try {
    const res = await fetch(`${API_BASE}/areas`);
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

// ==================== SUPER ADMIN APIS ====================

export async function adminLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Authentication failed');
  if (json.token) {
    setAuthToken(json.token);
  }
  return json;
}

export async function adminLogout() {
  setAuthToken(null);
  const res = await fetch(`${API_BASE}/admin/logout`, {
    method: 'POST',
    credentials: 'include'
  });
  return res.json();
}

export async function checkAdminAuth() {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    const json = await res.json();
    return json.success && json.authenticated ? json.user : null;
  } catch (err) {
    return null;
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch admin stats');
  return json.data;
}

export async function fetchAdminBhajans(status?: string): Promise<Bhajan[]> {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/admin/bhajans${query}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch admin bhajans');
  return json.data;
}

export async function adminCreateBhajan(data: Partial<Bhajan>) {
  const res = await fetch(`${API_BASE}/admin/bhajans`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create bhajan');
  return json;
}

export async function adminUpdateBhajan(id: number, data: Partial<Bhajan>) {
  const res = await fetch(`${API_BASE}/admin/bhajans/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update bhajan');
  return json;
}

export async function adminPatchStatus(id: number, action: 'approve' | 'reject' | 'publish' | 'unpublish' | 'cancel' | 'complete') {
  const res = await fetch(`${API_BASE}/admin/bhajans/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ action })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update status');
  return json;
}

export async function adminDeleteBhajan(id: number) {
  const res = await fetch(`${API_BASE}/admin/bhajans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete bhajan');
  return json;
}

export async function adminCleanDemoData(): Promise<{ deletedCount: number; message: string }> {
  const res = await fetch(`${API_BASE}/admin/clean-demo-data`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to clean demo data');
  return json;
}

export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${API_BASE}/admin/audit-logs`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch audit logs');
  return json.data;
}

export async function adminCreateAnnouncement(data: { title_en: string; title_te: string; content_en: string; content_te: string; is_published: boolean }) {
  const res = await fetch(`${API_BASE}/admin/announcements`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to create announcement');
  return json;
}

export async function adminDeleteAnnouncement(id: number) {
  const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to delete announcement');
  return json;
}

export async function fetchContentBlocks() {
  const res = await fetch(`${API_BASE}/admin/content`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  const json = await res.json();
  return json.success ? json.data : [];
}

export async function fetchContentByKey(key: string) {
  const res = await fetch(`${API_BASE}/content/${key}`);
  const json = await res.json();
  return json.success ? json.data : null;
}

export async function adminUpdateContent(key: string, data: { title_en?: string; title_te?: string; content_en: string; content_te: string }) {
  const res = await fetch(`${API_BASE}/admin/content/${key}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update content');
  return json;
}
