import React from 'react';
import { Flame, Music, Sun, Award } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface BhajanInfoProps {
  lang: Language;
}

export const BhajanInfo: React.FC<BhajanInfoProps> = ({ lang }) => {
  const t = translations[lang];

  const steps = [
    {
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      title: t.step1Title,
      desc: t.step1Desc
    },
    {
      icon: <Award className="w-5 h-5 text-amber-600" />,
      title: t.step2Title,
      desc: t.step2Desc
    },
    {
      icon: <Music className="w-5 h-5 text-amber-500" />,
      title: t.step3Title,
      desc: t.step3Desc
    },
    {
      icon: <Flame className="w-5 h-5 text-amber-600" />,
      title: t.step4Title,
      desc: t.step4Desc
    }
  ];

  return (
    <section id="bhajan-info" className="py-12 px-4 sm:px-6 bg-stone-900 text-amber-50 scroll-mt-16">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Devotional Sequence • భజన విధానం</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-telugu">
            {t.infoTitle}
          </h2>
          <p className="text-sm sm:text-base text-amber-200/80 mt-2 font-telugu">
            {t.infoSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-stone-800/80 rounded-2xl p-6 border border-stone-700/80 flex items-start space-x-4 shadow-sm"
            >
              <div className="p-3 bg-stone-900 rounded-xl flex-shrink-0 border border-amber-600/30">
                {step.icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-100 mb-1.5 font-telugu">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-telugu">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
