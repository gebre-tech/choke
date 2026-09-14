'use client'

import { useState, useCallback, useRef, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Film,
  Music,
  Star,
  ChevronUp,
  ChevronDown,
  Trash2,
  RotateCcw,
  Eye,
  Edit2,
} from 'lucide-react'
import { Button } from '@/components/ui/design-system'
import { Input, Textarea } from '@/components/ui/design-system'
import { MediaItem } from '@/components/ui/workflow/ListingWizard'
import { useToastHelpers } from '@/components/ui/design-system/Toast'

export interface MediaUploaderProps {
  media: MediaItem[]
  onChange: (media: MediaItem[]) => void
  maxFiles?: number
  acceptedTypes?: string
  showCoverSelector?: boolean
  className?: string
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const ACCEPTED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg']
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

export const MediaUploader = ({
  media,
  onChange,
  maxFiles = 20,
  acceptedTypes = 'image/*,video/*,audio/*',
  showCoverSelector = true,
  className = '',
}: MediaUploaderProps) => {
  const { error: toastError, success: toastSuccess } = useToastHelpers()
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      if (file.size > MAX_IMAGE_SIZE) return `Image ${file.name} exceeds 10MB limit`
      return null
    }
    if (ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      if (file.size > MAX_FILE_SIZE) return `Video ${file.name} exceeds 50MB limit`
      return null
    }
    if (ACCEPTED_AUDIO_TYPES.includes(file.type)) {
      if (file.size > MAX_FILE_SIZE) return `Audio ${file.name} exceeds 50MB limit`
      return null
    }
    return `File type ${file.type} not supported`
  }

  const getMediaType = (file: File): MediaItem['type'] => {
    if (file.type.startsWith('image/')) return 'IMAGE'
    if (file.type.startsWith('video/')) return 'VIDEO'
    if (file.type.startsWith('audio/')) return 'AUDIO'
    return 'IMAGE'
  }

  const createMediaItem = (file: File, index: number): MediaItem => ({
    id: `temp-${Date.now()}-${index}`,
    type: getMediaType(file),
    url: URL.createObjectURL(file),
    title: file.name,
    caption: '',
    altText: '',
    sortOrder: media.length + index,
    isCover: media.length === 0 && index === 0,
    file,
  })

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const validFiles: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file, i) => {
      const error = validateFile(file)
      if (error) {
        errors.push(error)
      } else if (media.length + validFiles.length < maxFiles) {
        validFiles.push(file)
      } else {
        errors.push(`Maximum ${maxFiles} files allowed`)
      }
    })

    if (errors.length > 0) {
      errors.forEach(e => toastError(e))
    }

    if (validFiles.length > 0) {
      const newMedia = validFiles.map((f, i) => createMediaItem(f, i))
      onChange([...media, ...newMedia])
    }
  }, [media, maxFiles, onChange])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const removeMedia = useCallback((id: string) => {
    const item = media.find(m => m.id === id)
    if (item?.url.startsWith('blob:')) URL.revokeObjectURL(item.url)
    onChange(media.filter(m => m.id !== id))
  }, [media, onChange])

  const setCover = useCallback((id: string) => {
    onChange(media.map(m => ({ ...m, isCover: m.id === id })))
  }, [media, onChange])

  const moveMedia = useCallback((id: string, direction: 'up' | 'down') => {
    const index = media.findIndex(m => m.id === id)
    if (index === -1) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= media.length) return

    const newMedia = [...media]
    const [moved] = newMedia.splice(index, 1)
    newMedia.splice(newIndex, 0, moved)
    onChange(newMedia.map((m, i) => ({ ...m, sortOrder: i })))
  }, [media, onChange])

  const handleEdit = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const saveEdit = useCallback((id: string, updates: Partial<MediaItem>) => {
    onChange(media.map(m => m.id === id ? { ...m, ...updates } : m))
    setEditingId(null)
  }, [media, onChange])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  return (
    <div className={className}>
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
          ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-stone-200 hover:border-emerald-300'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="media-upload-input"
          disabled={uploading || media.length >= maxFiles}
        />
        <label
          htmlFor="media-upload-input"
          className="cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <Upload className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-lg font-medium text-stone-900">
            {dragActive ? 'Drop files here…' : 'Drag & drop media files, or click to browse'}
          </p>
          <p className="text-sm text-stone-500 mt-1">
            Supports images, videos, audio. Max {maxFiles} files, 50MB each.
          </p>
          {media.length >= maxFiles && (
            <p className="text-sm text-amber-600 mt-2">Maximum file limit reached</p>
          )}
        </label>
      </div>

      {media.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900">Media ({media.length}/{maxFiles})</h3>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              {media.filter(m => m.type === 'IMAGE').length} images,{' '}
              {media.filter(m => m.type === 'VIDEO').length} videos
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((item, index) => (
              <MediaItemCard
                key={item.id}
                item={item}
                index={index}
                isEditing={editingId === item.id}
                isCover={item.isCover}
                onSetCover={setCover}
                onMoveUp={() => index > 0 && moveMedia(item.id, 'up')}
                onMoveDown={() => index < media.length - 1 && moveMedia(item.id, 'down')}
                onEdit={handleEdit}
                onSave={(updates: Partial<MediaItem>) => saveEdit(item.id, updates)}
                onCancel={cancelEdit}
                onRemove={() => removeMedia(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const MediaItemCard = ({
  item,
  index,
  isEditing,
  isCover,
  onSetCover,
  onMoveUp,
  onMoveDown,
  onEdit,
  onSave,
  onCancel,
  onRemove,
}: {
  item: MediaItem
  index: number
  isEditing: boolean
  isCover: boolean
  onSetCover: (id: string) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onEdit: (id: string) => void
  onSave: (updates: Partial<MediaItem>) => void
  onCancel: () => void
  onRemove: (id: string) => void
}) => {
  const [editTitle, setEditTitle] = useState(item.title)
  const [editCaption, setEditCaption] = useState(item.caption || '')
  const [editAltText, setEditAltText] = useState(item.altText || '')

  const handleSave = () => {
    onSave({ title: editTitle, caption: editCaption, altText: editAltText })
  }

  const getIcon = () => {
    switch (item.type) {
      case 'VIDEO': return <Film className="w-6 h-6" />
      case 'AUDIO': return <Music className="w-6 h-6" />
      default: return <ImageIcon className="w-6 h-6" />
    }
  }

  const renderPreview = () => {
    if (item.type === 'VIDEO') {
      return (
        <div className="relative aspect-video bg-stone-100 rounded-lg overflow-hidden">
          <video src={item.url} muted preload="metadata" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Film className="w-10 h-10 text-white/80" />
          </div>
        </div>
      )
    }
    if (item.type === 'AUDIO') {
      return (
        <div className="aspect-video bg-stone-100 rounded-lg flex items-center justify-center">
          <Music className="w-12 h-12 text-stone-400" />
        </div>
      )
    }
    return (
      <img
        src={item.url}
        alt={item.altText || item.title}
        className="w-full h-full object-cover"
      />
    )
  }

  if (isEditing) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl border-2 border-emerald-500 bg-white overflow-hidden"
      >
        <div className="aspect-video bg-stone-100">
          {renderPreview()}
        </div>
        <div className="p-3 space-y-3">
          <Input label="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          <Textarea label="Caption" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} rows={2} />
          <Input label="Alt Text" value={editAltText} onChange={(e) => setEditAltText(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 btn btn-primary text-sm py-2">Save</button>
            <button onClick={onCancel} className="flex-1 btn btn-secondary text-sm py-2">Cancel</button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group rounded-xl border border-stone-200 bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-stone-100 overflow-hidden">
        {renderPreview()}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
          <button
            onClick={() => onEdit(item.id)}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-stone-700"
            aria-label="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => !isCover && onSetCover(item.id)}
            disabled={isCover}
            className={`p-2 rounded-lg ${isCover ? 'bg-amber-500 text-white' : 'bg-white/90 hover:bg-white'} text-stone-700`}
            aria-label={isCover ? 'Current cover' : 'Set as cover'}
          >
            <Star className="w-5 h-5" />
          </button>
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-stone-700 disabled:opacity-30"
            aria-label="Move up"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={onMoveDown}
            className="p-2 rounded-lg bg-white/90 hover:bg-white text-stone-700"
            aria-label="Move down"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white"
            aria-label="Remove"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {item.isCover && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded-full">Cover</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2">
          <span className="text-xs text-white/80 truncate max-w-[60%]">{item.title}</span>
          <span className="text-[10px] text-white/60 capitalize">{item.type.toLowerCase()}</span>
        </div>
      </div>
      <div className="p-2 border-t border-stone-100">
        <p className="text-xs text-stone-500 truncate">{item.caption || 'No caption'}</p>
        <p className="text-[10px] text-stone-400">Position: {item.sortOrder + 1}</p>
      </div>
    </motion.div>
  )
}