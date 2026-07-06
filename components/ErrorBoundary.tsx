import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../services/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error({ err: error, errorInfo }, 'Uncaught error in React component');
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="ancient-bg flex flex-col items-center justify-center min-h-screen text-white p-4 relative overflow-y-auto">
          <div className="archaeological-vignette" />
          <div className="rune-overlay" />
          
          <div className="relative z-20 flex flex-col items-center p-6 md:p-8 stone-modal max-w-lg w-full text-center my-4 border-2 border-red-950/80 shadow-[0_0_30px_rgba(130,68,58,0.3)]">
            {/* Runes & Desolation icon */}
            <div className="text-4xl sm:text-5xl text-red-600 mb-2 animate-pulse">
              𐎠 𐎫 𐎧
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-ancient-header tracking-wider text-[#D8C49A] mb-2 uppercase">
              Runas Desestabilizadas
            </h1>
            <div className="h-0.5 w-24 mx-auto my-2 bg-gradient-to-r from-transparent via-red-800 to-transparent" />
            
            <p className="text-xs sm:text-sm font-runic-text text-[#9A8B72] italic leading-relaxed my-4">
              "Un disturbio en el vacío ha desalineado el flujo de la sintonía mística. Las runas del templo de piedra han colapsado momentáneamente..."
            </p>
            
            <div className="w-full bg-[#120f0b]/85 border border-red-950 p-3.5 rounded-lg text-left font-mono text-[10px] text-red-400 max-h-32 overflow-y-auto mb-5 leading-normal shadow-inner">
              <span className="font-bold uppercase text-red-500 block mb-1">⚠️ Perturbación Detectada:</span>
              Algo salió mal durante el flujo místico del juego. Por favor, vuelve a sintonizar el portal.
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
              <button
                onClick={() => window.location.reload()}
                className="stone-button text-xs py-2 px-5 font-orbitron"
              >
                Re-sintonizar Runas
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = window.location.pathname;
                }}
                className="stone-button stone-button-red text-xs py-2 px-5 font-orbitron"
              >
                Limpiar Portal y Salir
              </button>
            </div>
          </div>
          
          <div className="absolute bottom-4 z-20 text-[10px] tracking-widest text-red-950 font-ancient-header opacity-40 select-none">
            𐎠 𐎢 𐎤 𐎧
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
