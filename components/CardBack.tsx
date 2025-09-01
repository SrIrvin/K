import React from 'react';

export const CardBack: React.FC<{ count: number; type?: 'deck' | 'discard' | 'scored' }> = ({ count, type = 'deck' }) => {
  const gradient = {
    deck: 'from-blue-700 to-purple-800',
    discard: 'from-gray-600 to-gray-800',
    scored: 'from-yellow-600 to-yellow-800'
  }[type];

  const border = {
    deck: 'border-blue-400',
    discard: 'border-gray-500',
    scored: 'border-yellow-400'
  }[type];

  return (
    <div className="relative w-14 h-20 sm:w-16 sm:h-24 md:w-20 md:h-28 flex-shrink-0">
      {count > 0 && Array.from({ length: Math.min(count, 5) }).map((_, i) => (
         <div key={i} className={`absolute w-full h-full rounded-lg bg-gradient-to-br ${gradient} shadow-lg border ${border} flex items-center justify-center`} style={{ top: `${i * 2}px`, left: `${i * 2}px` }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-black/30 flex items-center justify-center font-orbitron text-blue-300 text-base sm:text-lg">克</div>
         </div>
      ))}
      {count > 0 && <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black rounded-full w-5 h-5 flex items-center justify-center font-bold font-orbitron text-xs z-10">{count}</div>}
    </div>
  );
}