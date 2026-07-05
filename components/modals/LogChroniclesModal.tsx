import React from 'react';
import { useTranslation } from 'react-i18next';
import { audioService } from '../../services/audioService';

interface LogChroniclesModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: string[];
}

export const LogChroniclesModal: React.FC<LogChroniclesModalProps> = ({ isOpen, onClose, log }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="stone-modal p-6 md:p-8 text-center border-4 border-[#8A6938] max-w-lg w-full shadow-[0_0_40px_rgba(216,196,154,0.35)] flex flex-col max-h-[80vh]">
        <h2 className="text-xl md:text-2xl font-ancient-header text-[#D8C49A] mb-1 tracking-widest">
          {t('game_ui.chronicle')}
        </h2>
        <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-[#8A6938] to-transparent mx-auto mb-4" />
        
        {/* Scrollable log list */}
        <div className="flex-grow overflow-y-auto bg-[#120f0b]/90 border border-[#574d3c] rounded p-4 text-left font-mono text-xs sm:text-sm text-[#9A8B72] shadow-inner mb-6 space-y-2.5">
          {log.length === 0 ? (
            <div className="italic text-center text-[#9A8B72]/50 mt-10">{t('game_ui.no_logs')}</div>
          ) : (
            [...log].reverse().map((l, index) => (
              <div key={index} className="border-b border-[#574d3c]/15 pb-1.5 flex gap-2">
                <span className="text-[#8A6938] font-bold select-none">&gt;</span>
                <span className="leading-relaxed">{l}</span>
              </div>
            ))
          )}
        </div>
        
        <button 
          onClick={() => {
            audioService.playSFX('click');
            onClose();
          }} 
          className="stone-button stone-button-red py-2 px-8 shadow-md mx-auto"
        >
          {t('game_ui.return_to_duel', 'REGRESAR AL DUELO')}
        </button>
      </div>
    </div>
  );
};
