import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'zh', name: '中文' },
  { code: 'fr', name: 'Français' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'nah', name: 'Nāhuatl' }
];

const getTranslation = (lang: string) => {
  const translations: Record<string, { title: string; sfx: string; bgm: string; langLabel: string; close: string }> = {
    es: { title: 'AJUSTES DEL JUEGO', sfx: 'Efectos (SFX)', bgm: 'Música (BGM)', langLabel: 'Idioma', close: 'CERRAR' },
    en: { title: 'GAME SETTINGS', sfx: 'Effects (SFX)', bgm: 'Music (BGM)', langLabel: 'Language', close: 'CLOSE' },
    fr: { title: 'PARAMÈTRES DU JEU', sfx: 'Effets (SFX)', bgm: 'Musique (BGM)', langLabel: 'Langue', close: 'FERMER' },
    it: { title: 'IMPOSTAZIONI GIOCO', sfx: 'Effetti (SFX)', bgm: 'Musica (BGM)', langLabel: 'Lingua', close: 'CHIUDI' },
    pt: { title: 'AJUSTES DO JOGO', sfx: 'Efeitos (SFX)', bgm: 'Música (BGM)', langLabel: 'Idioma', close: 'FECHAR' },
    ru: { title: 'НАСТРОЙКИ ИГРЫ', sfx: 'Эффекты (SFX)', bgm: 'Музыка (BGM)', langLabel: 'Язык', close: 'ЗАКРЫТЬ' },
    zh: { title: '游戏设置', sfx: '音效 (SFX)', bgm: '音乐 (BGM)', langLabel: '语言', close: '关闭' },
    ar: { title: 'إعدادات اللعبة', sfx: 'المؤثرات (SFX)', bgm: 'الموسيقى (BGM)', langLabel: 'اللغة', close: 'إغلاق' },
    nah: { title: 'TLAYECTLALILIZTLI', sfx: 'Tepozcacuica (SFX)', bgm: 'Tepozcuica (BGM)', langLabel: 'Tlahtolli', close: 'TZACUA' }
  };
  return translations[lang] || translations['en'];
};

const AudioSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => audioService.getSettings());
  const { i18n } = useTranslation();

  const localTexts = getTranslation(i18n.language);

  // Update local state when modifying settings
  const handleToggleSFXMute = () => {
    const newMute = !settings.sfxMuted;
    audioService.setSFXMuted(newMute);
    setSettings(prev => ({ ...prev, sfxMuted: newMute }));
    
    // Play a test sound if we just unmuted
    if (!newMute) {
      audioService.playSFX('click');
    }
  };

  const handleToggleBGMMute = () => {
    const newMute = !settings.bgmMuted;
    audioService.setBGMMuted(newMute);
    setSettings(prev => ({ ...prev, bgmMuted: newMute }));
  };

  const handleSFXVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    audioService.setSFXVolume(vol);
    setSettings(prev => ({ ...prev, sfxVolume: vol }));
  };

  const handleBGMVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    audioService.setBGMVolume(vol);
    setSettings(prev => ({ ...prev, bgmVolume: vol }));
  };

  // Close modal when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleOpenPanel = () => {
    audioService.playSFX('click');
    setIsOpen(true);
  };

  const handleClosePanel = () => {
    audioService.playSFX('click');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Audio settings button (carved rune style) */}
      <button
        onClick={handleOpenPanel}
        className="fixed top-4 right-4 z-40 w-11 h-11 flex items-center justify-center rounded-full bg-gradient-to-br from-[#a49479] to-[#766953] border-2 border-[#574d3c] shadow-lg text-[#1e1a14] hover:from-[#b8a68b] hover:to-[#86785e] active:scale-95 transition-all duration-150"
        title="Settings"
      >
        {settings.sfxMuted && settings.bgmMuted ? (
          /* Mute SVG */
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
          </svg>
        ) : (
          /* Speaker SVG */
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
      </button>

      {/* Modal Settings Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          {/* Stone carved panel */}
          <div className="relative w-full max-w-sm p-6 md:p-8 stone-modal text-white text-center animate-scaleUp">
            <h2 className="text-2xl font-ancient-header tracking-wider text-[#D8C49A] mb-1">
              {localTexts.title}
            </h2>
            <div className="h-0.5 w-20 mx-auto bg-gradient-to-r from-transparent via-[#8A6938] to-transparent mb-6" />

            <div className="flex flex-col gap-5 text-left mb-8">
              {/* SFX Control Row */}
              <div className="flex items-center gap-3 w-full bg-[#1e1a14]/60 p-3 rounded-lg border border-[#574d3c]/30">
                <button
                  onClick={handleToggleSFXMute}
                  className={`w-9 h-9 flex items-center justify-center rounded border transition-colors flex-shrink-0 ${
                    settings.sfxMuted
                      ? 'border-[#82443a] text-[#82443a] bg-red-950/20'
                      : 'border-[#8A6938]/60 text-[#D8C49A] bg-[#1e1a14]/40 hover:bg-[#8A6938]/20'
                  }`}
                  title={settings.sfxMuted ? 'Unmute' : 'Mute'}
                >
                  {settings.sfxMuted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                    </svg>
                  )}
                </button>
                <div className="flex-grow flex flex-col gap-1">
                  <span className="font-ancient-header text-[10px] md:text-xs tracking-wider text-[#9A8B72] uppercase">
                    {localTexts.sfx}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.sfxVolume}
                      disabled={settings.sfxMuted}
                      onChange={handleSFXVolumeChange}
                      className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#D8C49A] disabled:opacity-30"
                    />
                    <span className="text-[10px] md:text-xs font-mono w-8 text-right text-[#D8C49A] flex-shrink-0">
                      {settings.sfxMuted ? '0%' : `${Math.round(settings.sfxVolume * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* BGM Control Row */}
              <div className="flex items-center gap-3 w-full bg-[#1e1a14]/60 p-3 rounded-lg border border-[#574d3c]/30">
                <button
                  onClick={handleToggleBGMMute}
                  className={`w-9 h-9 flex items-center justify-center rounded border transition-colors flex-shrink-0 ${
                    settings.bgmMuted
                      ? 'border-[#82443a] text-[#82443a] bg-red-950/20'
                      : 'border-[#8A6938]/60 text-[#D8C49A] bg-[#1e1a14]/40 hover:bg-[#8A6938]/20'
                  }`}
                  title={settings.bgmMuted ? 'Unmute' : 'Mute'}
                >
                  {settings.bgmMuted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636M9 19V6l12-3v13" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  )}
                </button>
                <div className="flex-grow flex flex-col gap-1">
                  <span className="font-ancient-header text-[10px] md:text-xs tracking-wider text-[#9A8B72] uppercase">
                    {localTexts.bgm}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.bgmVolume}
                      disabled={settings.bgmMuted}
                      onChange={handleBGMVolumeChange}
                      className="w-full h-1.5 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer accent-[#D8C49A] disabled:opacity-30"
                    />
                    <span className="text-[10px] md:text-xs font-mono w-8 text-right text-[#D8C49A] flex-shrink-0">
                      {settings.bgmMuted ? '0%' : `${Math.round(settings.bgmVolume * 100)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Language Control Row */}
              <div className="flex items-center gap-3 w-full bg-[#1e1a14]/60 p-3 rounded-lg border border-[#574d3c]/30">
                <span className="w-9 h-9 flex items-center justify-center rounded border border-[#8A6938]/60 text-[#D8C49A] bg-[#1e1a14]/40 flex-shrink-0 text-base">
                  🌐
                </span>
                <div className="flex-grow flex flex-col gap-1">
                  <span className="font-ancient-header text-[10px] md:text-xs tracking-wider text-[#9A8B72] uppercase">
                    {localTexts.langLabel}
                  </span>
                  <select
                    value={i18n.language}
                    onChange={(e) => {
                      audioService.playSFX('click');
                      i18n.changeLanguage(e.target.value);
                    }}
                    className="bg-[#2c241b] border border-[#8A6938] text-[#D8C49A] font-bold text-xs px-2 py-1.5 rounded w-full focus:outline-none focus:ring-1 focus:ring-[#D8C49A] cursor-pointer"
                  >
                    {languages.map((lng) => (
                      <option key={lng.code} value={lng.code}>
                        {lng.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleClosePanel}
              className="stone-button stone-button-red px-8 py-2 text-sm"
            >
              {localTexts.close}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioSettings;
