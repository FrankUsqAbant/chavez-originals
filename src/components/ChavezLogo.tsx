import React from 'react';

interface ChavezLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  useImageFallback?: boolean;
}

export const ChavezLogo: React.FC<ChavezLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  useImageFallback = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 text-lg',
    md: 'h-10 text-xl',
    lg: 'h-14 text-2xl',
    xl: 'h-20 text-4xl',
  };

  if (useImageFallback) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/assets/aistudio/Logo_9636b3b5.webp"
          alt="Chavez Originals Logo"
          className={`${size === 'sm' ? 'h-8' : size === 'lg' ? 'h-14' : size === 'xl' ? 'h-20' : 'h-10'} w-auto object-contain rounded-md bg-black/40 p-1 border border-emerald-500/20`}
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Runner Graphic in Neon Green */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 100"
          className={`${size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : size === 'xl' ? 'w-16 h-16' : 'w-10 h-10'}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Head */}
          <circle cx="58" cy="22" r="10" fill="#00ff66" />
          {/* Torso & Leg 1 forming 'C' */}
          <path
            d="M 52 35 C 35 38, 22 52, 24 72 C 26 88, 42 95, 60 90 C 70 87, 78 78, 80 66 L 68 64 C 66 72, 60 78, 52 80 C 40 82, 34 74, 34 62 C 34 48, 44 42, 54 42 Z"
            fill="#00ff66"
          />
          {/* Kicking Leg forward */}
          <path
            d="M 55 45 L 82 45 L 75 56 L 50 56 Z"
            fill="#00ff66"
          />
          {/* Dynamic athletic sweep */}
          <path
            d="M 20 62 L 10 70 L 15 54 Z"
            fill="#00ff66"
            opacity="0.8"
          />
        </svg>
      </div>

      {/* Typography: CHAVEZ ORIGINALS */}
      <div className="flex flex-col">
        <div className="flex items-baseline font-black italic tracking-tighter leading-none">
          <span className="text-[#00ff66] text-2xl md:text-3xl font-extrabold pr-0.5">
            C
          </span>
          <span className="text-white text-2xl md:text-3xl font-black tracking-tight uppercase">
            HAVEZ
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] md:text-[11px] font-bold tracking-[0.35em] text-[#00ff66] uppercase mt-0.5">
            ORIGINALS
          </span>
        )}
      </div>
    </div>
  );
};
