'use client'

import { useState } from 'react'
import { Plus, Bus, RefreshCw, Settings, TrendingDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { MobilCard } from './MobilCard'
import { NumpadModal, SelectedAngkotData } from './NumpadModal'
import { SuccessModal } from './SuccessModal'
import { TambahAngkotModal } from './TambahAngkotModal'
import { EditAngkotModal } from './EditAngkotModal'
import { PengaturanModal } from './PengaturanModal'
import { BukuKasView, SetoranRecord } from './BukuKasView'
import { CatatPengeluaranModal } from './CatatPengeluaranModal'
import { BottomNav } from './BottomNav'
import { OfflinePengeluaran, OfflineAngkot } from '@/lib/offlineStorage'
import { playClickSound, triggerHaptic } from '@/lib/audio'

interface DashboardClientProps {
  onDataChange?: () => void
  tenantNama: string
  tenantNoHp?: string
  angkotList: SelectedAngkotData[]
  rawAngkotList: OfflineAngkot[]
  setoranHariIni: SetoranRecord[]
  setoranBulanIni: SetoranRecord[]
  pengeluaranHariIni: OfflinePengeluaran[]
  pengeluaranBulanIni: OfflinePengeluaran[]
  selectedDateStr: string
  onSelectDate: (dateStr: string) => void
}

export function DashboardClient({
  onDataChange,
  tenantNama: initialTenantNama,
  tenantNoHp = '',
  angkotList,
  rawAngkotList,
  setoranHariIni,
  setoranBulanIni,
  pengeluaranHariIni,
  pengeluaranBulanIni,
  selectedDateStr,
  onSelectDate,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'setor' | 'buku-kas'>('setor')
  const [tenantNama, setTenantNama] = useState(initialTenantNama)
  const [selectedAngkot, setSelectedAngkot] = useState<SelectedAngkotData | null>(null)
  const [editingAngkot, setEditingAngkot] = useState<SelectedAngkotData | null>(null)
  const [isNumpadOpen, setIsNumpadOpen] = useState(false)
  const [isTambahOpen, setIsTambahOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPengaturanOpen, setIsPengaturanOpen] = useState(false)
  const [isCatatPengeluaranOpen, setIsCatatPengeluaranOpen] = useState(false)

  // Success modal state
  const [successData, setSuccessData] = useState<{
    isOpen: boolean
    nominal: number
    platNomor: string
    namaSopir: string
    status: string
  }>({
    isOpen: false,
    nominal: 0,
    platNomor: '',
    namaSopir: '',
    status: '',
  })

  const belumSetorCount = angkotList.filter((a) => !a.setoranHariIni).length

  // Date formatting helpers
  const refDate = new Date(selectedDateStr + 'T12:00:00')
  const isToday = () => {
    const today = new Date()
    return (
      refDate.getDate() === today.getDate() &&
      refDate.getMonth() === today.getMonth() &&
      refDate.getFullYear() === today.getFullYear()
    )
  }

  const handlePrevDay = () => {
    playClickSound()
    triggerHaptic(30)
    const d = new Date(selectedDateStr + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    const yStr = d.getFullYear()
    const mStr = String(d.getMonth() + 1).padStart(2, '0')
    const dStr = String(d.getDate()).padStart(2, '0')
    onSelectDate(`${yStr}-${mStr}-${dStr}`)
  }

  const handleNextDay = () => {
    playClickSound()
    triggerHaptic(30)
    const d = new Date(selectedDateStr + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    const yStr = d.getFullYear()
    const mStr = String(d.getMonth() + 1).padStart(2, '0')
    const dStr = String(d.getDate()).padStart(2, '0')
    onSelectDate(`${yStr}-${mStr}-${dStr}`)
  }

  const handleOpenSetor = (angkot: SelectedAngkotData) => {
    setSelectedAngkot(angkot)
    setIsNumpadOpen(true)
  }

  const handleOpenEdit = (angkot: SelectedAngkotData) => {
    setEditingAngkot(angkot)
    setIsEditOpen(true)
  }

  const handleSetoranSuccess = (res: {
    nominal: number
    platNomor: string
    namaSopir: string
    status: string
  }) => {
    setSuccessData({
      isOpen: true,
      nominal: res.nominal,
      platNomor: res.platNomor,
      namaSopir: res.namaSopir,
      status: res.status,
    })
    if (onDataChange) onDataChange()
  }

  const handleArmadaChange = () => {
    if (onDataChange) {
      onDataChange()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-amber-400 selection:text-slate-950">
      <main className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col pb-36 shadow-xl relative border-x border-slate-200/60">
        {/* HEADER APLIKASI CLEAN LIGHT */}
        <header className="bg-white text-slate-900 px-5 pt-5 pb-4 sticky top-0 z-20 shadow-sm border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
                <Bus className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-tight uppercase text-slate-950">
                  {tenantNama}
                </h1>
                <p className="text-[11px] text-amber-700 font-bold uppercase tracking-wider">
                  SISTEM SETORAN OFFLINE
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playClickSound()
                  triggerHaptic(40)
                  setIsPengaturanOpen(true)
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
                title="Pengaturan Akun"
              >
                <Settings className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound()
                  triggerHaptic(40)
                  if (onDataChange) onDataChange()
                  else window.location.reload()
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
                title="Perbarui Data"
              >
                <RefreshCw className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* DATE PICKER & NAVIGASI TANGGAL */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevDay}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex-1 flex items-center justify-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 relative cursor-pointer">
              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
              <input
                type="date"
                value={selectedDateStr}
                onChange={(e) => {
                  if (e.target.value) {
                    playClickSound()
                    onSelectDate(e.target.value)
                  }
                }}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="text-center">
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  {refDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {isToday() && (
                  <span className="text-[10px] font-black text-emerald-600 block leading-none">
                    (Hari Ini)
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNextDay}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center cursor-pointer border border-slate-200 transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* BADGE STATUS OPERASIONAL HARI INI */}
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-50 rounded-xl py-2 px-2 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">TOTAL MOBIL</span>
              <span className="text-base font-black text-slate-900">{angkotList.length} Unit</span>
            </div>
            <div className="bg-amber-50 rounded-xl py-2 px-2 border border-amber-200">
              <span className="text-[10px] text-amber-800 font-bold block uppercase">BELUM SETOR</span>
              <span className="text-base font-black text-amber-900">{belumSetorCount} Unit</span>
            </div>
            {/* SHORTCUT CEPAT CATAT PENGELUARAN */}
            <button
              type="button"
              onClick={() => {
                playClickSound()
                triggerHaptic(45)
                setIsCatatPengeluaranOpen(true)
              }}
              className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl py-2 px-2 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-all"
            >
              <span className="text-[10px] text-red-700 font-black block uppercase tracking-wide">
                - BIAYA
              </span>
              <span className="text-xs font-black text-red-800 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-red-600" />
                Catat
              </span>
            </button>
          </div>
        </header>

        {/* KONTEN UTAMA */}
        <div className="flex-1 p-4 space-y-4">
          {activeTab === 'setor' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    DAFTAR MOBIL {isToday() ? 'HARI INI' : ''}
                  </h2>
                  <p className="text-xs text-slate-500 font-bold">
                    Pilih mobil di bawah untuk masukkan uang setoran
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound()
                    triggerHaptic(50)
                    setIsTambahOpen(true)
                  }}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Tambah Mobil
                </button>
              </div>

              {angkotList.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center mt-6 shadow-sm">
                  <Bus className="w-16 h-16 text-slate-400 mx-auto mb-3 stroke-[1.5]" />
                  <p className="text-base font-black text-slate-900 mb-1">
                    BELUM ADA MOBIL ANGKOT
                  </p>
                  <p className="text-xs font-bold text-slate-500 mb-6">
                    Tambahkan mobil angkot dan nama sopir pertama Anda.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsTambahOpen(true)}
                    className="w-full min-h-[56px] bg-blue-600 hover:bg-blue-700 text-white text-base font-black rounded-2xl flex items-center justify-center gap-2 shadow-md cursor-pointer transition-colors"
                  >
                    <Plus className="w-5 h-5 stroke-[3]" />
                    TAMBAH MOBIL PERTAMA
                  </button>
                </div>
              ) : (
                angkotList.map((item) => (
                  <MobilCard
                    key={item.id}
                    angkot={item}
                    onSelectSetor={handleOpenSetor}
                    onEditAngkot={handleOpenEdit}
                  />
                ))
              )}
            </div>
          ) : (
            <BukuKasView
              setoranHariIni={setoranHariIni}
              setoranBulanIni={setoranBulanIni}
              pengeluaranHariIni={pengeluaranHariIni}
              pengeluaranBulanIni={pengeluaranBulanIni}
              rawAngkotList={rawAngkotList}
              totalMobil={angkotList.length}
              namaJuragan={tenantNama}
              currentSelectedDate={selectedDateStr}
              onTambahMobilClick={() => setIsTambahOpen(true)}
              onCatatPengeluaranClick={() => setIsCatatPengeluaranOpen(true)}
              onDataChange={onDataChange}
            />
          )}
        </div>

        {/* MODAL FULLSCREEN NUMPAD SETORAN */}
        <NumpadModal
          isOpen={isNumpadOpen}
          angkot={selectedAngkot}
          currentSelectedDate={selectedDateStr}
          onClose={() => setIsNumpadOpen(false)}
          onSuccess={handleSetoranSuccess}
        />

        {/* MODAL CATAT PENGELUARAN */}
        <CatatPengeluaranModal
          isOpen={isCatatPengeluaranOpen}
          onClose={() => setIsCatatPengeluaranOpen(false)}
          onSuccess={() => {
            if (onDataChange) onDataChange()
          }}
          angkotList={rawAngkotList}
        />

        {/* MODAL SUKSES LAYAR PENUH */}
        <SuccessModal
          isOpen={successData.isOpen}
          nominal={successData.nominal}
          platNomor={successData.platNomor}
          namaSopir={successData.namaSopir}
          status={successData.status}
          onClose={() => setSuccessData((prev) => ({ ...prev, isOpen: false }))}
        />

        {/* MODAL TAMBAH MOBIL */}
        <TambahAngkotModal
          isOpen={isTambahOpen}
          onClose={() => {
            setIsTambahOpen(false)
            handleArmadaChange()
          }}
        />

        {/* MODAL EDIT MOBIL & SOPIR */}
        <EditAngkotModal
          isOpen={isEditOpen}
          angkot={editingAngkot}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleArmadaChange}
        />

        {/* MODAL PENGATURAN AKUN */}
        <PengaturanModal
          isOpen={isPengaturanOpen}
          currentNamaJuragan={tenantNama}
          currentNoHp={tenantNoHp}
          onClose={() => setIsPengaturanOpen(false)}
          onSuccess={(newNama) => setTenantNama(newNama)}
        />

        {/* BOTTOM NAVIGATION DUA MENU UTAMA */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab: 'setor' | 'buku-kas') => {
            playClickSound()
            triggerHaptic(40)
            setActiveTab(tab)
          }}
          belumSetorCount={belumSetorCount}
        />
      </main>
    </div>
  )
}
