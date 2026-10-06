import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Calendar, Navigation, Phone, BookOpen, PlusCircle, Check } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n/translations';

interface WebsiteTourProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const WebsiteTour: React.FC<WebsiteTourProps> = ({ isOpen, onClose, lang }) => {
  const [currentStep, setCurrentStep] = useState(0);
  if (!isOpen) return null;

  const t = translations[lang];

  const steps = [
    {
      title: lang === 'te' ? "1. భజనలు కనుగొనండి (Find Bhajans)" : "1. Find Bhajans",
      desc: lang === 'te' 
        ? "నెల్లూరు మరియు పరిసర ప్రాంతాలలో రాబోయే అయ్యప్ప భజనల జాబితాను ప్రాంతం లేదా తేదీ వారీగా శోధించండి."
        : "Discover upcoming verified Ayyappa bhajans across Nellore and surrounding areas with ease.",
      icon: <MapPin className="w-8 h-8 text-amber-500" />
    },
    {
      title: lang === 'te' ? "2. పూర్తి వివరాలు చూడండి (Check Details)" : "2. Check Details",
      desc: lang === 'te'
        ? "కార్యక్రమం తేదీ, ప్రారంభ సమయం, ఆలయం/వేదిక, మరియు నిర్వాహకుల పూర్తి వివరాలు తెలుసుకోండి."
        : "See exact date, start time, temple or venue details, and organizer information.",
      icon: <Calendar className="w-8 h-8 text-amber-500" />
    },
    {
      title: lang === 'te' ? "3. దారితీసే మార్గం (Get Directions)" : "3. Get Directions",
      desc: lang === 'te'
        ? "'Get Directions' బటన్ పై క్లిక్ చేసి నేరుగా గూగుల్ మ్యాప్స్ ద్వారా వేదికకు చేరుకోండి."
        : "Tap 'Get Directions' to open the exact location in Google Maps and navigate directly.",
      icon: <Navigation className="w-8 h-8 text-amber-500" />
    },
    {
      title: lang === 'te' ? "4. నిర్వాహకుడిని సంప్రదించండి (Contact Organizer)" : "4. Contact Organizer",
      desc: lang === 'te'
        ? "సమయం, వేదిక లేదా ప్రసాదం గురించి ఏవైనా సందేహాలుంటే 'Call Organizer' ద్వారా నేరుగా కాల్ చేయవచ్చు."
        : "Have questions about prasadam, venue, or timing? Directly call the organizer with one tap.",
      icon: <Phone className="w-8 h-8 text-emerald-500" />
    },
    {
      title: lang === 'te' ? "5. మొదటిసారి మాలాధారణ గైడ్ (Learn)" : "5. Learn Devotional Etiquette",
      desc: lang === 'te'
        ? "మొదటిసారి మాల ధరించిన భక్తుల కోసం నిత్య నియమాలు మరియు భజన మర్యాదలను చదవండి."
        : "Read helpful guidance, vratham practices, and etiquette designed specifically for first-time Maladharis.",
      icon: <BookOpen className="w-8 h-8 text-amber-500" />
    },
    {
      title: lang === 'te' ? "6. మీ భజనను చేర్చండి (Add a Bhajan)" : "6. Add a Bhajan",
      desc: lang === 'te'
        ? "మీరు భజన నిర్వాహకులైతే మీ కార్యక్రమ వివరాలను సులభంగా సమర్పించి అడ్మిన్ ఆమోదం పొందవచ్చు."
        : "Organizers can submit their upcoming bhajan dates for Super Admin review and publication.",
      icon: <PlusCircle className="w-8 h-8 text-amber-500" />
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-amber-300 relative flex flex-col justify-between">
        {/* Top Bar with Step Indicators */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentStep ? 'w-6 bg-amber-600' : 'w-2 bg-stone-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
            aria-label="Close Tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
            {current.icon}
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
            {t.tourStepTitle} {currentStep + 1} / {steps.length}
          </span>
          <h3 className="text-xl font-bold text-stone-900 font-telugu">
            {current.title}
          </h3>
          <p className="text-sm text-stone-600 leading-relaxed font-telugu max-w-xs mx-auto">
            {current.desc}
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-between gap-2 mt-4">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="px-3.5 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.tourPrev}</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-stone-400 hover:text-stone-600 text-xs sm:text-sm"
            >
              {t.tourSkip}
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center space-x-1.5"
          >
            <span>{currentStep === steps.length - 1 ? t.tourFinish : t.tourNext}</span>
            {currentStep === steps.length - 1 ? (
              <Check className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
