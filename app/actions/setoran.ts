'use server'

import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const SetoranSchema = z.object({
  angkotId: z.string().min(1, 'Mobil angkot wajib dipilih'),
  nominal: z.number().int().positive('Nominal setoran harus lebih dari 0'),
  catatan: z.string().max(100).optional(),
})

export async function catatSetoranAction(formDataRaw: {
  angkotId: string
  nominal: number
  catatan?: string
}) {
  // 1. Dapatkan tenantId dari sesi autentikasi (Simulasi auth session Juragan)
  const sessionTenantId = process.env.SESSION_TENANT_ID || 'tenant_juragan_123'

  // 2. Validasi input via Zod
  const parsed = SetoranSchema.safeParse(formDataRaw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' }
  }

  const { angkotId, nominal, catatan } = parsed.data

  try {
    // 3. Verifikasi kepemilikan mobil (ANTI-IDOR)
    const angkot = await prisma.angkot.findFirst({
      where: {
        id: angkotId,
        tenantId: sessionTenantId, // KUNCI WAJIB MULTI-TENANT
      },
    })

    if (!angkot) {
      return { success: false, error: 'Data angkot tidak ditemukan atau bukan milik Anda!' }
    }

    // 4. Hitung Status
    let status = 'LUNAS'
    if (nominal < angkot.targetHarian) {
      status = 'KURANG'
    } else if (nominal > angkot.targetHarian) {
      status = 'LEBIH'
    }

    // 5. Simpan transaksi
    await prisma.setoran.create({
      data: {
        tenantId: sessionTenantId,
        angkotId: angkot.id,
        nominal,
        targetHariIni: angkot.targetHarian,
        status,
        catatan: catatan?.trim() || '',
      },
    })

    revalidatePath('/')
    return {
      success: true,
      message: `Setoran Rp ${nominal.toLocaleString('id-ID')} Berhasil Dicatat!`,
      nominal,
      platNomor: angkot.platNomor,
      namaSopir: angkot.namaSopirTetap || 'Sopir',
      status,
    }
  } catch (error) {
    console.error('Database error on catatSetoran:', error)
    return { success: false, error: 'Gagal mencatat setoran karena gangguan database.' }
  }
}

export async function batalSetoranAction(setoranId: string) {
  const sessionTenantId = process.env.SESSION_TENANT_ID || 'tenant_juragan_123'
  try {
    const existing = await prisma.setoran.findFirst({
      where: {
        id: setoranId,
        tenantId: sessionTenantId,
      },
    })
    if (!existing) {
      return { success: false, error: 'Data setoran tidak ditemukan!' }
    }

    await prisma.setoran.delete({
      where: { id: setoranId },
    })

    revalidatePath('/')
    return { success: true, message: 'Catatan setoran berhasil dihapus!' }
  } catch (error) {
    console.error('Error saat batal setoran:', error)
    return { success: false, error: 'Gagal menghapus data setoran.' }
  }
}
