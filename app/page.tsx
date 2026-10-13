'use client'

import { useState, useEffect } from 'react'
import {
  getOfflineJuragan,
  getOfflineAngkotList,
  getOfflineSetoranList,
  getOfflinePengeluaranList,
  OfflineAngkot,
  OfflineSetoran,
  OfflinePengeluaran,
} from '@/lib/offlineStorage'
import { DashboardClient } from '@/components/DashboardClient'
import { SkeletonList } from '@/components/SkeletonList'

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [juragan, setJuragan] = useState({ namaJuragan: 'Sistem Setoran Angkot', noHp: '' })
  const [angkotList, setAngkotList] = useState<OfflineAngkot[]>([])
  const [setoranList, setSetoranList] = useState<OfflineSetoran[]>([])
  const [pengeluaranList, setPengeluaranList] = useState<OfflinePengeluaran[]>([])

  // State tanggal terpilih (Default: Hari Ini YYYY-MM-DD lokal)
  const getTodayStr = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [selectedDateStr, setSelectedDateStr] = useState<string>(getTodayStr())

  const loadData = () => {
    const j = getOfflineJuragan()
    const a = getOfflineAngkotList()
    const s = getOfflineSetoranList()
    const p = getOfflinePengeluaranList()
    setJuragan(j)
    setAngkotList(a)
    setSetoranList(s)
    setPengeluaranList(p)
  }

  useEffect(() => {
    loadData()
    setMounted(true)

    const handleStorageChange = () => loadData()
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-100 flex justify-center">
        <main className="w-full max-w-md bg-white min-h-screen flex flex-col p-4">
          <SkeletonList />
        </main>
      </div>
    )
  }

  // Parse tanggal terpilih (start & end of selected day)
  const [y, m, d] = selectedDateStr.split('-').map(Number)
  const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0).getTime()
  const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999).getTime()

  // Filter transaksi bulan dari tanggal terpilih
  const startOfMonth = new Date(y, m - 1, 1, 0, 0, 0, 0).getTime()
  const endOfMonth = new Date(y, m, 0, 23, 59, 59, 999).getTime()

  const setoranHariIni = setoranList.filter((item) => {
    const t = new Date(item.tanggal).getTime()
    return t >= startOfDay && t <= endOfDay
  })

  const setoranBulanIni = setoranList.filter((item) => {
    const t = new Date(item.tanggal).getTime()
    return t >= startOfMonth && t <= endOfMonth
  })

  const pengeluaranHariIni = pengeluaranList.filter((item) => {
    const t = new Date(item.tanggal).getTime()
    return t >= startOfDay && t <= endOfDay
  })

  const pengeluaranBulanIni = pengeluaranList.filter((item) => {
    const t = new Date(item.tanggal).getTime()
    return t >= startOfMonth && t <= endOfMonth
  })

  // Map ke tampilan kartu mobil (status setor pada tanggal terpilih)
  const angkotFormatted = angkotList.map((a) => {
    const sHariIni = setoranHariIni.find((s) => s.angkotId === a.id)
    return {
      id: a.id,
      platNomor: a.platNomor,
      namaSopirTetap: a.namaSopirTetap,
      setoranHariIni: sHariIni
        ? {
            id: sHariIni.id,
            nominal: sHariIni.nominal,
            pengeluaran: sHariIni.pengeluaran || 0,
            keteranganPengeluaran: sHariIni.keteranganPengeluaran || null,
            status: sHariIni.status,
            catatan: sHariIni.catatan,
          }
        : null,
    }
  })

  // Map angkot detail ke setoran records
  const angkotMap = new Map(angkotList.map((a) => [a.id, a]))

  const formatRecords = (list: OfflineSetoran[]) =>
    list.map((s) => {
      const a = angkotMap.get(s.angkotId)
      return {
        id: s.id,
        angkotId: s.angkotId,
        nominal: s.nominal,
        pengeluaran: s.pengeluaran || 0,
        keteranganPengeluaran: s.keteranganPengeluaran || null,
        status: s.status,
        catatan: s.catatan,
        createdAt: s.createdAt,
        tanggal: s.tanggal,
        angkot: {
          platNomor: a?.platNomor || 'D XXXX XX',
          namaSopirTetap: a?.namaSopirTetap || 'Sopir',
        },
      }
    })

  return (
    <DashboardClient
      tenantNama={juragan.namaJuragan}
      tenantNoHp={juragan.noHp}
      angkotList={angkotFormatted}
      rawAngkotList={angkotList}
      setoranHariIni={formatRecords(setoranHariIni)}
      setoranBulanIni={formatRecords(setoranBulanIni)}
      pengeluaranHariIni={pengeluaranHariIni}
      pengeluaranBulanIni={pengeluaranBulanIni}
      selectedDateStr={selectedDateStr}
      onSelectDate={(newDate) => setSelectedDateStr(newDate)}
      onDataChange={loadData}
    />
  )
}
