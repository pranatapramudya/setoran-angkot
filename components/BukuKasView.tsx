'use client'

import { useState, useTransition } from 'react'
import {
  Banknote,
  BookOpen,
  Calendar,
  Share2,
  Trash2,
  Check,
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Car,
  User,
  Building2,
  DollarSign
} from 'lucide-react'
import { deleteOfflineSetoran, deleteOfflinePengeluaran, OfflinePengeluaran, OfflineAngkot } from '@/lib/offlineStorage'
import { playClickSound, triggerHaptic } from '@/lib/audio'

export interface SetoranRecord {
  id: string
  angkotId: string
  nominal: number
  pengeluaran?: number
  keteranganPengeluaran?: string | null
  status: string
  catatan: string | null
  createdAt: string | Date
  tanggal: string | Date
  angkot: {
    platNomor: string
    namaSopirTetap: string | null
  }
}

interface BukuKasViewProps {
  setoranHariIni: SetoranRecord[]
  setoranBulanIni: SetoranRecord[]
  pengeluaranHariIni: OfflinePengeluaran[]
  pengeluaranBulanIni: OfflinePengeluaran[]
  rawAngkotList: OfflineAngkot[]
  totalMobil: number
  namaJuragan: string
  onTambahMobilClick: () => void
  onCatatPengeluaranClick: () => void
  onDataChange?: () => void
}

