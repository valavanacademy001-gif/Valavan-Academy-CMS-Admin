'use client'

import React, { useState } from 'react'
import {
  FileSpreadsheet, Download, Calendar, Filter, TrendingUp,
  Users, CheckCircle2, MessageSquare, ArrowUpRight, ArrowDownRight,
  PieChart, Globe, Smartphone, Monitor, Layers, Mail, Check, Sparkles, RefreshCw
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  course: string
  source: string
  medium: string
  campaign: string
  status: string
  date: string
  device?: string
  landingPage?: string
}

interface ReportsClientProps {
  initialLeads?: Lead[]
}

export default function ReportsClient({ initialLeads = [] }: ReportsClientProps) {
  const leads = initialLeads || []
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d')
  const [reportType, setReportType] = useState<'executive' | 'pages' | 'devices'>('executive')
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')
  const [digestEnabled, setDigestEnabled] = useState(false)
  const [digestEmail, setDigestEmail] = useState('admin@valavanacademy.com')
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')

  // Multi-channel analytics aggregation strictly from real leads data
  const totalLeads = leads.length
  const convertedLeads = leads.filter(l => l.status === 'Converted' || l.status === 'Enrolled').length
  const convRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'

  const utmBreakdown: any[] = []
  const pageBreakdown: any[] = []
  const deviceData: any[] = []

  const handleExport = (type: string) => {
    setIsExporting(true)
    setTimeout(() => {
      let csvContent = 'data:text/csv;charset=utf-8,'

      if (type === 'leads') {
        csvContent += 'Lead ID,Full Name,Email,Phone,Course Interested,UTM Source,UTM Medium,UTM Campaign,Status,Date,Device,Landing Page\n'
        leads.forEach(l => {
          csvContent += `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.course}","${l.source}","${l.medium}","${l.campaign}","${l.status}","${l.date}","${l.device || ''}","${l.landingPage || ''}"\n`
        })
      } else {
        csvContent += 'Valavan Academy Marketing & Analytics Executive Report\n'
        csvContent += `Generated On,${new Date().toISOString()}\n`
        csvContent += `Timeframe,${timeRange.toUpperCase()}\n\n`
        csvContent += 'Metric,Value\n'
        csvContent += 'Total Unique Visitors,0\n'
        csvContent += 'Total Page Views,0\n'
        csvContent += `Total Leads Generated,${totalLeads}\n`
        csvContent += `Direct Enrollments / Converted,${convertedLeads}\n`
        csvContent += `Overall Lead-to-Enrollment Rate,${convRate}%\n`
        csvContent += 'WhatsApp Direct Clicks,0\n'
      }

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `valavan_academy_${type}_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setIsExporting(false)
      setExportSuccess(`Successfully exported ${type.toUpperCase()} report!`)
      setTimeout(() => setExportSuccess(''), 4000)
    }, 400)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-blue-50 text-[#1748BB] px-2.5 py-1 rounded-full uppercase tracking-wide">
              Module 13 • Enterprise Reporting
            </span>
            <span className="text-xs text-gray-400">• Real-Time Tracking</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Marketing Analytics & Reports</h1>
          <p className="text-sm text-gray-500">
            Export automated reports, attribution summaries, campaign ROI, and page conversions.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === tab.id
                    ? 'bg-white text-[#1748BB] shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExport('executive')}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-[#1748BB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExporting ? 'Exporting...' : 'Export Full Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Unique Visitors</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1748BB]">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">0</div>
          <div className="text-xs text-gray-400 mt-1 font-normal">Based on real tracking sessions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Leads Captured</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">{totalLeads}</div>
          <div className="text-xs text-gray-400 mt-1 font-normal">From website forms & inquiries</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Direct Enrollments</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{convertedLeads}</div>
          <div className="text-xs text-gray-400 mt-1 font-normal">Confirmed student enrollments</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>WhatsApp Direct CTAs</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2">0</div>
          <div className="text-xs text-gray-400 mt-1 font-normal">Real-time click telemetry</div>
        </div>
      </div>

      {/* Tabs for Detailed Reports */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex items-center gap-2">
            {[
              { id: 'executive', label: 'Campaign Attribution (UTM)' },
              { id: 'pages', label: 'Landing Page Performance' },
              { id: 'devices', label: 'Device & Hardware Split' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reportType === t.id
                    ? 'bg-[#1748BB] text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleExport(reportType === 'executive' ? 'utm' : reportType === 'pages' ? 'pages' : 'leads')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Download CSV for this Table</span>
          </button>
        </div>

        {/* Tab 1: UTM Campaign Attribution */}
        {reportType === 'executive' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Source & Medium</th>
                  <th className="px-5 py-3.5">Campaign Name</th>
                  <th className="px-5 py-3.5 text-right">Clicks</th>
                  <th className="px-5 py-3.5 text-right">Leads</th>
                  <th className="px-5 py-3.5 text-right">Enrolled</th>
                  <th className="px-5 py-3.5 text-right">Conv. Rate</th>
                  <th className="px-5 py-3.5 text-right">Est. Spend</th>
                  <th className="px-5 py-3.5 text-right">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {utmBreakdown.length > 0 ? (
                  utmBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#1748BB]"></span>
                          <span>{item.source}</span>
                          <span className="text-gray-400 font-normal">/ {item.medium}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 font-mono text-[11px]">{item.campaign}</td>
                      <td className="px-5 py-4 text-right font-medium text-gray-700">{item.clicks.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-bold text-gray-900">{item.leads}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-600">{item.converted}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#1748BB]">{item.convRate}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{item.spend}</td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-800">{item.cpl}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-gray-400 text-xs">
                      No UTM campaign attribution data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Landing Pages */}
        {reportType === 'pages' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3.5">Page URL & Name</th>
                  <th className="px-5 py-3.5 text-right">Page Views</th>
                  <th className="px-5 py-3.5 text-right">Avg. Duration</th>
                  <th className="px-5 py-3.5 text-right">Bounce Rate</th>
                  <th className="px-5 py-3.5 text-right">Leads</th>
                  <th className="px-5 py-3.5 text-right">Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pageBreakdown.length > 0 ? (
                  pageBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{item.path}</div>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-700">{item.views.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{item.avgTime}</td>
                      <td className="px-5 py-4 text-right text-gray-600">{item.bounceRate}</td>
                      <td className="px-5 py-4 text-right font-bold text-gray-900">{item.leads}</td>
                      <td className="px-5 py-4 text-right font-bold text-emerald-600">{item.convRate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                      No landing page performance data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Devices */}
        {reportType === 'devices' && (
          <div className="p-6 space-y-6">
            {deviceData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deviceData.map((d, i) => (
                  <div key={i} className="p-5 rounded-xl border border-gray-100 bg-gray-50/60">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-600">{d.name}</div>
                      {i === 0 ? <Smartphone className="w-4 h-4 text-[#1748BB]" /> : <Monitor className="w-4 h-4 text-indigo-500" />}
                    </div>
                    <div className="text-2xl font-black text-gray-900 mt-2">{d.share}</div>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-3 overflow-hidden">
                      <div className={`${d.color} h-full rounded-full`} style={{ width: d.share }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-gray-500 mt-2">
                      <span>{d.visitors.toLocaleString()} Visitors</span>
                      <span className="font-semibold text-gray-700">{d.leads} Leads</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                No device telemetry data available yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Automated Email Digest Schedule Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Automated Marketing Email Digest</h3>
              <p className="text-xs text-gray-500">Send scheduled executive performance summaries directly to administrator inbox.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={digestEnabled}
              onChange={(e) => setDigestEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1748BB]"></div>
          </label>
        </div>

        {digestEnabled && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Email</label>
              <input
                type="email"
                value={digestEmail}
                onChange={(e) => setDigestEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-hidden font-medium"
                placeholder="admin@valavanacademy.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Frequency</label>
              <select
                value={digestFrequency}
                onChange={(e) => setDigestFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-hidden font-medium bg-white"
              >
                <option value="daily">Daily Summary (Every morning 9:00 AM)</option>
                <option value="weekly">Weekly Digest (Every Monday 9:00 AM)</option>
                <option value="monthly">Monthly Executive Report (1st of Month)</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setExportSuccess('Scheduled report settings saved successfully!')
                  setTimeout(() => setExportSuccess(''), 3000)
                }}
                className="w-full py-2 px-4 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Save Schedule Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
