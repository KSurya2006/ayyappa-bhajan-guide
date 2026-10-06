import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, X, Music, Sparkles } from 'lucide-react';
import type { Language } from '../types';
import { translations } from '../i18n/translations';

interface DevotionalAudioPlayerProps {
  lang: Language;
}

export function DevotionalAudioPlayer({ lang }: DevotionalAudioPlayerProps) {
  const t = translations[lang];

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const [isPlayerActive, setIsPlayerActive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if user has explicitly dismissed or muted in this session
    const sessionPref = sessionStorage.getItem('ayyappa_audio_pref');
    if (!sessionPref) {
      // First visit in session: show subtle devotional welcome banner
      setShowWelcomeBanner(true);
    } else if (sessionPref === 'playing') {
      setIsPlayerActive(true);
    }
  }, []);

  const handleStartPlayback = async () => {
    setShowWelcomeBanner(false);
    setIsPlayerActive(true);
    setIsExpanded(true);
    sessionStorage.setItem('ayyappa_audio_pref', 'active');

    if (audioRef.current) {
      try {
        audioRef.current.volume = volume;
        audioRef.current.muted = isMuted;
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio play request was interrupted or prevented by browser:', err);
      }
    }
  };

  const handleTogglePlayPause = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn('Playback error:', err);
      }
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleDismissBanner = () => {
    setShowWelcomeBanner(false);
    sessionStorage.setItem('ayyappa_audio_pref', 'dismissed');
  };

  const handleClosePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setIsPlayerActive(false);
    setIsExpanded(false);
    sessionStorage.setItem('ayyappa_audio_pref', 'stopped');
  };

  return (
    <>
      {/* Hidden Native Audio Element with preload="none" to prevent unauthorized bandwidth consumption */}
      <audio
        ref={audioRef}
        preload="none"
        loop
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.warn('[Devotional Audio] Fallback triggered if primary track unavailable:', e);
        }}
      >
        {/* Priority 1: Primary Ayyappa Devotional MP3 Track */}
        <source src="/audio/ayyappa-devotional.mp3" type="audio/mpeg" />
        {/* Priority 2: Custom Studio Track if named ayyappa-bhajan.mp3 */}
        <source src="/audio/ayyappa-bhajan.mp3" type="audio/mpeg" />
        {/* Priority 3: Synthesized Devotional Soundscape WAV fallback */}
        <source src="/audio/ayyappa-devotional.wav" type="audio/wav" />
      </audio>

      {/* 1. Subtle Devotional Welcome Banner on Initial Visit */}
      {showWelcomeBanner && !isPlayerActive && (
        <div
          role="region"
          aria-label={t.audioWelcomeTitle}
          className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 text-amber-50 px-4 py-2.5 shadow-md border-b border-amber-500/40 relative z-30 animate-fadeIn"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="text-xl select-none" aria-hidden="true">🙏</span>
              <div>
                <span className="font-semibold text-amber-200 mr-2 tracking-wide">
                  {t.audioWelcomeTitle}
                </span>
                <span className="text-amber-100/90 hidden sm:inline">
                  {t.audioWelcomeSubtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleStartPlayback}
                aria-label={t.audioPlayBhajan}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900/80 hover:bg-amber-950 text-amber-200 hover:text-white font-medium text-xs border border-amber-400/40 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                <span>{t.audioPlayBhajan}</span>
              </button>

              <button
                type="button"
                onClick={handleDismissBanner}
                aria-label={t.audioDismiss}
                className="p-1 rounded-full text-amber-200/80 hover:text-white hover:bg-amber-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Compact Devotional Audio Control Pill / Bar (Floating, non-blocking) */}
      {isPlayerActive && (
        <div
          role="region"
          aria-label={t.audioNowPlaying}
          className="fixed bottom-4 right-4 z-40 max-w-sm w-auto transition-all duration-300 select-none animate-slideUp"
        >
          <div className="bg-stone-900/95 backdrop-blur-md text-amber-100 rounded-2xl shadow-2xl border border-amber-600/40 p-3 sm:p-3.5 flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlayPause}
              aria-label={isPlaying ? t.audioPause : t.audioResume}
              className="w-10 h-10 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 flex items-center justify-center shadow-md transition-transform active:scale-95 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Track Info */}
            <div className="flex-1 min-w-[120px] max-w-[180px]">
              <div className="flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <p className="text-xs font-semibold text-amber-200 truncate">
                  {t.audioNowPlaying}
                </p>
              </div>
              <p className="text-[10px] text-stone-400 truncate">
                {isPlaying ? t.audioTrackDesc : (lang === 'te' ? 'ఆపబడింది' : 'Paused')}
              </p>
            </div>

            {/* Mute/Unmute */}
            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMuted ? t.audioUnmute : t.audioMute}
              className="p-2 rounded-lg text-amber-300 hover:bg-stone-800 transition-colors focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-stone-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Volume slider on hover or desktop */}
            <div className="hidden sm:flex items-center w-16">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label={t.audioVolume}
                className="w-full h-1 bg-stone-700 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              />
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClosePlayer}
              aria-label={t.audioClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors focus:outline-none focus:ring-1 focus:ring-stone-400 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Small Floating Re-trigger Icon if player was closed but visitor wants devotional audio */}
      {!isPlayerActive && !showWelcomeBanner && (
        <button
          type="button"
          onClick={handleStartPlayback}
          aria-label={t.audioPlayBhajan}
          className="fixed bottom-4 right-4 z-40 bg-amber-700/90 hover:bg-amber-600 text-amber-100 hover:text-white p-2.5 rounded-full shadow-lg border border-amber-500/40 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center gap-1.5 text-xs font-medium"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span className="hidden md:inline pr-1">{t.audioPlayBhajan}</span>
        </button>
      )}
    </>
  );
}
