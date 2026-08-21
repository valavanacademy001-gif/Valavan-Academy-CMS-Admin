'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Save, Globe, Mail, Phone, Image } from 'lucide-react'

type Setting = {
  id: string; key: string; value: string | null; label: string | null;
  description: string | null; setting_type: string
}

const SETTING_GROUPS = [
  {
    label: 'General',
    keys: ['academy_name', 'email', 'phone'],
  },
  {
    label: 'Branding',
    keys: ['logo_url', 'favicon_url'],
  },
  {
    label: 'Social Links',
    keys: ['facebook_url', 'instagram_url', 'youtube_url', 'linkedin_url', 'community_url'],
  },
  {
    label: 'Default SEO',
    keys: ['default_seo_title', 'default_seo_description'],
  },
]

export default function SiteSettingsClient({ initialSettings }: { initialSettings: Setting[] }) {
  const [settings, setSettings] = useState(
    Object.fromEntries(initialSettings.map((s) => [s.key, s.value ?? '']))
  )
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const settingMap = Object.fromEntries(initialSettings.map((s) => [s.key, s]))

  const handleChange = (key: string, value: string) => {
    setSettings((p) => ({ ...p, [key]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const updates = Object.entries(settings).map(([key, value]) =>
      supabase.from('site_settings').update({ value, updated_by: user?.id }).eq('key', key)
    )
    await Promise.all(updates)

    setSaving(false)
    setHasChanges(false)
    toast.success('✓ Settings saved successfully')
  }

  const renderInput = (setting: Setting) => {
    const value = settings[setting.key] ?? ''

    if (setting.setting_type === 'image') {
      return (
        <div className="space-y-2">
          <input type="url" value={value} onChange={(e) => handleChange(setting.key, e.target.value)} placeholder="https://... or /assets/..." className="input" />
          {value && (
            <img src={value} alt={setting.label ?? ''} className="w-16 h-16 rounded-lg object-contain border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
        </div>
      )
    }

    if (setting.setting_type === 'url') {
      return <input type="url" value={value} onChange={(e) => handleChange(setting.key, e.target.value)} placeholder="https://..." className="input" />
    }

    if (setting.key.includes('description')) {
      return <textarea rows={3} value={value} onChange={(e) => handleChange(setting.key, e.target.value)} className="input resize-none" />
    }

    return <input type="text" value={value} onChange={(e) => handleChange(setting.key, e.target.value)} className="input" />
  }

  return (
    <div className="space-y-6">
      {SETTING_GROUPS.map((group) => {
        const groupSettings = group.keys
          .map((k) => settingMap[k])
          .filter(Boolean)

        if (groupSettings.length === 0) return null

        return (
          <div key={group.label} className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-100 flex items-center gap-2">
              {group.label === 'Social Links' && <Globe className="w-4 h-4 text-[#1748BB]" />}
              {group.label === 'General' && <Mail className="w-4 h-4 text-[#1748BB]" />}
              {group.label === 'Branding' && <Image className="w-4 h-4 text-[#1748BB]" />}
              {group.label}
            </h2>
            {groupSettings.map((setting) => (
              <div key={setting.key}>
                <label className="label">{setting.label ?? setting.key}</label>
                {setting.description && <p className="text-xs text-gray-400 mb-1">{setting.description}</p>}
                {renderInput(setting)}
              </div>
            ))}
          </div>
        )
      })}

      <div className="card p-4 flex items-center justify-between">
        <span className="text-xs text-gray-400">{hasChanges ? '⚠ Unsaved changes' : '✓ All settings saved'}</span>
        <button onClick={handleSave} disabled={saving || !hasChanges} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
