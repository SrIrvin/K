import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { audioService } from '../../services/audioService';

interface TermsAndCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsAndCreditsModal: React.FC<TermsAndCreditsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'terms' | 'credits'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-4 font-medieval selection:bg-amber-800 selection:text-amber-100 animate-fadeIn">
      <div className="stone-modal p-5 md:p-8 max-w-2xl w-full border-4 border-[#8a6938] bg-[#14110e]/95 rounded-lg shadow-[0_0_50px_rgba(216,196,154,0.4)] flex flex-col max-h-[90vh] relative overflow-hidden text-[#D8C49A]">
        {/* Decorative corner runes */}
        <div className="absolute top-2 left-2 text-[#8a6938]/30 font-serif select-none pointer-events-none text-xl">᚛</div>
        <div className="absolute top-2 right-2 text-[#8a6938]/30 font-serif select-none pointer-events-none text-xl">᚜</div>
        <div className="absolute bottom-2 left-2 text-[#8a6938]/30 font-serif select-none pointer-events-none text-xl">ᚘ</div>
        <div className="absolute bottom-2 right-2 text-[#8a6938]/30 font-serif select-none pointer-events-none text-xl">ᚙ</div>

        {/* Modal Header */}
        <div className="text-center mb-5 relative z-10">
          <div className="text-[10px] text-amber-500/70 tracking-[0.3em] uppercase font-orbitron mb-1">
            {t('menu.modal_ritual_title', '📜 Leyes y Anales del Templo 📜')}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-widest text-[#D8C49A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-ancient-header uppercase">
            {activeTab === 'terms' 
              ? t('menu.terms_title', 'TÉRMINOS Y CONDICIONES') 
              : t('menu.credits_title', 'CRÉDITOS Y CREADORES')}
          </h2>
          <div className="h-0.5 w-36 bg-gradient-to-r from-transparent via-[#8a6938] to-transparent mx-auto mt-2" />
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#524335] mb-5 relative z-10 font-orbitron text-xs">
          <button
            onClick={() => {
              audioService.playSFX('click');
              setActiveTab('terms');
            }}
            className={`flex-1 py-2.5 font-bold tracking-wider transition-all border-b-2 uppercase ${
              activeTab === 'terms'
                ? 'border-amber-500 text-amber-400 bg-[#211a14]/60'
                : 'border-transparent text-[#9a8b72] hover:text-[#D8C49A]'
            }`}
          >
            ⚖️ {t('menu.terms_tab', 'Términos')}
          </button>
          <button
            onClick={() => {
              audioService.playSFX('click');
              setActiveTab('credits');
            }}
            className={`flex-1 py-2.5 font-bold tracking-wider transition-all border-b-2 uppercase ${
              activeTab === 'credits'
                ? 'border-amber-500 text-amber-400 bg-[#211a14]/60'
                : 'border-transparent text-[#9a8b72] hover:text-[#D8C49A]'
            }`}
          >
            🎖️ {t('menu.credits_tab', 'Créditos')}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-4 mb-5 max-h-[50vh] custom-scroll font-runic-text text-sm leading-relaxed text-[#c6b394]">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  ⚔️ 1. Leyes del Altar (Reglas de Uso)
                </h3>
                <p>
                  El Altar de 克 (K) es un espacio consagrado al honor táctico. Queda estrictamente prohibida la manipulación del software, el uso de hacks, modificaciones fraudulentas, o la interrupción deliberada de las conexiones PeerJS en las salas públicas. Todo retador debe luchar con dignidad.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  🔒 2. Secretos Ocultos (Privacidad)
                </h3>
                <p>
                  No recopilamos ni comerciamos con tu identidad mortal. Para el funcionamiento de los marcadores públicos, guardamos únicamente tu alias (Nickname), oro conseguido y estadísticas de victorias/derrotas de forma anónima en Firebase. Ninguna información sensible se almacena ni se vende.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  🛡️ 3. Juicio de Responsabilidad (Disclaimer)
                </h3>
                <p>
                  克 (K) se ofrece "tal cual" con fines de entretenimiento. Los creadores no asumen responsabilidad alguna por las derrotas sufridas ante la IA, el dolor mental por tácticas enemigas sádicas, o la pérdida ocasional de la conexión debido al viento en el plano material.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  📜 4. Pactos y Propiedad Intelectual
                </h3>
                <p>
                  Los elementos artísticos, código, sonidos e historias recopilados en este juego son propiedad exclusiva de sus desarrolladores. El juego se inspira en juegos clásicos de cartas físicas y duelos de tablero medievales.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#1d1812] border border-[#8a6938] p-4 rounded shadow-md text-center">
                <div className="text-2xl mb-1">👑</div>
                <h3 className="text-[#e5c9a4] font-bold font-orbitron text-sm uppercase tracking-wide">
                  Irvin (SrIrvin)
                </h3>
                <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider mb-2">
                  Forjador del Altar y Programador Jefe
                </p>
                <p className="text-xs italic">
                  Diseñó el código sagrado del juego, implementó la lógica de combate, la inteligencia artificial de los guardianes, y la red de comunicación mística PeerJS para duelos mundiales.
                </p>
                <div className="mt-3 flex justify-center">
                  <a
                    href="https://linkedin.com/in/sr-irvin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D8C49A] hover:text-white border border-[#8a6938]/50 hover:border-amber-500 bg-[#120f0c] text-[10px] font-orbitron px-3 py-1 rounded transition-all flex items-center gap-1"
                  >
                    <span>💼</span> Perfil de LinkedIn
                  </a>
                </div>
              </div>

              <div className="bg-[#1d1812] border border-[#8a6938] p-4 rounded shadow-md text-center">
                <div className="text-2xl mb-1">🩸</div>
                <h3 className="text-[#e5c9a4] font-bold font-orbitron text-sm uppercase tracking-wide">
                  Moon
                </h3>
                <p className="text-xs text-red-400 font-semibold uppercase tracking-wider mb-2">
                  Princesa Carmesí • Lore & Diseño del Ritual
                </p>
                <p className="text-xs italic">
                  Responsable del lore místico, el equilibrio esotérico de las runas, las mecánicas de los 7 Guardianes y el diseño de la campaña de marketing sagrado.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 rounded shadow-inner text-center">
                <h4 className="text-amber-500 font-bold font-orbitron text-[10px] uppercase tracking-wider mb-1">
                  💖 Agradecimientos Especiales
                </h4>
                <p className="text-xs">
                  A todos los retadores que se atreven a cruzar las puertas del Templo y batirse en duelo en el Altar de 克 (K). ¡Que las runas guíen su camino!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-center pt-2 relative z-10">
          <button
            onClick={() => {
              audioService.playSFX('click');
              onClose();
            }}
            className="stone-button py-2.5 px-10 text-xs tracking-widest font-bold uppercase transition-transform active:scale-95"
          >
            {t('audio.close', 'CERRAR')}
          </button>
        </div>
      </div>
    </div>
  );
};
