'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error untuk kebutuhan debugging lokal
    console.error('Crash terdeteksi oleh Error Boundary SOP:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-amber-400 selection:text-slate-950">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-red-200 p-6 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-black text-red-600 uppercase tracking-widest block mb-1">
            TERJADI KENDALA SISTEM
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Aplikasi Mengalami Masalah
          </h1>
          <p className="text-sm font-semibold text-slate-600 mt-2">
            Data setoran Anda di memori HP tetap aman. Silakan muat ulang halaman untuk melanjutkan pencatatan.
          </p>
        </div>

        {error?.message && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Pesan Error:</span>
            <span className="text-xs font-mono font-bold text-slate-700 break-words">
              {error.message}
            </span>
          </div>
        )}

        <div className="space-y-2 pt-2">
          {/* TOMBOL PENYELAMAT SESUAI MODUL 5 SOP */}
          <button
            type="button"
            onClick={() => reset()}
            className="w-full min-h-[58px] bg-red-600 hover:bg-red-700 active:scale-95 text-white text-base font-black rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            COBA MUAT ULANG SISTEM
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full min-h-[50px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-sm font-bold rounded-2xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4" />
            Muat Ulang Halaman Utama
          </button>
        </div>
      </div>
    </div>
  )
}
