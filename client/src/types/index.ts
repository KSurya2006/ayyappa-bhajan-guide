export type Language = 'te' | 'en';

export interface Bhajan {
  id: number;
  name: string;
  name_te?: string;
  date: string;
  start_time: string;
  venue: string;
  venue_te?: string;
  area: string;
  area_te?: string;
  map_url?: string;
  latitude?: number;
  longitude?: number;
  organizer_name: string;
  contact_number: string;
  description?: string;
  description_te?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
  is_published: number;
  is_sample: number;
  created_at: string;
}

export interface Announcement {
  id: number;
  title_en: string;
  title_te: string;
  content_en: string;
  content_te: string;
  is_published: number;
  created_at: string;
}

export interface NelloreArea {
  id: string;
  en: string;
  te: string;
}

export interface AdminStats {
  totalPublished: number;
  pendingSubmissions: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  sampleCount: number;
}

export interface AuditLog {
  id: number;
  admin_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: string;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  username: string;
}
