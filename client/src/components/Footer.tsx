import React from 'react';
import { Flame, Shield, Compass, Heart } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FooterProps {
  lang: Language;
  onOpenAdminLogin: () => void;
  onStartTour: () => void;
}

export const Footer: React.FC<FooterProps> = ({ lang, onOpenAdminLogin, onStartTour }) => {
  const t = translations[lang];

  return (
    <footer className="bg-stone-950 text-amber-100/80 border-t border-amber-600/30 pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
          {/* Brand & Devotional Motto */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2.5 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center text-stone-950">
                <Flame className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white font-telugu">
                {t.appTitle}
              </span>
            </div>
            <p className="text-xs text-amber-300 font-medium font-telugu">
              {t.footerMotto} • {t.footerPilot}
            </p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-sm">
              {t.footerDevotion}
            </p>
          </div>

          {/* Quick Utility Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
            <button
              onClick={onStartTour}
              className="flex items-center space-x-1.5 text-amber-300 hover:text-white transition py-1 px-3 rounded-lg bg-stone-900 border border-stone-800"
            >
              <Compass className="w-4 h-4" />
              <span>{t.reopenTour}</span>
            </button>

            <button
              onClick={onOpenAdminLogin}
              className="flex items-center space-x-1.5 text-stone-400 hover:text-amber-300 transition py-1 px-3 rounded-lg bg-stone-900 border border-stone-800"
            >
              <Shield className="w-4 h-4" />
              <span>{t.superAdminLogin}</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar with Security & Pilot Details */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-stone-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} Ayyappa Bhajan Guide. Pilot focusing strictly on Nellore, Andhra Pradesh.
          </p>
          <p className="flex items-center justify-center space-x-1">
            <span>Built with Zero-Trust Backend Security</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
