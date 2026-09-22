'use client'

import { useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Users, Search, Filter, Download, Plus, Eye,
  Phone, Mail, Calendar, Sparkles, ExternalLink,
  MessageCircle, Tag, CheckCircle2, Clock, X,
  FileSpreadsheet, ArrowUpRight, ChevronRight, Edit3, Trash2,
  Briefcase, Save, RefreshCw, Layers, Check, HelpCircle,
  TrendingUp, Shield, AlertCircle, PhoneCall
} from 'lucide-react'

export interface LeadItem {
  id: string
  name: string
  age?: number | string | null
  phone: string
  email?: string
  occupation?: string
  program_interested: string
  program_slug?: string
  source: string
  status:
    | 'New Lead'
    | 'Contacted'
    | 'Interested'
    | 'Follow Up'
    | 'Payment Pending'
    | 'Purchased'
    | 'Not Interested'
    | 'Lost'
    | string
  sales_notes?: string
  assigned_to?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  landing_page?: string
  referrer?: string
  visitor_id?: string
  session_id?: string
  device?: string
  browser?: string
  country?: string
  ip?: string
  created_at: string
}

export const LEAD_STATUS_OPTIONS = [
  'New Lead',
  'Contacted',
  'Interested',
  'Follow Up',
  'Payment Pending',
  'Purchased',
  'Not Interested',
  'Lost',
]

export const OCCUPATION_OPTIONS = [
  'Student',
  'Working Professional',
  'Business Owner',
  'Freelancer',
  'House Wife',
]

export const QUICK_NOTE_PRESETS = [
  'Will join next month',
  'Asked for details on WhatsApp',
  'Discussion completed, ready to pay',
  'Needs EMI / Installment options',
  'Call back tomorrow evening',
  'No response after 2 attempts',
  'Interested in Full Stack Creator instead',
]

