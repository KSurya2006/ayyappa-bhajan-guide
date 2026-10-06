import React from 'react';
import { Calendar, Clock, MapPin, User, Phone, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Bhajan, Language } from '../types';
import { translations } from '../i18n/translations';

interface BhajanCardProps {
  bhajan: Bhajan;
  lang: Language;
  onSelect: (bhajan: Bhajan) => void;
}

export const BhajanCard: React.FC<BhajanCardProps> = ({ bhajan, lang, onSelect }) => {
  const t = translations[lang];

  const displayName = (lang === 'te' && bhajan.name_te) ? bhajan.name_te : bhajan.name;
  const displayVenue = (lang === 'te' && bhajan.venue_te) ? bhajan.venue_te : bhajan.venue;
  const displayArea = (lang === 'te' && bhajan.area_te) ? bhajan.area_te : bhajan.area;

  // Format date nicely
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  let dateBadge = bhajan.date;
  if (bhajan.date === todayStr) {
    dateBadge = t.statusToday;
  } else if (bhajan.date === tomorrowStr) {
    dateBadge = lang === 'te' ? 'రేపు' : 'Tomorrow';
  }

  // Generate Google Maps navigation URL
  const getMapLink = () => {
    if (bhajan.latitude && bhajan.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${bhajan.latitude},${bhajan.longitude}`;
    }
    if (bhajan.map_url) {
      return bhajan.map_url;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bhajan.venue + ', ' + bhajan.area + ', Nellore')}`;
  };

  return (
    <div
      onClick={() => onSelect(bhajan)}
      className="bg-white rounded-2xl border border-amber-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden group"
    >
      {/* Top Accent Strip */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        bhajan.status === 'cancelled' ? 'bg-red-500' :
        bhajan.status === 'completed' ? 'bg-stone-400' :
        bhajan.date === todayStr ? 'bg-amber-500' : 'bg-amber-600'
      }`} />

      <div>
        {/* Badges Bar */}
        <div className="flex items-center justify-between mb-3 pt-1 text-xs">
          <div className="flex items-center space-x-1.5">
            {/* Status Badge */}
            <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[11px] ${
              bhajan.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              bhajan.status === 'completed' ? 'bg-stone-100 text-stone-700' :
              bhajan.date === todayStr ? 'bg-amber-100 text-amber-900 border border-amber-300' :
              'bg-amber-50 text-amber-800'
            }`}>
              {bhajan.status === 'cancelled' ? t.statusCancelled :
               bhajan.status === 'completed' ? t.statusCompleted :
               bhajan.date === todayStr ? `🔥 ${t.statusToday}` : t.statusUpcoming}
            </span>

            {/* Admin Approved Verification Badge */}
            <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>{t.verifiedBadge}</span>
            </span>
          </div>

          {/* Date Label */}
          <span className="text-stone-600 font-semibold bg-stone-100 px-2.5 py-0.5 rounded-md">
            {dateBadge}
          </span>
        </div>

        {/* Bhajan Event Title */}
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-3 group-hover:text-amber-800 transition font-telugu leading-snug">
          {displayName}
        </h3>

        {/* Timing and Schedule */}
        <div className="space-y-2 mb-4 text-xs sm:text-sm text-stone-700">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span className="font-semibold text-stone-900">{bhajan.start_time}</span>
            <span className="text-stone-400">•</span>
            <span className="text-stone-600 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 inline text-stone-500 mr-1" />
              {bhajan.date}
            </span>
          </div>

          {/* Venue & Locality */}
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-stone-900">{displayVenue}</p>
              <p className="text-stone-500 text-xs">{displayArea}</p>
            </div>
          </div>

          {/* Organizer */}
          {bhajan.organizer_name && (
            <div className="flex items-center space-x-2 text-stone-600 text-xs">
              <User className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>{t.organizer}: <strong className="text-stone-800">{bhajan.organizer_name}</strong></span>
            </div>
          )}
        </div>

        {/* Short Description snippet */}
        {bhajan.description && (
          <p className="text-xs text-stone-600 line-clamp-2 mb-4 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60 font-telugu">
            {(lang === 'te' && bhajan.description_te) ? bhajan.description_te : bhajan.description}
          </p>
        )}
      </div>

      {/* Action Buttons (Mobile-first large touch targets) */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100" onClick={(e) => e.stopPropagation()}>
        {/* Get Directions Button */}
        <a
          href={getMapLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition active:scale-95"
        >
          <Navigation className="w-4 h-4" />
          <span>{t.getDirections}</span>
        </a>

        {/* Call Organizer Button */}
        {bhajan.contact_number ? (
          <a
            href={`tel:${bhajan.contact_number}`}
            className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-xs sm:text-sm border border-stone-300 transition active:scale-95"
          >
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>{t.callOrganizer}</span>
          </a>
        ) : (
          <button
            onClick={() => onSelect(bhajan)}
            className="py-2.5 px-3 bg-stone-100 text-stone-600 font-semibold rounded-xl text-xs sm:text-sm text-center"
          >
            {t.bhajanDetails}
          </button>
        )}
      </div>
    </div>
  );
};
