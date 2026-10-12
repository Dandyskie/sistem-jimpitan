import React from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '../../utils/fullscreen';

interface FullscreenButtonProps {
  className?: string;
  showText?: boolean;
}

/**
 * Tombol Toggle Layar Penuh (Fullscreen Enter / Exit) khusus tampilan mobile.
 */
export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  className = '',
  showText = false,
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      title={isFullscreen ? 'Keluar Layar Penuh' : 'Masuk Layar Penuh (Fullscreen)'}
      aria-label={isFullscreen ? 'Keluar Layar Penuh' : 'Masuk Layar Penuh'}
      className={`md:hidden inline-flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-2xs ${className}`}
    >
      {isFullscreen ? (
        <Minimize2 className="w-4 h-4 text-emerald-700 shrink-0" />
      ) : (
        <Maximize2 className="w-4 h-4 text-slate-600 shrink-0" />
      )}

      {showText && (
        <span className="text-xs font-semibold">
          {isFullscreen ? 'Keluar Penuh' : 'Layar Penuh'}
        </span>
      )}
    </button>
  );
};

export default FullscreenButton;
