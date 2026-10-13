'use server'

import 'server-only'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

const TenantProfileSchema = z.object({
  namaJuragan: z.string().min(2, 'Nama minimal 2 karakter').max(60),
  noHp: z.string().max(20).optional(),
})

export async function updatePengaturanAction(formDataRaw: {
  namaJuragan: string
  noHp?: string
}) {
  const sessionTenantId = process.env.SESSION_TENANT_ID || 'tenant_juragan_123'

  const parsed = TenantProfileSchema.safeParse(formDataRaw)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' }
  }

  try {
    await prisma.tenant.update({
      where: { id: sessionTenantId },
      data: {
        namaJuragan: parsed.data.namaJuragan.trim(),
        noHp: parsed.data.noHp?.trim() || '08122334455',
      },
    })

    revalidatePath('/')
    return { success: true, message: 'Pengaturan akun berhasil disimpan!' }
  } catch (error) {
    console.error('Error update profil juragan:', error)
    return { success: false, error: 'Gagal memperbarui pengaturan akun.' }
  }
}
