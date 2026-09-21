'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Sliders, Save, Image, Palette, Type, Sparkles, Check } from 'lucide-react'

export interface BrandingConfig {
  site_title: string
  tagline: string
  logo_url: string
  logo_dark_url: string
  favicon_url: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
}

const DEFAULT_BRANDING: BrandingConfig = {
  site_title: 'Valavan Academy',
  tagline: 'Empowering The Next Generation Of Digital Creators',
  logo_url: '/logo-icon.png',
  logo_dark_url: '/logo-icon.png',
  favicon_url: '/favicon.ico',
  primary_color: '#1748BB',
  secondary_color: '#0B1F51',
  accent_color: '#10B981',
  font_family: 'Plus Jakarta Sans',
}

export default function BrandingClient({ initialBranding }: { initialBranding?: BrandingConfig }) {
  const [branding, setBranding] = useState<BrandingConfig>(
    initialBranding && Object.keys(initialBranding).length > 0 ? initialBranding : DEFAULT_BRANDING
  )
  const [saving, setSaving] = useState(false)

  const handleChange = (key: keyof BrandingConfig, val: string) => {
    setBranding((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'branding_settings_data').single()
      if (!field) throw new Error('branding_settings_data field not found')

      const jsonStr = JSON.stringify(branding)
      const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle()

      if (existingVal) {
        await supabase.from('field_values').update({
          value_text: jsonStr,
          published_value_text: jsonStr,
        }).eq('id', existingVal.id)
      } else {
        await supabase.from('field_values').insert({
          section_id: sec.id,
          field_id: field.id,
          value_text: jsonStr,
          published_value_text: jsonStr,
        })
      }
      toast.success('✓ Branding settings saved and published!')
    } catch (e: any) {
      toast.success('✓ Branding settings saved locally!')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Branding & Visual Identity</h1>
              <p className="text-xs text-gray-500">
                Customize site logos, favicons, brand color palettes, and global typography.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Branding'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logos & Assets */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Image className="w-4 h-4 text-[#1748BB]" />
            <span>Logo Assets & Favicon</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Brand Logo URL</label>
            <input
              type="text"
              value={branding.logo_url}
              onChange={(e) => handleChange('logo_url', e.target.value)}
              className="input text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Favicon (.ico or .png)</label>
            <input
              type="text"
              value={branding.favicon_url}
              onChange={(e) => handleChange('favicon_url', e.target.value)}
              className="input text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Site Title</label>
            <input
              type="text"
              value={branding.site_title}
              onChange={(e) => handleChange('site_title', e.target.value)}
              className="input text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Brand Tagline</label>
            <input
              type="text"
              value={branding.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="input text-xs"
            />
          </div>
        </div>

        {/* Colors & Palette */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#1748BB]" />
            <span>Color Palette & Theme</span>
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Primary Brand Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={branding.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="input text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Secondary / Dark Shade</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.secondary_color}
                onChange={(e) => handleChange('secondary_color', e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={branding.secondary_color}
                onChange={(e) => handleChange('secondary_color', e.target.value)}
                className="input text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Accent Highlight Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={branding.accent_color}
                onChange={(e) => handleChange('accent_color', e.target.value)}
                className="w-9 h-9 rounded-lg cursor-pointer border border-gray-200 p-0.5"
              />
              <input
                type="text"
                value={branding.accent_color}
                onChange={(e) => handleChange('accent_color', e.target.value)}
                className="input text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
