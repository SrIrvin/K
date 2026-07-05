import { Card, Unit, Suit, Rank } from '../types';

export const unitToCard = (unit: Unit): Card => {
    const { 
        baseDamage, currentDamage, speed, position, 
        hasMoved, boosterCard, boosterCards, stackedAttackers, ...card 
    } = unit;
    return card;
};

export const getCardImagePath = (card: Card): string => {
  const suitMap: { [key in Suit]: string } = {
    [Suit.Clubs]: '1',
    [Suit.Diamonds]: '2',
    [Suit.Hearts]: '3',
    [Suit.Spades]: '4',
    [Suit.Joker]: '1', // Joker only has one image
  };

  const suitNumber = suitMap[card.suit];
  let folder = '';
  let fileName = '';

  if (['2', '3', '4'].includes(card.rank)) {
    folder = '2 3 4';
    fileName = `${card.rank}.webp`;
  } else if (['5', '6', '7'].includes(card.rank)) {
    folder = '5 6 7';
    fileName = `${card.rank}.webp`;
  } else if (['8', '9', '10'].includes(card.rank)) {
    folder = '8 9 10';
    fileName = `${card.rank}.webp`;
  } else if (card.rank === 'Joker') {
    folder = 'Joker';
    fileName = `Joker ${suitNumber}.webp`;
  } else { // J, Q, K, A
    const isAce = card.rank === 'A';
    folder = isAce ? 'As' : card.rank;
    fileName = isAce ? `As ${suitNumber}.webp` : `${card.rank} ${suitNumber}.webp`;
  }

  return `/images/${folder}/${fileName}`;
};
