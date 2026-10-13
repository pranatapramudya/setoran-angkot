'use client'

import { useState, useTransition, useEffect } from 'react'
import { X, Delete, Banknote, AlertCircle, RotateCcw, TrendingDown, Plus, Minus, Tag, Bus, User } from 'lucide-react'
import { addOfflineSetoran } from '@/lib/offlineStorage'
import { playClickSound, playSuccessSound, triggerHaptic } from '@/lib/audio'

export interface SelectedAngkotData {
  id: string
  platNomor: string
  namaSopirTetap: string | null
  setoranHariIni?: {
    id: string
    nominal: number
    pengeluaran?: number
    keteranganPengeluaran?: string | null
    status: string
    catatan: string | null
  } | null
}

interface NumpadModalProps {
  isOpen: boolean
  angkot: SelectedAngkotData | null
  onClose: () => void
  onSuccess: (result: {
    nominal: number
    pengeluaran?: number
    platNomor: string
    namaSopir: string
    status: string
  }) => void
}

const QUICK_EXPENSE_TAGS = [
  'Bensin Rp 20.000',
  'Bensin Rp 30.000',
  'Tambal Ban Rp 15.000',
  'Ganti Oli Rp 50.000',
  'Servis Ringan Rp 40.000',
  'Uang Makan Sopir Rp 20.000',
]

