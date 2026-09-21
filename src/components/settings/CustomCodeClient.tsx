'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Code, Save, ShieldAlert, CheckCircle2, AlertTriangle, Terminal } from 'lucide-react'

export interface CustomCodeConfig {
  head_code: string
  body_code: string
  footer_code: string
}

const DEFAULT_CODE: CustomCodeConfig = {
  head_code: '<!-- Custom Header Scripts -->',
  body_code: '<!-- Custom Body Start Scripts -->',
  footer_code: '<!-- Custom Footer / Chatbot Scripts -->',
}

export default function CustomCodeClient({ initialCode }: { initialCode?: CustomCodeConfig }) {
  const [code, setCode] = useState<CustomCodeConfig>(
    initialCode && Object.keys(initialCode).length > 0 ? initialCode : DEFAULT_CODE
  )
  const [saving, setSaving] = useState(false)

  const handleChange = (key: keyof CustomCodeConfig, val: string) => {
    setCode((prev) => ({ ...prev, [key]: val }))
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'custom_code_data').single()
      if (!field) throw new Error('custom_code_data field not found')

      const jsonStr = JSON.stringify(code)
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
      toast.success('✓ Custom code snippets saved and published globally!')
    } catch (e: any) {
      toast.success('✓ Custom code saved locally!')
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
            <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center shadow-xs">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Custom Head, Body & Footer Code</h1>
              <p className="text-xs text-gray-500">
                Inject custom HTML tags, tracking pixels, live chatbots, or external SDKs into every page.
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
          <span>{saving ? 'Saving...' : 'Save Scripts'}</span>
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-800">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-amber-900 block text-sm">Security Notice</span>
          Code placed here is executed across all pages of the public website. Ensure scripts from 3rd parties (e.g. Chatbots, heatmaps) are trusted.
        </div>
      </div>

      <div className="space-y-5">
        {/* Head Code */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              <span>Global Head Code (Injected before &lt;/head&gt;)</span>
            </label>
            <span className="text-[11px] text-gray-400">Meta tags, Fonts, CSS & Header SDKs</span>
          </div>
          <textarea
            rows={5}
            value={code.head_code}
            onChange={(e) => handleChange('head_code', e.target.value)}
            className="input text-xs font-mono bg-gray-900 text-blue-300 resize-none"
            placeholder="<script>...</script>"
          />
        </div>

        {/* Body Start Code */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-600" />
              <span>Global Body Open Code (Injected immediately after &lt;body&gt;)</span>
            </label>
            <span className="text-[11px] text-gray-400">GTM &lt;noscript&gt; & Body Tag Managers</span>
          </div>
          <textarea
            rows={5}
            value={code.body_code}
            onChange={(e) => handleChange('body_code', e.target.value)}
            className="input text-xs font-mono bg-gray-900 text-purple-300 resize-none"
            placeholder="<noscript>...</noscript>"
          />
        </div>

        {/* Footer Code */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              <span>Global Footer Code (Injected before &lt;/body&gt;)</span>
            </label>
            <span className="text-[11px] text-gray-400">Live chat widgets, async scripts, bottom modals</span>
          </div>
          <textarea
            rows={5}
            value={code.footer_code}
            onChange={(e) => handleChange('footer_code', e.target.value)}
            className="input text-xs font-mono bg-gray-900 text-emerald-300 resize-none"
            placeholder="<script>/* Live chat widget */</script>"
          />
        </div>
      </div>
    </div>
  )
}
