export const MEDIA_TYPES = ['IMAGE', 'VIDEO', 'AUDIO'] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

export const MEDIA_SCOPES = ['GALLERY', 'COTTAGE', 'EXPERIENCE', 'PRODUCT', 'PAGE_BACKGROUND'] as const
export type MediaScope = (typeof MEDIA_SCOPES)[number]

export const IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'avif'])

export const USER_IMAGE_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])
export const USER_URL_ERROR =
  'Only https image URLs (jpg/png/webp/gif) or YouTube/Vimeo links can be added here. File uploads and other external links are managed by admins.'

export type PublicMediaUrl =
  | { ok: true; url: string; type: 'IMAGE' }
  | { ok: true; url: string; type: 'VIDEO'; provider: string; videoId: string }
  | { ok: false; error: string }

export function classifyPublicMediaUrl(raw: string): PublicMediaUrl {
  const url = String(raw ?? '').trim()
  if (!/^https:\/\//i.test(url)) {
    return { ok: false, error: 'Image and embed links must be https URLs.' }
  }
  const external = classifyExternalUrl(url)
  if (external) {
    return { ok: true, url, type: 'VIDEO', provider: external.provider, videoId: external.videoId }
  }
  const clean = url.split('?')[0]
  const ext = clean.split('.').pop()?.toLowerCase() ?? ''
  if (USER_IMAGE_EXTS.has(ext)) {
    return { ok: true, url, type: 'IMAGE' }
  }
  return { ok: false, error: USER_URL_ERROR }
}

export type MediaLike = {
  type?: string
  provider?: string | null
  videoId?: string | null
  url: string
}

export type GalleryMedia = {
  id: string
  title: string
  type: MediaType
  url: string
  provider: string | null
  videoId: string | null
  caption?: string | null
  altText?: string | null
  mimeType?: string | null
}

export function parseYouTubeId(url: string): string | null {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/) ??
    url.match(/youtube\.com\/watch\?.*v=([\w-]{6,})/)
  return m?.[1] ?? null
}

export function parseVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  return m?.[1] ?? null
}

export function classifyExternalUrl(url: string): { provider: string; videoId: string } | null {
  const yt = parseYouTubeId(url)
  if (yt) return { provider: 'YOUTUBE', videoId: yt }
  const vm = parseVimeoId(url)
  if (vm) return { provider: 'VIMEO', videoId: vm }
  return null
}

export function embedSrc(m: MediaLike): string | null {
  const yt = m.videoId ?? parseYouTubeId(m.url)
  const vm = m.videoId ?? parseVimeoId(m.url)
  if (m.provider === 'YOUTUBE' && yt) return `https://www.youtube-nocookie.com/embed/${yt}`
  if (m.provider === 'VIMEO' && vm) return `https://player.vimeo.com/video/${vm}`
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt}`
  if (vm) return `https://player.vimeo.com/video/${vm}`
  return null
}

export function detectMediaTypeFromUrl(url: string): MediaType | null {
  if (classifyExternalUrl(url)) return 'VIDEO'
  const clean = url.split('?')[0]
  const ext = clean.split('.').pop()?.toLowerCase() ?? ''
  if (IMAGE_EXTS.has(ext)) return 'IMAGE'
  return null
}

export function isLocalUpload(url: string): boolean {
  return url.startsWith('/uploads/')
}

export function isUrlReachableUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function mediaLabel(scope: string): string {
  switch (scope.toUpperCase()) {
    case 'COTTAGE':
      return 'Cottage'
    case 'EXPERIENCE':
      return 'Experience'
    case 'PRODUCT':
      return 'Product'
    case 'PAGE_BACKGROUND':
      return 'Page Background'
    default:
      return 'Gallery'
  }
}