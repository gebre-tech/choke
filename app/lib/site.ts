import { prisma } from '@/lib/prisma'

export const SITE_SETTING_KEYS = [
  'siteName',
  'tagline',
  'contactEmail',
  'contactPhone',
  'logoUrl',
] as const

export type SiteSettingKey = (typeof SITE_SETTING_KEYS)[number]

export const SITE_SETTINGS_DEFAULTS: Record<SiteSettingKey, string> = {
  siteName: 'Choke Panoramic Eco-Lodge',
  tagline: "Ethiopia's highest-altitude eco-lodge at 4,070 m",
  contactEmail: 'stay@chokepanoramic.et',
  contactPhone: '+251 91 234 5678',
  logoUrl: '',
}

export type SiteSettings = Record<SiteSettingKey, string>

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany()
  const map = new Map(rows.map((r) => [r.key, r.value]))
  const merged: SiteSettings = { ...SITE_SETTINGS_DEFAULTS }
  for (const key of SITE_SETTING_KEYS) {
    const v = map.get(key)
    if (typeof v === 'string' && v.trim()) merged[key] = v
  }
  return merged
}

export async function setSiteSettings(
  updates: Partial<Record<SiteSettingKey, string>>
): Promise<SiteSettings> {
  await prisma.$transaction(
    Object.entries(updates)
      .filter(([k]) => (SITE_SETTING_KEYS as readonly string[]).includes(k))
      .map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: value ?? '' },
          update: { value: value ?? '' },
        })
      )
  )
  return getSiteSettings()
}