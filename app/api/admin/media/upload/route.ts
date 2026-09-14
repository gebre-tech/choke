import { adminOnly } from '../../guard'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { mkdirSync, writeFileSync } from 'fs'
import {
  MAX_UPLOAD_BYTES,
  ruleForFile,
  safeUploadName,
  uploadsDir,
} from '@/lib/media'

export async function POST(req: NextRequest) {
  const guard = await adminOnly()
  if (!guard.ok) return guard.response

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
  }

  mkdirSync(uploadsDir(), { recursive: true })

  const created: unknown[] = []
  const failures: { name: string; reason: string }[] = []

  for (const file of files) {
    const name = file.name || 'file'
    try {
      if (file.size > MAX_UPLOAD_BYTES) {
        failures.push({ name, reason: `File exceeds 50MB limit (${Math.round(file.size / 1024 / 1024)}MB)` })
        continue
      }
      const rule = ruleForFile(name, file.type)
      if (!rule) {
        failures.push({ name, reason: 'Type not supported — use image (jpg/png/webp/gif), video (mp4/webm/mov) or audio (mp3/wav/ogg/m4a)' })
        continue
      }
      const id = randomUUID()
      const fileName = safeUploadName(`media-${id.slice(0, 8)}`, name, file.type)
      if (!fileName) {
        failures.push({ name, reason: 'Could not determine a safe filename' })
        continue
      }
      const buffer = Buffer.from(await file.arrayBuffer())
      writeFileSync(`${uploadsDir()}\\${fileName}`, buffer)

      const title = name.replace(/\.[a-zA-Z0-9]+$/, '').replace(/[-_]+/g, ' ').trim() || 'Untitled'

      const media = await prisma.media.create({
        data: {
          title,
          type: rule.type,
          url: `/uploads/${fileName}`,
          provider: 'NONE',
          mimeType: rule.mime,
          sizeBytes: buffer.length,
          fileName,
          scope: 'GALLERY',
        },
      })
      created.push(media)
    } catch {
      failures.push({ name, reason: 'Upload failed unexpectedly' })
    }
  }

  return NextResponse.json(
    { media: created, failures },
    { status: created.length > 0 ? 201 : 400 }
  )
}