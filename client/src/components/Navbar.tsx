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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Pilot Badge */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-900/40">
              <Flame className="w-6 h-6 text-stone-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg sm:text-xl tracking-tight text-amber-100">
                  {t.appTitle}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full">
                  {t.pilotBadge}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 hidden sm:block">
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
          <div className="flex items-center space-x-2">
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
            <div className="flex items-center bg-stone-800 p-0.5 rounded-lg border border-amber-600/30">
              <button
                onClick={() => onLanguageChange('te')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  lang === 'te' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-amber-200 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  lang === 'en' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-amber-200 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Add Bhajan Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold px-3 py-1.5 rounded-lg text-xs sm:text-sm shadow-md transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{t.navAddBhajan}</span>
              <span className="sm:hidden">+</span>
            </button>

            {/* Admin Portal Icon Button */}
            <button
              onClick={onOpenAdminLogin}
              title={t.navAdmin}
              className="p-1.5 text-amber-300 hover:text-amber-100 hover:bg-stone-800 rounded-lg transition"
            >
              <Shield className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 md:hidden text-amber-200 hover:text-white hover:bg-stone-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-b border-amber-600/30 px-4 pt-2 pb-4 space-y-2 animate-in slide-in-from-top duration-150">
          <button
            onClick={() => scrollTo('find-bhajans')}
            className="w-full text-left py-2 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium"
          >
            {t.navFind}
          </button>
          <button
            onClick={() => scrollTo('first-time-guide')}
            className="w-full text-left py-2 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium"
          >
            {t.navGuide}
          </button>
          <button
            onClick={() => scrollTo('bhajan-info')}
            className="w-full text-left py-2 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium"
          >
            {t.navInfo}
          </button>
          <button
            onClick={() => scrollTo('how-to-use')}
            className="w-full text-left py-2 px-3 rounded-lg text-amber-100 hover:bg-stone-800 text-sm font-medium"
          >
            {t.navHowToUse}
          </button>
          <div className="pt-2 border-t border-stone-800 flex justify-between items-center">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onStartTour();
              }}
              className="flex items-center space-x-1.5 text-xs text-amber-300 py-1"
            >
              <Compass className="w-4 h-4" />
              <span>{t.btnStartTour}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminLogin();
              }}
              className="flex items-center space-x-1.5 text-xs text-amber-400 py-1"
            >
              <Shield className="w-4 h-4" />
              <span>{t.navAdmin}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
