const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenantId = 'tenant_juragan_123';

  // 1. Upsert Tenant
  const tenant = await prisma.tenant.upsert({
    where: { noHp: '08122334455' },
    update: {
      id: tenantId,
      namaJuragan: 'H. Ahmad Kosasih (Juragan 05)',
    },
    create: {
      id: tenantId,
      namaJuragan: 'H. Ahmad Kosasih (Juragan 05)',
      noHp: '08122334455',
    },
  });

  console.log('✓ Tenant siap:', tenant.namaJuragan);

  // 2. Bersihkan data sebelumnya untuk tenant ini
  await prisma.setoran.deleteMany({ where: { tenantId } });
  await prisma.angkot.deleteMany({ where: { tenantId } });

  // 3. Buat Armada Angkot
  const angkotData = [
    { platNomor: 'D 1902 AB', namaSopirTetap: 'Mang Ujang', targetHarian: 150000 },
    { platNomor: 'D 1945 ZX', namaSopirTetap: 'Mang Asep', targetHarian: 150000 },
    { platNomor: 'D 2024 AA', namaSopirTetap: 'Mang Cecep', targetHarian: 140000 },
    { platNomor: 'D 1888 KL', namaSopirTetap: 'Mang Dudung', targetHarian: 160000 },
    { platNomor: 'D 1771 BC', namaSopirTetap: 'Mang Ade', targetHarian: 150000 },
  ];

  const createdAngkots = [];
  for (const item of angkotData) {
    const a = await prisma.angkot.create({
      data: {
        tenantId,
        platNomor: item.platNomor,
        namaSopirTetap: item.namaSopirTetap,
        targetHarian: item.targetHarian,
        isActive: true,
      },
    });
    createdAngkots.push(a);
  }

  // 4. Buat histori setoran bulan Oktober 2026 (multi-hari untuk Laporan Bulanan)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed bulan ini

  // Contoh data transaksi beberapa hari lalu di bulan ini
  const historiData = [
    // 5 hari lalu
    { daysAgo: 5, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Tarikan lancar' },
    { daysAgo: 5, angkotIdx: 1, nominal: 140000, status: 'KURANG', catatan: 'Bensin Rp 10.000' },
    { daysAgo: 5, angkotIdx: 2, nominal: 140000, status: 'LUNAS', catatan: 'Setor pas sore' },
    { daysAgo: 5, angkotIdx: 3, nominal: 160000, status: 'LUNAS', catatan: 'Lancar' },

    // 4 hari lalu
    { daysAgo: 4, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Aman' },
    { daysAgo: 4, angkotIdx: 1, nominal: 150000, status: 'LUNAS', catatan: 'Lunas' },
    { daysAgo: 4, angkotIdx: 2, nominal: 120000, status: 'KURANG', catatan: 'Tambal ban bocor Rp 20.000' },
    { daysAgo: 4, angkotIdx: 4, nominal: 170000, status: 'LEBIH', catatan: 'Rame penumpang pasar' },

    // 3 hari lalu
    { daysAgo: 3, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Beres tepat waktu' },
    { daysAgo: 3, angkotIdx: 2, nominal: 140000, status: 'LUNAS', catatan: 'Tarikan ramai' },
    { daysAgo: 3, angkotIdx: 3, nominal: 130000, status: 'KURANG', catatan: 'Beli oli mesin Rp 30.000' },

    // 2 hari lalu
    { daysAgo: 2, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Aman lancar' },
    { daysAgo: 2, angkotIdx: 1, nominal: 150000, status: 'LUNAS', catatan: 'Beres' },
    { daysAgo: 2, angkotIdx: 3, nominal: 160000, status: 'LUNAS', catatan: 'Lunas pas' },
    { daysAgo: 2, angkotIdx: 4, nominal: 150000, status: 'LUNAS', catatan: 'Aman' },

    // Kemarin
    { daysAgo: 1, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Lunas' },
    { daysAgo: 1, angkotIdx: 1, nominal: 125000, status: 'KURANG', catatan: 'Hujan lebat tarikan sepi' },
    { daysAgo: 1, angkotIdx: 2, nominal: 140000, status: 'LUNAS', catatan: 'Beres' },
    { daysAgo: 1, angkotIdx: 3, nominal: 160000, status: 'LUNAS', catatan: 'Lancar' },

    // Hari Ini
    { daysAgo: 0, angkotIdx: 0, nominal: 150000, status: 'LUNAS', catatan: 'Setor maghrib pas' },
    { daysAgo: 0, angkotIdx: 2, nominal: 100000, status: 'KURANG', catatan: 'Ganti ban bocor Rp 40.000' },
  ];

  for (const item of historiData) {
    const d = new Date(year, month, now.getDate() - item.daysAgo, 17, 30, 0, 0);
    const angkot = createdAngkots[item.angkotIdx];
    await prisma.setoran.create({
      data: {
        tenantId,
        angkotId: angkot.id,
        tanggal: d,
        nominal: item.nominal,
        targetHariIni: angkot.targetHarian,
        status: item.status,
        catatan: item.catatan,
      },
    });
  }

  console.log('✓ Database berhasil di-seed dengan data armada dan rekap bulanan multi-hari!');
}

main()
  .catch((e) => {
    console.error('Error saat seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
