'use client'

import { useState } from 'react'
import { adminApi, useAsyncData, Modal, Field, inputCls, Err, Badge } from '@/components/admin/ui'
import { MediaThumb } from '@/components/media/MediaViewer'
import { Loader2, Plus, X, Image as ImageIcon, Film, Edit2, Trash2, ChevronUp, ChevronDown, Star, LayoutDashboard, ShoppingBag, Home, ImagePlus, Link2, Save, Eye, EyeOff } from 'lucide-react'
import PageBackgroundManager from '@/components/admin/PageBackgroundManager'

const PAGES = [
  { id: 'home', label: 'Homepage', icon: Home, sections: ['hero', 'cottages', 'experiences', 'marketplace-preview'] },
  { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, sections: ['hero', 'experiences', 'products'] },
  { id: 'booking', label: 'Booking', icon: LayoutDashboard, sections: ['hero', 'form'] },
]

export default function AdminPageBackgroundsPage() {
  const [activeTab, setActiveTab] = useState('manage')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Page Backgrounds</h2>
        <p className="text-stone-500 text-sm">
          Manage multimedia backgrounds (images, videos, external links) for each page section.
        </p>
      </div>

      <div className="flex gap-2 bg-stone-100 rounded-xl p-1" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'manage'}
          onClick={() => setActiveTab('manage')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'manage'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Manage Backgrounds
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'preview'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Preview
        </button>
      </div>

      {activeTab === 'manage' && <PageBackgroundManager />}
      {activeTab === 'preview' && <PreviewTab />}
    </div>
  )
}

function PreviewTab() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-8">
      <h3 className="text-lg font-bold flex items-center gap-2">
        <Eye className="w-5 h-5 text-emerald-600" /> Live Preview
      </h3>
      <p className="text-stone-500">
        Click any page to preview how backgrounds will appear on the live site.
      </p>
      <div className="grid md:grid-cols-3 gap-4">
        {PAGES.map((page) => (
          <div key={page.id} className="border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gradient-to-br from-emerald-900 via-teal-800 to-stone-900 flex items-center justify-center">
              <page.icon className="w-16 h-16 text-emerald-300" />
            </div>
            <div className="p-4">
              <h4 className="font-bold text-lg">{page.label}</h4>
              <p className="text-sm text-stone-500 mt-1">
                Sections: {page.sections.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')}
              </p>
              <div className="mt-3 flex gap-2">
                <a
                  href={`/${page.id === 'home' ? '' : page.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                >
                  <Eye className="w-4 h-4 mx-auto" /> View Live
                </a>
                <button className="px-4 py-2 rounded-lg border border-stone-300 text-stone-600 hover:bg-stone-50">
                  <ImagePlus className="w-4 h-4 mx-auto" /> Add BG
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}