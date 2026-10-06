import React, { useState, useEffect } from 'react';
import {
  Shield, LogOut, CheckCircle2, XCircle, Edit, Trash2, PlusCircle,
  AlertTriangle, RefreshCw, Eye, EyeOff, Calendar, Clock, MapPin,
  Phone, User, Megaphone, FileText, Sparkles, Database
} from 'lucide-react';
import { Bhajan, AdminStats, AuditLog, Announcement, Language, AdminUser } from '../../types';
import { translations } from '../../i18n/translations';
import {
  fetchAdminStats, fetchAdminBhajans, adminPatchStatus, adminDeleteBhajan,
  adminCreateBhajan, adminCleanDemoData, fetchAuditLogs, adminLogout,
  fetchAnnouncements, adminCreateAnnouncement, adminDeleteAnnouncement
} from '../../services/api';
import { EditBhajanModal } from './EditBhajanModal';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
  onClose: () => void;
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  onLogout,
  onClose,
  lang
}) => {
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'stats' | 'pending' | 'bhajans' | 'add' | 'announcements' | 'audit' | 'production'>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [selectedForEdit, setSelectedForEdit] = useState<Bhajan | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // New Bhajan form state
  const [newBhajan, setNewBhajan] = useState({
    name: '',
    name_te: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '06:30 PM',
    venue: '',
    venue_te: '',
    area: 'Stonehousepet, Nellore',
    area_te: 'స్టోన్‌హౌస్‌పేట, నెల్లూరు',
    map_url: '',
    organizer_name: '',
    contact_number: '',
    description: '',
    description_te: ''
  });

  // New Announcement state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title_en: '',
    title_te: '',
    content_en: '',
    content_te: ''
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sData, bData, aLogs, ann] = await Promise.all([
        fetchAdminStats(),
        fetchAdminBhajans(),
        fetchAuditLogs(),
        fetchAnnouncements()
      ]);
      setStats(sData);
      setBhajans(bData);
      setAuditLogs(aLogs);
      setAnnouncements(ann);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (id: number, action: 'approve' | 'reject' | 'publish' | 'unpublish' | 'cancel' | 'complete') => {
    try {
      await adminPatchStatus(id, action);
      setMessage(`Bhajan status updated to "${action}".`);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminDeleteBhajan(id);
      setDeleteConfirmId(null);
      setMessage('Bhajan deleted permanently.');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete bhajan');
    }
  };

  const handleCreateDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateBhajan(newBhajan);
      setMessage('New verified bhajan published successfully.');
      setNewBhajan({
        name: '',
        name_te: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '06:30 PM',
        venue: '',
        venue_te: '',
        area: 'Stonehousepet, Nellore',
        area_te: 'స్టోన్‌హౌస్‌పేట, నెల్లూరు',
        map_url: '',
        organizer_name: '',
        contact_number: '',
        description: '',
        description_te: ''
      });
      setActiveTab('bhajans');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create bhajan');
    }
  };

  const handleCleanDemoData = async () => {
    if (!window.confirm(t.confirmPurge)) return;
    try {
      const res = await adminCleanDemoData();
      setMessage(res.message);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to clean demo data');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminCreateAnnouncement({
        ...newAnnouncement,
        is_published: true
      });
      setMessage('Announcement published successfully.');
      setNewAnnouncement({ title_en: '', title_te: '', content_en: '', content_te: '' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await adminDeleteAnnouncement(id);
      setMessage('Announcement deleted.');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement');
    }
  };

  const pendingBhajans = bhajans.filter(b => b.status === 'pending');

  return (
    <div className="fixed inset-0 z-50 bg-stone-950 text-amber-50 flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Admin Header Bar */}
      <header className="bg-stone-900 border-b border-amber-600/30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-stone-950 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg text-white">Super Admin Console</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Nellore Pilot
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Authenticated as: <strong className="text-amber-200">{user.username}</strong></p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadData}
            className="p-2 text-stone-400 hover:text-amber-300 hover:bg-stone-800 rounded-lg transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-200 text-xs font-semibold rounded-lg border border-stone-700"
          >
            View Website
          </button>
          <button
            onClick={async () => {
              await adminLogout();
              onLogout();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-200 text-xs font-semibold rounded-lg border border-red-800/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </header>

      {/* Navigation Tabs Bar */}
      <nav className="bg-stone-900/60 border-b border-stone-800 px-4 sm:px-6 flex space-x-1 overflow-x-auto py-2 text-xs font-semibold scrollbar-none">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'stats' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          {t.tabStats}
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'pending' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          <span>{t.tabPending}</span>
          {pendingBhajans.length > 0 && (
            <span className="w-5 h-5 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {pendingBhajans.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('bhajans')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'bhajans' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          {t.tabBhajans} ({bhajans.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'add' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          + {t.tabAdd}
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'announcements' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          {t.tabAnnouncements}
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'audit' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          {t.tabAudit}
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`px-3 py-2 rounded-lg transition whitespace-nowrap text-amber-400 ${
            activeTab === 'production' ? 'bg-amber-600 text-stone-950 font-bold' : 'hover:bg-stone-800'
          }`}
        >
          {t.tabProduction}
        </button>
      </nav>

      {/* Notification Toasts */}
      {message && (
        <div className="bg-emerald-950/90 border border-emerald-600 text-emerald-200 px-4 py-2 text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}
      {error && (
        <div className="bg-red-950/90 border border-red-600 text-red-200 px-4 py-2 text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 font-bold">✕</button>
        </div>
      )}

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* TAB 1: OVERVIEW STATS */}
          {activeTab === 'stats' && stats && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-stone-900 border border-amber-600/30 p-4 rounded-2xl">
                  <span className="text-xs text-stone-400 block">{t.statPublished}</span>
                  <span className="text-2xl font-bold text-amber-400 mt-1 block">{stats.totalPublished}</span>
                </div>
                <div className="bg-stone-900 border border-amber-600/30 p-4 rounded-2xl relative overflow-hidden">
                  {stats.pendingSubmissions > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping" />}
                  <span className="text-xs text-stone-400 block">{t.statPending}</span>
                  <span className="text-2xl font-bold text-red-400 mt-1 block">{stats.pendingSubmissions}</span>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <span className="text-xs text-stone-400 block">{t.statUpcoming}</span>
                  <span className="text-2xl font-bold text-emerald-400 mt-1 block">{stats.upcoming}</span>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <span className="text-xs text-stone-400 block">{t.statCompleted}</span>
                  <span className="text-2xl font-bold text-stone-300 mt-1 block">{stats.completed}</span>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <span className="text-xs text-stone-400 block">{t.statCancelled}</span>
                  <span className="text-2xl font-bold text-red-400 mt-1 block">{stats.cancelled}</span>
                </div>
                <div className="bg-stone-900 border border-stone-800 p-4 rounded-2xl">
                  <span className="text-xs text-stone-400 block">{t.statSampleCount}</span>
                  <span className="text-2xl font-bold text-yellow-500 mt-1 block">{stats.sampleCount}</span>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-stone-900 border border-amber-600/30 p-6 rounded-3xl">
                <h3 className="font-bold text-base text-white mb-4">Super Admin Operations</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('pending')}
                    className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center space-x-1.5"
                  >
                    <span>Review Pending ({pendingBhajans.length})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Create Verified Bhajan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('production')}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-600/40 font-semibold rounded-xl text-xs flex items-center space-x-1.5"
                  >
                    <Database className="w-4 h-4" />
                    <span>Production Readiness</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING SUBMISSIONS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">
                  Pending Submissions ({pendingBhajans.length})
                </h3>
                <span className="text-xs text-stone-400">
                  Submissions require Super Admin approval before becoming public.
                </span>
              </div>

              {pendingBhajans.length === 0 ? (
                <div className="bg-stone-900 p-8 rounded-2xl border border-stone-800 text-center text-stone-400 text-sm">
                  No pending submissions waiting for approval.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBhajans.map((b) => (
                    <div
                      key={b.id}
                      className="bg-stone-900 border border-amber-500/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold rounded">
                            PENDING
                          </span>
                          <h4 className="font-bold text-white text-base">{b.name}</h4>
                        </div>
                        <p className="text-xs text-stone-300">
                          {b.venue} • {b.area} • <strong>{b.date} at {b.start_time}</strong>
                        </p>
                        <p className="text-xs text-stone-400">
                          Organizer: <strong className="text-stone-200">{b.organizer_name}</strong> ({b.contact_number})
                        </p>
                        {b.description && (
                          <p className="text-xs text-stone-400 italic bg-stone-950 p-2 rounded border border-stone-800 max-w-xl">
                            "{b.description}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => setSelectedForEdit(b)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'approve')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold rounded-lg flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Publish</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(b.id, 'reject')}
                          className="px-3 py-1.5 bg-red-900/60 hover:bg-red-800 text-red-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ALL BHAJANS MANAGEMENT */}
          {activeTab === 'bhajans' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">All Bhajans ({bhajans.length})</h3>
                <span className="text-xs text-stone-400">Edit, Publish, Cancel, or Delete events</span>
              </div>

              <div className="space-y-3">
                {bhajans.map((b) => (
                  <div
                    key={b.id}
                    className="bg-stone-900 border border-stone-800 p-4 sm:p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          b.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          b.status === 'cancelled' ? 'bg-red-950 text-red-300 border border-red-800' :
                          b.status === 'completed' ? 'bg-stone-800 text-stone-400' :
                          'bg-yellow-950 text-yellow-300 border border-yellow-800'
                        }`}>
                          {b.status.toUpperCase()}
                        </span>
                        <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                          b.is_published ? 'bg-amber-950 text-amber-300' : 'bg-stone-800 text-stone-500'
                        }`}>
                          {b.is_published ? 'Published' : 'Hidden'}
                        </span>
                        {b.is_sample === 1 && (
                          <span className="px-2 py-0.5 text-[10px] bg-purple-950 text-purple-300 border border-purple-800 rounded">
                            DEMO DATA
                          </span>
                        )}
                        <h4 className="font-bold text-white text-sm sm:text-base">{b.name}</h4>
                      </div>
                      <p className="text-xs text-stone-300">
                        {b.venue} • {b.area} • <strong>{b.date} at {b.start_time}</strong>
                      </p>
                      <p className="text-xs text-stone-500">
                        Organizer: {b.organizer_name} ({b.contact_number})
                      </p>
                    </div>

                    {/* Management Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t border-stone-800 lg:border-t-0">
                      <button
                        onClick={() => setSelectedForEdit(b)}
                        className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {b.is_published ? (
                        <button
                          onClick={() => handleStatusChange(b.id, 'unpublish')}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Unpublish</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(b.id, 'publish')}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-emerald-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Publish</span>
                        </button>
                      )}

                      {b.status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'cancel')}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-yellow-300 text-xs font-semibold rounded-lg"
                        >
                          Cancel Event
                        </button>
                      )}

                      {b.status !== 'completed' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'complete')}
                          className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg"
                        >
                          Complete
                        </button>
                      )}

                      <button
                        onClick={() => setDeleteConfirmId(b.id)}
                        className="px-2.5 py-1.5 bg-red-950/70 hover:bg-red-900 text-red-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ADD BHAJAN DIRECTLY */}
          {activeTab === 'add' && (
            <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 max-w-2xl mx-auto">
              <h3 className="font-bold text-lg text-white mb-2">Create & Publish Verified Bhajan</h3>
              <p className="text-xs text-stone-400 mb-6">
                Directly added bhajans by Super Admin are marked verified and published immediately.
              </p>

              <form onSubmit={handleCreateDirect} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Event Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={newBhajan.name}
                      onChange={(e) => setNewBhajan({ ...newBhajan, name: e.target.value })}
                      placeholder="e.g. Maha Padi Pooja"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Event Name (తెలుగు)</label>
                    <input
                      type="text"
                      value={newBhajan.name_te}
                      onChange={(e) => setNewBhajan({ ...newBhajan, name_te: e.target.value })}
                      placeholder="ఉదా: మహా పడిపూజ"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white font-telugu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={newBhajan.date}
                      onChange={(e) => setNewBhajan({ ...newBhajan, date: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Start Time *</label>
                    <input
                      type="text"
                      required
                      value={newBhajan.start_time}
                      onChange={(e) => setNewBhajan({ ...newBhajan, start_time: e.target.value })}
                      placeholder="06:30 PM"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Venue (English) *</label>
                    <input
                      type="text"
                      required
                      value={newBhajan.venue}
                      onChange={(e) => setNewBhajan({ ...newBhajan, venue: e.target.value })}
                      placeholder="Sri Ayyappa Temple"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Venue (తెలుగు)</label>
                    <input
                      type="text"
                      value={newBhajan.venue_te}
                      onChange={(e) => setNewBhajan({ ...newBhajan, venue_te: e.target.value })}
                      placeholder="శ్రీ అయ్యప్ప దేవాలయం"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white font-telugu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Area / Town *</label>
                    <input
                      type="text"
                      required
                      value={newBhajan.area}
                      onChange={(e) => setNewBhajan({ ...newBhajan, area: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Area (తెలుగు)</label>
                    <input
                      type="text"
                      value={newBhajan.area_te}
                      onChange={(e) => setNewBhajan({ ...newBhajan, area_te: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white font-telugu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">Google Maps URL or Coordinates *</label>
                  <input
                    type="text"
                    required
                    value={newBhajan.map_url}
                    onChange={(e) => setNewBhajan({ ...newBhajan, map_url: e.target.value })}
                    placeholder="https://maps.google.com/?q=..."
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Organizer Name</label>
                    <input
                      type="text"
                      value={newBhajan.organizer_name}
                      onChange={(e) => setNewBhajan({ ...newBhajan, organizer_name: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Contact Phone Number</label>
                    <input
                      type="text"
                      maxLength={10}
                      value={newBhajan.contact_number}
                      onChange={(e) => setNewBhajan({ ...newBhajan, contact_number: e.target.value })}
                      placeholder="9848012345"
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-sm shadow-md transition"
                >
                  Publish Verified Bhajan
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-6">
              <div className="bg-stone-900 p-6 rounded-3xl border border-stone-800 max-w-2xl mx-auto">
                <h3 className="font-bold text-base text-white mb-4">Create Announcement</h3>
                <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Title (English) *</label>
                    <input
                      type="text"
                      required
                      value={newAnnouncement.title_en}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_en: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Title (తెలుగు) *</label>
                    <input
                      type="text"
                      required
                      value={newAnnouncement.title_te}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title_te: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white font-telugu"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Content (English) *</label>
                    <textarea
                      rows={2}
                      required
                      value={newAnnouncement.content_en}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_en: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">Content (తెలుగు) *</label>
                    <textarea
                      rows={2}
                      required
                      value={newAnnouncement.content_te}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content_te: e.target.value })}
                      className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-white font-telugu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
                  >
                    Post Announcement
                  </button>
                </form>
              </div>

              {/* List */}
              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">Active Announcements</h4>
                {announcements.map((a) => (
                  <div key={a.id} className="bg-stone-900 p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
                    <div>
                      <h5 className="font-bold text-amber-200 text-sm">{a.title_en} / {a.title_te}</h5>
                      <p className="text-xs text-stone-400 mt-1">{a.content_en}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Security Audit Log (Requirement 17)</h3>
              <p className="text-xs text-stone-400">
                Immutable record of administrative actions, resource modifications, and timestamps.
              </p>

              <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-800 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-700">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Admin</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Resource</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-stone-800/40">
                          <td className="p-3 whitespace-nowrap text-stone-400">{log.timestamp}</td>
                          <td className="p-3 font-semibold text-amber-200">{log.admin_id}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-200 text-[11px] font-mono">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-stone-400">{log.resource_type} #{log.resource_id || '-'}</td>
                          <td className="p-3 text-stone-300 max-w-xs truncate">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PRODUCTION DATA CLEANER */}
          {activeTab === 'production' && (
            <div className="bg-stone-900 border border-amber-600/40 p-6 sm:p-8 rounded-3xl max-w-xl mx-auto space-y-5">
              <div className="flex items-center space-x-3 text-amber-400">
                <Database className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-lg text-white">Production Launch Readiness</h3>
              </div>

              <div className="bg-amber-950/40 border border-amber-600/30 p-4 rounded-xl text-xs text-amber-200 leading-relaxed space-y-2">
                <p className="font-semibold text-white">Critical Requirement 3 & 57 Compliance:</p>
                <p>
                  "For the actual deployed production version: DO NOT USE DUMMY DATA. Every published bhajan must come from actual information submitted by an organizer or entered by the Super Admin. Before production deployment, remove all demo/sample events."
                </p>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs text-stone-300">
                <div className="flex justify-between items-center">
                  <span>Current sample/demo records:</span>
                  <span className="font-bold text-amber-400 text-sm">{stats?.sampleCount || 0}</span>
                </div>
              </div>

              <button
                onClick={handleCleanDemoData}
                disabled={stats?.sampleCount === 0}
                className="w-full py-3.5 bg-red-800 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition"
              >
                {t.purgeBtn}
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Edit Bhajan Modal */}
      {selectedForEdit && (
        <EditBhajanModal
          bhajan={selectedForEdit}
          isOpen={true}
          onClose={() => setSelectedForEdit(null)}
          onSuccess={() => {
            setMessage('Bhajan updated successfully.');
            loadData();
          }}
          lang={lang}
        />
      )}

      {/* Delete Confirmation Modal (Requirement 30) */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-red-700/60 rounded-3xl p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950 text-red-500 flex items-center justify-center mx-auto border border-red-800">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-white">Confirm Deletion</h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              {t.confirmDelete}
            </p>
            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
