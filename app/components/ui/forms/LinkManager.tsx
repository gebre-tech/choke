'use client'

import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  MapPin,
  ShoppingCart,
  MessageSquare,
  Video,
  Link2,
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/design-system'
import { Input, Textarea, Select } from '@/components/ui/design-system'
import { useToastHelpers } from '@/components/ui/design-system/Toast'
import { LinkItem } from '@/components/ui/workflow/ListingWizard'

export interface LinkManagerProps {
  links: LinkItem[]
  onChange: (links: LinkItem[]) => void
  maxLinks?: number
  className?: string
}

const LINK_TYPES = [
  { value: 'WEBSITE', label: 'Website', icon: Globe, description: 'Main website or product page' },
  { value: 'BOOKING', label: 'Booking', icon: MapPin, description: 'Booking/reservation page' },
  { value: 'PURCHASE', label: 'Purchase', icon: ShoppingCart, description: 'Direct purchase link' },
  { value: 'LOCATION', label: 'Location', icon: MapPin, description: 'Map/address link' },
  { value: 'SOCIAL', label: 'Social Media', icon: MessageSquare, description: 'Instagram, Facebook, etc.' },
  { value: 'VIDEO', label: 'Video', icon: Video, description: 'YouTube, Vimeo embed link' },
  { value: 'OTHER', label: 'Other', icon: Link2, description: 'Any other external link' },
] as const

const LINK_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  WEBSITE: Globe,
  BOOKING: MapPin,
  PURCHASE: ShoppingCart,
  LOCATION: MapPin,
  SOCIAL: MessageSquare,
  VIDEO: Video,
  OTHER: Link2,
}

const validateUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const LinkManager = ({
  links,
  onChange,
  maxLinks = 10,
  className = '',
}: LinkManagerProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<LinkItem>>({
    type: 'WEBSITE',
    title: '',
    url: '',
    description: '',
    openInNewTab: true,
    sortOrder: links.length,
  })
  const { error: toastError, success: toastSuccess } = useToastHelpers()

  const editingLink = links.find(l => l.id === editingId)

  const handleAddClick = () => {
    setFormData({
      type: 'WEBSITE',
      title: '',
      url: '',
      description: '',
      openInNewTab: true,
      sortOrder: links.length,
    })
    setEditingId(null)
    setModalOpen(true)
  }

  const handleEditClick = (link: LinkItem) => {
    setFormData({ ...link })
    setEditingId(link.id)
    setModalOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title?.trim()) {
      toastError('Title is required')
      return
    }
    if (!formData.url?.trim()) {
      toastError('URL is required')
      return
    }
    try {
      new URL(formData.url)
    } catch {
      toastError('Please enter a valid URL (e.g., https://example.com)')
      return
    }

    if (editingId) {
      onChange(links.map(l => l.id === editingId ? { ...l, ...formData, id: editingId } : l))
    } else {
      const newLink: LinkItem = {
        id: `link-${Date.now()}`,
        ...formData,
        sortOrder: links.length,
      } as LinkItem
      onChange([...links, newLink])
    }

    setModalOpen(false)
    resetForm()
  }

  const removeLink = (id: string) => {
    if (confirm('Remove this link?')) {
      onChange(links.filter(l => l.id !== id))
    }
  }

  const moveLink = (id: string, direction: 'up' | 'down') => {
    const index = links.findIndex(l => l.id === id)
    if (index === -1) return
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= links.length) return

    const newLinks = [...links]
    const [moved] = newLinks.splice(index, 1)
    newLinks.splice(newIndex, 0, moved)
    onChange(newLinks.map((l, i) => ({ ...l, sortOrder: i })))
  }

  const resetForm = () => {
    setFormData({
      type: 'WEBSITE',
      title: '',
      url: '',
      description: '',
      openInNewTab: true,
      sortOrder: links.length,
    })
    setEditingId(null)
    setModalOpen(false)
  }

  const getTypeIcon = (type: string) => {
    const Icon = LINK_TYPE_ICONS[type] || Link2
    return <Icon className="w-4 h-4" />
  }

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-900">External Links ({links.length}/{maxLinks})</h3>
        {links.length < maxLinks && (
          <Button variant="secondary" size="sm" onClick={handleAddClick} icon={<Plus className="w-4 h-4" />}>
            Add Link
          </Button>
        )}
      </div>

      {links.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-stone-200 rounded-xl">
          <Link2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">No links added yet</p>
          <p className="text-sm text-stone-400 mt-1">Add booking pages, websites, social media, etc.</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={handleAddClick} icon={<Plus className="w-4 h-4" />}>
            Add Your First Link
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="card p-4 flex items-center gap-3"
            >
              <div className="flex items-center gap-2">
                <button
                  onMouseDown={e => e.preventDefault()}
                  className="text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing self-start pt-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">
                      {LINK_TYPES.find(t => t.value === link.type)?.label ?? link.type}
                    </span>
                    {!link.openInNewTab && <span className="text-[10px] text-stone-400">(same tab)</span>}
                  </div>
                  <p className="font-medium line-clamp-1">{link.title}</p>
                  <p className="text-xs text-stone-500 truncate">{link.url}</p>
                  {link.description && <p className="text-xs text-stone-400 line-clamp-2">{link.description}</p>}
                  <div className="flex items-center gap-2 text-[11px] text-stone-400">
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={link.openInNewTab} disabled className="w-3 h-3" />
                      Open in new tab
                    </label>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => handleEditClick(link)} className="text-stone-400 hover:text-emerald-600 p-1" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button type="button" onClick={() => removeLink(link.id)} className="text-stone-400 hover:text-red-600 p-1" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{editingId ? 'Edit Link' : 'Add Link'}</h3>
                <button onClick={() => setModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100" aria-label="Close modal">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Link Type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LinkItem['type'] }))}
                  options={LINK_TYPES.map(t => ({ value: t.value, label: t.label }))}
                  required
                />

                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Book Now, Our Website, Instagram"
                  required
                />

                <Input
                  label="URL"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
                {!validateUrl(formData.url || '') && formData.url && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Please enter a valid URL (e.g., https://example.com)
                  </p>
                )}

                <Input
                  label="Description (optional)"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this link"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="openInNewTab"
                    checked={formData.openInNewTab ?? true}
                    onChange={(e) => setFormData(prev => ({ ...prev, openInNewTab: e.target.checked }))}
                    className="w-4 h-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="openInNewTab" className="text-sm font-medium text-stone-700">
                    Open in new tab
                  </label>
                </div>

                <Input
                  label="Sort Order"
                  type="number"
                  min="0"
                  value={formData.sortOrder || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: Number(e.target.value) }))}
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Save Changes' : 'Add Link'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}