export default function LeadsAttributionClient({ initialLeads }: { initialLeads: LeadItem[] }) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads || [])
  const [activeProgramTab, setActiveProgramTab] = useState<'All' | 'workshop' | '90days' | 'fullstack'>('All')
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedOccupation, setSelectedOccupation] = useState<string>('All')
  const [dateRangeFilter, setDateRangeFilter] = useState<'All' | 'today' | 'yesterday' | '7days' | '30days'>('All')

  // Modals & Active Lead Selection
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [notesModalLead, setNotesModalLead] = useState<LeadItem | null>(null)
  const [currentNotesDraft, setCurrentNotesDraft] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // New Manual Lead Form State
  const [newLead, setNewLead] = useState<Partial<LeadItem>>({
    name: '',
    age: '',
    phone: '',
    email: '',
    occupation: 'Student',
    program_interested: '90-Day Graphic Design Mastery',
    program_slug: '90-days-graphic-design',
    source: 'Manual / Direct Inquiry',
    status: 'New Lead',
    sales_notes: '',
    assigned_to: 'Admin',
    utm_source: 'Direct',
    utm_medium: 'Manual',
    utm_campaign: '',
  })

  // Synchronize leads array to Supabase field_values
  const persistLeads = async (updatedList: LeadItem[], successMsg?: string) => {
    setIsSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global settings page not found')

      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking analytics section not found')

      let { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'leads_data').maybeSingle()
      if (!field) {
        const { data: newF } = await supabase.from('fields').insert({
          section_id: sec.id,
          name: 'leads_data',
          label: 'Leads Data',
          field_type: 'json',
          sort_order: 21,
        }).select('id').single()
        field = newF
      }

      if (field) {
        const jsonStr = JSON.stringify(updatedList, null, 2)
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

      setLeads(updatedList)
      if (successMsg) toast.success(successMsg)
    } catch (e: any) {
      console.error('Error saving leads:', e)
      toast.error(`Database sync error: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Refresh latest leads from Supabase
  const refreshLeads = useCallback(async (showToast = true) => {
    setIsRefreshing(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
      if (page) {
        const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
        if (sec) {
          const { data: fieldVals } = await supabase
            .from('field_values')
            .select('*, field:fields(name)')
            .eq('section_id', sec.id)

          const fv = fieldVals?.find((f: any) => f.field?.name === 'leads_data')

          if (fv) {
            const raw = fv.published_value_text || fv.value_text
            if (raw) {
              setLeads(JSON.parse(raw))
              if (showToast) toast.success('✓ Leads refreshed with latest entries!')
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed refreshing leads:', err)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  // Status badge styling helper
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Purchased':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Interested':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Follow Up':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Payment Pending':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'Contacted':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'Not Interested':
      case 'Lost':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'New Lead':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
    }
  }

  // Program badge styling helper
  const getProgramBadge = (prog: string) => {
    const p = (prog || '').toLowerCase()
    if (p.includes('workshop') || p.includes('3-hour') || p.includes('3 hour')) {
      return { label: '3-Hour Workshop', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (p.includes('full-stack') || p.includes('creator')) {
      return { label: 'Full Stack Creator', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    }
    return { label: '90-Day Mastery', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
  }

  // Handle inline status change
  const handleStatusChange = async (leadId: string, newStatus: string) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    await persistLeads(updated, `Status updated to "${newStatus}"`)
  }

  // Open Notes Modal
  const openNotesModal = (lead: LeadItem) => {
    setNotesModalLead(lead)
    setCurrentNotesDraft(lead.sales_notes || '')
  }

  // Save Notes Modal
  const saveNotesModal = async () => {
    if (!notesModalLead) return
    const updated = leads.map((l) => (l.id === notesModalLead.id ? { ...l, sales_notes: currentNotesDraft.trim() } : l))
    await persistLeads(updated, 'Sales notes saved successfully!')
    setNotesModalLead(null)
  }

  // Handle Delete Lead
  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this lead?')) return
    const updated = leads.filter((l) => l.id !== leadId)
    await persistLeads(updated, 'Lead deleted permanently')
    if (selectedLead?.id === leadId) setSelectedLead(null)
  }

  // Handle Create Manual Lead
  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLead.name || !newLead.phone) {
      toast.error('Name and Phone number are required')
      return
    }

    const leadToInsert: LeadItem = {
      id: 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7),
      name: newLead.name.trim(),
      age: newLead.age ? Number(newLead.age) : null,
      phone: newLead.phone.trim(),
      email: (newLead.email || '').trim().toLowerCase(),
      occupation: newLead.occupation || 'Student',
      program_interested: newLead.program_interested || '90-Day Graphic Design Mastery',
      program_slug: newLead.program_slug || '90-days-graphic-design',
      source: newLead.source || 'Manual Lead',
      status: (newLead.status as any) || 'New Lead',
      sales_notes: (newLead.sales_notes || '').trim(),
      assigned_to: newLead.assigned_to || 'Admin',
      utm_source: newLead.utm_source || 'Direct',
      utm_medium: newLead.utm_medium || 'Manual',
      utm_campaign: newLead.utm_campaign || '',
      created_at: new Date().toISOString(),
    }

    const updated = [leadToInsert, ...leads]
    await persistLeads(updated, '✓ New lead captured successfully!')
    setShowAddModal(false)
    setNewLead({
      name: '',
      age: '',
      phone: '',
      email: '',
      occupation: 'Student',
      program_interested: '90-Day Graphic Design Mastery',
      program_slug: '90-days-graphic-design',
      source: 'Manual / Direct Inquiry',
      status: 'New Lead',
      sales_notes: '',
      assigned_to: 'Admin',
    })
  }

  // -------------------------------------------------------------
  // Filter & Search Calculations
  // -------------------------------------------------------------
  const { filteredLeads, counts, kpis } = useMemo(() => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
    const endOfYesterday = startOfToday - 1
    const startOfWeek = now.getTime() - 7 * 24 * 60 * 60 * 1000
    const startOfMonth = now.getTime() - 30 * 24 * 60 * 60 * 1000

    let cutoffStart = 0
    let cutoffEnd = Infinity

    if (dateRangeFilter === 'today') {
      cutoffStart = startOfToday
    } else if (dateRangeFilter === 'yesterday') {
      cutoffStart = startOfYesterday
      cutoffEnd = endOfYesterday
    } else if (dateRangeFilter === '7days') {
      cutoffStart = startOfWeek
    } else if (dateRangeFilter === '30days') {
      cutoffStart = startOfMonth
    }

    // Program Filter Helper
    const matchesProgram = (l: LeadItem, tab: string) => {
      if (tab === 'All') return true
      const p = (l.program_interested || l.program_slug || '').toLowerCase()
      if (tab === 'workshop') return p.includes('workshop') || p.includes('3-hour') || p.includes('3 hour')
      if (tab === '90days') return p.includes('90-day') || p.includes('90 day') || p.includes('graphic design')
      if (tab === 'fullstack') return p.includes('full-stack') || p.includes('creator')
      return true
    }

    const fLeads = leads.filter((l) => {
      // 1. Program tab
      if (!matchesProgram(l, activeProgramTab)) return false

      // 2. Search
      const searchTarget = `${l.name} ${l.phone} ${l.email || ''} ${l.sales_notes || ''} ${l.utm_source || ''}`.toLowerCase()
      if (search && !searchTarget.includes(search.toLowerCase())) return false

      // 3. Status
      if (selectedStatus !== 'All' && l.status !== selectedStatus) return false

      // 4. Occupation
      if (selectedOccupation !== 'All' && l.occupation !== selectedOccupation) return false

      // 5. Date
      const t = new Date(l.created_at).getTime()
      if (t < cutoffStart || t > cutoffEnd) return false

      return true
    })

    // Program Counts
    const programCounts = {
      all: leads.length,
      workshop: leads.filter((l) => matchesProgram(l, 'workshop')).length,
      gd90: leads.filter((l) => matchesProgram(l, '90days')).length,
      fullstack: leads.filter((l) => matchesProgram(l, 'fullstack')).length,
    }

    // KPIs
    const todayLeads = leads.filter((l) => new Date(l.created_at).getTime() >= startOfToday).length
    const weekLeads = leads.filter((l) => new Date(l.created_at).getTime() >= startOfWeek).length
    const monthLeads = leads.filter((l) => new Date(l.created_at).getTime() >= startOfMonth).length
    const purchasedLeads = leads.filter((l) => l.status === 'Purchased').length
    const convRate = leads.length > 0 ? ((purchasedLeads / leads.length) * 100).toFixed(1) + '%' : '0.0%'

    return {
      filteredLeads: fLeads,
      counts: programCounts,
      kpis: {
        total: leads.length,
        today: todayLeads,
        week: weekLeads,
        month: monthLeads,
        workshop: programCounts.workshop,
        gd90: programCounts.gd90,
        fullstack: programCounts.fullstack,
        convRate: convRate,
      },
    }
  }, [leads, activeProgramTab, search, selectedStatus, selectedOccupation, dateRangeFilter])

  // -------------------------------------------------------------
  // CSV & Excel Exporters
  // -------------------------------------------------------------
  const exportToCSV = (isExcel = false) => {
    if (filteredLeads.length === 0) {
      toast.error('No leads available to export with current filters')
      return
    }

    const headers = [
      'Lead ID',
      'Created Date',
      'Program',
      'Name',
      'Age',
      'Phone Number',
      'Email',
      'Occupation',
      'Status',
      'Sales Notes',
      'Assigned To',
      'Source',
      'UTM Source',
      'UTM Medium',
      'UTM Campaign',
      'Landing Page',
      'Referrer',
      'Device',
      'Country',
    ]

    const rows = filteredLeads.map((l) => [
      `"${l.id}"`,
      `"${new Date(l.created_at).toLocaleString()}"`,
      `"${l.program_interested}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.age || ''}"`,
      `"${l.phone}"`,
      `"${l.email || ''}"`,
      `"${l.occupation || ''}"`,
      `"${l.status}"`,
      `"${(l.sales_notes || '').replace(/"/g, '""')}"`,
      `"${l.assigned_to || ''}"`,
      `"${l.source || ''}"`,
      `"${l.utm_source || ''}"`,
      `"${l.utm_medium || ''}"`,
      `"${l.utm_campaign || ''}"`,
      `"${l.landing_page || ''}"`,
      `"${l.referrer || ''}"`,
      `"${l.device || ''}"`,
      `"${l.country || ''}"`,
    ])

    const csvContent = (isExcel ? '\uFEFF' : '') + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: isExcel ? 'text/csv;charset=utf-8;' : 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `valavan_leads_${activeProgramTab}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`✓ Exported ${filteredLeads.length} leads successfully!`)
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Management System</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-[#1748BB] uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {leads.length} Total Leads Captured
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Track pre-payment inquiries, occupations, sales notes, status workflows, and export client lists.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refreshLeads(true)}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#1748BB] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={() => exportToCSV(false)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* Export Excel */}
          <button
            type="button"
            onClick={() => exportToCSV(true)}
            className="px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          {/* Add New Lead Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* 8 KPI Widgets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Leads', val: kpis.total, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Leads Today', val: kpis.today, icon: Clock, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Leads This Week', val: kpis.week, icon: Calendar, color: 'text-purple-600 bg-purple-50' },
          { label: 'Leads This Month', val: kpis.month, icon: TrendingUp, color: 'text-cyan-600 bg-cyan-50' },
          { label: 'Workshop', val: kpis.workshop, icon: Sparkles, color: 'text-amber-600 bg-amber-50' },
          { label: '90-Day Mastery', val: kpis.gd90, icon: Layers, color: 'text-teal-600 bg-teal-50' },
          { label: 'Full Stack', val: kpis.fullstack, icon: Tag, color: 'text-rose-600 bg-rose-50' },
          { label: 'Conv. Rate', val: kpis.convRate, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
        ].map((kpi) => {
          const Icon = kpi.icon
          return (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-200 p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-medium text-gray-500 truncate">{kpi.label}</span>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${kpi.color}`}>
                  <Icon className="w-3 h-3" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 tracking-tight">{kpi.val}</div>
            </div>
          )
        })}
      </div>

      {/* Program Tabs & Filters Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3.5">
        {/* Program Separation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3">
          {[
            { id: 'All', label: 'All Program Leads', count: counts.all },
            { id: 'workshop', label: '3 Hours Workshop', count: counts.workshop },
            { id: '90days', label: '90-Day Graphic Design', count: counts.gd90 },
            { id: 'fullstack', label: 'Full Stack Creator', count: counts.fullstack },
          ].map((tab) => {
            const isSelected = activeProgramTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveProgramTab(tab.id as typeof activeProgramTab)}
                className={`px-3.5 py-1.8 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1748BB] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-white text-gray-700 shadow-2xs'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Name, Phone, Email, Notes..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB] bg-gray-50/40"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            >
              <option value="All">All Statuses</option>
              {LEAD_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Occupation Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Occupation:</span>
            <select
              value={selectedOccupation}
              onChange={(e) => setSelectedOccupation(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            >
              <option value="All">All Occupations</option>
              {OCCUPATION_OPTIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Date:</span>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as typeof dateRangeFilter)}
              className="w-full py-2 px-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
            >
              <option value="All">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="text-xs font-bold text-gray-800">
            Showing <span className="text-[#1748BB]">{filteredLeads.length}</span> lead{filteredLeads.length === 1 ? '' : 's'}
          </div>
          {isSaving && (
            <span className="text-xs font-semibold text-[#1748BB] flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing database...</span>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-3.5">Date & Time</th>
                <th className="py-3 px-3.5">Program</th>
                <th className="py-3 px-3.5">Name & Age</th>
                <th className="py-3 px-3.5">Phone (WhatsApp)</th>
                <th className="py-3 px-3.5">Email</th>
                <th className="py-3 px-3.5">Occupation</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 min-w-[200px]">Sales Notes</th>
                <th className="py-3 px-3.5">Attribution</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-14 text-center text-gray-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold text-gray-700">No leads found</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {search || selectedStatus !== 'All' || activeProgramTab !== 'All'
                        ? 'Try clearing your search or filter options.'
                        : 'Leads captured from pre-payment forms will appear here automatically.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const programBadge = getProgramBadge(lead.program_interested)
                  const cleanPhone = lead.phone ? lead.phone.replace(/[^0-9]/g, '') : ''
                  const waNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`

                  return (
                    <tr key={lead.id} className="hover:bg-blue-50/20 transition-colors">
                      {/* Date & Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        <div>{new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-gray-400">{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* Program */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${programBadge.color}`}>
                          {programBadge.label}
                        </span>
                      </td>

                      {/* Name & Age */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-gray-900">{lead.name}</div>
                        {lead.age && (
                          <div className="text-[10px] text-gray-400">Age: {lead.age} yrs</div>
                        )}
                      </td>

                      {/* Phone with WhatsApp & Call triggers */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-mono text-gray-900 font-semibold">
                          <span>{lead.phone}</span>
                          {cleanPhone && (
                            <div className="flex items-center gap-1">
                              <a
                                href={`https://wa.me/${waNumber}?text=Hi%20${encodeURIComponent(lead.name)},%20thank%20you%20for%20your%20interest%20in%20Valavan%20Academy!`}
                                target="_blank"
                                rel="noreferrer"
                                title="Chat on WhatsApp"
                                className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                              <a
                                href={`tel:${lead.phone}`}
                                title="Call Lead"
                                className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center justify-center transition-colors"
                              >
                                <PhoneCall className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3.5 text-gray-600 truncate max-w-[160px]" title={lead.email || ''}>
                        {lead.email ? (
                          <a href={`mailto:${lead.email}`} className="hover:text-[#1748BB] hover:underline">
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>

                      {/* Occupation */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700">
                          {lead.occupation || 'Student'}
                        </span>
                      </td>

                      {/* Status Interactive Dropdown */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className={`text-[11px] font-bold py-1 px-2 rounded-lg border focus:outline-none focus:ring-1 cursor-pointer transition-colors ${getStatusBadgeStyle(
                            lead.status
                          )}`}
                        >
                          {LEAD_STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-white text-gray-900 font-medium">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Sales Notes Column (Click to edit) */}
                      <td className="py-3 px-3.5">
                        <div
                          onClick={() => openNotesModal(lead)}
                          className="group flex items-start justify-between gap-1 p-1.5 rounded-lg hover:bg-gray-100/70 border border-transparent hover:border-gray-200 cursor-pointer transition-colors"
                          title="Click to edit notes"
                        >
                          <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                            {lead.sales_notes || <span className="text-gray-400 italic">Add note...</span>}
                          </p>
                          <Edit3 className="w-3 h-3 text-gray-400 group-hover:text-[#1748BB] shrink-0 mt-0.5" />
                        </div>
                      </td>

                      {/* Attribution */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-[10px] text-gray-500 font-mono">
                        <div>
                          <span className="font-bold text-gray-700">{lead.utm_source || 'Direct'}</span>
                          {lead.utm_medium && <span className="text-gray-400"> / {lead.utm_medium}</span>}
                        </div>
                        <div className="text-gray-400">{lead.device || 'desktop'}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            title="View Full Attribution & Details"
                            className="p-1 rounded-md text-gray-500 hover:text-[#1748BB] hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLead(lead.id)}
                            title="Delete Lead"
                            className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: SALES NOTES EDITOR WITH QUICK PRESETS */}
      {notesModalLead && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sales Notes · {notesModalLead.name}</h3>
                <p className="text-xs text-gray-400">{notesModalLead.program_interested} ({notesModalLead.phone})</p>
              </div>
              <button
                type="button"
                onClick={() => setNotesModalLead(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Note Presets Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500">Quick Note Templates:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setCurrentNotesDraft((prev) => (prev ? `${prev} · ${preset}` : preset))
                    }}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-[#1748BB] text-gray-700 transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Textarea */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-gray-700">Detailed Sales Call Log & Remarks</label>
              <textarea
                rows={4}
                value={currentNotesDraft}
                onChange={(e) => setCurrentNotesDraft(e.target.value)}
                placeholder="Type your follow-up notes, student background, discount requested, preferred batch timings..."
                className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setNotesModalLead(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveNotesModal}
                disabled={isSaving}
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL LEAD ATTRIBUTION & DETAIL INSPECTOR */}
      {selectedLead && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold text-lg">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">{selectedLead.name}</h3>
                  <p className="text-xs text-gray-400">Captured on {new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Program Interested</span>
                <p className="font-bold text-gray-900 text-sm">{selectedLead.program_interested}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Current Status</span>
                <p className="font-bold text-gray-900 text-sm">{selectedLead.status}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</span>
                <p className="font-mono font-bold text-gray-900 text-sm">{selectedLead.phone}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Email Address</span>
                <p className="font-bold text-gray-900 text-sm">{selectedLead.email || 'None provided'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Age</span>
                <p className="font-bold text-gray-900">{selectedLead.age ? `${selectedLead.age} years old` : 'Not specified'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Occupation</span>
                <p className="font-bold text-gray-900">{selectedLead.occupation || 'Student'}</p>
              </div>
            </div>

            {/* Sales Notes Box */}
            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1.5">
              <span className="text-[11px] font-bold text-[#1748BB]">Sales Notes & Follow-up History</span>
              <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedLead.sales_notes || 'No sales notes recorded yet.'}
              </p>
            </div>

            {/* Marketing Attribution & Telemetry */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-800">Marketing Attribution & Tracking Data</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">UTM Source</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.utm_source || 'direct'}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">UTM Medium</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.utm_medium || 'none'}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">UTM Campaign</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.utm_campaign || 'direct'}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">Device / Browser</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.device || 'desktop'} ({selectedLead.browser || 'Chrome'})</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">Landing Page</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.landing_page || '/'}</span>
                </div>
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <span className="text-gray-400 block text-[9px] uppercase">Country</span>
                  <span className="font-mono font-bold text-gray-800">{selectedLead.country || 'IN'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="btn-primary py-2 px-6 text-xs font-bold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW MANUAL LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Add New Lead Manually</h3>
                <p className="text-xs text-gray-400">Capture phone, walk-in, or WhatsApp prospect details.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Ramesh S"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                />
              </div>

              {/* Row: Age & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Age</label>
                  <input
                    type="number"
                    value={newLead.age || ''}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, age: e.target.value }))}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={newLead.email || ''}
                  onChange={(e) => setNewLead((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="ramesh@gmail.com"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                />
              </div>

              {/* Program & Occupation */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Program</label>
                  <select
                    value={newLead.program_slug}
                    onChange={(e) => {
                      const slug = e.target.value
                      const name =
                        slug === '3-hours-live-workshop'
                          ? '3 Hours Live Graphic Design Workshop'
                          : slug === 'full-stack-creator'
                          ? 'Full Stack Digital Creator Program'
                          : '90-Day Graphic Design Mastery'
                      setNewLead((prev) => ({ ...prev, program_slug: slug, program_interested: name }))
                    }}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                  >
                    <option value="90-days-graphic-design">90-Day Graphic Design</option>
                    <option value="3-hours-live-workshop">3 Hours Live Workshop</option>
                    <option value="full-stack-creator">Full Stack Creator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Occupation</label>
                  <select
                    value={newLead.occupation}
                    onChange={(e) => setNewLead((prev) => ({ ...prev, occupation: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                  >
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Initial Status</label>
                <select
                  value={newLead.status}
                  onChange={(e) => setNewLead((prev) => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                >
                  {LEAD_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sales Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Initial Remarks / Notes</label>
                <textarea
                  rows={2}
                  value={newLead.sales_notes || ''}
                  onChange={(e) => setNewLead((prev) => ({ ...prev, sales_notes: e.target.value }))}
                  placeholder="e.g. Enquired over direct WhatsApp call regarding weekend batch."
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1748BB]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Lead</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
