'use client'

import { useState, useTransition } from 'react'
import { X, Plus, AlertCircle, Bus } from 'lucide-react'
import { addOfflineAngkot } from '@/lib/offlineStorage'
import { playClickSound, playSuccessSound, triggerHaptic } from '@/lib/audio'

interface TambahAngkotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TambahAngkotModal({ isOpen, onClose }: TambahAngkotModalProps) {
  const [platNomor, setPlatNomor] = useState('')
  const [namaSopir, setNamaSopir] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!platNomor.trim()) {
      setErrorMessage('Plat nomor mobil wajib diisi!')
      triggerHaptic(80)
      return
    }

    playClickSound()
    triggerHaptic(50)

    startTransition(() => {
      try {
        addOfflineAngkot(platNomor, namaSopir)
        playSuccessSound()
        triggerHaptic(60)
        onClose()
        setPlatNomor('')
        setNamaSopir('')
        window.location.reload()
      } catch (err) {
        setErrorMessage('Gagal menambah armada')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-slate-900 p-6 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bus className="w-7 h-7 text-blue-700 stroke-[2.5]" />
            <h2 className="text-2xl font-black text-slate-900">TAMBAH MOBIL BARU</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-black text-slate-800 mb-1">
              Plat Nomor Mobil:
            </label>
            <input
              type="text"
              placeholder="Contoh: D 1234 AB"
              value={platNomor}
              onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
              className="w-full h-16 px-4 text-2xl font-black text-slate-900 uppercase bg-slate-50 border-3 border-slate-800 rounded-2xl focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-base font-black text-slate-800 mb-1">
              Nama Sopir (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Mang Ujang"
              value={namaSopir}
              onChange={(e) => setNamaSopir(e.target.value)}
              className="w-full h-14 px-4 text-xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-800 rounded-2xl focus:bg-white focus:outline-none"
            />
          </div>

          {errorMessage && (
            <div className="bg-red-100 border-2 border-red-700 text-red-900 font-bold p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[64px] bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xl font-black rounded-2xl flex items-center justify-center gap-2 border-3 border-blue-950 shadow-xl cursor-pointer mt-4"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
            ) : (
              <>
                <Plus className="w-7 h-7 stroke-[3]" />
                SIMPAN MOBIL KE SISTEM
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
