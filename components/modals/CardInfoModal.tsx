import React, { useContext } from 'react';
import { GameContext } from '../../context/GameContext';
import { GameCard } from '../GameCard';
import { useTranslation } from 'react-i18next';

export const CardInfoModal: React.FC = () => {
    const { state, dispatch } = useContext(GameContext);
    const { t } = useTranslation();
    const card = state.cardInfoModal;
    if (!card) return null;

    return (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })}>
            <div className="bg-gray-800 p-6 rounded-lg text-center shadow-2xl border border-yellow-500 max-w-md w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-center mb-4 h-48">
                    <GameCard card={card} />
                </div>
                <h3 className="text-2xl font-orbitron text-yellow-400 mb-2">{card.rank} of {card.suit}</h3>
                <p className="text-base text-gray-300">{t(`card_descriptions.${card.rank}`)}</p>
                <button onClick={() => dispatch({ type: 'SET_CARD_INFO_MODAL', payload: { card: null } })} className="mt-6 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">Close</button>
            </div>
        </div>
    );
};