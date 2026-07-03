import React, { useState, useEffect } from 'react';
import { audioService } from '../services/audioService';

const AudioSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => audioService.getSettings());

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

  // Click handler sound effect for opening panel
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
        title="Configuración de Sonido"
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
              AJUSTES DE AUDIO
            </h2>
            <div className="h-0.5 w-20 mx-auto bg-gradient-to-r from-transparent via-[#8A6938] to-transparent mb-6" />

            <div className="flex flex-col gap-6 text-left mb-8">
              {/* SFX Control */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-ancient-header text-sm md:text-base tracking-wide text-[#9A8B72]">
                    Efectos (SFX)
                  </span>
                  <button
                    onClick={handleToggleSFXMute}
                    className={`px-3 py-1 text-xs font-ancient-header rounded border transition-colors ${
                      settings.sfxMuted
                        ? 'border-[#82443a] text-[#82443a] bg-red-950/20'
                        : 'border-[#385B74] text-[#D8C49A] bg-[#385B74]/20'
                    }`}
                  >
                    {settings.sfxMuted ? 'SILENCIADO' : 'ACTIVO'}
                  </button>
                </div>
                <div className="flex items-center gap-4">
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
                  <span className="text-xs font-mono w-8 text-right text-[#D8C49A]">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
              </div>

              {/* BGM Control */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-ancient-header text-sm md:text-base tracking-wide text-[#9A8B72]">
                    Música de Fondo (BGM)
                  </span>
                  <button
                    onClick={handleToggleBGMMute}
                    className={`px-3 py-1 text-xs font-ancient-header rounded border transition-colors ${
                      settings.bgmMuted
                        ? 'border-[#82443a] text-[#82443a] bg-red-950/20'
                        : 'border-[#385B74] text-[#D8C49A] bg-[#385B74]/20'
                    }`}
                  >
                    {settings.bgmMuted ? 'SILENCIADO' : 'ACTIVO'}
                  </button>
                </div>
                <div className="flex items-center gap-4">
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
                  <span className="text-xs font-mono w-8 text-right text-[#D8C49A]">
                    {Math.round(settings.bgmVolume * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleClosePanel}
              className="stone-button stone-button-red px-8 py-2 text-sm"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AudioSettings;
