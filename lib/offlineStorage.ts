export interface OfflineAngkot {
  id: string;
  platNomor: string;
  namaSopirTetap: string | null;
  isActive: boolean;
}

export interface OfflineSetoran {
  id: string;
  angkotId: string;
  nominal: number; // Pendapatan kotor / setoran
  pengeluaran?: number; // Potongan pengeluaran armada (Rp)
  keteranganPengeluaran?: string | null; // Keterangan pengeluaran (Bensin, Ban, dll.)
  status: string;
  catatan: string | null;
  tanggal: string; // ISO String (waktu transaksi)
  createdAt: string;
}

export interface OfflinePengeluaran {
  id: string;
  angkotId?: string | null; // ID / Plat armada jika terkait mobil, atau null jika pengeluaran umum
  nominal: number; // Nominal biaya / pengeluaran (Rp)
  keterangan: string; // Keterangan (misal: "Bensin", "Ganti Oli", "Tambal Ban", "Servis")
  kategori?: string; // "BBM", "Bengkel", "Sparepart", "Operasional", "Lainnya"
  tanggal: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  JURAGAN: 'setoran_angkot_juragan',
  NO_HP: 'setoran_angkot_nohp',
  ANGKOT_LIST: 'setoran_angkot_armada',
  SETORAN_LIST: 'setoran_angkot_transaksi',
  PENGELUARAN_LIST: 'setoran_angkot_pengeluaran',
};

export function getOfflineJuragan(): { namaJuragan: string; noHp: string } {
  if (typeof window === 'undefined') {
    return { namaJuragan: 'Sistem Setoran Angkot', noHp: '' };
  }
  const nama = localStorage.getItem(STORAGE_KEYS.JURAGAN) || 'Sistem Setoran Angkot';
  const noHp = localStorage.getItem(STORAGE_KEYS.NO_HP) || '';
  return { namaJuragan: nama, noHp };
}

export function saveOfflineJuragan(namaJuragan: string, noHp: string = '') {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.JURAGAN, namaJuragan.trim());
    localStorage.setItem(STORAGE_KEYS.NO_HP, noHp.trim());
  }
}

// Helper periksa apakah dua tanggal jatuh pada hari yang sama (YYYY-MM-DD lokal)
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// --- MANAJEMEN ARMADA (ANGKOT) ---

export function getOfflineAngkotList(): OfflineAngkot[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.ANGKOT_LIST);
  if (!raw) {
    // Default data jika baru pertama kali buka
    const initial: OfflineAngkot[] = [
      { id: 'angkot_1', platNomor: 'D 1902 AB', namaSopirTetap: 'Mang Ujang', isActive: true },
      { id: 'angkot_2', platNomor: 'D 1945 BC', namaSopirTetap: 'Kang Asep', isActive: true },
      { id: 'angkot_3', platNomor: 'D 2024 XY', namaSopirTetap: 'Pak Dadang', isActive: true },
    ];
    localStorage.setItem(STORAGE_KEYS.ANGKOT_LIST, JSON.stringify(initial));
    return initial;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addOfflineAngkot(platNomor: string, namaSopirTetap?: string): OfflineAngkot {
  const current = getOfflineAngkotList();
  const newAngkot: OfflineAngkot = {
    id: 'angkot_' + Date.now(),
    platNomor: platNomor.trim().toUpperCase(),
    namaSopirTetap: namaSopirTetap?.trim() || null,
    isActive: true,
  };
  const updated = [...current, newAngkot];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ANGKOT_LIST, JSON.stringify(updated));
  }
  return newAngkot;
}

export function updateOfflineAngkot(
  id: string,
  data: { platNomor: string; namaSopirTetap?: string }
): OfflineAngkot | null {
  const current = getOfflineAngkotList();
  const index = current.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const updatedAngkot: OfflineAngkot = {
    ...current[index],
    platNomor: data.platNomor.trim().toUpperCase(),
    namaSopirTetap: data.namaSopirTetap?.trim() || null,
  };

  current[index] = updatedAngkot;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ANGKOT_LIST, JSON.stringify(current));
  }
  return updatedAngkot;
}

export function deleteOfflineAngkot(id: string): boolean {
  const current = getOfflineAngkotList();
  const updated = current.filter((a) => a.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ANGKOT_LIST, JSON.stringify(updated));
  }
  return true;
}

