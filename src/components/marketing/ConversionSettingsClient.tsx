'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Target, Save, Link as LinkIcon, ExternalLink, Sparkles,
  CheckCircle2, RefreshCw, MessageSquare, BookOpen, CreditCard,
  Layers, Lock, Eye, AlertCircle
} from 'lucide-react'

export interface ProgramConversionConfig {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  payment_url: string
  thank_you_url: string
  whatsapp_group_url: string
  course_access_url: string
  is_active: boolean
  description?: string
}

export const DEFAULT_PROGRAM_CONVERSIONS: ProgramConversionConfig[] = [
  {
    id: '90-days-graphic-design',
    name: '90-Day Graphic Design Mastery',
    slug: '90-days-graphic-design',
    price: 4999,
    currency: 'INR',
    payment_url: 'https://pages.razorpay.com/pl_SuHNtUTy7rhIe0/view',
    thank_you_url: '/thank-you/90-days-graphic-design',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Comprehensive 90-day practical design course with live mentorship and career portfolio.',
  },
  {
    id: '3-hours-live-workshop',
    name: '3 Hours Live Graphic Design Workshop',
    slug: '3-hours-live-workshop',
    price: 199,
    currency: 'INR',
    payment_url: 'https://rzp.io/rzp/e9OpaQTo',
    thank_you_url: '/thank-you/3-hours-live-workshop',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Live 3-hour printing, flex design, and high-margin client acquisition masterclass.',
  },
  {
    id: 'full-stack-creator',
    name: 'Full Stack Digital Creator Program',
    slug: 'full-stack-creator',
    price: 14999,
    currency: 'INR',
    payment_url: 'https://rzp.io/rzp/v8ykjCk',
    thank_you_url: '/thank-you/full-stack-creator',
    whatsapp_group_url: 'https://chat.whatsapp.com/JfBplPD1MisAt0RMgrylRj',
    course_access_url: 'https://learn.valavanacademy.com/clientapp/login',
    is_active: true,
    description: 'Elite 6-month creator incubator covering design, 4K video editing, web, and monetization.',
  },
]

interface ConversionSettingsClientProps {
  initialSettings?: ProgramConversionConfig[]
}

export default function ConversionSettingsClient({
  initialSettings = DEFAULT_PROGRAM_CONVERSIONS,
}: ConversionSettingsClientProps) {
  const [programs, setPrograms] = useState<ProgramConversionConfig[]>(
    initialSettings && initialSettings.length > 0 ? initialSettings : DEFAULT_PROGRAM_CONVERSIONS
  )
  const [saving, setSaving] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<string>(
    initialSettings[0]?.slug || '90-days-graphic-design'
  )

  const activeProgram = programs.find((p) => p.slug === selectedProgram) || programs[0]

  const handleFieldChange = (field: keyof ProgramConversionConfig, value: any) => {
    setPrograms((prev) =>
      prev.map((p) => {
        if (p.slug === activeProgram.slug) {
          return { ...p, [field]: value }
        }
        return p
      })
    )
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global settings page not found')

      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking analytics section not found')

      let { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'program_conversion_settings').maybeSingle()
      if (!field) {
        const { data: newF, error: fErr } = await supabase.from('fields').insert({
          section_id: sec.id,
          name: 'program_conversion_settings',
          label: 'Program Conversion Settings',
          field_type: 'json',
          sort_order: 30,
        }).select('id').single()
        if (fErr) throw fErr
        field = newF
      }

      if (field) {
        const jsonStr = JSON.stringify(programs, null, 2)
        const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle()

        if (existingVal) {
          await supabase.from('field_values').update({
            value_text: jsonStr,
            published_value_text: jsonStr,
            is_draft: false,
            updated_at: new Date().toISOString(),
          }).eq('id', existingVal.id)
        } else {
          await supabase.from('field_values').insert({
            page_id: page.id,
            section_id: sec.id,
            field_id: field.id,
            value_text: jsonStr,
            published_value_text: jsonStr,
            is_draft: false,
          })
        }
      }

      toast.success('✓ Program Conversion Settings & Payment links saved permanently!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Failed to save: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Program Conversion Settings</h1>
              <p className="text-xs text-gray-500">
                Manage dynamic Razorpay payment links, WhatsApp group redirects, and thank-you pages.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Program Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {programs.map((prog) => {
          const isSelected = prog.slug === activeProgram.slug
          return (
            <button
              key={prog.slug}
              type="button"
              onClick={() => setSelectedProgram(prog.slug)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-[#1748BB] ring-2 ring-blue-100 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  prog.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {prog.is_active ? 'Active' : 'Disabled'}
                </span>
                <span className="text-xs font-bold text-gray-900">₹{prog.price.toLocaleString()}</span>
              </div>
              <h4 className="text-sm font-bold text-gray-900 leading-snug">{prog.name}</h4>
              <p className="text-[11px] text-gray-400 font-mono mt-1">/programs/{prog.slug}</p>
            </button>
          )
        })}
      </div>

      {/* Active Program Configuration Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-gray-900">{activeProgram.name}</h3>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                {activeProgram.slug}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              These settings control what happens after a lead fills the pre-payment form.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-gray-700">Program Active</span>
            <input
              type="checkbox"
              checked={activeProgram.is_active}
              onChange={(e) => handleFieldChange('is_active', e.target.checked)}
              className="w-4 h-4 rounded text-[#1748BB] focus:ring-[#1748BB]"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Program Display Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Program Name</label>
            <input
              type="text"
              value={activeProgram.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
          </div>

          {/* Standard Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Program Price (₹ INR)</label>
            <input
              type="number"
              value={activeProgram.price}
              onChange={(e) => handleFieldChange('price', Number(e.target.value))}
              className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
          </div>

          {/* Razorpay Payment Link */}
          <div className="md:col-span-2 space-y-1.5 bg-blue-50/40 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1748BB] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Razorpay Payment Page URL <span className="text-red-500">*</span></span>
              </label>
              <a
                href={activeProgram.payment_url}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#1748BB] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Test Payment Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="url"
              value={activeProgram.payment_url}
              onChange={(e) => handleFieldChange('payment_url', e.target.value)}
              placeholder="https://pages.razorpay.com/pl_.../view"
              className="w-full px-3.5 py-2 text-xs font-mono border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
            <p className="text-[11px] text-gray-500">
              User will be automatically redirected to this link right after submitting the Lead Capture Form.
            </p>
          </div>

          {/* Thank You Page URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thank You Page URL</span>
            </label>
            <input
              type="text"
              value={activeProgram.thank_you_url}
              onChange={(e) => handleFieldChange('thank_you_url', e.target.value)}
              placeholder="/thank-you/90-days-graphic-design"
              className="w-full px-3.5 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
          </div>

          {/* WhatsApp Group Link */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Community / Group Invite URL</span>
            </label>
            <input
              type="url"
              value={activeProgram.whatsapp_group_url}
              onChange={(e) => handleFieldChange('whatsapp_group_url', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3.5 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
          </div>

          {/* Course Access Link */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Course Access Link / LMS Login Portal</span>
            </label>
            <input
              type="url"
              value={activeProgram.course_access_url}
              onChange={(e) => handleFieldChange('course_access_url', e.target.value)}
              placeholder="https://learn.valavanacademy.com/clientapp/login"
              className="w-full px-3.5 py-2 text-xs font-mono border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
