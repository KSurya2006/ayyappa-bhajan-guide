import React from 'react';
import { X, Calendar, Clock, MapPin, User, Phone, Navigation, CheckCircle2, AlertTriangle, Share2 } from 'lucide-react';
import { Bhajan, Language } from '../types';
import { translations } from '../i18n/translations';

interface BhajanDetailsModalProps {
  bhajan: Bhajan | null;
  lang: Language;
  onClose: () => void;
}

export const BhajanDetailsModal: React.FC<BhajanDetailsModalProps> = ({ bhajan, lang, onClose }) => {
  if (!bhajan) return null;
  const t = translations[lang];

  const displayName = (lang === 'te' && bhajan.name_te) ? bhajan.name_te : bhajan.name;
  const displayVenue = (lang === 'te' && bhajan.venue_te) ? bhajan.venue_te : bhajan.venue;
  const displayArea = (lang === 'te' && bhajan.area_te) ? bhajan.area_te : bhajan.area;
  const displayDesc = (lang === 'te' && bhajan.description_te) ? bhajan.description_te : bhajan.description;

  const getMapLink = () => {
    if (bhajan.latitude && bhajan.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${bhajan.latitude},${bhajan.longitude}`;
    }
    if (bhajan.map_url) {
      return bhajan.map_url;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bhajan.venue + ', ' + bhajan.area + ', Nellore')}`;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: displayName,
        text: `Ayyappa Bhajan in ${displayArea}: ${displayName} on ${bhajan.date} at ${bhajan.start_time}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${displayName} - ${bhajan.date} at ${bhajan.start_time}, ${displayVenue}`);
      alert(lang === 'te' ? 'భజన వివరాలు కాపీ చేయబడ్డాయి!' : 'Bhajan details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-amber-200 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-stone-900 text-amber-50 p-4 sm:p-5 flex items-center justify-between border-b border-amber-600/30 z-10">
          <div className="flex items-center space-x-2">
            <span className="bg-amber-600 text-stone-950 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {bhajan.status === 'cancelled' ? t.statusCancelled :
               bhajan.status === 'completed' ? t.statusCompleted :
               t.statusUpcoming}
            </span>
            <span className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.verifiedBadge}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-amber-200 hover:text-white hover:bg-stone-800 rounded-full transition"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-telugu leading-tight">
              {displayName}
            </h2>
            <p className="text-sm text-stone-500 mt-1 font-medium">
              {displayArea} • Nellore, AP
            </p>
          </div>

          {/* Cancellation Notice if Cancelled */}
          {bhajan.status === 'cancelled' && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-center space-x-2 text-sm">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="font-semibold">{t.statusCancelled}</p>
            </div>
          )}

          {/* Key Event Details Grid */}
          <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-200/60 space-y-3 text-sm">
            <div className="flex items-center space-x-3 text-stone-800">
              <Calendar className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">{t.date}</span>
                <span className="font-bold text-base">{bhajan.date}</span>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-stone-800">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">{t.time}</span>
                <span className="font-bold text-base">{bhajan.start_time}</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 text-stone-800">
              <MapPin className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-stone-500 block font-medium">{t.venue}</span>
                <span className="font-semibold text-stone-900">{displayVenue}</span>
                <p className="text-xs text-stone-600 mt-0.5">{displayArea}</p>
              </div>
            </div>

            {bhajan.organizer_name && (
              <div className="flex items-center space-x-3 text-stone-800 pt-2 border-t border-amber-200/50">
                <User className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <span className="text-xs text-stone-500 block font-medium">{t.organizer}</span>
                  <span className="font-bold text-stone-900">{bhajan.organizer_name}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          {displayDesc && (
            <div>
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                {t.description}
              </h4>
              <p className="text-sm text-stone-700 leading-relaxed font-telugu bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                {displayDesc}
              </p>
            </div>
          )}

          {/* Devotional Advice Note */}
          <div className="text-[11px] text-stone-500 bg-amber-50/30 p-3 rounded-lg border border-amber-100 italic">
            Swami Saranam! Devotees are requested to arrive 15 minutes before start time and maintain the sanctity of the bhajan mandali.
          </div>
        </div>

        {/* Footer CTAs: Large Touch Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-stone-200 p-4 sm:p-5 grid grid-cols-2 gap-3 mt-auto">
          <a
            href={getMapLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-95"
          >
            <Navigation className="w-4 h-4" />
            <span>{t.getDirections}</span>
          </a>

          {bhajan.contact_number ? (
            <a
              href={`tel:${bhajan.contact_number}`}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition active:scale-95"
            >
              <Phone className="w-4 h-4" />
              <span>{t.callOrganizer}</span>
            </a>
          ) : (
            <button
              onClick={onClose}
              className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-xl text-sm transition"
            >
              {t.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
