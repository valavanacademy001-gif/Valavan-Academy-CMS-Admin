'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Users, Search, Filter, Download, Plus, Eye,
  Phone, Mail, Calendar, Sparkles, ExternalLink,
  MessageCircle, Tag, CheckCircle2, Clock, X,
  FileSpreadsheet, ArrowUpRight, ChevronRight, Edit3, Trash2
} from 'lucide-react'

export interface LeadItem {
  id: string
  name: string
  phone: string
  email: string
  program_interested: string
  source: string
  status: 'New' | 'Contacted' | 'Enrolled' | 'Lost'
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  landing_page?: string
  referrer?: string
  notes?: string
  created_at: string
}

export default function LeadsAttributionClient({ initialLeads }: { initialLeads: LeadItem[] }) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads)
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedProgram, setSelectedProgram] = useState<string>('All')
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // New Lead form state
  const [newLead, setNewLead] = useState<Partial<LeadItem>>({
    name: '',
    phone: '',
    email: '',
    program_interested: '90 Days Graphic Design Mastery',
    source: 'Direct Entry',
    status: 'New',
    utm_source: 'Direct',
    utm_medium: 'Manual',
    utm_campaign: '',
    notes: '',
  })

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.utm_source && l.utm_source.toLowerCase().includes(search.toLowerCase())) ||
        (l.utm_campaign && l.utm_campaign.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = selectedStatus === 'All' || l.status === selectedStatus
      const matchProgram = selectedProgram === 'All' || l.program_interested === selectedProgram
      return matchSearch && matchStatus && matchProgram
    })
  }, [leads, search, selectedStatus, selectedProgram])

  // Save Leads JSON helper
  const persistLeads = async (updatedList: LeadItem[]) => {
    setIsSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'leads_data').single()
      if (!field) throw new Error('leads_data field not found')

      const jsonStr = JSON.stringify(updatedList)
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
    } catch (e: any) {
      toast.error(`Sync error: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: LeadItem['status']) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    setLeads(updated)
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, status: newStatus })
    }
    await persistLeads(updated)
    toast.success(`Lead status updated to ${newStatus}`)
  }

  const handleNotesChange = async (leadId: string, notes: string) => {
    const updated = leads.map((l) => (l.id === leadId ? { ...l, notes } : l))
    setLeads(updated)
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, notes })
    }
    await persistLeads(updated)
  }

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return
    const updated = leads.filter((l) => l.id !== leadId)
    setLeads(updated)
    setSelectedLead(null)
    await persistLeads(updated)
    toast.success('Lead removed successfully')
  }

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLead.name || !newLead.phone) {
      toast.error('Please enter Name and Phone')
      return
    }

    const created: LeadItem = {
      id: `lead-${Date.now()}`,
      name: newLead.name || '',
      phone: newLead.phone || '',
      email: newLead.email || '',
      program_interested: newLead.program_interested || '90 Days Graphic Design Mastery',
      source: newLead.source || 'Manual Entry',
      status: (newLead.status as any) || 'New',
      utm_source: newLead.utm_source || 'Direct',
      utm_medium: newLead.utm_medium || 'Manual',
      utm_campaign: newLead.utm_campaign || '',
      notes: newLead.notes || '',
      created_at: new Date().toISOString(),
    }

    const updated = [created, ...leads]
    setLeads(updated)
    setShowAddModal(false)
    setNewLead({
      name: '',
      phone: '',
      email: '',
      program_interested: '90 Days Graphic Design Mastery',
      source: 'Direct Entry',
      status: 'New',
      utm_source: 'Direct',
      utm_medium: 'Manual',
      utm_campaign: '',
      notes: '',
    })
    await persistLeads(updated)
    toast.success('✓ New lead added successfully!')
  }

  // CSV Export
  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Program', 'Source', 'Status', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Date', 'Notes']
    const rows = filteredLeads.map((l) => [
      `"${l.id}"`,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.program_interested}"`,
      `"${l.source}"`,
      `"${l.status}"`,
      `"${l.utm_source || ''}"`,
      `"${l.utm_medium || ''}"`,
      `"${l.utm_campaign || ''}"`,
      `"${new Date(l.created_at).toLocaleDateString()}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `valavan_leads_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('✓ Leads exported to CSV successfully!')
  }

  const counts = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'New').length,
    contacted: leads.filter((l) => l.status === 'Contacted').length,
    enrolled: leads.filter((l) => l.status === 'Enrolled').length,
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Lead Tracking & UTM Attribution</h1>
              <p className="text-xs text-gray-500">
                Multi-touch attribution capturing every campaign, source, keyword, and conversion event.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCSV}
            className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-xs font-medium text-gray-500">Total Leads</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{counts.total}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-xs font-medium text-amber-600">New Inquiries</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{counts.new}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-xs font-medium text-blue-600">Contacted</span>
          <div className="text-2xl font-bold text-blue-600 mt-1">{counts.contacted}</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">Enrolled Students</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{counts.enrolled}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email, campaign..."
            className="input pl-9 text-xs py-2"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input py-2 text-xs font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Enrolled">Enrolled</option>
            <option value="Lost">Lost</option>
          </select>

          {/* Program Filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="input py-2 text-xs font-medium"
          >
            <option value="All">All Programs</option>
            <option value="90 Days Graphic Design Mastery">90 Days Graphic Design</option>
            <option value="3 Hours Live Workshop">3 Hours Live Workshop</option>
            <option value="Full Stack Creator Masterclass">Full Stack Creator</option>
          </select>
        </div>
      </div>

      {/* Leads Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Lead Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Program</th>
                <th className="py-3 px-4">UTM Source / Campaign</th>
                <th className="py-3 px-4">Captured</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => {
                  const statusColors = {
                    New: 'bg-amber-50 text-amber-700 border-amber-200',
                    Contacted: 'bg-blue-50 text-blue-700 border-blue-200',
                    Enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Lost: 'bg-gray-50 text-gray-500 border-gray-200',
                  }
                  return (
                    <tr key={lead.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {lead.name}
                        <span className="block text-[10px] text-gray-400 font-normal mt-0.5">via {lead.source}</span>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {lead.program_interested}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-100">
                          <span>{lead.utm_source || 'Direct'}</span>
                          {lead.utm_medium && <span className="text-purple-400">/ {lead.utm_medium}</span>}
                        </div>
                        {lead.utm_campaign && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5 truncate max-w-[160px]">
                            {lead.utm_campaign}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1748BB] hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No leads found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LEAD DETAIL & UTM ATTRIBUTION MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{selectedLead.name}</h3>
                  <p className="text-xs text-gray-400">Captured {new Date(selectedLead.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Box */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Phone Number</span>
                <a href={`tel:${selectedLead.phone}`} className="text-xs font-bold text-[#1748BB] block mt-0.5 hover:underline">
                  {selectedLead.phone}
                </a>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold">Email Address</span>
                <a href={`mailto:${selectedLead.email}`} className="text-xs font-bold text-[#1748BB] block mt-0.5 hover:underline truncate">
                  {selectedLead.email || 'None Provided'}
                </a>
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Lead Status</label>
              <div className="grid grid-cols-4 gap-2">
                {(['New', 'Contacted', 'Enrolled', 'Lost'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedLead.id, st)}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      selectedLead.status === st
                        ? 'bg-[#1748BB] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Touch UTM Attribution Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#1748BB]" />
                <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">UTM Campaign Attribution</span>
              </div>
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">utm_source</span>
                    <span className="font-mono font-semibold text-gray-900">{selectedLead.utm_source || 'direct'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">utm_medium</span>
                    <span className="font-mono font-semibold text-gray-900">{selectedLead.utm_medium || 'none'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-purple-200/60">
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">utm_campaign</span>
                    <span className="font-mono font-semibold text-gray-900 truncate block">{selectedLead.utm_campaign || 'none'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">utm_content</span>
                    <span className="font-mono font-semibold text-gray-900 truncate block">{selectedLead.utm_content || 'none'}</span>
                  </div>
                </div>
                {selectedLead.landing_page && (
                  <div className="pt-1 border-t border-purple-200/60">
                    <span className="text-[10px] text-purple-700 font-bold block">Landing Page URL</span>
                    <span className="font-mono font-semibold text-[#1748BB] truncate block">{selectedLead.landing_page}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lead Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Internal Admin Notes</label>
              <textarea
                value={selectedLead.notes || ''}
                onChange={(e) => handleNotesChange(selectedLead.id, e.target.value)}
                rows={3}
                placeholder="Add notes about call discussion, follow-up schedule..."
                className="input text-xs resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDeleteLead(selectedLead.id)}
                className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="btn-secondary py-1.5 px-4 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LEAD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateLead} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Add New Lead Manually</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newLead.name}
                  onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  placeholder="e.g. Ramesh S"
                  className="input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newLead.phone}
                  onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                placeholder="ramesh@gmail.com"
                className="input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Program Interested</label>
              <select
                value={newLead.program_interested}
                onChange={(e) => setNewLead({ ...newLead, program_interested: e.target.value })}
                className="input text-xs"
              >
                <option value="90 Days Graphic Design Mastery">90 Days Graphic Design Mastery</option>
                <option value="3 Hours Live Workshop">3 Hours Live Workshop</option>
                <option value="Full Stack Creator Masterclass">Full Stack Creator Masterclass</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">UTM Source</label>
                <input
                  type="text"
                  value={newLead.utm_source}
                  onChange={(e) => setNewLead({ ...newLead, utm_source: e.target.value })}
                  placeholder="Instagram, Google, Direct..."
                  className="input text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Campaign Name</label>
                <input
                  type="text"
                  value={newLead.utm_campaign}
                  onChange={(e) => setNewLead({ ...newLead, utm_campaign: e.target.value })}
                  placeholder="e.g. Masterclass_Sep"
                  className="input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 px-4 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                Create Lead
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
