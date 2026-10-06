import React from 'react';
import { Calendar, PlusCircle, BookOpen, Info, Compass } from 'lucide-react';
import { Language } from '../types';

interface MobileBottomNavProps {
  lang: Language;
  onOpenAddModal: () => void;
  onStartTour: () => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  onOpenAddModal,
  onStartTour,
  activeSection,
  setActiveSection
}) => {
  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isTe = lang === 'te';

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-950/95 backdrop-blur-lg border-t border-amber-600/30 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Find Bhajans */}
        <button
          onClick={() => scrollTo('find-bhajans')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[56px] ${
            activeSection === 'find-bhajans'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-telugu">
            {isTe ? 'భజనలు' : 'Bhajans'}
          </span>
        </button>

        {/* Add Bhajan (Prominent Floating-style Action) */}
        <button
          onClick={onOpenAddModal}
          className="flex flex-col items-center justify-center -mt-3.5 group focus:outline-none"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 text-stone-950 flex items-center justify-center shadow-lg shadow-amber-600/40 border-2 border-stone-950 group-active:scale-95 transition">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] leading-tight font-semibold text-amber-300 mt-0.5 font-telugu">
            {isTe ? 'సమర్పణ' : 'Add'}
          </span>
        </button>

        {/* First Time Guide */}
        <button
          onClick={() => scrollTo('first-time-guide')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[56px] ${
            activeSection === 'first-time-guide'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-telugu">
            {isTe ? 'మాలా గైడ్' : 'Guide'}
          </span>
        </button>

        {/* Bhajan Info */}
        <button
          onClick={() => scrollTo('bhajan-info')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[56px] ${
            activeSection === 'bhajan-info'
              ? 'text-amber-400 font-bold'
              : 'text-stone-400 hover:text-amber-200'
          }`}
        >
          <Info className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-telugu">
            {isTe ? 'సమాచారం' : 'Info'}
          </span>
        </button>

        {/* Website Tour */}
        <button
          onClick={onStartTour}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg transition min-w-[56px] text-stone-400 hover:text-amber-200"
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight font-telugu">
            {isTe ? 'టూర్' : 'Tour'}
          </span>
        </button>
      </div>
    </nav>
  );
};
