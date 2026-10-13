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
  tanggal: string;
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

export function saveOfflineJuragan(namaJuragan: string, noHp: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.JURAGAN, namaJuragan);
  localStorage.setItem(STORAGE_KEYS.NO_HP, noHp);
}

export function getOfflineAngkotList(): OfflineAngkot[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.ANGKOT_LIST);
  if (!raw) {
    return [];
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
}): OfflineSetoran {
  const current = getOfflineSetoranList();
  const now = new Date();
  const pengeluaranNominal = Number(data.pengeluaran) || 0;
  const ketPengeluaran = data.keteranganPengeluaran?.trim() || null;

  const newSetoran: OfflineSetoran = {
    id: 'setoran_' + Date.now(),
    angkotId: data.angkotId,
    nominal: data.nominal,
    pengeluaran: pengeluaranNominal,
    keteranganPengeluaran: ketPengeluaran,
    status: 'TERCATAT',
    catatan: data.catatan?.trim() || null,
    tanggal: now.toISOString(),
    createdAt: now.toISOString(),
  };

  const updated = [newSetoran, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.SETORAN_LIST, JSON.stringify(updated));
  }

  // Jika ada potongan pengeluaran saat setor mobil, otomatis catat juga ke buku pengeluaran
  if (pengeluaranNominal > 0 && ketPengeluaran) {
    addOfflinePengeluaran({
      angkotId: data.angkotId,
      nominal: pengeluaranNominal,
      keterangan: ketPengeluaran,
      kategori: 'Potongan Setoran',
    });
  }

  return newSetoran;
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
  const now = new Date();
  const newPengeluaran: OfflinePengeluaran = {
    id: 'pengeluaran_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    angkotId: data.angkotId || null,
    nominal: Number(data.nominal) || 0,
    keterangan: data.keterangan.trim(),
    kategori: data.kategori || 'Operasional',
    tanggal: data.tanggal || now.toISOString(),
    createdAt: now.toISOString(),
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
