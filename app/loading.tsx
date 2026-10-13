import { Bus } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      <main className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col p-4 space-y-4 shadow-xl border-x border-slate-200/60 animate-pulse">
        {/* HEADER SKELETON */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-300 flex items-center justify-center">
              <Bus className="w-5 h-5 text-amber-700 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <div className="w-32 h-4 bg-slate-200 rounded-md"></div>
              <div className="w-24 h-3 bg-slate-100 rounded-md"></div>
            </div>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-xl"></div>
        </div>

        {/* STATUS CARDS SKELETON */}
        <div className="grid grid-cols-3 gap-2">
          <div className="h-14 bg-white rounded-xl border border-slate-200"></div>
          <div className="h-14 bg-white rounded-xl border border-slate-200"></div>
          <div className="h-14 bg-white rounded-xl border border-slate-200"></div>
        </div>

        {/* MOBIL CARDS SKELETON */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                  <div className="space-y-1.5">
                    <div className="w-28 h-5 bg-slate-200 rounded-md"></div>
                    <div className="w-20 h-3 bg-slate-100 rounded-md"></div>
                  </div>
                </div>
                <div className="w-24 h-6 bg-slate-100 rounded-xl"></div>
              </div>
              <div className="w-full h-14 bg-slate-100 rounded-2xl"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
