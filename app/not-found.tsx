import Link from 'next/link'
import { Bus, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
          <Bus className="w-8 h-8 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-4xl font-black text-slate-900 font-mono block">404</span>
          <h2 className="text-xl font-black text-slate-900 mt-1">Halaman Tidak Ditemukan</h2>
          <p className="text-xs font-semibold text-slate-500 mt-2">
            Rute yang Anda tuju tidak tersedia di sistem operasional angkot.
          </p>
        </div>

        <Link
          href="/"
          className="w-full min-h-[54px] bg-slate-900 hover:bg-slate-800 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4 stroke-[3]" />
          KEMBALI KE BERANDA UTAMA
        </Link>
      </div>
    </div>
  )
}
