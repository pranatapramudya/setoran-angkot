'use client'

import { useState, useTransition } from 'react'
import { X, Settings, Check, AlertCircle, User, Phone, CheckCircle2 } from 'lucide-react'
import { saveOfflineJuragan } from '@/lib/offlineStorage'
import { playClickSound, playSuccessSound, triggerHaptic } from '@/lib/audio'

interface PengaturanModalProps {
  isOpen: boolean
  currentNamaJuragan: string
  currentNoHp?: string
  onClose: () => void
  onSuccess: (newNama: string) => void
}

export function PengaturanModal({
  isOpen,
  currentNamaJuragan,
  currentNoHp = '',
  onClose,
  onSuccess,
}: PengaturanModalProps) {
  const [namaJuragan, setNamaJuragan] = useState(currentNamaJuragan)
  const [noHp, setNoHp] = useState(currentNoHp)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaJuragan.trim()) {
      setErrorMessage('Nama Juragan / Nama Akun wajib diisi!')
      triggerHaptic(60)
      return
    }

    playClickSound()
    triggerHaptic(40)

    startTransition(() => {
      try {
        saveOfflineJuragan(namaJuragan, noHp)
        playSuccessSound()
        triggerHaptic(60)
        setIsSuccess(true)
        setTimeout(() => {
          setIsSuccess(false)
          onSuccess(namaJuragan)
          onClose()
        }, 600)
      } catch (err) {
        setErrorMessage('Gagal menyimpan pengaturan')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-3xl border-4 border-slate-900 p-6 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b-2 border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-7 h-7 text-amber-500 stroke-[2.5]" />
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                PENGATURAN
              </span>
              <h2 className="text-xl font-black text-slate-900">
                PROFIL & NAMA AKUN
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-800 cursor-pointer"
          >
            <X className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center space-y-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-slate-900">
              PENGATURAN TERSIMPAN!
            </h3>
            <p className="text-base font-bold text-slate-600">
              Nama sistem & juragan berhasil diperbarui.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-700" />
                Nama Juragan / Nama Usaha:
              </label>
              <input
                type="text"
                placeholder="Contoh: H. Ahmad Kosasih (Juragan 05)"
                value={namaJuragan}
                onChange={(e) => setNamaJuragan(e.target.value)}
                className="w-full h-16 px-4 text-xl font-black text-slate-900 bg-slate-50 border-3 border-slate-800 rounded-2xl focus:bg-white focus:outline-none"
                required
              />
              <span className="text-xs font-bold text-slate-500 mt-1 block">
                Nama ini akan muncul di bagian atas layar dan laporan WhatsApp.
              </span>
            </div>

            <div>
              <label className="block text-base font-black text-slate-900 mb-1.5 flex items-center gap-2">
                <Phone className="w-5 h-5 text-emerald-700" />
                Nomor HP / WhatsApp:
              </label>
              <input
                type="tel"
                placeholder="Contoh: 081234567890"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                className="w-full h-14 px-4 text-lg font-bold text-slate-900 bg-slate-50 border-2 border-slate-700 rounded-2xl focus:bg-white focus:outline-none"
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
              className="w-full min-h-[64px] bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xl font-black rounded-2xl flex items-center justify-center gap-3 border-3 border-black shadow-xl cursor-pointer mt-3"
            >
              {isPending ? (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent" />
              ) : (
                <>
                  <Check className="w-7 h-7 stroke-[3]" />
                  SIMPAN PENGATURAN
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
