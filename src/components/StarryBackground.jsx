import React, { useMemo } from 'react';

export default function StarryBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 50 }, () => ({
      size: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.2,
      duration: Math.random() * 3 + 2,
    }));
  }, []);
  
  return (
    <>
      <div className="absolute top-12 right-12 w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-amber-300 opacity-20 blur-2xl pointer-events-none"></div>
      <div className="absolute top-16 right-16 w-24 h-24 rounded-full bg-amber-100/40 shadow-[0_0_60px_30px_rgba(252,211,77,0.15)] pointer-events-none"></div>
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
