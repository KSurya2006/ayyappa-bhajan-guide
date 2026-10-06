import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Bhajan, Language } from '../../types';
import { adminUpdateBhajan } from '../../services/api';

interface EditBhajanModalProps {
  bhajan: Bhajan | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lang: Language;
}

export const EditBhajanModal: React.FC<EditBhajanModalProps> = ({
  bhajan,
  isOpen,
  onClose,
  onSuccess,
  lang
}) => {
  if (!isOpen || !bhajan) return null;

  const [formData, setFormData] = useState<Partial<Bhajan>>({
    name: bhajan.name || '',
    name_te: bhajan.name_te || '',
    date: bhajan.date || '',
    start_time: bhajan.start_time || '',
    venue: bhajan.venue || '',
    venue_te: bhajan.venue_te || '',
    area: bhajan.area || '',
    area_te: bhajan.area_te || '',
    map_url: bhajan.map_url || '',
    organizer_name: bhajan.organizer_name || '',
    contact_number: bhajan.contact_number || '',
    description: bhajan.description || '',
    description_te: bhajan.description_te || '',
    status: bhajan.status || 'approved',
    is_published: bhajan.is_published
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await adminUpdateBhajan(bhajan.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update bhajan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 text-amber-50 p-4 sm:p-5 flex items-center justify-between border-b border-amber-600/30 z-10">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-white">
              Super Admin: Edit Bhajan #{bhajan.id}
            </h3>
            <p className="text-xs text-amber-200/70">Modify or correct event details before or after publishing</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-stone-400 hover:text-white rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Name EN & TE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Event Name (English) *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Event Name (తెలుగు)</label>
              <input
                type="text"
                value={formData.name_te || ''}
                onChange={(e) => setFormData({ ...formData, name_te: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 font-telugu"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Date (YYYY-MM-DD) *</label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Start Time *</label>
              <input
                type="text"
                required
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
          </div>

          {/* Venue EN & TE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Venue (English) *</label>
              <input
                type="text"
                required
                value={formData.venue || ''}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Venue (తెలుగు)</label>
              <input
                type="text"
                value={formData.venue_te || ''}
                onChange={(e) => setFormData({ ...formData, venue_te: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 font-telugu"
              />
            </div>
          </div>

          {/* Area EN & TE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Area / Town (Nellore) *</label>
              <input
                type="text"
                required
                value={formData.area || ''}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Area (తెలుగు)</label>
              <input
                type="text"
                value={formData.area_te || ''}
                onChange={(e) => setFormData({ ...formData, area_te: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 font-telugu"
              />
            </div>
          </div>

          {/* Map URL */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Google Maps URL / Coordinates *</label>
            <input
              type="text"
              required
              value={formData.map_url || ''}
              onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
            />
          </div>

          {/* Organizer & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Organizer Name</label>
              <input
                type="text"
                value={formData.organizer_name || ''}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Contact Phone Number</label>
              <input
                type="text"
                maxLength={10}
                value={formData.contact_number || ''}
                onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
              />
            </div>
          </div>

          {/* Status & Publication Control */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Event Status</label>
              <select
                value={formData.status || 'approved'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-semibold text-stone-900"
              >
                <option value="pending">Pending Admin Approval</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">Public Visibility</label>
              <div className="flex items-center space-x-3 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="is_published"
                    checked={formData.is_published === 1}
                    onChange={() => setFormData({ ...formData, is_published: 1 })}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Published (1)</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="is_published"
                    checked={formData.is_published === 0}
                    onChange={() => setFormData({ ...formData, is_published: 0 })}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Unpublished (0)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description (English)</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Description (తెలుగు)</label>
            <textarea
              rows={2}
              value={formData.description_te || ''}
              onChange={(e) => setFormData({ ...formData, description_te: e.target.value })}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-sm text-stone-900 font-telugu"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-stone-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