export function BukuKasView({
  setoranHariIni,
  setoranBulanIni,
  pengeluaranHariIni,
  pengeluaranBulanIni,
  rawAngkotList,
  totalMobil,
  namaJuragan,
  onTambahMobilClick,
  onCatatPengeluaranClick,
  onDataChange,
}: BukuKasViewProps) {
  const [periodeMode, setPeriodeMode] = useState<'harian' | 'bulanan'>('harian')
  const [filterMode, setFilterMode] = useState<'semua' | 'setoran' | 'pengeluaran'>('semua')
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  const now = new Date()
  const namaBulanTahun = now.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  const currentPengeluaran = periodeMode === 'harian' ? pengeluaranHariIni : pengeluaranBulanIni
  const currentSetoran = periodeMode === 'harian' ? setoranHariIni : setoranBulanIni

  // TOTAL PENDAPATAN KOTOR
  const totalPendapatan = currentSetoran.reduce((acc, curr) => acc + curr.nominal, 0)

  // BREAKDOWN PENGELUARAN: PER ARMADA vs UMUM
  const pengeluaranArmadaList = currentPengeluaran.filter((p) => !!p.angkotId)
  const pengeluaranUmumList = currentPengeluaran.filter((p) => !p.angkotId)

  const totalPengeluaranArmada = pengeluaranArmadaList.reduce((acc, curr) => acc + curr.nominal, 0)
  const totalPengeluaranUmum = pengeluaranUmumList.reduce((acc, curr) => acc + curr.nominal, 0)
  const totalPengeluaranKeseluruhan = totalPengeluaranArmada + totalPengeluaranUmum

  // PENDAPATAN BERSIH / SISA KAS JURAGAN
  const pendapatanBersih = totalPendapatan - totalPengeluaranKeseluruhan

  // STATUS MOBIL HARIAN
  const mobilSudahSetorIds = new Set(setoranHariIni.map((s) => s.angkotId))
  const jumlahSudahSetorHarian = mobilSudahSetorIds.size
  const jumlahBelumSetorHarian = Math.max(0, totalMobil - jumlahSudahSetorHarian)

  // Map Armada dari data ketersediaan armada
  const angkotMap = new Map<string, OfflineAngkot>(rawAngkotList.map((a) => [a.id, a]))

  // PERFORMA / KEUANGAN TIAP MOBIL (Armada Financial Breakdown)
  const armadaBreakdown = rawAngkotList.map((arm) => {
    // Setoran mobil ini di periode aktif
    const setoranMobil = currentSetoran.filter((s) => s.angkotId === arm.id)
    const totalSetorMobil = setoranMobil.reduce((acc, curr) => acc + curr.nominal, 0)

    // Pengeluaran mobil ini di periode aktif
    const pengeluaranMobil = currentPengeluaran.filter((p) => p.angkotId === arm.id)
    const totalPengeluaranMobil = pengeluaranMobil.reduce((acc, curr) => acc + curr.nominal, 0)

    // Sisa Bersih Mobil
    const sisaBersihMobil = totalSetorMobil - totalPengeluaranMobil

    return {
      armada: arm,
      totalSetor: totalSetorMobil,
      totalPengeluaran: totalPengeluaranMobil,
      sisaBersih: sisaBersihMobil,
      frekuensiSetor: setoranMobil.length,
      rincianPengeluaran: pengeluaranMobil,
    }
  }).sort((a, b) => b.sisaBersih - a.sisaBersih)

  const handleShareWA = () => {
    playClickSound()
    triggerHaptic(40)

    let text = ''
    const periodeLabel =
      periodeMode === 'harian'
        ? now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : `Bulan ${namaBulanTahun}`

    text += `*LAPORAN BUKU KAS SETORAN ANGKOT*\n`
    text += `Juragan: ${namaJuragan}\n`
    text += `Periode: ${periodeLabel}\n\n`
    text += `🟢 *TOTAL PENDAPATAN (SETORAN): Rp ${totalPendapatan.toLocaleString('id-ID')}*\n`
    text += `🔴 *TOTAL PENGELUARAN KESELURUHAN: Rp ${totalPengeluaranKeseluruhan.toLocaleString('id-ID')}*\n`
    text += `   - Pengeluaran Armada: Rp ${totalPengeluaranArmada.toLocaleString('id-ID')}\n`
    text += `   - Pengeluaran Umum/Kantor: Rp ${totalPengeluaranUmum.toLocaleString('id-ID')}\n`
    text += `💰 *PENDAPATAN BERSIH / SISA KAS: Rp ${pendapatanBersih.toLocaleString('id-ID')}*\n\n`

    text += `*RINCIAN KEUANGAN PER MOBIL:*\n`
    armadaBreakdown.forEach((item, idx) => {
      text += `${idx + 1}. ${item.armada.platNomor} (${item.armada.namaSopirTetap || 'Sopir'})\n`
      text += `   • Setor: Rp ${item.totalSetor.toLocaleString('id-ID')} (${item.frekuensiSetor}x)\n`
      text += `   • Biaya: -Rp ${item.totalPengeluaran.toLocaleString('id-ID')}\n`
      text += `   • Bersih: Rp ${item.sisaBersih.toLocaleString('id-ID')}\n`
    })

    if (pengeluaranUmumList.length > 0) {
      text += `\n*PENGELUARAN OPERASIONAL UMUM:*\n`
      pengeluaranUmumList.forEach((p, idx) => {
        text += `${idx + 1}. ${p.keterangan}: -Rp ${p.nominal.toLocaleString('id-ID')}\n`
      })
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }

    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  const handleHapusSetoran = (id: string, plat: string, nominal: number) => {
    const confirm = window.confirm(
      `Yakin ingin menghapus catatan setoran Rp ${nominal.toLocaleString('id-ID')} untuk ${plat}?`
    )
    if (!confirm) return

    playClickSound()
    triggerHaptic(60)

    startTransition(() => {
      deleteOfflineSetoran(id)
      if (onDataChange) onDataChange()
      else window.location.reload()
    })
  }

  const handleHapusPengeluaran = (id: string, keterangan: string, nominal: number) => {
    const confirm = window.confirm(
      `Yakin ingin menghapus pengeluaran "${keterangan}" sebesar Rp ${nominal.toLocaleString('id-ID')}?`
    )
    if (!confirm) return

    playClickSound()
    triggerHaptic(60)

    startTransition(() => {
      deleteOfflinePengeluaran(id)
      if (onDataChange) onDataChange()
      else window.location.reload()
    })
  }

  return (
    <div className="space-y-4">
      {/* PILIHAN PERIODE: HARIAN / BULANAN (CLEAN LIGHT) */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl grid grid-cols-2 gap-2 border border-slate-300">
        <button
          type="button"
          onClick={() => {
            playClickSound()
            triggerHaptic(30)
            setPeriodeMode('harian')
          }}
          className={`min-h-[50px] rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
            periodeMode === 'harian'
              ? 'bg-white text-slate-900 shadow-md border border-slate-200'
              : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-blue-600" />
          1. REKAP HARIAN
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound()
            triggerHaptic(30)
            setPeriodeMode('bulanan')
          }}
          className={`min-h-[50px] rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer transition-all ${
            periodeMode === 'bulanan'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-transparent text-slate-600 hover:bg-slate-300/50'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          2. LAPORAN BULANAN
        </button>
      </div>

      {/* KARTU RINGKASAN BUKU KAS (CLEAN LIGHT - TANPA DARK MODE) */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">
                {periodeMode === 'harian' ? 'BUKU KAS HARI INI' : `BUKU KAS ${namaBulanTahun.toUpperCase()}`}
              </h2>
              <span className="text-xs font-bold text-slate-500">
                Laporan Pendapatan Bersih & Pengeluaran Armada
              </span>
            </div>
          </div>
          <span className="text-xs font-black bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            {periodeMode === 'harian' ? 'HARI INI' : 'BULAN INI'}
          </span>
        </div>

        {/* UTAMA: PENDAPATAN BERSIH / SISA KAS JURAGAN */}
        <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-4 text-center">
          <span className="text-xs font-black text-emerald-900 uppercase tracking-widest block">
            💰 PENDAPATAN BERSIH (SISA UANG KAS)
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight mt-1">
            Rp {pendapatanBersih.toLocaleString('id-ID')}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 block mt-1">
            Total Setoran Kotor dikurangi Total Pengeluaran Keseluruhan
          </span>
        </div>

        {/* GRID DUA KOLOM: PENDAPATAN vs TOTAL PENGELUARAN */}
        <div className="grid grid-cols-2 gap-3 text-center">
          {/* KOLOM PENDAPATAN */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center justify-center gap-1 text-emerald-700 text-xs font-black uppercase mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Pendapatan</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-slate-900 block">
              Rp {totalPendapatan.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">
              {currentSetoran.length} Setoran Masuk
            </span>
          </div>

          {/* KOLOM TOTAL PENGELUARAN */}
          <div className="bg-red-50/60 rounded-2xl p-3 border border-red-200">
            <div className="flex items-center justify-center gap-1 text-red-600 text-xs font-black uppercase mb-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Pengeluaran</span>
            </div>
            <span className="text-lg sm:text-xl font-black text-red-600 block">
              - Rp {totalPengeluaranKeseluruhan.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-slate-500 font-bold">
              {currentPengeluaran.length} Catatan Biaya
            </span>
          </div>
        </div>

        {/* RINCIAN PENGELUARAN GABUNGAN: ARMADA vs UMUM */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-slate-500" />
              Biaya Tiap Armada ({pengeluaranArmadaList.length} biaya):
            </span>
            <span className="font-black text-slate-900">
              Rp {totalPengeluaranArmada.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="flex items-center justify-between font-bold text-slate-600">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              Biaya Operasional Umum ({pengeluaranUmumList.length} biaya):
            </span>
            <span className="font-black text-slate-900">
              Rp {totalPengeluaranUmum.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* STATUS ARMADA (KHUSUS HARIAN) */}
        {periodeMode === 'harian' && (
          <div className="grid grid-cols-2 gap-2.5 text-center pt-1">
            <div className="bg-emerald-50/60 rounded-xl p-2 border border-emerald-200">
              <span className="text-[10px] font-black text-emerald-800 uppercase block">SUDAH SETOR</span>
              <span className="text-base font-black text-emerald-700">
                {jumlahSudahSetorHarian} <span className="text-xs font-bold text-slate-500">/ {totalMobil} Mobil</span>
              </span>
            </div>
            <div className="bg-red-50/60 rounded-xl p-2 border border-red-200">
              <span className="text-[10px] font-black text-red-800 uppercase block">BELUM SETOR</span>
              <span className="text-base font-black text-red-700">
                {jumlahBelumSetorHarian} <span className="text-xs font-bold text-slate-500">Mobil</span>
              </span>
            </div>
          </div>
        )}

        {/* TOMBOL AKSI CEPAT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playClickSound()
              onCatatPengeluaranClick()
            }}
            className="min-h-[52px] bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 border border-red-700 shadow-sm cursor-pointer transition-all"
          >
            <TrendingDown className="w-4 h-4 stroke-[2.5]" />
            - CATAT PENGELUARAN
          </button>

          <button
            type="button"
            onClick={handleShareWA}
            className="min-h-[52px] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-black rounded-2xl flex items-center justify-center gap-2 border border-emerald-700 shadow-sm cursor-pointer transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                TERSALIN KE WA!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 stroke-[2.5]" />
                KIRIM REKAP KE WA
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION KHUSUS: REKAP KEUANGAN & PENGELUARAN TIAP ARMADA */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-700 stroke-[2.5]" />
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                REKAP KEUANGAN TIAP MOBIL
              </h3>
              <p className="text-xs font-bold text-slate-500">
                Ketahui setoran masuk, biaya pengeluaran & sisa bersih tiap armada
              </p>
            </div>
          </div>
        </div>

        {armadaBreakdown.length === 0 ? (
          <div className="p-4 text-center text-xs font-bold text-slate-500">
            Belum ada armada yang terdaftar.
          </div>
        ) : (
          <div className="space-y-2.5">
            {armadaBreakdown.map((item) => (
              <div
                key={item.armada.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-base text-slate-950">
                      {item.armada.platNomor}
                    </span>
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {item.armada.namaSopirTetap || 'Tanpa Sopir'}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {item.frekuensiSetor}x setor
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-200">
                  <div className="bg-white rounded-xl p-2 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">SETOR</span>
                    <span className="text-xs font-black text-emerald-700">
                      Rp {item.totalSetor.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-white rounded-xl p-2 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block">BIAYA MOBIL</span>
                    <span className="text-xs font-black text-red-600">
                      -Rp {item.totalPengeluaran.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 block">BERSIH</span>
                    <span className="text-xs font-black text-emerald-900">
                      Rp {item.sisaBersih.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Rincian item biaya mobil ini jika ada */}
                {item.rincianPengeluaran.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1">
                    {item.rincianPengeluaran.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-lg text-[10px] font-bold"
                      >
                        {p.keterangan}: -Rp {p.nominal.toLocaleString('id-ID')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FILTER TAMPILAN RIWAYAT */}
      <div className="flex items-center justify-between gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-300 text-xs font-black">
        <button
          type="button"
          onClick={() => {
            playClickSound()
            setFilterMode('semua')
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            filterMode === 'semua'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-300/50'
          }`}
        >
          Semua ({currentSetoran.length + currentPengeluaran.length})
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound()
            setFilterMode('setoran')
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            filterMode === 'setoran'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-300/50'
          }`}
        >
          🟢 Setoran ({currentSetoran.length})
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound()
            setFilterMode('pengeluaran')
          }}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            filterMode === 'pengeluaran'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-300/50'
          }`}
        >
          🔴 Pengeluaran ({currentPengeluaran.length})
        </button>
      </div>

      {/* BAGIAN 1: RINCIAN PENGELUARAN */}
      {(filterMode === 'semua' || filterMode === 'pengeluaran') && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Catatan Pengeluaran ({currentPengeluaran.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                playClickSound()
                onCatatPengeluaranClick()
              }}
              className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Tambah Biaya
            </button>
          </div>

          {currentPengeluaran.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center text-slate-500 font-bold text-xs">
              Belum ada catatan pengeluaran di periode ini.
            </div>
          ) : (
            <div className="space-y-2">
              {currentPengeluaran.map((p) => {
                const dateObj = new Date(p.tanggal)
                const jam = dateObj.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const tgl = dateObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })

                // Tarik data armada dari ID
                const targetArm = p.angkotId ? angkotMap.get(p.angkotId) : null

                return (
                  <div
                    key={p.id}
                    className="bg-white border border-red-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 hover:border-red-400 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 mt-0.5">
                        <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-950 text-sm">
                            {p.keterangan}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5">
                          {targetArm ? (
                            <span className="text-red-700 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                              🚐 {targetArm.platNomor} ({targetArm.namaSopirTetap || 'Sopir'})
                            </span>
                          ) : (
                            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              🏢 Umum / Kantor
                            </span>
                          )}
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {periodeMode === 'bulanan' ? `${tgl}, ${jam}` : jam}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-base font-black text-red-600">
                        - Rp {p.nominal.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleHapusPengeluaran(p.id, p.keterangan, p.nominal)}
                        disabled={isPending}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-700 flex items-center justify-center cursor-pointer transition-colors"
                        title="Hapus Pengeluaran Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* BAGIAN 2: RINCIAN SETORAN MASUK */}
      {(filterMode === 'semua' || filterMode === 'setoran') && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Setoran Masuk ({currentSetoran.length})
              </h3>
            </div>
          </div>

          {currentSetoran.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center text-slate-500 font-bold text-xs">
              Belum ada setoran tercatat di periode ini.
            </div>
          ) : (
            <div className="space-y-2">
              {currentSetoran.map((s) => {
                const dateObj = new Date(s.createdAt)
                const jam = dateObj.toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                const tgl = dateObj.toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })

                return (
                  <div
                    key={s.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3 hover:border-slate-400 transition-colors"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Car className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-950 text-sm">
                            {s.angkot.platNomor}
                          </span>
                          <span className="text-xs font-bold text-slate-600">
                            ({s.angkot.namaSopirTetap || 'Sopir'})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {periodeMode === 'bulanan' ? `${tgl}, ${jam}` : jam}
                          </span>
                          {s.catatan && (
                            <>
                              <span>•</span>
                              <span className="text-amber-800">{s.catatan}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-base font-black text-emerald-700 block">
                          Rp {s.nominal.toLocaleString('id-ID')}
                        </span>
                        {s.pengeluaran && s.pengeluaran > 0 ? (
                          <span className="text-[10px] font-bold text-red-600 block">
                            Potong: -Rp {s.pengeluaran.toLocaleString('id-ID')}
                          </span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleHapusSetoran(s.id, s.angkot.platNomor, s.nominal)}
                        disabled={isPending}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-700 flex items-center justify-center cursor-pointer transition-colors"
                        title="Hapus Catatan Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
