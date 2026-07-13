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
            {t('menu.modal_ritual_title', 'Acuerdos Legales y Créditos')}
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-widest text-[#D8C49A] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-ancient-header uppercase">
            {activeTab === 'terms' 
              ? t('menu.terms_title', 'TÉRMINOS DE SERVICIO Y PRIVACIDAD') 
              : t('menu.credits_title', 'CRÉDITOS DEL PROYECTO')}
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
            {t('menu.terms_tab', 'Términos y Privacidad')}
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
            {t('menu.credits_tab', 'Créditos')}
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto pr-1 space-y-4 mb-5 max-h-[50vh] custom-scroll font-runic-text text-xs md:text-sm leading-relaxed text-[#c6b394]">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  1. CONDICIONES DE USO
                </h3>
                <p>
                  Este software se proporciona de forma gratuita, "tal cual" (as is) y para fines de entretenimiento personal y demostrativo. Queda estrictamente prohibida la ingeniería inversa maliciosa, la manipulación de llamadas de red a la base de datos o el uso de exploits para perturbar el juego en línea.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  2. DECLARACIÓN DE DATOS Y PRIVACIDAD
                </h3>
                <p className="mb-2">
                  <strong>Datos Guardados:</strong> Para el funcionamiento de los marcadores, logros y estadísticas globales, el juego guarda únicamente tu alias (Nickname), volumen de oro virtual acumulado, logros obtenidos y número de victorias/derrotas. Estos datos son públicos y se almacenan de manera persistente en Firebase Firestore de forma asociada al Nickname elegido. No recopilamos nombres reales, correos electrónicos (salvo para inicio de sesión opcional con Google, en cuyo caso solo se asocia tu ID único de forma segura para conservar tu progreso) ni contraseñas.
                </p>
                <p>
                  <strong>Tecnología Peer-to-Peer (Conexión P2P):</strong> Las batallas multijugador utilizan el protocolo WebRTC mediante PeerJS. Al iniciar una partida en línea, se establece una conexión directa entre los navegadores de ambos oponentes. Para lograr esto, se intercambian las direcciones IP de manera estándar por el protocolo WebRTC. Al usar el modo multijugador, declaras conocer y aceptar esta transmisión técnica directa de datos.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  3. LIMITACIÓN DE RESPONSABILIDAD LEGAL
                </h3>
                <p>
                  Bajo ninguna circunstancia los desarrolladores del juego serán responsables de daños directos, indirectos, incidentales, especiales o consecuentes de cualquier tipo (incluyendo, pero no limitado a, fallas del navegador, latencia en partidas Peer-to-Peer, pérdida de datos de progreso almacenados localmente en localStorage, o interrupción del servicio de Firebase o PeerJS). El uso del juego se realiza bajo el propio riesgo y criterio del usuario.
                </p>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-3 md:p-4 rounded shadow-inner">
                <h3 className="text-amber-500 font-bold font-orbitron text-xs mb-1.5 uppercase tracking-wide">
                  4. ALMACENAMIENTO LOCAL (LocalStorage)
                </h3>
                <p>
                  El juego utiliza cookies técnicas y el almacenamiento interno (localStorage) de tu navegador para guardar exclusivamente configuraciones locales tales como el estado de volumen (SFX/BGM), tu alias local, tus preferencias de calidad gráfica y registros rápidos de partida. Al continuar navegando y jugando en este sitio web, aceptas el uso de estas configuraciones técnicas.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-[#1d1812] border border-[#8a6938] p-5 rounded shadow-md text-center max-w-md mx-auto">
                <h3 className="text-[#e5c9a4] font-bold font-orbitron text-base uppercase tracking-wide">
                  Irvin (SrIrvin)
                </h3>
                <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider mb-3">
                  Creador y Desarrollador de Software Principal
                </p>
                <p className="text-xs text-[#b8a68b] leading-relaxed">
                  Responsable de la concepción total del juego, la arquitectura del motor de cartas, el diseño de la interfaz de juego responsiva (UX/UI), la inteligencia artificial táctica y la infraestructura de red P2P.
                </p>
                <div className="mt-4 flex justify-center">
                  <a
                    href="https://linkedin.com/in/sr-irvin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D8C49A] hover:text-white border border-[#8a6938]/50 hover:border-amber-500 bg-[#120f0c] text-[10px] font-orbitron px-4 py-1.5 rounded transition-all flex items-center gap-1 shadow-sm hover:shadow-[0_0_10px_rgba(216,196,154,0.3)]"
                  >
                    linkedin.com/in/sr-irvin/
                  </a>
                </div>
              </div>
              <div className="bg-[#1d1812] border border-[#8a6938] p-5 rounded shadow-md text-center max-w-md mx-auto">
                <h3 className="text-[#e5c9a4] font-bold font-orbitron text-base uppercase tracking-wide">
                  Gustavo Adolfo Hernández (ShinigamiIOs)
                </h3>
                <p className="text-xs text-amber-500/70 font-semibold uppercase tracking-wider mb-3">
                  Co-diseñador, Ilustrador y Escritor de Lore
                </p>
                <p className="text-xs text-[#b8a68b] leading-relaxed">
                  Participó activamente en el co-diseño de las mecánicas del juego de cartas, diseñó el aspecto místico de las cartas y redactó la historia y diálogos de Shinigami.
                </p>
                <div className="mt-4 flex justify-center">
                  <a
                    href="https://www.linkedin.com/in/gustavo-adolfo-hernandez"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D8C49A] hover:text-white border border-[#8a6938]/50 hover:border-amber-500 bg-[#120f0c] text-[10px] font-orbitron px-4 py-1.5 rounded transition-all flex items-center gap-1 shadow-sm hover:shadow-[0_0_10px_rgba(216,196,154,0.3)]"
                  >
                    linkedin.com/in/gustavo-adolfo-hernandez
                  </a>
                </div>
              </div>

              <div className="bg-[#120f0c]/60 border border-[#3d3328] p-4 rounded shadow-inner text-center max-w-md mx-auto">
                <h4 className="text-amber-500 font-bold font-orbitron text-xs uppercase tracking-wider mb-2">
                  AGRADECIMIENTOS ESPECIALES
                </h4>
                <p className="text-xs text-[#9a8b72] leading-relaxed">
                  A todos los jugadores que acceden al Altar a desafiar sus mentes, y a los desarrolladores y mantenedores de las bibliotecas de código abierto que facilitan el desarrollo de juegos indie en la web.
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
