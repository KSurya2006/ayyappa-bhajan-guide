import { useState, useEffect } from 'react';
import type { Language, Bhajan, NelloreArea, Announcement, AdminUser } from './types';
import { fetchBhajans, fetchAreas, fetchAnnouncements, checkAdminAuth } from './services/api';
import { Navbar } from './components/Navbar';
import { AnnouncementsBanner } from './components/AnnouncementsBanner';
import { Hero } from './components/Hero';
import { FindBhajans } from './components/FindBhajans';
import { FirstTimeGuide } from './components/FirstTimeGuide';
import { BhajanInfo } from './components/BhajanInfo';
import { HowToUse } from './components/HowToUse';
import { Footer } from './components/Footer';
import { BhajanDetailsModal } from './components/BhajanDetailsModal';
import { AddBhajanModal } from './components/AddBhajanModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { WebsiteTour } from './components/WebsiteTour';
import { DevotionalAudioPlayer } from './components/DevotionalAudioPlayer';

export function App() {
  const [lang, setLang] = useState<Language>('te');
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [areas, setAreas] = useState<NelloreArea[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

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

    const hasSeenTour = localStorage.getItem('ayyappa_seen_tour');
    if (!hasSeenTour) {
      setIsTourOpen(true);
      localStorage.setItem('ayyappa_seen_tour', 'true');
    }
  }, []);

  const handleAdminLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    setIsAdminDashboardOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-stone-900 selection:bg-amber-500 selection:text-stone-950">
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
        onOpenAdminLogin={() => {
          if (adminUser) {
            setIsAdminDashboardOpen(true);
          } else {
            setIsAdminLoginOpen(true);
          }
        }}
        onStartTour={() => setIsTourOpen(true)}
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