export function NumpadModal({
  isOpen,
  angkot,
  onClose,
  onSuccess,
}: NumpadModalProps) {
  const [activeInput, setActiveInput] = useState<'setoran' | 'pengeluaran'>('setoran')
  const [nominalStr, setNominalStr] = useState<string>('')
  const [pengeluaranStr, setPengeluaranStr] = useState<string>('')
  const [ketPengeluaran, setKetPengeluaran] = useState<string>('')
  const [catatan, setCatatan] = useState<string>('')
  const [showPengeluaran, setShowPengeluaran] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (angkot) {
      if (angkot.setoranHariIni) {
        setNominalStr(angkot.setoranHariIni.nominal.toString())
        if (angkot.setoranHariIni.pengeluaran && angkot.setoranHariIni.pengeluaran > 0) {
          setPengeluaranStr(angkot.setoranHariIni.pengeluaran.toString())
          setKetPengeluaran(angkot.setoranHariIni.keteranganPengeluaran || '')
          setShowPengeluaran(true)
        } else {
          setPengeluaranStr('')
          setKetPengeluaran('')
          setShowPengeluaran(false)
        }
        setCatatan(angkot.setoranHariIni.catatan || '')
      } else {
        setNominalStr('')
        setPengeluaranStr('')
        setKetPengeluaran('')
        setCatatan('')
        setShowPengeluaran(false)
      }
      setActiveInput('setoran')
      setErrorMessage(null)
    }
  }, [angkot, isOpen])

  if (!isOpen || !angkot) return null

  const nominalNumber = parseInt(nominalStr.replace(/\D/g, '') || '0', 10)
  const pengeluaranNumber = parseInt(pengeluaranStr.replace(/\D/g, '') || '0', 10)
  const setorBersih = Math.max(0, nominalNumber - pengeluaranNumber)

  const handleKeyClick = (val: string) => {
    playClickSound()
    triggerHaptic(40)
    setErrorMessage(null)

    const currentStr = activeInput === 'setoran' ? nominalStr : pengeluaranStr
    const setFunc = activeInput === 'setoran' ? setNominalStr : setPengeluaranStr

    if (val === 'RESET') {
      setFunc('')
      return
    }

    if (val === 'HAPUS') {
      setFunc((prev) => prev.slice(0, -1))
      return
    }

    if (val === '000') {
      if (!currentStr || currentStr === '0') return
      if (currentStr.length + 3 > 9) return
      setFunc((prev) => prev + '000')
      return
    }

    if (currentStr.length >= 9) return
    if (currentStr === '0') {
      setFunc(val)
    } else {
      setFunc((prev) => prev + val)
    }
  }

  const handleQuickAdd = (amount: number) => {
    playClickSound()
    triggerHaptic(30)
    setErrorMessage(null)
    if (activeInput === 'setoran') {
      const current = parseInt(nominalStr.replace(/\D/g, '') || '0', 10)
      setNominalStr((current + amount).toString())
    } else {
      const current = parseInt(pengeluaranStr.replace(/\D/g, '') || '0', 10)
      setPengeluaranStr((current + amount).toString())
    }
  }

  const handleQuickExpenseTag = (tag: string) => {
    playClickSound()
    triggerHaptic(30)
    setKetPengeluaran(tag)
    const match = tag.match(/\d+[\.\d+]*/g)
    if (match) {
      const num = match.join('').replace(/\./g, '')
      setPengeluaranStr(num)
    }
  }

  const handleQuickNote = (noteText: string) => {
    playClickSound()
    triggerHaptic(30)
    setCatatan(noteText)
  }

  const handleSubmit = () => {
    if (nominalNumber <= 0) {
      triggerHaptic(100)
      setErrorMessage('Nominal uang setoran kotor wajib dimasukkan!')
      return
    }

    if (pengeluaranNumber > nominalNumber) {
      triggerHaptic(100)
      setErrorMessage('Pengeluaran tidak boleh melebihi total uang setoran!')
      return
    }

    if (pengeluaranNumber > 0 && !ketPengeluaran.trim()) {
      triggerHaptic(100)
      setErrorMessage('Keterangan pengeluaran wajib diisi (misal: Bensin, Tambal Ban)!')
      return
    }

    playClickSound()
    triggerHaptic(50)

    startTransition(() => {
      try {
        addOfflineSetoran({
          angkotId: angkot.id,
          nominal: nominalNumber,
          pengeluaran: pengeluaranNumber,
          keteranganPengeluaran: ketPengeluaran.trim() || undefined,
          catatan,
        })
        playSuccessSound()
        triggerHaptic(70)
        onSuccess({
          nominal: nominalNumber,
          pengeluaran: pengeluaranNumber,
          platNomor: angkot.platNomor,
          namaSopir: angkot.namaSopirTetap || 'Sopir',
          status: 'TERCATAT',
        })
      } catch (err) {
        setErrorMessage('Gagal menyimpan setoran')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl flex flex-col max-h-[96vh] overflow-hidden text-slate-900">
        
        {/* HEADER MODAL - CLEAN LIGHT */}
        <div className="bg-white p-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Bus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-wider text-slate-900 font-mono">
                  {angkot.platNomor}
                </span>
                <span className="text-sm font-bold text-slate-600 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {angkot.namaSopirTetap || 'Sopir'}
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-400">
                Catat Setoran & Potongan Armada
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playClickSound()
              onClose()
            }}
            disabled={isPending}
            className="w-10 h-10 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* AREA DISPLAY & INPUT */}
        <div className="p-4 space-y-3 bg-slate-50 flex-1 overflow-y-auto">
          
          {/* TAB PILIHAN INPUT: SETORAN ATAU PENGELUARAN */}
          <div className="grid grid-cols-2 gap-2 bg-slate-200/80 p-1 rounded-2xl border border-slate-300">
            <button
              type="button"
              onClick={() => {
                playClickSound()
                setActiveInput('setoran')
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeInput === 'setoran'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
              }`}
            >
              <Banknote className="w-4 h-4 text-emerald-600" />
              1. Uang Setor (Rp)
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound()
                setShowPengeluaran(true)
                setActiveInput('pengeluaran')
              }}
              className={`py-2 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeInput === 'pengeluaran'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              2. Potong Biaya {pengeluaranNumber > 0 ? `(${pengeluaranNumber.toLocaleString('id-ID')})` : ''}
            </button>
          </div>

          {/* DISPLAY AKTIF */}
          {activeInput === 'setoran' ? (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 shadow-sm text-center">
              <div className="flex items-center justify-between mb-0.5 px-1">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  UANG SETORAN KOTOR (RP)
                </span>
                {nominalNumber > 0 && (
                  <button
                    type="button"
                    onClick={() => handleKeyClick('RESET')}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="text-4xl sm:text-5xl font-black text-slate-950 font-mono tracking-tight py-1">
                {nominalStr ? parseInt(nominalStr, 10).toLocaleString('id-ID') : '0'}
              </div>

              {/* Tampilkan sisa bersih jika ada potongan */}
              {pengeluaranNumber > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-red-600">
                    Potongan ({ketPengeluaran || 'Operasional'}): -Rp {pengeluaranNumber.toLocaleString('id-ID')}
                  </span>
                  <span className="text-emerald-700 font-black">
                    Setor Bersih: Rp {setorBersih.toLocaleString('id-ID')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-red-50/70 border-2 border-red-200 rounded-2xl p-3.5 shadow-sm text-center space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-red-700 uppercase tracking-widest">
                  POTONGAN BIAYA / PENGELUARAN (RP)
                </span>
                {pengeluaranNumber > 0 && (
                  <button
                    type="button"
                    onClick={() => handleKeyClick('RESET')}
                    className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
              <div className="text-3xl sm:text-4xl font-black text-red-600 font-mono tracking-tight">
                - Rp {pengeluaranStr ? parseInt(pengeluaranStr, 10).toLocaleString('id-ID') : '0'}
              </div>

              {/* Input Keterangan Pengeluaran */}
              <div>
                <input
                  type="text"
                  placeholder="Keterangan (misal: Bensin, Tambal Ban, dll.)"
                  value={ketPengeluaran}
                  onChange={(e) => setKetPengeluaran(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-red-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
                />
                {/* Quick Expense Tags */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {QUICK_EXPENSE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleQuickExpenseTag(tag)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer transition-colors ${
                        ketPengeluaran === tag
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PESAN ERROR VALIDASI */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-center gap-2 text-red-700 text-xs font-bold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TOMBOL CEPAT TAMBAH NOMINAL */}
          <div className="grid grid-cols-4 gap-1.5">
            {[10000, 20000, 50000, 100000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAdd(amt)}
                className="h-9 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 text-xs font-black rounded-xl border border-slate-200 shadow-sm cursor-pointer transition-all"
              >
                +{amt / 1000}rb
              </button>
            ))}
          </div>

          {/* INPUT CATATAN UMUM */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2.5">
            <input
              type="text"
              placeholder="Catatan tambahan (misal: Jalan setengah hari, macet)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 placeholder:text-slate-400 bg-transparent outline-none"
            />
          </div>
        </div>

        {/* KEYPAD NUMERIK RAKSASA (CLEAN LIGHT) */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'HAPUS'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(k)}
                disabled={isPending}
                className={`min-h-[56px] rounded-2xl font-black text-2xl flex items-center justify-center cursor-pointer active:scale-95 transition-all select-none ${
                  k === 'HAPUS'
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 shadow-sm'
                }`}
              >
                {k === 'HAPUS' ? <Delete className="w-6 h-6" /> : k}
              </button>
            ))}
          </div>

          {/* TOMBOL SIMPAN SETORAN */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full min-h-[58px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-lg font-black rounded-2xl flex items-center justify-center gap-2 border-2 border-emerald-700 shadow-lg cursor-pointer transition-transform"
            >
              <Banknote className="w-5 h-5 stroke-[2.5]" />
              <span>
                SIMPAN SETORAN (Rp {setorBersih.toLocaleString('id-ID')})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
