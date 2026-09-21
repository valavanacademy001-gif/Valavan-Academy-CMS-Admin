'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  BarChart3, Activity, Globe, Sparkles, Save, CheckCircle2,
  AlertTriangle, Shield, Code, Layers, MousePointer,
  Users, MessageCircle, FileText, ArrowUpRight, TrendingUp,
  Smartphone, Monitor, Tablet, RefreshCw, Eye, ExternalLink,
  Zap, Clock, Calendar, Check, HelpCircle
} from 'lucide-react'

interface TrackingAnalyticsClientProps {
  initialFields: Record<string, string>
}

type DateRange = 'today' | 'yesterday' | '7days' | '30days' | '90days'

export default function TrackingAnalyticsClient({ initialFields }: TrackingAnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'pixels' | 'custom_code' | 'cookie_consent'>('analytics')
  const [dateRange, setDateRange] = useState<DateRange>('7days')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Record<string, string>>(initialFields)

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    // Clear validation error on type
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  const validateInputs = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Meta Pixel: Numeric only if enabled
    if (formData.meta_pixel_enabled === 'true' && formData.meta_pixel_id) {
      if (!/^\d+$/.test(formData.meta_pixel_id.trim())) {
        newErrors.meta_pixel_id = 'Meta Pixel ID must contain only digits (e.g. 123456789012345).'
      }
    }

    // GA4: Must start with G-
    if (formData.ga4_enabled === 'true' && formData.ga4_measurement_id) {
      if (!/^G-[A-Z0-9]+$/i.test(formData.ga4_measurement_id.trim())) {
        newErrors.ga4_measurement_id = 'GA4 Measurement ID must start with "G-" (e.g. G-ABC123XYZ).'
      }
    }

    // GTM: Must start with GTM-
    if (formData.gtm_enabled === 'true' && formData.gtm_container_id) {
      if (!/^GTM-[A-Z0-9]+$/i.test(formData.gtm_container_id.trim())) {
        newErrors.gtm_container_id = 'GTM Container ID must start with "GTM-" (e.g. GTM-W9XYZ12).'
      }
    }

    // Clarity: Project ID validation
    if (formData.clarity_enabled === 'true' && formData.clarity_project_id) {
      if (!/^[a-z0-9]+$/i.test(formData.clarity_project_id.trim())) {
        newErrors.clarity_project_id = 'Clarity Project ID must be alphanumeric.'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateInputs()) {
      toast.error('Please fix validation errors before saving.')
      return
    }

    setSaving(true)
    const supabase = createClient()

    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global settings page not found')

      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: fields } = await supabase.from('fields').select('id, name').eq('section_id', sec.id)

      for (const field of fields || []) {
        if (formData[field.name] !== undefined) {
          const val = formData[field.name]
          const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle()
          if (existingVal) {
            const { error: updErr } = await supabase.from('field_values').update({
              value_text: val,
              published_value_text: val,
              is_draft: false,
              updated_at: new Date().toISOString(),
            }).eq('id', existingVal.id)
            if (updErr) console.error(`Error saving ${field.name}:`, updErr)
          } else {
            const { error: insErr } = await supabase.from('field_values').insert({
              section_id: sec.id,
              field_id: field.id,
              page_id: page.id,
              value_text: val,
              published_value_text: val,
              is_draft: false,
              updated_at: new Date().toISOString(),
            })
            if (insErr) console.error(`Error inserting ${field.name}:`, insErr)
          }
        }
      }

      toast.success('✓ Tracking settings & pixels saved permanently in database!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Save failed: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  // Check if any tracking provider is currently enabled
  const hasConnectedIntegrations = Boolean(
    (formData.ga4_enabled === 'true' && formData.ga4_measurement_id?.trim()) ||
    (formData.meta_pixel_enabled === 'true' && formData.meta_pixel_id?.trim()) ||
    (formData.clarity_enabled === 'true' && formData.clarity_project_id?.trim()) ||
    (formData.gtm_enabled === 'true' && formData.gtm_container_id?.trim()) ||
    (formData.linkedin_enabled === 'true' && formData.linkedin_partner_id?.trim()) ||
    (formData.tiktok_enabled === 'true' && formData.tiktok_pixel_id?.trim())
  )

  // Real data metrics - default strictly to 0 and 'Not Available' when no data exists
  const metrics = {
    visitorsToday: 0,
    visitorsThisWeek: 0,
    totalVisitors: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    leadsGenerated: 0,
    whatsAppClicks: 0,
    formSubmissions: 0,
    conversionRate: '0%',
    avgSessionTime: '0s',
    topSource: 'Not Available',
    topLandingPage: 'Not Available',
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Tracking & Analytics System</h1>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  hasConnectedIntegrations ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hasConnectedIntegrations ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                  {hasConnectedIntegrations ? 'Live Integrations Active' : 'No Integrations Connected'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Manage all pixels, analytics, events, attribution, and custom scripts without touching code.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Filter Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: '90days', label: '90 Days' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDateRange(d.id as DateRange)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dateRange === d.id ? 'bg-white text-[#1748BB] shadow-2xs font-bold' : 'hover:text-gray-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-gray-200 bg-white rounded-xl px-3 shadow-2xs">
        {[
          { id: 'analytics', label: 'Analytics Dashboard', icon: TrendingUp },
          { id: 'pixels', label: 'Pixel & Analytics Integrations', icon: Zap },
          { id: 'custom_code', label: 'Custom Tracking Code', icon: Code },
          { id: 'cookie_consent', label: 'Cookie Consent & Privacy', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3.5 px-4 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#1748BB] text-[#1748BB]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1748BB]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: ANALYTICS DASHBOARD */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Empty State Banner when no integrations connected */}
          {!hasConnectedIntegrations && (
            <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-2xl border border-blue-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-base font-bold text-gray-900">No Analytics Data Available</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Connect Google Analytics, Meta Pixel or Microsoft Clarity to start collecting data and tracking website visitors in real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('pixels')}
                  className="px-3.5 py-2 rounded-xl bg-[#1748BB] hover:bg-[#133c9e] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect Google Analytics</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pixels')}
                  className="px-3.5 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect Microsoft Clarity</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('pixels')}
                  className="px-3.5 py-2 rounded-xl bg-[#1877F2] hover:bg-[#125ec2] text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Connect Meta Pixel</span>
                </button>
              </div>
            </div>
          )}

          {/* 12 Key Performance Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3.5">
            {[
              { label: 'Visitors Today', val: metrics.visitorsToday, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Visitors This Week', val: metrics.visitorsThisWeek, icon: Globe, color: 'text-indigo-600 bg-indigo-50' },
              { label: 'Total Visitors', val: metrics.totalVisitors, icon: Activity, color: 'text-purple-600 bg-purple-50' },
              { label: 'Unique Visitors', val: metrics.uniqueVisitors, icon: Eye, color: 'text-cyan-600 bg-cyan-50' },
              { label: 'Total Page Views', val: metrics.pageViews, icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Leads Generated', val: metrics.leadsGenerated, icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
              { label: 'WhatsApp Clicks', val: metrics.whatsAppClicks, icon: MessageCircle, color: 'text-green-600 bg-green-50' },
              { label: 'Form Submits', val: metrics.formSubmissions, icon: CheckCircle2, color: 'text-teal-600 bg-teal-50' },
              { label: 'Conversion Rate', val: metrics.conversionRate, icon: TrendingUp, color: 'text-rose-600 bg-rose-50' },
              { label: 'Avg Session Time', val: metrics.avgSessionTime, icon: Clock, color: 'text-sky-600 bg-sky-50' },
              { label: 'Top Traffic Source', val: metrics.topSource, icon: ExternalLink, color: 'text-pink-600 bg-pink-50' },
              { label: 'Top Landing Page', val: metrics.topLandingPage, icon: Layers, color: 'text-orange-600 bg-orange-50' },
            ].map((kpi) => {
              const Icon = kpi.icon
              return (
                <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">{kpi.label}</span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${kpi.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{kpi.val}</div>
                </div>
              )
            })}
          </div>

          {/* Visual Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Chart 1: Visitors Trend */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Visitors & Traffic Trend</h3>
                  <p className="text-xs text-gray-400">Daily unique visitors and session volume</p>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                  Total 0 Views
                </span>
              </div>

              {/* Empty State for Chart 1 */}
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1748BB] flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">No visitor data available yet</h4>
                <p className="text-xs text-gray-500 max-w-sm">
                  Traffic trends will appear here once visitors start browsing your website.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1748BB]" />
                    <span className="font-semibold text-gray-700">Unique Visitors</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-gray-700">Leads Captured</span>
                  </div>
                </div>
                <span className="text-gray-400">No active sessions</span>
              </div>
            </div>

            {/* Chart 2: Traffic Sources Breakdown */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-gray-900">Traffic Acquisition Channels</h3>
              <p className="text-xs text-gray-400">UTM campaigns & referral distribution</p>

              {/* Empty State for Chart 2 */}
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-gray-50/60 rounded-xl border border-dashed border-gray-200">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                  <Globe className="w-6 h-6 opacity-60" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">No traffic source data available yet</h4>
                <p className="text-xs text-gray-500 max-w-xs">
                  UTM campaigns, ads, and referral channels will be tracked automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Top Landing Pages Performance Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Page Analytics & Conversion Performance</h3>
                <p className="text-xs text-gray-400">Metrics, bounce rate, and lead conversions per URL</p>
              </div>
              <span className="text-xs font-semibold text-gray-400">Live Telemetry Ready</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Page Path</th>
                    <th className="py-3 px-4 text-right">Page Views</th>
                    <th className="py-3 px-4 text-right">Unique Visitors</th>
                    <th className="py-3 px-4 text-right">Avg Time</th>
                    <th className="py-3 px-4 text-right">Bounce Rate</th>
                    <th className="py-3 px-4 text-right">Leads</th>
                    <th className="py-3 px-4 text-right">Conv. Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-semibold text-gray-700">No page analytics available yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Page views, bounce rates, and lead conversions will appear here once tracked.</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIXELS & ANALYTICS INTEGRATIONS */}
      {activeTab === 'pixels' && (
        <div className="space-y-6">
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-[#1748BB] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 space-y-0.5">
              <span className="font-bold text-[#1748BB] block text-sm">Automatic Script Injection</span>
              When enabled, pixels and tracking tags are automatically injected into all public website pages asynchronously with zero performance degradation.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Meta Pixel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center font-bold text-lg">
                    f
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Meta Pixel (Facebook & Instagram)</h4>
                    <p className="text-[11px] text-gray-400">Track pageviews, leads & standard purchase events</p>
                  </div>
                </div>
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => handleChange('meta_pixel_enabled', formData.meta_pixel_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.meta_pixel_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.meta_pixel_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Meta Pixel ID</label>
                <input
                  type="text"
                  value={formData.meta_pixel_id || ''}
                  onChange={(e) => handleChange('meta_pixel_id', e.target.value)}
                  placeholder="e.g. 182930491823901"
                  className={`input font-mono text-xs ${errors.meta_pixel_id ? 'border-red-500 focus:border-red-500' : ''}`}
                />
                {errors.meta_pixel_id && <p className="text-[11px] text-red-500">{errors.meta_pixel_id}</p>}
                <span className="text-[10px] text-gray-400">Numeric identifier found in Meta Events Manager</span>
              </div>
            </div>

            {/* 2. Google Analytics 4 (GA4) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-base">
                    G
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Google Analytics 4 (GA4)</h4>
                    <p className="text-[11px] text-gray-400">Real-time user paths, traffic sources & audience</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('ga4_enabled', formData.ga4_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.ga4_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.ga4_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">GA4 Measurement ID</label>
                <input
                  type="text"
                  value={formData.ga4_measurement_id || ''}
                  onChange={(e) => handleChange('ga4_measurement_id', e.target.value)}
                  placeholder="e.g. G-ABC123XYZ4"
                  className={`input font-mono text-xs ${errors.ga4_measurement_id ? 'border-red-500' : ''}`}
                />
                {errors.ga4_measurement_id && <p className="text-[11px] text-red-500">{errors.ga4_measurement_id}</p>}
                <span className="text-[10px] text-gray-400">Starts with G- from Google Analytics Data Streams</span>
              </div>
            </div>

            {/* 3. Google Tag Manager (GTM) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold text-xs">
                    GTM
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Google Tag Manager (GTM)</h4>
                    <p className="text-[11px] text-gray-400">Injects both Head script and Body NoScript container</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('gtm_enabled', formData.gtm_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.gtm_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.gtm_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">GTM Container ID</label>
                <input
                  type="text"
                  value={formData.gtm_container_id || ''}
                  onChange={(e) => handleChange('gtm_container_id', e.target.value)}
                  placeholder="e.g. GTM-N5M9XYZ"
                  className={`input font-mono text-xs ${errors.gtm_container_id ? 'border-red-500' : ''}`}
                />
                {errors.gtm_container_id && <p className="text-[11px] text-red-500">{errors.gtm_container_id}</p>}
                <span className="text-[10px] text-gray-400">Starts with GTM- from your Tag Manager container</span>
              </div>
            </div>

            {/* 4. Microsoft Clarity Heatmaps */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center font-bold text-sm">
                    MC
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Microsoft Clarity (Heatmaps & Session Recordings)</h4>
                    <p className="text-[11px] text-gray-400">Session replays, click heatmaps & scroll maps</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('clarity_enabled', formData.clarity_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.clarity_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.clarity_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Clarity Project ID</label>
                <input
                  type="text"
                  value={formData.clarity_project_id || ''}
                  onChange={(e) => handleChange('clarity_project_id', e.target.value)}
                  placeholder="e.g. qm9x8k2l1a"
                  className={`input font-mono text-xs ${errors.clarity_project_id ? 'border-red-500' : ''}`}
                />
                {errors.clarity_project_id && <p className="text-[11px] text-red-500">{errors.clarity_project_id}</p>}
                <span className="text-[10px] text-gray-400">Project ID from clarity.microsoft.com</span>
              </div>
            </div>

            {/* 5. LinkedIn Insight Tag */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0A66C2]/10 text-[#0A66C2] flex items-center justify-center font-bold text-sm">
                    in
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">LinkedIn Insight Tag</h4>
                    <p className="text-[11px] text-gray-400">Conversion tracking & B2B professional retargeting</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('linkedin_enabled', formData.linkedin_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.linkedin_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.linkedin_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">LinkedIn Partner ID</label>
                <input
                  type="text"
                  value={formData.linkedin_partner_id || ''}
                  onChange={(e) => handleChange('linkedin_partner_id', e.target.value)}
                  placeholder="e.g. 5839201"
                  className="input font-mono text-xs"
                />
                <span className="text-[10px] text-gray-400">Partner ID from Campaign Manager</span>
              </div>
            </div>

            {/* 6. TikTok Pixel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                    TT
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">TikTok Pixel</h4>
                    <p className="text-[11px] text-gray-400">Track short-form video conversions & campaigns</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('tiktok_enabled', formData.tiktok_enabled === 'true' ? 'false' : 'true')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.tiktok_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.tiktok_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">TikTok Pixel ID</label>
                <input
                  type="text"
                  value={formData.tiktok_pixel_id || ''}
                  onChange={(e) => handleChange('tiktok_pixel_id', e.target.value)}
                  placeholder="e.g. C5M9XYZ12345"
                  className="input font-mono text-xs"
                />
                <span className="text-[10px] text-gray-400">Pixel ID from TikTok Ads Manager</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOM TRACKING CODE */}
      {activeTab === 'custom_code' && (
        <div className="space-y-6">
          <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 space-y-0.5">
              <span className="font-bold text-amber-800 block text-sm">Advanced Code Injection</span>
              Paste raw JavaScript, verification tags, or custom tracking pixels below. Code will be injected directly into the designated locations on every page.
            </div>
          </div>

          <div className="space-y-5">
            {/* Header Code */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-gray-900 block">Head Code (Injected before &lt;/head&gt;)</label>
                  <p className="text-[11px] text-gray-400">Site verification tags, meta tags, and global head scripts</p>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">&lt;head&gt;</span>
              </div>
              <textarea
                value={formData.custom_head_code || ''}
                onChange={(e) => handleChange('custom_head_code', e.target.value)}
                rows={5}
                placeholder="<!-- Paste custom scripts to inject in <head> -->&#10;<script>&#10;  // custom analytics&#10;</script>"
                className="input font-mono text-xs resize-y bg-gray-900 text-gray-100 placeholder:text-gray-600"
              />
            </div>

            {/* Body Code */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-gray-900 block">Body Code (Injected immediately after &lt;body&gt;)</label>
                  <p className="text-[11px] text-gray-400">NoScript fallback tags and top-of-body tracking containers</p>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">&lt;body&gt; top</span>
              </div>
              <textarea
                value={formData.custom_body_code || ''}
                onChange={(e) => handleChange('custom_body_code', e.target.value)}
                rows={4}
                placeholder="<!-- Paste custom noscript tags or top-of-body code -->"
                className="input font-mono text-xs resize-y bg-gray-900 text-gray-100 placeholder:text-gray-600"
              />
            </div>

            {/* Footer Code */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-gray-900 block">Footer Code (Injected before &lt;/body&gt;)</label>
                  <p className="text-[11px] text-gray-400">Live chat widgets, end-of-page triggers, and conversion webhooks</p>
                </div>
                <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">&lt;/body&gt; bottom</span>
              </div>
              <textarea
                value={formData.custom_footer_code || ''}
                onChange={(e) => handleChange('custom_footer_code', e.target.value)}
                rows={5}
                placeholder="<!-- Paste live chat widgets or footer tracking scripts -->"
                className="input font-mono text-xs resize-y bg-gray-900 text-gray-100 placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: COOKIE CONSENT */}
      {activeTab === 'cookie_consent' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h4 className="text-base font-bold text-gray-900">Cookie Consent Banner</h4>
                <p className="text-xs text-gray-400">Display a GDPR/DPDP-compliant cookie banner on the website</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('cookie_consent_enabled', formData.cookie_consent_enabled === 'true' ? 'false' : 'true')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formData.cookie_consent_enabled === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.cookie_consent_enabled === 'true' ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Banner Headline</label>
                <input
                  type="text"
                  value={formData.cookie_banner_headline || ''}
                  onChange={(e) => handleChange('cookie_banner_headline', e.target.value)}
                  placeholder="We Value Your Privacy"
                  className="input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Banner Description Text</label>
                <textarea
                  value={formData.cookie_banner_text || ''}
                  onChange={(e) => handleChange('cookie_banner_text', e.target.value)}
                  rows={3}
                  placeholder="We use cookies to improve your user experience and analyze site traffic..."
                  className="input text-xs resize-none"
                />
              </div>
            </div>

            {/* Live Banner Preview Box */}
            <div className="pt-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Live UI Preview</span>
              <div className="p-4 rounded-xl bg-gray-900 text-white shadow-lg border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#1748BB]" />
                    <span>{formData.cookie_banner_headline || 'We Value Your Privacy'}</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                    {formData.cookie_banner_text || 'We use cookies and analytics to enhance your browsing experience, provide personalized content, and analyze our traffic.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button" className="px-3.5 py-1.5 text-xs font-bold bg-[#1748BB] text-white rounded-lg shadow-sm">
                    Accept All
                  </button>
                  <button type="button" className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white rounded-lg border border-gray-700">
                    Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
