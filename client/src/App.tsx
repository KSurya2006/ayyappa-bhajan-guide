import { useState, useEffect } from 'react';
import type { Language, Bhajan, NelloreArea, Announcement, AdminUser } from './types';
import { fetchBhajans, fetchAreas, fetchAnnouncements, checkAdminAuth, DEFAULT_NELLORE_AREAS, onWakeUpStatusChange } from './services/api';
import { Navbar } from './components/Navbar';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { Hero } from './components/Hero';
import { FindBhajans } from './components/FindBhajans';
import { FirstTimeGuide } from './components/FirstTimeGuide';
import { BhajanInfo } from './components/BhajanInfo';
import { HowToUse } from './components/HowToUse';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { BhajanDetailsModal } from './components/BhajanDetailsModal';
import { AddBhajanModal } from './components/AddBhajanModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WebsiteTour } from './components/WebsiteTour';
import { DevotionalAudioPlayer } from './components/DevotionalAudioPlayer';
import { Loader2 } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('te');
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [areas, setAreas] = useState<NelloreArea[]>(DEFAULT_NELLORE_AREAS);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isServerWaking, setIsServerWaking] = useState(false);

  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [bhajanList, areaList, annList, currentAdmin] = await Promise.all([
        fetchBhajans(),
        fetchAreas(),
        fetchAnnouncements(),
        checkAdminAuth()
      ]);
      setBhajans(bhajanList);
      setAreas(areaList);
      setAnnouncements(annList);
      if (currentAdmin) {
        setAdminUser(currentAdmin);
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();

    // Listen for Render cold-boot wake up notifications
    const unsubscribeWakeUp = onWakeUpStatusChange((isWaking) => {
      setIsServerWaking(isWaking);
    });

    // Check for admin query or hash in URL (?admin=true or ?admin=login or #admin)
    if (
      window.location.search.includes('admin') ||
      window.location.hash.toLowerCase().includes('admin')
    ) {
      setIsAdminLoginOpen(true);
    }

    // Keyboard shortcut (Ctrl+Shift+A) to open Super Admin portal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (adminUser) {
          setIsAdminDashboardOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const hasSeenTour = localStorage.getItem('ayyappa_seen_tour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
      localStorage.setItem('ayyappa_seen_tour', 'true');
    }

    return () => {
      unsubscribeWakeUp();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [adminUser]);

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsAdminDashboardOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-900 selection:bg-amber-500 selection:text-stone-950 pb-16 md:pb-0">
      {/* Devotional Server Cold-Boot Status Banner */}
      {isServerWaking && (
        <div className="bg-amber-600 text-stone-950 px-4 py-2 text-center text-xs font-semibold flex items-center justify-center space-x-2 shadow-md animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
          <span>
            {lang === 'te'
              ? 'స్వామి సన్నిధి సర్వర్ కనెక్ట్ అవుతోంది (దయచేసి కొన్ని క్షణాలు వేచి ఉండండి)...'
              : 'Connecting to devotional server... (Waking up, please wait a few seconds)'}
          </span>
        </div>
      )}

      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenAdminLogin={() => {
          if (adminUser) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onStartTour={() => setIsTourOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <AnnouncementsBanner announcements={announcements} lang={lang} />
      <DevotionalAudioPlayer lang={lang} />

      <Hero
        lang={lang}
        onFindClick={() => {
          const el = document.getElementById('find-bhajans');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onAddClick={() => setIsAddModalOpen(true)}
        onTourClick={() => setIsTourOpen(true)}
      />

      <FindBhajans
        bhajans={bhajans}
        areas={areas}
        lang={lang}
        onSelectBhajan={(b) => setSelectedBhajan(b)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isLoading={loading}
        onRefresh={loadInitialData}
      />

      <FirstTimeGuide lang={lang} />

      <BhajanInfo lang={lang} />

      <HowToUse lang={lang} onStartTour={() => setIsTourOpen(true)} />

      <Footer
        lang={lang}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (Visible on phones) */}
      <MobileBottomNav
        lang={lang}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onStartTour={() => setIsTourOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <BhajanDetailsModal
        bhajan={selectedBhajan}
        lang={lang}
        onClose={() => setSelectedBhajan(null)}
      />

      <AddBhajanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        lang={lang}
        areas={areas}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
        lang={lang}
      />

      {isAdminDashboardOpen && adminUser && (
        <AdminDashboard
          user={adminUser}
          onLogout={() => {
            setAdminUser(null);
            setIsAdminDashboardOpen(false);
            loadInitialData();
          }}
          onClose={() => {
            setIsAdminDashboardOpen(false);
            loadInitialData();
          }}
          lang={lang}
        />
      )}

      <WebsiteTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default App;
