'use client'

import { Bus, Check, ArrowRight, RotateCw, FileText, TrendingDown } from 'lucide-react'
import { playClickSound, triggerHaptic } from '@/lib/audio'
import { SelectedAngkotData } from './NumpadModal'

interface MobilCardProps {
  angkot: SelectedAngkotData
  onSelectSetor: (angkot: SelectedAngkotData) => void
  onEditAngkot?: (angkot: SelectedAngkotData) => void
}

export function MobilCard({ angkot, onSelectSetor, onEditAngkot }: MobilCardProps) {
  const setoran = angkot.setoranHariIni
  const isSetor = !!setoran
  const pengeluaran = setoran?.pengeluaran || 0
  const setorBersih = setoran ? Math.max(0, setoran.nominal - pengeluaran) : 0

  const handleClickSetor = () => {
    playClickSound()
    triggerHaptic(40)
    onSelectSetor(angkot)
  }

  const handleClickEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    playClickSound()
    triggerHaptic(40)
    if (onEditAngkot) {
      onEditAngkot(angkot)
    }
  }

  return (
    <div
      className={`border-2 rounded-3xl p-5 shadow-sm transition-all ${
        isSetor
          ? 'bg-emerald-50/40 border-emerald-300'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Baris Atas: Plat Nomor, Sopir & Tombol Ubah Sopir */}
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-start gap-2.5">
          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Bus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-slate-950 font-mono">
                {angkot.platNomor}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-bold text-slate-600">
                Sopir: <strong className="text-slate-900">{angkot.namaSopirTetap || 'Belum Diisi'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Status di kanan atas kartu */}
        <div className="flex flex-col items-end gap-1.5">
          {isSetor ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs shadow-sm">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              SUDAH SETOR
            </span>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-xl bg-red-50 border border-red-300 text-red-700 font-black text-xs">
              BELUM SETOR
            </span>
          )}

          {/* Tombol Ubah Sopir / Mobil */}
          <button
            type="button"
            onClick={handleClickEdit}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-2.5 py-1 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
            title="Ubah data mobil atau ganti nama sopir"
          >
            <span>Ubah Sopir/Mobil</span>
          </button>
        </div>
      </div>

      {/* Bagian Nominal & Interaksi */}
      <div className="mt-4">
        {isSetor ? (
          <div className="space-y-3">
            {pengeluaran > 0 ? (
              <div className="space-y-2 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>Setoran Kotor:</span>
                  <span className="text-slate-900 font-black">Rp {setoran.nominal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-red-600">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    Potong Biaya ({setoran.keteranganPengeluaran || 'Operasional'}):
                  </span>
                  <span className="font-black">- Rp {pengeluaran.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    SETORAN BERSIH:
                  </span>
                  <span className="text-2xl font-black text-emerald-700">
                    Rp {setorBersih.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase block">
                  UANG DISETOR HARI INI
                </span>
                <span className="text-3xl font-black text-slate-950">
                  Rp {setoran.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            )}

            {/* KETERANGAN JELAS */}
            {setoran.catatan ? (
              <div className="text-xs font-bold text-slate-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-start gap-2">
                <FileText className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-amber-800 font-black block uppercase">
                    Catatan:
                  </span>
                  <span>{setoran.catatan}</span>
                </div>
              </div>
            ) : null}

            {/* Tombol Ubah / Catat Ulang */}
            <button
              type="button"
              onClick={handleClickSetor}
              className="w-full min-h-[50px] bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 text-sm font-black rounded-2xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-transform"
            >
              <RotateCw className="w-4 h-4 stroke-[2.5]" />
              UBAH / CATAT SETORAN ULANG
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* TOMBOL RAKSASA CATAT SETORAN */}
            <button
              type="button"
              onClick={handleClickSetor}
              className="w-full min-h-[64px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-lg font-black rounded-2xl flex items-center justify-center gap-2.5 border-2 border-emerald-700 shadow-md cursor-pointer transition-transform"
            >
              <span>MASUKKAN SETORAN</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
