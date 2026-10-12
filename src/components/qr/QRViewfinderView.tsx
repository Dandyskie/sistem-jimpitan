import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Search, QrCode, AlertCircle, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';
import jsQR from 'jsqr';
import { Resident } from '../../types';
import { playScannerBeep, matchResidentFromQr } from '../../utils/scannerUtils';

interface QRViewfinderViewProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filteredResidents: Resident[];
  residents: Resident[];
  autoRecord: boolean;
  onToggleAutoRecord: (val: boolean) => void;
  scanToast: { nama: string; rumah: string; nominal: number } | null;
  onClearScanToast: () => void;
  onResidentDetected: (resident: Resident) => void;
  onSelectResident: (res: Resident) => void;
}

/**
 * Tampilan Bidik Kamera Asli (Live Camera Video Stream) dengan pendeteksian otomatis via jsQR.
 * Mendukung rekam otomatis tanpa modal mengganggu dan notifikasi toast auto-fade 1.8s.
 */
export const QRViewfinderView: React.FC<QRViewfinderViewProps> = ({
  searchQuery,
  onSearchChange,
  filteredResidents,
  residents,
  autoRecord,
  onToggleAutoRecord,
  scanToast,
  onClearScanToast,
  onResidentDetected,
  onSelectResident,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastScannedTimeRef = useRef<number>(0);

  // Auto-dismiss scan toast setelah 1.8 detik
  useEffect(() => {
    if (!scanToast) return;
    const timer = setTimeout(() => {
      onClearScanToast();
    }, 700);
    return () => clearTimeout(timer);
  }, [scanToast, onClearScanToast]);

  // Mulai streaming kamera ponsel/laptop
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Browser ini tidak mendukung akses kamera langsung.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch {
      setCameraError('Izin kamera ditolak atau perangkat kamera tidak tersedia.');
      setIsCameraActive(false);
    }
  }, []);

  // Hentikan kamera dan loop pemindaian
  const stopCamera = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (!isCameraActive) return;

    let isScanningFrame = false;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      const canScan = video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && !isScanningFrame;
      if (canScan) {
        isScanningFrame = true;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          const now = Date.now();
          const cooldownPassed = now - lastScannedTimeRef.current > 1500;

          if (code && code.data && cooldownPassed) {
            const matched = matchResidentFromQr(code.data, residents);
            if (matched) {
              lastScannedTimeRef.current = now;
              playScannerBeep();
              if (navigator.vibrate) navigator.vibrate(80);
              onResidentDetected(matched);
            }
          }
        }
        isScanningFrame = false;
      }

      animationFrameId.current = requestAnimationFrame(scanFrame);
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isCameraActive, residents, onResidentDetected]);

  return (
    <div className="space-y-3.5">
      {/* Sakelar Mode Otomatis Ronda Cepat */}
      <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-emerald-700 shrink-0" />
          <div>
            <span className="text-xs font-bold text-emerald-950 block leading-tight">
              Otomatis Catat Rp 2.000
            </span>
            <span className="text-[10px] text-emerald-800">
              Langsung rekam begitu kamera mengenali kaleng jimpitan
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleAutoRecord(!autoRecord)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            autoRecord ? 'bg-emerald-600' : 'bg-slate-300'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform shadow-xs ${
              autoRecord ? 'right-0.5' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {/* Frame Kamera Asli HTML5 */}
      <div className="relative aspect-4/3 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover ${cameraError ? 'hidden' : 'block'}`}
        />

        <canvas ref={canvasRef} className="hidden" />

        {/* Notifikasi Ringan Melayang Otomatis Hilang (Non-intrusif) */}
        {scanToast && (
          <div className="absolute top-3 inset-x-3 z-30 p-2.5 bg-emerald-900/95 backdrop-blur-md text-white rounded-xl shadow-lg border border-emerald-400/50 flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-black truncate">{scanToast.rumah} • {scanToast.nama}</p>
                <p className="text-[10px] text-emerald-200 font-medium">Rp {scanToast.nominal.toLocaleString('id-ID')} tercatat</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-100 shrink-0">
              Siap Scan Berikutnya
            </span>
          </div>
        )}

        {/* Overlay Kotak Bidik Target Barcode */}
        {!cameraError && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 border-2 border-emerald-400/80 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-lg" />
              <div className="absolute inset-x-2 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
            </div>

            <p className="mt-3 text-[11px] font-semibold text-white/90 bg-black/50 px-3 py-1 rounded-full backdrop-blur-xs">
              Arahkan kamera ke stiker QR kaleng
            </p>
          </div>
        )}

        {/* Pesan Kesalahan Izin Kamera */}
        {cameraError && (
          <div className="p-4 text-center space-y-2 text-white">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-200">{cameraError}</p>
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi Izin Kamera</span>
            </button>
          </div>
        )}
      </div>

      {/* Simulator / Pilihan Alternatif Cepat Manual */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] block">
          Pilihan Manual (Jika Hujan / Kondisi Gelap)
        </span>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama warga atau nomor rumah..."
            className="w-full h-8.5 pl-8 pr-3 text-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
          {filteredResidents.slice(0, 8).map((res) => (
            <button
              key={res.id}
              type="button"
              onClick={() => onSelectResident(res)}
              className="w-full p-2 rounded-lg border border-[var(--color-border)] hover:border-emerald-300 hover:bg-emerald-50 text-left flex items-center justify-between text-xs transition-colors cursor-pointer group"
            >
              <div>
                <span className="font-bold text-[var(--color-text-primary)] group-hover:text-emerald-700">
                  {res.blok ? res.blok.replace('Blok ', '') : ''} No. {res.noRumah}
                </span>
                <span className="text-[var(--color-text-secondary)] ml-2">{res.nama}</span>
              </div>
              <QrCode className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
