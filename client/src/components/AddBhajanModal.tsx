import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, PlusCircle, MapPin, Calendar, Clock, Phone, User, Info } from 'lucide-react';
import { Language, NelloreArea } from '../types';
import { translations } from '../i18n/translations';
import { submitBhajan, DEFAULT_NELLORE_AREAS } from '../services/api';

interface AddBhajanModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  areas: NelloreArea[];
}

export const AddBhajanModal: React.FC<AddBhajanModalProps> = ({ isOpen, onClose, lang, areas }) => {
  if (!isOpen) return null;
  const t = translations[lang];
  const activeAreas = (areas && areas.length > 0) ? areas : DEFAULT_NELLORE_AREAS;

  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '06:30 PM',
    venue: '',
    area: activeAreas[0]?.en || 'Stonehousepet',
    custom_area: '',
    organizer_name: '',
    contact_number: '',
    map_url: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend checks
    if (!formData.name.trim() || !formData.venue.trim() || !formData.organizer_name.trim() || !formData.contact_number.trim()) {
      setErrorMessage(lang === 'te' ? 'దయచేసి అన్ని తప్పనిసరి వివరాలను పూరించండి.' : 'Please fill all required fields.');
      return;
    }

    if (!formData.map_url.trim()) {
      setErrorMessage(lang === 'te' ? 'భక్తులు చేరుకోవడానికి సరైన గూగుల్ మ్యాప్ లింక్ తప్పనిసరి.' : 'A Google Maps link or coordinates is required.');
      return;
    }

    const areaFinal = formData.custom_area.trim() ? formData.custom_area.trim() : formData.area;

    setLoading(true);
    try {
      await submitBhajan({
        name: formData.name.trim(),
        date: formData.date,
        start_time: formData.start_time.trim(),
        venue: formData.venue.trim(),
        area: areaFinal,
        organizer_name: formData.organizer_name.trim(),
        contact_number: formData.contact_number.trim(),
        map_url: formData.map_url.trim(),
        description: formData.description.trim()
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 text-amber-50 p-4 sm:p-5 flex items-center justify-between border-b border-amber-600/30 z-10">
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base sm:text-lg text-white font-telugu">
              {t.addTitle}
            </h3>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 font-telugu">
                {t.formSuccessTitle}
              </h3>
              <p className="text-stone-600 text-sm max-w-md mx-auto font-telugu leading-relaxed">
                {t.formSuccessMsg}
              </p>
              <div className="pt-4">
                <button
                  onClick={resetAndClose}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm transition"
                >
                  {t.close}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Informational Workflow Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-900">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed font-telugu">
                  {t.formNotice}
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl flex items-center space-x-2 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Event Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.formBhajanName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t.formBhajanPlaceholder}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.formDate} *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.formTime} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    placeholder={t.formTimePlaceholder}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.formVenue} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder={t.formVenuePlaceholder}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Area Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.formArea} *
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    {activeAreas.map((a) => (
                      <option key={a.id} value={a.en}>
                        {lang === 'te' ? a.te : a.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.formCustomArea}
                  </label>
                  <input
                    type="text"
                    value={formData.custom_area}
                    onChange={(e) => setFormData({ ...formData, custom_area: e.target.value })}
                    placeholder="Specific colony/street..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Organizer & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.formOrganizerName} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organizer_name}
                    onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                    placeholder={t.formOrganizerNamePlaceholder}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>{t.formContactNumber} *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.contact_number}
                    onChange={(e) => setFormData({ ...formData, contact_number: e.target.value.replace(/\D/g, '') })}
                    placeholder={t.formContactPlaceholder}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              {/* Map Location Link */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>{t.formMapUrl} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.map_url}
                  onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
                  placeholder={t.formMapUrlPlaceholder}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  {t.formMapHelp}
                </p>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.formDescription}
                </label>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t.formDescriptionPlaceholder}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 active:scale-98"
                >
                  {loading ? t.formSubmitting : t.formSubmitBtn}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
