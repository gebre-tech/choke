import path from 'path'
import {
  IMAGE_EXTS,
  classifyExternalUrl,
  detectMediaTypeFromUrl,
  type MediaType,
} from './media-shared'

export { classifyExternalUrl, detectMediaTypeFromUrl, type MediaType, IMAGE_EXTS }

export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // 50MB

export const UPLOAD_RULES: Record<string, { mime: string; type: MediaType; ext: string }> = {
  jpg: { mime: 'image/jpeg', type: 'IMAGE', ext: 'jpg' },
  jpeg: { mime: 'image/jpeg', type: 'IMAGE', ext: 'jpg' },
  png: { mime: 'image/png', type: 'IMAGE', ext: 'png' },
  webp: { mime: 'image/webp', type: 'IMAGE', ext: 'webp' },
  gif: { mime: 'image/gif', type: 'IMAGE', ext: 'gif' },
  svg: { mime: 'image/svg+xml', type: 'IMAGE', ext: 'svg' },
  avif: { mime: 'image/avif', type: 'IMAGE', ext: 'avif' },
  mp4: { mime: 'video/mp4', type: 'VIDEO', ext: 'mp4' },
  webm: { mime: 'video/webm', type: 'VIDEO', ext: 'webm' },
  mov: { mime: 'video/quicktime', type: 'VIDEO', ext: 'mov' },
  mp3: { mime: 'audio/mpeg', type: 'AUDIO', ext: 'mp3' },
  wav: { mime: 'audio/wav', type: 'AUDIO', ext: 'wav' },
  ogg: { mime: 'audio/ogg', type: 'AUDIO', ext: 'ogg' },
  m4a: { mime: 'audio/mp4', type: 'AUDIO', ext: 'm4a' },
  aac: { mime: 'audio/aac', type: 'AUDIO', ext: 'aac' },
}

export function uploadsDir(): string {
  return path.join(process.cwd(), 'public', 'uploads')
}

export function ruleForFile(name: string, mime: string): (typeof UPLOAD_RULES)[string] | null {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  const byExt = UPLOAD_RULES[ext]
  if (byExt && (!mime || byExt.mime === mime)) return byExt
  if (!byExt) {
    const byMime = Object.values(UPLOAD_RULES).find((r) => r.mime === mime)
    if (byMime) return byMime
  }
  return null
}

export function safeUploadName(prefix: string, origName: string, mime: string): string | null {
  const rule = ruleForFile(origName, mime)
  if (!rule) return null
  const safe = `${prefix}-${Date.now()}.${rule.ext}`
  return path.basename(safe).replace(/[^a-zA-Z0-9._-]/g, '_')
}