import React, { useState } from 'react';
import { Heart, Sparkles, AlertCircle, HelpCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface FirstTimeGuideProps {
  lang: Language;
}

export const FirstTimeGuide: React.FC<FirstTimeGuideProps> = ({ lang }) => {
  const t = translations[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = lang === 'te' ? [
    {
      q: "నేను భజనకు ఏ సమయంలో చేరుకోవాలి?",
      a: "భజన ప్రారంభ సమయానికి కనీసం 15 నిమిషాల ముందే చేరుకోవడం మంచిది. దీనివల్ల ప్రశాంతంగా కూర్చుని దీపారాధన మరియు గణపతి పూజలో పాల్గొనవచ్చు."
    },
    {
      q: "భజనలో పాల్గొనేటప్పుడు ఏ వస్త్రాలు ధరించాలి?",
      a: "మాలధారణ నియమాల ప్రకారం నలుపు, నీలం లేదా కాషాయ రంగు వస్త్రాలను శుభ్రంగా ఉతికి ధరించాలి. విభూతి, చందనం తప్పనిసరిగా ధరించాలి."
    },
    {
      q: "ఆహార నియమాలు మరియు భజన ప్రసాదం గురించి ఏమి తెలుసుకోవాలి?",
      a: "భజన అనంతరం అందించే ప్రసాదాన్ని భక్తితో స్వీకరించాలి. ఒకవేళ మీ వ్రత నియమాల్లో రాత్రి భోజనం లేకుండా కేవలం ఫలాహారం ఉంటే, నిర్వాహకులకు వినమ్రంగా తెలిపి తీర్థం మాత్రమే స్వీకరించవచ్చు."
    },
    {
      q: "నా గురుస్వామి చెప్పిన పద్ధతికి, ఇతరులు చెప్పేదానికి తేడా ఉంటే ఎవరి మాట వినాలి?",
      a: "ఎల్లప్పుడూ మీ మాల వేయించిన గురుస్వామి మరియు మీ సంప్రదాయాన్ని మాత్రమే అనుసరించండి. ప్రాంతాన్ని బట్టి కొన్ని ఆచారాల్లో తేడాలు ఉండవచ్చు."
    }
  ] : [
    {
      q: "What time should I arrive at a bhajan?",
      a: "It is recommended to reach at least 15 minutes before the announced start time. This helps you settle down peacefully and witness the opening Deeparadhana and Ganapathi Pooja."
    },
    {
      q: "What should I wear when attending a bhajan?",
      a: "Wear clean, washed traditional vastram (black, dark blue, or saffron as prescribed by your Guru Swami), with fresh sacred Vibhuti and Chandanam on your forehead."
    },
    {
      q: "What if the prasadam offered doesn't align with my fasting routine?",
      a: "You may respectfully receive the holy teertham (sacred water) and politely inform the volunteers that you are observing Ekabhuktam (single-meal vrata). Devotion and humility are paramount."
    },
    {
      q: "What if customs differ between temples or mandalis?",
      a: "Always follow the specific instructions of your Guru Swami. Local traditions may have minor variations, but adherence to your Guru's guidance ensures spiritual harmony."
    }
  ];

  return (
    <section id="first-time-guide" className="py-12 px-4 sm:px-6 max-w-5xl mx-auto scroll-mt-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-100/90 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          <span>Devotional Guidance • మార్గదర్శనం</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-telugu">
          {t.guideTitle}
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-2 font-telugu">
          {t.guideSubtitle}
        </p>

        {/* Essential Guru Swami Guidance Alert */}
        <div className="mt-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-900 flex items-start space-x-3 text-left">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed font-telugu font-medium">
            {t.guideDisclaimer}
          </p>
        </div>
      </div>

      {/* 3 Core Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-4 font-bold">
              1
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-telugu">
              {t.guideCard1Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-telugu">
              {t.guideCard1Text}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-4 font-bold">
              2
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-telugu">
              {t.guideCard2Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-telugu">
              {t.guideCard2Text}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 mb-4 font-bold">
              3
            </div>
            <h3 className="text-lg font-bold text-stone-900 mb-2 font-telugu">
              {t.guideCard3Title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-telugu">
              {t.guideCard3Text}
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-sm">
        <h3 className="text-lg sm:text-xl font-bold text-stone-900 mb-6 flex items-center space-x-2 font-telugu">
          <HelpCircle className="w-5 h-5 text-amber-600" />
          <span>{t.guideFaqTitle}</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-stone-200 rounded-xl overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 text-left flex items-center justify-between bg-stone-50 hover:bg-stone-100/80 transition"
                >
                  <span className="font-semibold text-sm sm:text-base text-stone-900 font-telugu pr-4">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-500 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-stone-700 leading-relaxed font-telugu border-t border-stone-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
