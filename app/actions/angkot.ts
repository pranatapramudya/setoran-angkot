'use server'

import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const AngkotSchema = z.object({
  platNomor: z.string().min(3, 'Plat nomor wajib diisi').max(20),
  namaSopirTetap: z.string().max(50).optional(),
  targetHarian: z.number().int().min(10000, 'Target setoran harian minimal Rp 10.000'),
})

export async function tambahAngkotAction(formDataRaw: {
  platNomor: string
  namaSopirTetap?: string
  targetHarian: number
}) {
  const sessionTenantId = process.env.SESSION_TENANT_ID || 'tenant_juragan_123'

  const parsed = AngkotSchema.safeParse(formDataRaw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data mobil tidak valid' }
  }

  const { platNomor, namaSopirTetap, targetHarian } = parsed.data
  const formattedPlat = platNomor.trim().toUpperCase()

  try {
    const existing = await prisma.angkot.findFirst({
      where: {
        tenantId: sessionTenantId,
        platNomor: formattedPlat,
      },
    })

    if (existing) {
      return { success: false, error: `Mobil ${formattedPlat} sudah ada di armada Anda!` }
    }

    await prisma.angkot.create({
      data: {
        tenantId: sessionTenantId,
        platNomor: formattedPlat,
        namaSopirTetap: namaSopirTetap?.trim() || null,
        targetHarian,
        isActive: true,
      },
    })

    revalidatePath('/')
    return { success: true, message: `Mobil ${formattedPlat} berhasil ditambahkan!` }
  } catch (error) {
    console.error('Error tambah mobil:', error)
    return { success: false, error: 'Gagal menambah armada mobil.' }
  }
}
