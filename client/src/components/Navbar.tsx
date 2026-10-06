import React, { useState } from 'react';
import { Flame, Globe, Menu, X, PlusCircle, Shield, Compass } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenAddModal: () => void;
  onOpenAdminLogin: () => void;
  onStartTour: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  onOpenAddModal,
  onOpenAdminLogin,
  onStartTour,
  activeSection,
  setActiveSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur-md text-amber-50 border-b border-amber-600/30 shadow-md">
      <div className="max-w-6xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Pilot Badge */}
          <div
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0 flex-shrink"
            onClick={() => scrollTo('hero')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/40 shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-stone-950 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-sm sm:text-lg tracking-tight text-amber-100 truncate">
                  {t.appTitle}
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full shrink-0">
                  {t.pilotBadge}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 hidden sm:block truncate">
                {t.pilotNotice}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => scrollTo('find-bhajans')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSection === 'find-bhajans' ? 'bg-amber-600 text-stone-950 font-semibold' : 'text-amber-100 hover:bg-stone-800'
              }`}
            >
              {t.navFind}
            </button>
            <button
              onClick={() => scrollTo('first-time-guide')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSection === 'first-time-guide' ? 'bg-amber-600 text-stone-950 font-semibold' : 'text-amber-100 hover:bg-stone-800'
              }`}
            >
              {t.navGuide}
            </button>
            <button
              onClick={() => scrollTo('bhajan-info')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSection === 'bhajan-info' ? 'bg-amber-600 text-stone-950 font-semibold' : 'text-amber-100 hover:bg-stone-800'
              }`}
            >
              {t.navInfo}
            </button>
            <button
              onClick={() => scrollTo('how-to-use')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeSection === 'how-to-use' ? 'bg-amber-600 text-stone-950 font-semibold' : 'text-amber-100 hover:bg-stone-800'
              }`}
            >
              {t.navHowToUse}
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {/* Tour Button */}
            <button
              onClick={onStartTour}
              title="Tour"
              className="hidden lg:flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-amber-300 hover:text-amber-200 hover:bg-stone-800 rounded-md transition"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-amber-600/30 shrink-0">
              <button
                onClick={() => onLanguageChange('te')}
                className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold rounded transition ${
                  lang === 'te' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-amber-200 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-1.5 sm:px-2 py-1 text-[11px] sm:text-xs font-semibold rounded transition ${
                  lang === 'en' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-amber-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Add Bhajan Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md transition active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navAddBhajan}</span>
              <span className="sm:hidden">{lang === 'te' ? '+ భజన' : '+ Add'}</span>
            </button>

            {/* Admin Portal Icon Button (Desktop only; on mobile accessible via drawer/shortcut) */}
            <button
              onClick={onOpenAdminLogin}
              title={t.navAdmin}
              className="hidden md:flex p-1.5 text-amber-300 hover:text-amber-100 hover:bg-stone-800 rounded-lg transition shrink-0"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle (Always visible, high contrast, guaranteed touch target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 md:hidden text-amber-300 hover:text-white bg-stone-800/90 hover:bg-stone-700 border border-amber-500/30 rounded-lg shrink-0 flex items-center justify-center min-w-[38px] min-h-[38px] shadow-sm active:scale-95 transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5 text-amber-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950/98 backdrop-blur-lg border-b border-amber-600/40 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top duration-150 shadow-2xl">
          <button
            onClick={() => scrollTo('find-bhajans')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium flex items-center space-x-2"
          >
            <span>{t.navFind}</span>
          </button>
          <button
            onClick={() => scrollTo('first-time-guide')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium flex items-center space-x-2"
          >
            <span>{t.navGuide}</span>
          </button>
          <button
            onClick={() => scrollTo('bhajan-info')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium flex items-center space-x-2"
          >
            <span>{t.navInfo}</span>
          </button>
          <button
            onClick={() => scrollTo('how-to-use')}
            className="w-full text-left py-2.5 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium flex items-center space-x-2"
          >
            <span>{t.navHowToUse}</span>
          </button>
          <div className="pt-3 border-t border-stone-800 flex justify-between items-center">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartTour();
              }}
              className="flex items-center space-x-1.5 text-xs text-amber-300 py-1.5 px-2.5 bg-stone-900 rounded-md border border-stone-800"
            >
              <Compass className="w-4 h-4" />
              <span>{t.btnStartTour}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="flex items-center space-x-1.5 text-xs text-stone-500 hover:text-amber-300 py-1.5 px-2.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.navAdmin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
