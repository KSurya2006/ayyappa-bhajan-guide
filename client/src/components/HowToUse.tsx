import React from 'react';
import { Compass, CheckCircle, Navigation, Phone, BookOpen, PlusCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface HowToUseProps {
  lang: Language;
  onStartTour: () => void;
}

export const HowToUse: React.FC<HowToUseProps> = ({ lang, onStartTour }) => {
  const t = translations[lang];

  const steps = [
    { num: "1", title: t.howStep1, desc: t.howStep1Desc, icon: <CheckCircle className="w-4 h-4 text-amber-600" /> },
    { num: "2", title: t.howStep2, desc: t.howStep2Desc, icon: <CheckCircle className="w-4 h-4 text-amber-600" /> },
    { num: "3", title: t.howStep3, desc: t.howStep3Desc, icon: <Navigation className="w-4 h-4 text-amber-600" /> },
    { num: "4", title: t.howStep4, desc: t.howStep4Desc, icon: <Phone className="w-4 h-4 text-emerald-600" /> },
    { num: "5", title: t.howStep5, desc: t.howStep5Desc, icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
    { num: "6", title: t.howStep6, desc: t.howStep6Desc, icon: <PlusCircle className="w-4 h-4 text-amber-600" /> },
  ];

  return (
    <section id="how-to-use" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-telugu">
          {t.howTitle}
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-2 font-telugu">
          {t.howSubtitle}
        </p>
        <button
          onClick={onStartTour}
          className="mt-4 inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95"
        >
          <Compass className="w-4 h-4 animate-spin-slow" />
          <span>{t.btnStartTour}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  {s.num}
                </span>
                {s.icon}
              </div>
              <h3 className="font-bold text-sm text-stone-900 mb-1.5 font-telugu">
                {s.title}
              </h3>
              <p className="text-xs text-stone-600 font-telugu leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