// --- MANAJEMEN SETORAN (TRANSAKSI HARIAN) ---

export function getOfflineSetoranList(): OfflineSetoran[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.SETORAN_LIST);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addOfflineSetoran(data: {
  angkotId: string;
  nominal: number;
  pengeluaran?: number;
  keteranganPengeluaran?: string;
  catatan?: string;
  tanggal?: string; // Tanggal kalender target (opsional, default: waktu sekarang)
}): OfflineSetoran {
  const current = getOfflineSetoranList();
  const targetDate = data.tanggal ? new Date(data.tanggal) : new Date();
  const targetIso = targetDate.toISOString();
  const pengeluaranNominal = Number(data.pengeluaran) || 0;
  const ketPengeluaran = data.keteranganPengeluaran?.trim() || null;

  // CEK APAKAH MOBIL INI SUDAH PERNAH SETOR PADA TANGGAL INI (MENCEGAH DOUBLE SAVE)
  const existingIndex = current.findIndex(
    (s) => s.angkotId === data.angkotId && isSameDay(s.tanggal, targetDate)
  );

  let updated: OfflineSetoran[];
  let savedSetoran: OfflineSetoran;

  if (existingIndex !== -1) {
    // UPDATE SETORAN YANG SUDAH ADA (Bukan nambah baris baru / double record)
    savedSetoran = {
      ...current[existingIndex],
      nominal: data.nominal,
      pengeluaran: pengeluaranNominal,
      keteranganPengeluaran: ketPengeluaran,
      status: 'TERCATAT',
      catatan: data.catatan?.trim() || null,
      tanggal: targetIso,
    };
    updated = [...current];
    updated[existingIndex] = savedSetoran;
  } else {
    // BUAT BARU JIKA BELUM ADA
    savedSetoran = {
      id: 'setoran_' + Date.now(),
      angkotId: data.angkotId,
      nominal: data.nominal,
      pengeluaran: pengeluaranNominal,
      keteranganPengeluaran: ketPengeluaran,
      status: 'TERCATAT',
      catatan: data.catatan?.trim() || null,
      tanggal: targetIso,
      createdAt: new Date().toISOString(),
    };
    updated = [savedSetoran, ...current];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETORAN_LIST, JSON.stringify(updated));
  }

  // Jika ada potongan pengeluaran saat setor mobil, otomatis sinkronkan ke buku pengeluaran
  if (pengeluaranNominal > 0 && ketPengeluaran) {
    addOfflinePengeluaran({
      angkotId: data.angkotId,
      nominal: pengeluaranNominal,
      keterangan: ketPengeluaran,
      kategori: 'Potongan Setoran',
      tanggal: targetIso,
    });
  }

  return savedSetoran;
}

export function deleteOfflineSetoran(id: string) {
  const current = getOfflineSetoranList();
  const updated = current.filter((s) => s.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETORAN_LIST, JSON.stringify(updated));
  }
}

// --- MANAJEMEN CATATAN PENGELUARAN (BIAYA / PENGELUARAN KAS) ---

export function getOfflinePengeluaranList(): OfflinePengeluaran[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.PENGELUARAN_LIST);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addOfflinePengeluaran(data: {
  angkotId?: string | null;
  nominal: number;
  keterangan: string;
  kategori?: string;
  tanggal?: string;
}): OfflinePengeluaran {
  const current = getOfflinePengeluaranList();
  const targetIso = data.tanggal || new Date().toISOString();
  
  const newPengeluaran: OfflinePengeluaran = {
    id: 'pengeluaran_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    angkotId: data.angkotId || null,
    nominal: Number(data.nominal) || 0,
    keterangan: data.keterangan.trim(),
    kategori: data.kategori || 'Operasional',
    tanggal: targetIso,
    createdAt: new Date().toISOString(),
  };

  const updated = [newPengeluaran, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PENGELUARAN_LIST, JSON.stringify(updated));
  }
  return newPengeluaran;
}

export function deleteOfflinePengeluaran(id: string): boolean {
  const current = getOfflinePengeluaranList();
  const updated = current.filter((p) => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PENGELUARAN_LIST, JSON.stringify(updated));
  }
  return true;
}
