'use client'

import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { playClickSound, triggerHaptic } from '@/lib/audio'

interface SuccessModalProps {
  isOpen: boolean
  message?: string
  nominal: number
  platNomor: string
  namaSopir: string
  status: string
  onClose: () => void
}

export function SuccessModal({
  isOpen,
  nominal,
  platNomor,
  namaSopir,
  status,
  onClose,
}: SuccessModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    playClickSound();
    triggerHaptic(40);
    onClose();
  };

  const statusBg =
    status === 'LUNAS'
      ? 'bg-emerald-700 text-white'
      : status === 'KURANG'
      ? 'bg-red-700 text-white'
      : 'bg-blue-700 text-white';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-emerald-700 p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Ikon Sukses Jumbo */}
        <div className="w-24 h-24 rounded-full bg-emerald-100 border-4 border-emerald-600 flex items-center justify-center text-emerald-700 mb-4 animate-bounce">
          <CheckCircle2 className="w-16 h-16 stroke-[2.5]" />
        </div>

        <span className="text-emerald-800 text-lg font-black tracking-widest uppercase mb-1">
          ✓ BERHASIL DICATAT
        </span>

        {/* Nominal Raksasa */}
        <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight my-2">
          Rp {nominal.toLocaleString('id-ID')}
        </div>

        {/* Info Mobil & Status */}
        <div className="w-full bg-slate-100 border-2 border-slate-300 rounded-2xl p-4 my-4 space-y-2 text-left">
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-base font-bold text-slate-600">Mobil:</span>
            <span className="text-xl font-black text-slate-900 bg-slate-900 text-white px-3 py-1 rounded-lg">
              {platNomor}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-slate-200 pb-2">
            <span className="text-base font-bold text-slate-600">Sopir:</span>
            <span className="text-lg font-bold text-slate-900">{namaSopir}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-base font-bold text-slate-600">Status Setoran:</span>
            <span className={`text-base font-black px-3 py-1 rounded-lg ${statusBg}`}>
              {status}
            </span>
          </div>
        </div>

        {/* Tombol Kembali Raksasa */}
        <button
          type="button"
          onClick={handleClose}
          className="w-full min-h-[68px] bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xl sm:text-2xl font-black rounded-2xl flex items-center justify-center gap-3 border-3 border-emerald-950 shadow-xl cursor-pointer mt-2"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
          KEMBALI KE DAFTAR MOBIL
        </button>
      </div>
    </div>
  );
}
