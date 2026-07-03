import React, { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import { GameCard } from '../GameCard';
import { useTranslation } from 'react-i18next';
import { Rank } from '../../types';

export const CardInfoModal: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const { t, i18n } = useTranslation();
    const card = state.cardInfoModal;
    
    if (!card) return null;

    const handleClose = () => {
        dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } });
    };

    // Helper to get card sub-category translated name
    const getCardCategory = (rank: Rank): string => {
        const isEs = i18n.language === 'es';
        if (rank === 'Joker') return isEs ? 'Asesino de las Sombras' : 'Shadow Assassin';
        if (rank === 'A') return isEs ? 'Misil Kamikaze' : 'Kamikaze Missile';
        if (rank === 'K') return isEs ? 'Dictador Loco' : 'Mad Dictator';
        if (rank === 'Q') return isEs ? 'Sanadora Mística' : 'Mystic Healer';
        if (rank === 'J') return isEs ? 'Turbo / Impulsor' : 'Turbo / Booster';
        
        const num = parseInt(rank);
        if (num >= 8) return isEs ? 'Unidad Pesada' : 'Heavy Unit';
        if (num >= 5) return isEs ? 'Unidad Mediana' : 'Medium Unit';
        return isEs ? 'Unidad Ligera' : 'Light Unit';
    };

    return (
        <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all duration-300 animate-fadeIn" 
            onClick={handleClose}
        >
            <div 
                className="bg-[#1c1a17] p-5 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.9)] border-double border-4 border-[#8A6938] max-w-xl w-full relative z-10 overflow-hidden transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
                style={{
                    borderRadius: '12px 8px 15px 9px / 9px 15px 8px 12px',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.9), 0 15px 35px rgba(0,0,0,0.8)'
                }}
            >
                {/* Ancient runic decorative background pattern */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#8A6938]/60 to-transparent" />
                
                {/* Grid layout for card and detailed description */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
                    
                    {/* Left Column: GameCard showcase */}
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center">
                        <div className="w-36 h-52 sm:w-44 sm:h-64 relative filter drop-shadow-[0_10px_15px_rgba(138,105,56,0.4)] hover:scale-105 transition-transform duration-300">
                            <GameCard card={card} isPreview={true} />
                        </div>
                        <span className="text-[10px] text-[#9A8B72]/60 mt-3 font-runic-text tracking-widest uppercase">
                            {card.suit === 'Joker' ? 'Runa de Sombras' : `Runa de ${card.suit}`}
                        </span>
                    </div>

                    {/* Right Column: Detailed specs & tips */}
                    <div className="col-span-1 md:col-span-3 flex flex-col justify-between h-full space-y-4">
                        <div>
                            {/* Card Tag */}
                            <span className="inline-block px-2.5 py-0.5 text-[9px] font-bold font-orbitron bg-[#8A6938]/30 border border-[#8A6938]/60 rounded text-[#D8C49A] tracking-wider uppercase mb-1.5">
                                {getCardCategory(card.rank)}
                            </span>
                            
                            {/* Card Name */}
                            <h3 className="text-2xl font-black font-orbitron text-[#D8C49A] leading-tight tracking-tight border-b border-[#574d3c]/30 pb-2">
                                {card.rank === 'Joker' ? 'JOKER' : `${card.rank} de ${card.suit}`}
                            </h3>
                        </div>

                        {/* Description Box */}
                        <div className="bg-[#2A2A2A]/50 border border-[#574d3c]/40 p-3 sm:p-4 rounded-lg relative shadow-inner">
                            <h4 className="text-xs font-bold text-[#9A8B72] uppercase tracking-wider mb-1 font-orbitron">
                                {i18n.language === 'es' ? 'Descripción de la Piedra' : 'Stone Description'}
                            </h4>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {t(`card_descriptions.${card.rank}`)}
                            </p>
                        </div>

                        {/* Tips Box */}
                        <div className="bg-[#8A6938]/15 border border-[#8A6938]/40 p-3 sm:p-4 rounded-lg relative shadow-inner">
                            <div className="flex items-center space-x-1.5 mb-1.5">
                                <span className="text-xs">💡</span>
                                <h4 className="text-xs font-extrabold text-[#D8C49A] uppercase tracking-wider font-orbitron">
                                    {i18n.language === 'es' ? 'Consejo del Sabio' : 'Sage\'s Advice'}
                                </h4>
                            </div>
                            <p className="text-sm text-[#D8C49A] italic leading-relaxed">
                                {t(`card_tips.${card.rank}`)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer and Close Button */}
                <div className="mt-6 pt-4 border-t border-[#574d3c]/30 flex justify-end">
                    <button 
                        onClick={handleClose} 
                        className="px-5 py-2 bg-gradient-to-r from-[#6e532a] to-[#8A6938] hover:from-[#8A6938] hover:to-[#a57f49] text-white font-bold font-orbitron text-xs tracking-wider rounded-lg border border-[#D8C49A]/30 shadow-md active:translate-y-0.5 transition-all duration-200"
                    >
                        {i18n.language === 'es' ? 'CERRAR TABLA' : 'CLOSE TABLET'}
                    </button>
                </div>
            </div>
        </div>
    );
};