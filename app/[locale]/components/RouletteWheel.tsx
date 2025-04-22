import { useRef, useEffect } from 'react';
import { useRoulette } from '../context/RouletteContext';

export default function RouletteWheel() {
  const { people, rotationAngle, wheelRef } = useRoulette();
  const localWheelRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (localWheelRef.current && wheelRef) {
      wheelRef.current = localWheelRef.current;
    }
  }, [wheelRef]);

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80">
      {/* Wheel */}
      <div
        ref={localWheelRef}
        className="absolute w-full h-full rounded-full border-8 border-purple-600 overflow-hidden"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
          transformOrigin: 'center center'
        }}
      >
        {people.map((person, index) => {
          const degree = 360 / people.length;
          const rotate = index * degree;
          const skew = 90 - degree;
          
          return (
            <div
              key={index}
              className="absolute w-1/2 h-1/2 origin-bottom-right"
              style={{
                transform: `rotate(${rotate}deg) skew(${skew}deg)`,
              }}
            >
              <div 
                className="w-full h-full flex items-center justify-center origin-bottom-right pl-10 -rotate-45 text-center overflow-hidden"
                style={{
                  backgroundColor: `hsl(${(index * 137) % 360}, 70%, ${60 + (index % 3) * 10}%)`,
                }}
              >
                <span className="text-white text-xs font-bold truncate transform -rotate-90 whitespace-nowrap max-w-20">{person}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-b-[30px] border-b-red-500 z-10"></div>
    </div>
  );
}
