'use client'

import { Bus, BookOpen } from 'lucide-react'
import { playClickSound, triggerHaptic } from '@/lib/audio'

interface BottomNavProps {
  activeTab: 'setor' | 'buku-kas'
  onChangeTab: (tab: 'setor' | 'buku-kas') => void
  belumSetorCount: number
}

export function BottomNav({ activeTab, onChangeTab, belumSetorCount }: BottomNavProps) {
  const handleTabClick = (tab: 'setor' | 'buku-kas') => {
    playClickSound()
    triggerHaptic(40)
    onChangeTab(tab)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl"
      style={{ height: '76px' }}
      aria-label="Navigasi Menu Utama"
    >
      <div className="max-w-md mx-auto h-full grid grid-cols-2 p-2 gap-2.5">
        {/* TAB 1: SETOR MOBIL */}
        <button
          type="button"
          onClick={() => handleTabClick('setor')}
          className={`h-full rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-black text-base sm:text-lg transition-all relative ${
            activeTab === 'setor'
              ? 'bg-amber-400 text-slate-950 border-2 border-amber-500 shadow-md scale-[1.02]'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <Bus className="w-6 h-6 stroke-[2.5]" />
          <span>1. SETOR MOBIL</span>
          {belumSetorCount > 0 && (
            <span className="w-6 h-6 bg-red-600 text-white text-xs font-black rounded-full flex items-center justify-center absolute -top-1 -right-1 border-2 border-white shadow">
              {belumSetorCount}
            </span>
          )}
        </button>

        {/* TAB 2: BUKU KAS */}
        <button
          type="button"
          onClick={() => handleTabClick('buku-kas')}
          className={`h-full rounded-2xl flex items-center justify-center gap-2 cursor-pointer font-black text-base sm:text-lg transition-all ${
            activeTab === 'buku-kas'
              ? 'bg-blue-600 text-white border-2 border-blue-700 shadow-md scale-[1.02]'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <BookOpen className="w-6 h-6 stroke-[2.5]" />
          <span>2. BUKU KAS</span>
        </button>
      </div>
    </nav>
  )
}
