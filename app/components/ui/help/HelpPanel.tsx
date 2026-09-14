'use client'

import { useState, useRef, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, HelpCircle, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/design-system'
import { Input } from '@/components/ui/design-system'

export interface HelpItem {
  id: string
  title: string
  content: ReactNode
  category: string
  tags?: string[]
  context?: string[]
}

export interface HelpPanelProps {
  items: HelpItem[]
  context?: string
  trigger?: React.ReactNode
  position?: 'left' | 'right'
  className?: string
}

const DEFAULT_HELP_ITEMS: HelpItem[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: (
      <div className="space-y-3">
        <p>Welcome to Choke Panoramic! This platform helps you manage your products, cottages, and experiences.</p>
        <p>Start by clicking "Add Product", "Add Cottage", or "Add Experience" from your dashboard.</p>
      </div>
    ),
    category: 'Basics',
    tags: ['new', 'start'],
    context: ['dashboard'],
  },
  {
    id: 'creating-listings',
    title: 'Creating Listings',
    content: (
      <div className="space-y-3">
        <h4 className="font-medium">The creation process has 5 steps:</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>Details:</strong> Name, description, price, category</li>
          <li><strong>Media:</strong> Upload photos, videos, set cover image</li>
          <li><strong>Links:</strong> Add booking, website, social media links</li>
          <li><strong>Additional:</strong> Type-specific settings</li>
          <li><strong>Review:</strong> Final check before publishing</li>
        </ol>
      </div>
    ),
    category: 'Listings',
    tags: ['create', 'workflow'],
    context: ['products', 'cottages', 'experiences'],
  },
  {
    id: 'media-upload',
    title: 'Uploading Media',
    content: (
      <div className="space-y-3">
        <p>Drag and drop files directly onto the upload area, or click to browse.</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Images: JPG, PNG, WebP, GIF (max 10MB)</li>
          <li>Videos: MP4, WebM (max 50MB)</li>
          <li>Audio: MP3, WAV, OGG (max 50MB)</li>
        </ul>
        <p className="text-sm text-stone-600">First image becomes the cover. Drag to reorder.</p>
      </div>
    ),
    category: 'Media',
    tags: ['upload', 'images', 'videos'],
    context: ['media', 'products', 'cottages', 'experiences'],
  },
  {
    id: 'links-management',
    title: 'Managing Links',
    content: (
      <div className="space-y-3">
        <p>Add external links for each listing type:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Products:</strong> Website, Purchase, Social Media</li>
          <li><strong>Cottages:</strong> Booking, Website, Location, Social Media</li>
          <li><strong>Experiences:</strong> Booking, Website, Meeting Point, Social Media</li>
        </ul>
        <p className="text-sm text-stone-600">Always use full URLs (https://example.com)</p>
      </div>
    ),
    category: 'Links',
    tags: ['links', 'booking', 'social'],
    context: ['products', 'cottages', 'experiences'],
  },
  {
    id: 'publishing',
    title: 'Publishing vs Saving Draft',
    content: (
      <div className="space-y-3">
        <p><strong>Save Draft:</strong> Saves your progress. Can be incomplete. Only visible to you.</p>
        <p><strong>Publish:</strong> Makes listing public. All required fields must be complete.</p>
        <p className="text-sm text-stone-600">Drafts auto-save every 30 seconds. Your work is never lost.</p>
      </div>
    ),
    category: 'Publishing',
    tags: ['draft', 'publish', 'autosave'],
    context: ['products', 'cottages', 'experiences'],
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues',
    content: (
      <div className="space-y-3">
        <h4 className="font-medium">Troubleshooting:</h4>
        <dl className="space-y-2 text-sm">
          <dt className="font-medium">"Upload failed"</dt>
          <dd className="text-stone-600">Check file size (max 50MB) and type. Try a different file.</dd>
          <dt className="font-medium">"Invalid URL"</dt>
          <dd className="text-stone-600">Use full URLs starting with https:// (e.g., https://example.com)</dd>
          <dt className="font-medium">"Missing required fields"</dt>
          <dd className="text-stone-600">Check the validation errors in each step. All required fields must be filled.</dd>
          <dt className="font-medium">"Cover image not set"</dt>
          <dd className="text-stone-600">Click the star icon on any image to set it as cover.</dd>
        </dl>
      </div>
    ),
    category: 'Troubleshooting',
    tags: ['errors', 'help'],
    context: ['*'],
  },
]

export function HelpPanel({
  items = DEFAULT_HELP_ITEMS,
  context,
  trigger,
  position = 'right',
  className = '',
}: HelpPanelProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesContext = !context || item.context?.includes('*') || item.context?.includes(context)
    return matchesSearch && matchesCategory && matchesContext
  })

  const categories = ['all', ...new Set(items.map(i => i.category))]

  return (
    <div className={`relative inline-flex ${className}`}>
      {trigger || (
        <button
          onClick={() => setOpen(!open)}
          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label="Open help"
          aria-expanded={open}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`fixed z-[1600] ${position === 'left' ? 'left-4' : 'right-4'} top-20`}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 w-80 md:w-96 max-h-[70vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-stone-900">Help Center</h3>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
                  aria-label="Close help"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-stone-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search help..."
                    className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="px-4 py-2 border-b border-stone-100">
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                        activeCategory === cat
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <Search className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                    <p>No help articles found</p>
                    <p className="text-xs">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-stone-900">{item.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">
                              {item.category}
                            </span>
                            {item.tags?.map(tag => (
                              <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-stone-100 text-stone-500 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 text-sm text-stone-600">{item.content}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="p-4 border-t border-stone-100">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm text-stone-600">Can't find what you need?</span>
                  <Button variant="ghost" size="sm" className="ml-auto">
                    Contact Support
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ContextualHelp({ title, content, children }: { title: string; content: ReactNode; children: ReactNode }) {
  return (
    <div className="relative inline-flex">
      {children}
      <HelpTooltip title={title} content={content}>
        <button type="button" className="ml-1.5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100">
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
      </HelpTooltip>
    </div>
  )
}

interface HelpTooltipProps {
  title: string
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const HelpTooltip = ({ title, content, children, position = 'top' }: HelpTooltipProps) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const positions = {
    top: { tooltip: 'bottom-2 left-1/2 -translate-x-1/2', arrow: 'top-full left-1/2 -translate-x-1/2' },
    bottom: { tooltip: 'top-2 left-1/2 -translate-x-1/2', arrow: 'bottom-full left-1/2 -translate-x-1/2' },
    left: { tooltip: 'right-2 top-1/2 -translate-y-1/2', arrow: 'left-full top-1/2 -translate-y-1/2' },
    right: { tooltip: 'left-2 top-1/2 -translate-y-1/2', arrow: 'right-full top-1/2 -translate-y-1/2' },
  }

  const pos = positions[position]

  return (
    <div className="relative inline-flex">
      {children}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="ml-1.5 p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100"
        aria-label="Show help"
        aria-expanded={open}
      >
        <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <div className={`fixed z-[1600] ${pos.tooltip}`}>
            <div className="px-3 py-2.5 text-sm bg-white border border-stone-200 rounded-xl shadow-lg max-w-sm">
              <h4 className="font-medium text-stone-900 mb-1">{title}</h4>
              <div className="text-sm text-stone-600">{content}</div>
            </div>
            <div className={`absolute ${pos.arrow} w-0 h-0 border-4 border-transparent border-b-stone-200`} />
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}