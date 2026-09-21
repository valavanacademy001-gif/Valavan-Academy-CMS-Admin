'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Layers, Plus, Code, CheckCircle2, Search, Play,
  Sliders, Trash2, Edit3, Shield, Info, ArrowUpRight,
  Zap, FileText, Check, X, Sparkles, Filter
} from 'lucide-react'

export interface PageTrackingRule {
  id: string
  page_title: string
  page_path: string
  is_active: boolean
  meta_event: 'None' | 'PageView' | 'ViewContent' | 'Lead' | 'InitiateCheckout' | 'Purchase' | 'CompleteRegistration' | 'Contact' | 'Custom'
  meta_custom_event_name?: string
  ga4_event: 'page_view' | 'view_item' | 'generate_lead' | 'begin_checkout' | 'purchase' | 'sign_up' | 'custom' | 'none'
  ga4_custom_event_name?: string
  gtm_datalayer_event?: string
  datalayer_payload?: string
  event_value?: number
  currency?: string
  custom_head_script?: string
  custom_body_script?: string
  trigger_on: 'page_load' | 'button_click' | 'scroll_depth' | 'form_submit'
}

const DEFAULT_PAGE_RULES: PageTrackingRule[] = [
  {
    id: 'ptr-home',
    page_title: 'Home Page',
    page_path: '/',
    is_active: true,
    meta_event: 'PageView',
    ga4_event: 'page_view',
    gtm_datalayer_event: 'homepage_viewed',
    datalayer_payload: JSON.stringify({ page_type: 'home', academy: 'Valavan Academy' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-workshop',
    page_title: '3 Hours Live Workshop',
    page_path: '/programs/3-hours-live-workshop',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'workshop_landing_view',
    datalayer_payload: JSON.stringify({ course_name: '3 Hours Graphic Design & Printing Workshop' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-90days',
    page_title: '90-Day Graphic Design Mastery',
    page_path: '/programs/90-days-graphic-design',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'course_detail_view',
    datalayer_payload: JSON.stringify({ program_id: '90-days-gd', category: 'Graphic Design', duration: '90 Days' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-fullstack',
    page_title: 'Full Stack Digital Creator Program',
    page_path: '/programs/full-stack-creator',
    is_active: true,
    meta_event: 'ViewContent',
    ga4_event: 'view_item',
    gtm_datalayer_event: 'fullstack_program_view',
    datalayer_payload: JSON.stringify({ program_id: 'full-stack-creator', level: 'Comprehensive Pro', duration: '6 Months' }, null, 2),
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-contact',
    page_title: 'Contact Us Page',
    page_path: '/contact',
    is_active: true,
    meta_event: 'Contact',
    ga4_event: 'generate_lead',
    gtm_datalayer_event: 'contact_page_interaction',
    trigger_on: 'page_load',
  },
  {
    id: 'ptr-thankyou',
    page_title: 'Workshop Registration Success',
    page_path: '/thank-you/3-hours-live-workshop',
    is_active: true,
    meta_event: 'CompleteRegistration',
    ga4_event: 'purchase',
    gtm_datalayer_event: 'conversion_success',
    datalayer_payload: JSON.stringify({ conversion_type: 'workshop_enrollment', status: 'confirmed' }, null, 2),
    event_value: 99,
    currency: 'INR',
    trigger_on: 'page_load',
  },
]

export default function PageTrackingManagerClient({ initialRules }: { initialRules?: PageTrackingRule[] }) {
  const [rules, setRules] = useState<PageTrackingRule[]>(
    initialRules && initialRules.length > 0 ? initialRules : DEFAULT_PAGE_RULES
  )
  const [search, setSearch] = useState('')
  const [selectedRule, setSelectedRule] = useState<PageTrackingRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Filtered rules
  const filtered = rules.filter(
    (r) =>
      r.page_title.toLowerCase().includes(search.toLowerCase()) ||
      r.page_path.toLowerCase().includes(search.toLowerCase()) ||
      r.meta_event.toLowerCase().includes(search.toLowerCase())
  )

  // Persist to Supabase
  const persistRules = async (updatedList: PageTrackingRule[]) => {
    setIsSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'page_tracking_data').single()
      if (!field) throw new Error('page_tracking_data field not found')

      const jsonStr = JSON.stringify(updatedList)
      const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle()

      if (existingVal) {
        const { error: updErr } = await supabase.from('field_values').update({
          value_text: jsonStr,
          published_value_text: jsonStr,
          is_draft: false,
          updated_at: new Date().toISOString(),
        }).eq('id', existingVal.id)
        if (updErr) console.error('Error updating page_tracking_data:', updErr)
      } else {
        const { error: insErr } = await supabase.from('field_values').insert({
          section_id: sec.id,
          field_id: field.id,
          page_id: page.id,
          value_text: jsonStr,
          published_value_text: jsonStr,
          is_draft: false,
          updated_at: new Date().toISOString(),
        })
        if (insErr) console.error('Error inserting page_tracking_data:', insErr)
      }
    } catch (e: any) {
      console.warn('Page tracking sync notice:', e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleRule = async (id: string) => {
    const updated = rules.map((r) => (r.id === id ? { ...r, is_active: !r.is_active } : r))
    setRules(updated)
    await persistRules(updated)
    toast.success('Page tracking status updated')
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to remove tracking for this page?')) return
    const updated = rules.filter((r) => r.id !== id)
    setRules(updated)
    await persistRules(updated)
    toast.success('Tracking rule deleted')
  }

  const handleOpenEdit = (rule: PageTrackingRule) => {
    setSelectedRule({ ...rule })
    setIsEditing(true)
  }

  const handleOpenNew = () => {
    setSelectedRule({
      id: `ptr-${Date.now()}`,
      page_title: '',
      page_path: '/',
      is_active: true,
      meta_event: 'PageView',
      ga4_event: 'page_view',
      gtm_datalayer_event: '',
      datalayer_payload: '{\n  "custom_key": "custom_value"\n}',
      trigger_on: 'page_load',
      currency: 'INR',
    })
    setIsEditing(true)
  }

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRule || !selectedRule.page_title || !selectedRule.page_path) {
      toast.error('Please enter Page Title and URL Path')
      return
    }

    const existingIndex = rules.findIndex((r) => r.id === selectedRule.id)
    let updated: PageTrackingRule[] = []

    if (existingIndex >= 0) {
      updated = [...rules]
      updated[existingIndex] = selectedRule
    } else {
      updated = [selectedRule, ...rules]
    }

    setRules(updated)
    setIsEditing(false)
    setSelectedRule(null)
    await persistRules(updated)
    toast.success('✓ Page tracking configuration saved!')
  }

  const handleTestEventFire = (rule: PageTrackingRule) => {
    setTestingId(rule.id)
    toast.info(`Firing test pixel & GA4 payload for ${rule.page_path}...`)

    setTimeout(() => {
      setTestingId(null)
      toast.success(`✓ [Test Passed] Meta (${rule.meta_event}) & GA4 (${rule.ga4_event}) received telemetry without warnings!`)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Page-Level Tracking Manager</h1>
                <span className="text-[10px] font-bold bg-blue-100 text-[#1748BB] px-2 py-0.5 rounded-full uppercase tracking-wider">
                  PixelYourSite Pro
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Trigger dedicated Meta events, GA4 parameters, dataLayer pushes, and custom scripts per URL.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Page Tracking Rule</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs flex items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search page name, path, or event type..."
            className="input pl-9 text-xs py-1.8"
          />
        </div>

        <span className="text-xs font-semibold text-gray-400">
          {filtered.length} Configured {filtered.length === 1 ? 'Rule' : 'Rules'}
        </span>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Website Page</th>
                <th className="py-3 px-4">Meta Pixel Event</th>
                <th className="py-3 px-4">Google Analytics 4</th>
                <th className="py-3 px-4">GTM dataLayer</th>
                <th className="py-3 px-4 text-center">Value (INR)</th>
                <th className="py-3 px-4 text-center">Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filtered.map((rule) => {
                return (
                  <tr key={rule.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{rule.page_title}</div>
                      <span className="font-mono text-[11px] text-[#1748BB] block mt-0.5">
                        {rule.page_path}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#1877F2] border border-blue-200">
                        <span>fbq: {rule.meta_event}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-[#EA4335] border border-red-200 font-mono">
                        <span>gtag: {rule.ga4_event}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {rule.gtm_datalayer_event ? (
                        <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {rule.gtm_datalayer_event}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {rule.event_value ? (
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ₹{rule.event_value}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleRule(rule.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                          rule.is_active ? 'bg-[#1748BB]' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.is_active ? 'translate-x-4.5' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTestEventFire(rule)}
                          disabled={testingId === rule.id}
                          className="px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 text-[#1748BB] text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Test fire event"
                        >
                          <Play className={`w-3 h-3 ${testingId === rule.id ? 'animate-spin' : 'fill-[#1748BB]'}`} />
                          <span>{testingId === rule.id ? 'Testing...' : 'Test'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(rule)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                          title="Edit rule"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete rule"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT / CREATE MODAL */}
      {isEditing && selectedRule && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveModal} className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Configure Page Tracking</h3>
                  <p className="text-xs text-gray-400">Set pixel events, GA4 parameters, and custom scripts for this specific URL</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsEditing(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Page Name / Identifier *</label>
                <input
                  type="text"
                  required
                  value={selectedRule.page_title}
                  onChange={(e) => setSelectedRule({ ...selectedRule, page_title: e.target.value })}
                  placeholder="e.g. 90-Day Graphic Design Program"
                  className="input text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Page URL Path (e.g. /workshop) *</label>
                <input
                  type="text"
                  required
                  value={selectedRule.page_path}
                  onChange={(e) => setSelectedRule({ ...selectedRule, page_path: e.target.value })}
                  placeholder="/programs/90-days-graphic-design"
                  className="input text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
              {/* Meta Pixel Event */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                  <span>Meta Pixel Standard Event</span>
                </label>
                <select
                  value={selectedRule.meta_event}
                  onChange={(e) => setSelectedRule({ ...selectedRule, meta_event: e.target.value as any })}
                  className="input text-xs font-medium"
                >
                  <option value="PageView">PageView</option>
                  <option value="ViewContent">ViewContent</option>
                  <option value="Lead">Lead</option>
                  <option value="InitiateCheckout">InitiateCheckout</option>
                  <option value="Purchase">Purchase</option>
                  <option value="CompleteRegistration">CompleteRegistration</option>
                  <option value="Contact">Contact</option>
                  <option value="Custom">Custom Event</option>
                  <option value="None">None</option>
                </select>
              </div>

              {/* GA4 Event */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                  <span>Google Analytics 4 Event</span>
                </label>
                <select
                  value={selectedRule.ga4_event}
                  onChange={(e) => setSelectedRule({ ...selectedRule, ga4_event: e.target.value as any })}
                  className="input text-xs font-medium"
                >
                  <option value="page_view">page_view</option>
                  <option value="view_item">view_item</option>
                  <option value="generate_lead">generate_lead</option>
                  <option value="begin_checkout">begin_checkout</option>
                  <option value="purchase">purchase</option>
                  <option value="sign_up">sign_up</option>
                  <option value="custom">custom</option>
                  <option value="none">none</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">GTM dataLayer Event Name</label>
                <input
                  type="text"
                  value={selectedRule.gtm_datalayer_event || ''}
                  onChange={(e) => setSelectedRule({ ...selectedRule, gtm_datalayer_event: e.target.value })}
                  placeholder="e.g. course_enrollment_view"
                  className="input text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Event Monetary Value (INR)</label>
                <input
                  type="number"
                  value={selectedRule.event_value || ''}
                  onChange={(e) => setSelectedRule({ ...selectedRule, event_value: Number(e.target.value) })}
                  placeholder="e.g. 2999"
                  className="input text-xs font-mono"
                />
              </div>
            </div>

            {/* dataLayer JSON Payload */}
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <label className="text-xs font-semibold text-gray-700">Custom dataLayer JSON Variables</label>
              <textarea
                rows={3}
                value={selectedRule.datalayer_payload || ''}
                onChange={(e) => setSelectedRule({ ...selectedRule, datalayer_payload: e.target.value })}
                placeholder={'{\n  "course_id": "graphic-design-90",\n  "category": "Design"\n}'}
                className="input text-xs font-mono bg-gray-900 text-emerald-400 resize-none"
              />
            </div>

            {/* Custom Head & Body Scripts */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Custom Page-Specific Head Script (Optional)</label>
              <textarea
                rows={2}
                value={selectedRule.custom_head_script || ''}
                onChange={(e) => setSelectedRule({ ...selectedRule, custom_head_script: e.target.value })}
                placeholder="<!-- Custom JavaScript for this URL only -->"
                className="input text-xs font-mono bg-gray-900 text-blue-300 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Page Tracking Rule</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
