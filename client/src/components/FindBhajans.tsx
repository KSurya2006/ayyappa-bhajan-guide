import React, { useState } from 'react';
import { MapPin, Calendar, Search, LocateFixed, Sparkles, Filter, RefreshCw } from 'lucide-react';
import { Bhajan, Language, NelloreArea } from '../types';
import { translations } from '../i18n/translations';
import { BhajanCard } from './BhajanCard';

interface FindBhajansProps {
  bhajans: Bhajan[];
  areas: NelloreArea[];
  lang: Language;
  onSelectBhajan: (bhajan: Bhajan) => void;
  onOpenAddModal: () => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const FindBhajans: React.FC<FindBhajansProps> = ({
  bhajans,
  areas,
  lang,
  onSelectBhajan,
  onOpenAddModal,
  isLoading,
  onRefresh
}) => {
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const t = translations[lang];

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  // Optional Geolocation feature (Requirement 24: Non-intrusive, never forced)
  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      alert(lang === 'te' ? 'మీ పరికరంలో లొకేషన్ అందుబాటులో లేదు.' : 'Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus(lang === 'te' ? 'సమీప ప్రాంతాలను పరిశీలిస్తున్నాము...' : 'Finding nearby bhajans in Nellore...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Nellore center coordinates roughly (14.4426, 79.9865)
        setLocationStatus(null);
        setSelectedArea('all');
        setSelectedDateFilter('all');
      },
      (err) => {
        setLocationStatus(null);
        alert(lang === 'te' ? 'లొకేషన్ అనుమతి లభించలేదు. మీరు క్రింది డ్రాప్‌డౌన్ నుండి ప్రాంతాన్ని ఎంచుకోవచ్చు.' : 'Location permission was denied. You can still manually select any Nellore area.');
      },
      { timeout: 8000 }
    );
  };

  // Filter bhajans locally
  const filteredBhajans = bhajans.filter((b) => {
    // Area match
    if (selectedArea !== 'all') {
      const areaMatch = b.area.toLowerCase().includes(selectedArea.toLowerCase()) ||
        (b.area_te && b.area_te.includes(selectedArea));
      if (!areaMatch) return false;
    }

    // Date match
    if (selectedDateFilter === 'today') {
      if (b.date !== todayStr) return false;
    } else if (selectedDateFilter === 'tomorrow') {
      if (b.date !== tomorrowStr) return false;
    }

    // Text search match
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = b.name.toLowerCase().includes(q) || (b.name_te && b.name_te.toLowerCase().includes(q));
      const venueMatch = b.venue.toLowerCase().includes(q) || (b.venue_te && b.venue_te.toLowerCase().includes(q));
      const organizerMatch = b.organizer_name?.toLowerCase().includes(q);
      if (!nameMatch && !venueMatch && !organizerMatch) return false;
    }

    return true;
  });

  return (
    <section id="find-bhajans" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-16">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          <MapPin className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.pilotBadge} — Nellore & Surroundings</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-telugu">
          {t.findTitle}
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-2 font-telugu">
          {t.findSubtitle}
        </p>
      </div>

      {/* Filter Controls Bar (Mobile-first stacked & wrap) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-amber-200/80 mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Area Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.filterArea}</span>
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            >
              <option value="all">{t.filterAllAreas}</option>
              {areas.map((a) => (
                <option key={a.id} value={a.en}>
                  {lang === 'te' ? a.te : a.en}
                </option>
              ))}
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>{t.filterDate}</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedDateFilter('all')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  selectedDateFilter === 'all' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedDateFilter('today')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  selectedDateFilter === 'today' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {lang === 'te' ? 'ఈరోజు' : 'Today'}
              </button>
              <button
                onClick={() => setSelectedDateFilter('tomorrow')}
                className={`py-2 text-xs font-semibold rounded-lg transition ${
                  selectedDateFilter === 'tomorrow' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-700 hover:text-stone-900'
                }`}
              >
                {lang === 'te' ? 'రేపు' : 'Tomorrow'}
              </button>
            </div>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center space-x-1">
              <Search className="w-3.5 h-3.5 text-amber-600" />
              <span>Search Mandali / Venue</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'te' ? 'ఆలయం లేదా నిర్వాహకుడు...' : 'e.g. Stonehousepet, Guruswami...'}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-3.5 pr-8 py-2.5 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleFindNearMe}
              className="inline-flex items-center space-x-1.5 text-amber-700 hover:text-amber-900 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition"
            >
              <LocateFixed className="w-3.5 h-3.5" />
              <span>{t.filterNearMe}</span>
            </button>
            {locationStatus && <span className="text-amber-600 italic text-[11px]">{locationStatus}</span>}
          </div>

          <div className="flex items-center space-x-2 text-stone-500">
            <span className="font-semibold text-stone-800">
              {filteredBhajans.length} {lang === 'te' ? 'భజనలు కనుగొనబడ్డాయి' : 'bhajans listed'}
            </span>
            <button
              onClick={onRefresh}
              className="p-1 hover:text-amber-700 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Bhajan Grid */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-amber-100 p-8 shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-stone-600 font-semibold font-telugu">
            {lang === 'te' ? 'భజన వివరాలు లోడ్ అవుతున్నాయి...' : 'Loading verified bhajans...'}
          </p>
        </div>
      ) : filteredBhajans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBhajans.map((bhajan) => (
            <BhajanCard
              key={bhajan.id}
              bhajan={bhajan}
              lang={lang}
              onSelect={onSelectBhajan}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-amber-300 p-8 max-w-lg mx-auto shadow-sm">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
            <Calendar className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2 font-telugu">
            {t.noBhajansFound}
          </h3>
          <p className="text-sm text-stone-600 mb-6 font-telugu">
            {t.noBhajansPrompt}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-95"
          >
            {t.formSubmitBtn}
          </button>
        </div>
      )}
    </section>
  );
};
