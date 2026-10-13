'use client'

import { AlertTriangle, RotateCw } from 'lucide-react'
import { playClickSound, triggerHaptic } from '@/lib/audio'

interface ErrorFallbackProps {
  onRetry?: () => void
  pesan?: string
}

export function ErrorFallback({ onRetry, pesan }: ErrorFallbackProps) {
  const handleRetry = () => {
    playClickSound();
    triggerHaptic(50);
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-red-50 border-4 border-red-700 rounded-3xl p-6 text-center my-6 shadow-lg">
      <div className="flex justify-center mb-4">
        <div className="w-20 h-20 rounded-full bg-red-100 border-4 border-red-700 flex items-center justify-center text-red-700">
          <AlertTriangle className="w-12 h-12 stroke-[2.5]" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-red-950 mb-3 uppercase tracking-tight">
        KONEKSI TERPUTUS
      </h2>
      <p className="text-xl font-bold text-red-900 leading-relaxed mb-6">
        {pesan || 'JANGAN PANIK, DATA TIDAK HILANG. KLIK TOMBOL UNTUK COBA LAGI.'}
      </p>
      <button
        type="button"
        onClick={handleRetry}
        className="w-full min-h-[64px] bg-red-700 hover:bg-red-800 active:scale-95 text-white text-xl font-black rounded-2xl flex items-center justify-center gap-3 shadow-md border-2 border-red-900 cursor-pointer"
      >
        <RotateCw className="w-7 h-7 stroke-[3]" />
        COBA HUBUNGKAN LAGI
      </button>
    </div>
  );
}
