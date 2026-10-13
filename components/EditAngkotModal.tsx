'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Check, Trash2, AlertCircle, Bus, User, Edit3 } from 'lucide-react'
import { updateOfflineAngkot, deleteOfflineAngkot } from '@/lib/offlineStorage'
import { playClickSound, playSuccessSound, triggerHaptic } from '@/lib/audio'

interface EditAngkotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  angkot: {
    id: string
    platNomor: string
    namaSopirTetap: string | null
  } | null
}

export function EditAngkotModal({ isOpen, onClose, onSuccess, angkot }: EditAngkotModalProps) {
  const [platNomor, setPlatNomor] = useState('')
  const [namaSopir, setNamaSopir] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirmHapus, setConfirmHapus] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (angkot) {
      setPlatNomor(angkot.platNomor || '')
      setNamaSopir(angkot.namaSopirTetap || '')
      setConfirmHapus(false)
      setErrorMessage(null)
    }
  }, [angkot, isOpen])

  if (!isOpen || !angkot) return null

  const handleSimpan = (e: React.FormEvent) => {
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
        updateOfflineAngkot(angkot.id, {
          platNomor: platNomor.trim(),
          namaSopirTetap: namaSopir.trim() || undefined,
        })
        playSuccessSound()
        triggerHaptic(60)
        onSuccess()
        onClose()
      } catch (err) {
        setErrorMessage('Gagal memperbarui data mobil')
      }
    })
  }

  const handleHapus = () => {
    playClickSound()
    triggerHaptic(60)

    startTransition(() => {
      try {
        deleteOfflineAngkot(angkot.id)
        playSuccessSound()
        triggerHaptic(80)
        onSuccess()
        onClose()
      } catch (err) {
        setErrorMessage('Gagal menghapus mobil')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-slate-900 p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-7 h-7 text-amber-600 stroke-[2.5]" />
            <h2 className="text-2xl font-black text-slate-900">UBAH MOBIL / SOPIR</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Edit */}
        <form onSubmit={handleSimpan} className="space-y-4">
          <div>
            <label className="block text-base font-black text-slate-800 mb-1">
              Plat Nomor Mobil:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Contoh: D 1234 AB"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                className="w-full h-16 px-4 text-2xl font-black text-slate-900 uppercase bg-slate-50 border-3 border-slate-800 rounded-2xl focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-black text-slate-800 mb-1">
              Nama Sopir:
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nama sopir (Contoh: Mang Asep)"
                value={namaSopir}
                onChange={(e) => setNamaSopir(e.target.value)}
                className="w-full h-16 px-4 text-xl font-bold text-slate-900 bg-slate-50 border-2 border-slate-800 rounded-2xl focus:bg-white focus:outline-none"
              />
            </div>
            <span className="text-xs text-slate-500 font-bold mt-1 block">
              Ganti nama ini jika sopir berganti orang.
            </span>
          </div>

          {errorMessage && (
            <div className="bg-red-100 border-2 border-red-700 text-red-900 font-bold p-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Tombol Simpan Perubahan */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full min-h-[64px] bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xl font-black rounded-2xl flex items-center justify-center gap-2 border-3 border-emerald-950 shadow-xl cursor-pointer mt-4"
          >
            {isPending ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
            ) : (
              <>
                <Check className="w-7 h-7 stroke-[3]" />
                SIMPAN PERUBAHAN
              </>
            )}
          </button>
        </form>

        {/* Garis Pemisah Hapus */}
        <div className="border-t-2 border-dashed border-slate-300 mt-6 pt-5">
          {!confirmHapus ? (
            <button
              type="button"
              onClick={() => {
                playClickSound()
                setConfirmHapus(true)
              }}
              className="w-full min-h-[52px] bg-red-50 hover:bg-red-100 text-red-700 text-base font-bold rounded-2xl border-2 border-red-300 flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="w-5 h-5 stroke-[2]" />
              Hapus Mobil Ini Dari Daftar
            </button>
          ) : (
            <div className="bg-red-50 border-2 border-red-600 rounded-2xl p-4 text-center space-y-3">
              <p className="text-base font-black text-red-900">
                Yakin ingin menghapus mobil {angkot.platNomor}?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmHapus(false)}
                  className="min-h-[48px] bg-white border-2 border-slate-400 font-black text-slate-800 rounded-xl"
                >
                  BATAL
                </button>
                <button
                  type="button"
                  onClick={handleHapus}
                  disabled={isPending}
                  className="min-h-[48px] bg-red-700 text-white font-black rounded-xl border-2 border-red-950"
                >
                  YA, HAPUS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
