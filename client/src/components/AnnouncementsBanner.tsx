import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';
import { Announcement, Language } from '../types';

interface AnnouncementsBannerProps {
  announcements: Announcement[];
  lang: Language;
}

export const AnnouncementsBanner: React.FC<AnnouncementsBannerProps> = ({ announcements, lang }) => {
  const [closedIds, setClosedIds] = useState<number[]>([]);

  const activeAnnouncements = announcements.filter(a => !closedIds.includes(a.id));
  if (activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[0];
  const title = lang === 'te' ? current.title_te : current.title_en;
  const content = lang === 'te' ? current.content_te : current.content_en;

  return (
    <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 text-stone-950 px-4 py-2.5 shadow-inner">
      <div className="max-w-6xl mx-auto flex items-start sm:items-center justify-between gap-3 text-xs sm:text-sm font-medium">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-amber-900/20 rounded-full flex-shrink-0">
            <Megaphone className="w-4 h-4 text-stone-900" />
          </div>
          <div>
            <strong className="font-bold mr-1.5">{title}:</strong>
            <span>{content}</span>
          </div>
        </div>
        <button
          onClick={() => setClosedIds(prev => [...prev, current.id])}
          className="text-stone-900/70 hover:text-stone-950 p-1 flex-shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
