export function SkeletonList() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="Memuat data mobil...">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-slate-200 border-2 border-slate-300 rounded-2xl p-5 min-h-[120px] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="h-9 w-40 bg-slate-300 rounded-lg" />
            <div className="h-8 w-24 bg-slate-300 rounded-full" />
          </div>
          <div className="h-6 w-52 bg-slate-300 rounded mt-3" />
          <div className="h-14 w-full bg-slate-300 rounded-xl mt-4" />
        </div>
      ))}
    </div>
  );
}
