import React from 'react';
import { Compass, PlusCircle, MapPin, Sparkles, HeartHandshake } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HeroProps {
  lang: Language;
  onFindClick: () => void;
  onAddClick: () => void;
  onTourClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onFindClick, onAddClick, onTourClick }) => {
  const t = translations[lang];

  return (
    <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-amber-50 pt-10 pb-16 px-4 sm:px-6">
      {/* Devotional Background Motif Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" />
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Sacred Mantra & Pilot Tag */}
        <div className="inline-flex items-center space-x-2 bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 rounded-full mb-5 text-amber-300 text-xs sm:text-sm font-medium">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="tracking-wide">{t.appSubtitle}</span>
          <span className="text-amber-500">•</span>
          <span className="font-semibold text-amber-200">{t.pilotBadge} (AP)</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight font-telugu">
          {t.heroTitle}
        </h1>

        {/* Supporting Message */}
        <p className="text-base sm:text-xl text-amber-200/90 max-w-2xl mx-auto mb-8 leading-relaxed font-telugu">
          {t.heroSubtitle}
        </p>

        {/* Core Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
          <button
            onClick={onFindClick}
            className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl text-base shadow-lg shadow-amber-900/50 transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <MapPin className="w-5 h-5" />
            <span>{t.heroCtaFind}</span>
          </button>

          <button
            onClick={onAddClick}
            className="w-full sm:w-auto px-6 py-3.5 bg-stone-800 hover:bg-stone-700 border border-amber-600/40 text-amber-200 hover:text-white font-semibold rounded-xl text-base transition-all transform active:scale-95 flex items-center justify-center space-x-2"
          >
            <PlusCircle className="w-5 h-5 text-amber-400" />
            <span>{t.heroCtaAdd}</span>
          </button>
        </div>

        {/* 1-Minute Interactive Tour Pill */}
        <div className="inline-block">
          <button
            onClick={onTourClick}
            className="inline-flex items-center space-x-2 text-xs sm:text-sm text-amber-300/80 hover:text-amber-200 transition py-1 px-3 rounded-full hover:bg-stone-800/80"
          >
            <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span className="underline decoration-dotted underline-offset-4">{t.heroTakeTour}</span>
          </button>
        </div>

        {/* Trust & Pilot Feature Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-10 border-t border-stone-800/80 max-w-2xl mx-auto text-left">
          <div className="flex items-center space-x-2.5 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-amber-100">Nellore Focus</p>
              <p className="text-stone-400 text-[11px]">Accurate local venues</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-amber-100">Admin Approved</p>
              <p className="text-stone-400 text-[11px]">Verified organizers</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center space-x-2.5 bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-amber-100">Mobile First</p>
              <p className="text-stone-400 text-[11px]">1-tap call & maps</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
