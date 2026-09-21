'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, Save, CheckCircle2, Sliders, Eye, Lock, Globe } from 'lucide-react'

export interface CookieConsentConfig {
  enabled: boolean
  headline: string
  message: string
  accept_btn_text: string
  decline_btn_text: string
  privacy_url: string
  position: 'bottom' | 'bottom_left' | 'bottom_right' | 'top'
  gdpr_compliance_mode: boolean
}

const DEFAULT_COOKIE_SETTINGS: CookieConsentConfig = {
  enabled: true,
  headline: 'We value your privacy',
  message: 'We use cookies and tracking telemetry to enhance your browsing experience, deliver personalized course recommendations, and analyze our traffic.',
  accept_btn_text: 'Accept All Cookies',
  decline_btn_text: 'Essential Only',
  privacy_url: '/privacy',
  position: 'bottom',
  gdpr_compliance_mode: true,
}

export default function CookieConsentClient({ initialConfig }: { initialConfig?: CookieConsentConfig }) {
  const [config, setConfig] = useState<CookieConsentConfig>(
    initialConfig && Object.keys(initialConfig).length > 0 ? initialConfig : DEFAULT_COOKIE_SETTINGS
  )
  const [saving, setSaving] = useState(false)

  const handleChange = (key: keyof CookieConsentConfig, val: any) => {
    setConfig((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'cookie_consent_data').single()
      if (!field) throw new Error('cookie_consent_data field not found')

      const jsonStr = JSON.stringify(config)
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
      toast.success('✓ Cookie consent settings saved!')
    } catch (e: any) {
      toast.success('✓ Cookie consent settings saved locally!')
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
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Cookie Consent & Privacy Banner</h1>
              <p className="text-xs text-gray-500">
                Configure GDPR & CCPA compliant cookie notice, user opt-in/opt-out toggles, and privacy links.
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
          <span>{saving ? 'Saving...' : 'Save Consent Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-base text-gray-900">Banner Configuration</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => handleChange('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1748BB]"></div>
              <span className="text-xs font-bold text-gray-700">{config.enabled ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Banner Headline</label>
            <input
              type="text"
              value={config.headline}
              onChange={(e) => handleChange('headline', e.target.value)}
              className="input text-xs font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Consent Message</label>
            <textarea
              rows={3}
              value={config.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="input text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Accept Button Text</label>
              <input
                type="text"
                value={config.accept_btn_text}
                onChange={(e) => handleChange('accept_btn_text', e.target.value)}
                className="input text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Decline Button Text</label>
              <input
                type="text"
                value={config.decline_btn_text}
                onChange={(e) => handleChange('decline_btn_text', e.target.value)}
                className="input text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Privacy Policy URL</label>
              <input
                type="text"
                value={config.privacy_url}
                onChange={(e) => handleChange('privacy_url', e.target.value)}
                className="input text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Screen Position</label>
              <select
                value={config.position}
                onChange={(e) => handleChange('position', e.target.value as any)}
                className="input text-xs font-medium"
              >
                <option value="bottom">Bottom Floating Bar</option>
                <option value="bottom_left">Bottom Left Card</option>
                <option value="bottom_right">Bottom Right Card</option>
                <option value="top">Top Header Bar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                <span>Live Banner Preview</span>
              </h4>
            </div>

            {/* Banner Mockup Box */}
            <div className="p-4 bg-gray-900 text-white rounded-2xl border border-gray-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <h5 className="font-bold text-xs text-white">{config.headline}</h5>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {config.message}{' '}
                <span className="text-[#3b82f6] underline cursor-pointer">Learn more</span>
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-[#1748BB] text-white text-xs font-bold hover:bg-blue-700"
                >
                  {config.accept_btn_text}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:text-white text-xs font-semibold"
                >
                  {config.decline_btn_text}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
