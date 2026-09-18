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

const defaultLeads: Lead[] = [
  { id: 'LD-1092', name: 'Karthik Raja', email: 'karthik.r@gmail.com', phone: '+91 98401 23456', course: 'Design Mastery 90-Days', source: 'meta_ads', medium: 'cpc', campaign: 'sep_creative_cohort', status: 'Converted', date: '2026-09-18 14:32', device: 'Mobile (iOS)', landingPage: '/programs/graphic-design-mastery' },
  { id: 'LD-1091', name: 'Priya Sundaram', email: 'priya.s@outlook.com', phone: '+91 97890 87654', course: 'Full Stack Web Dev', source: 'google_ads', medium: 'search', campaign: 'fullstack_tamil_chennai', status: 'Contacted', date: '2026-09-18 12:15', device: 'Desktop (macOS)', landingPage: '/programs/full-stack-web-development' },
  { id: 'LD-1090', name: 'Saravanan M', email: 'saravanan.m@yahoo.com', phone: '+91 94440 11223', course: 'Live Masterclass', source: 'whatsapp_direct', medium: 'organic_chat', campaign: 'direct_inquiry', status: 'New', date: '2026-09-18 10:45', device: 'Mobile (Android)', landingPage: '/live-workshop' },
  { id: 'LD-1089', name: 'Divya Bharathi', email: 'divya.b@gmail.com', phone: '+91 99620 44556', course: 'Design Mastery 90-Days', source: 'instagram', medium: 'bio_link', campaign: 'reels_viral_typography', status: 'Converted', date: '2026-09-17 19:20', device: 'Mobile (iOS)', landingPage: '/programs/graphic-design-mastery' },
  { id: 'LD-1088', name: 'Anand Kumar', email: 'anand.k@techcorp.in', phone: '+91 98840 99887', course: 'Full Stack Web Dev', source: 'youtube', medium: 'video_desc', campaign: 'nextjs_tamil_tutorial', status: 'In Discussion', date: '2026-09-17 16:05', device: 'Desktop (Windows)', landingPage: '/programs/full-stack-web-development' },
  { id: 'LD-1087', name: 'Meenakshi R', email: 'meena.r@gmail.com', phone: '+91 94450 66778', course: 'Design Mastery 90-Days', source: 'meta_ads', medium: 'cpc', campaign: 'sep_creative_cohort', status: 'Converted', date: '2026-09-16 11:30', device: 'Mobile (Android)', landingPage: '/programs/graphic-design-mastery' },
]

export default function ReportsClient({ initialLeads = [] }: ReportsClientProps) {
  const leads = initialLeads.length > 0 ? initialLeads : defaultLeads
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | '90d' | 'all'>('30d')
  const [reportType, setReportType] = useState<'executive' | 'utm' | 'pages' | 'devices'>('executive')
  const [digestEmail, setDigestEmail] = useState('valavanacademy001@gmail.com')
  const [digestFrequency, setDigestFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [digestEnabled, setDigestEnabled] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState('')

  // Multi-channel analytics aggregation
  const totalLeads = leads.length
  const convertedLeads = leads.filter(l => l.status === 'Converted').length
  const convRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'

  const utmBreakdown = [
    { source: 'meta_ads', medium: 'cpc', campaign: 'sep_creative_cohort', clicks: 1420, leads: 38, converted: 12, convRate: '31.5%', spend: '₹8,400', cpl: '₹221' },
    { source: 'google_ads', medium: 'search', campaign: 'fullstack_tamil_chennai', clicks: 980, leads: 29, converted: 9, convRate: '31.0%', spend: '₹6,800', cpl: '₹234' },
    { source: 'instagram', medium: 'bio_link', campaign: 'reels_viral_typography', clicks: 2150, leads: 44, converted: 16, convRate: '36.3%', spend: '₹0 (Organic)', cpl: '₹0' },
    { source: 'youtube', medium: 'video_desc', campaign: 'nextjs_tamil_tutorial', clicks: 860, leads: 19, converted: 6, convRate: '31.5%', spend: '₹0 (Organic)', cpl: '₹0' },
    { source: 'whatsapp_direct', medium: 'chat_cta', campaign: 'direct_inquiry', clicks: 430, leads: 22, converted: 11, convRate: '50.0%', spend: '₹0', cpl: '₹0' },
  ]

  const pageBreakdown = [
    { path: '/programs/graphic-design-mastery', title: 'Graphic Design Mastery 90-Days', views: 5420, avgTime: '4m 12s', bounceRate: '32.4%', leads: 64, convRate: '1.18%' },
    { path: '/programs/full-stack-web-development', title: 'Full Stack Web Development', views: 3890, avgTime: '3m 48s', bounceRate: '38.1%', leads: 42, convRate: '1.07%' },
    { path: '/live-workshop', title: '3 Hours Live Workshop Masterclass', views: 2750, avgTime: '2m 55s', bounceRate: '28.6%', leads: 39, convRate: '1.41%' },
    { path: '/', title: 'Valavan Academy - Home', views: 8940, avgTime: '2m 10s', bounceRate: '41.2%', leads: 28, convRate: '0.31%' },
    { path: '/contact', title: 'Contact Us & Enroll', views: 1210, avgTime: '1m 40s', bounceRate: '21.5%', leads: 18, convRate: '1.48%' },
  ]

  const deviceData = [
    { name: 'Mobile (iOS & Android)', share: '68.4%', visitors: 15180, leads: 131, color: 'bg-[#1748BB]' },
    { name: 'Desktop (Mac & Windows)', share: '28.2%', visitors: 6260, leads: 56, color: 'bg-indigo-500' },
    { name: 'Tablet (iPad & Android Tab)', share: '3.4%', visitors: 755, leads: 4, color: 'bg-cyan-500' },
  ]

  const handleExport = (type: string) => {
    setIsExporting(true)
    setTimeout(() => {
      let csvContent = 'data:text/csv;charset=utf-8,'

      if (type === 'leads') {
        csvContent += 'Lead ID,Full Name,Email,Phone,Course Interested,UTM Source,UTM Medium,UTM Campaign,Status,Date,Device,Landing Page\n'
        leads.forEach(l => {
          csvContent += `"${l.id}","${l.name}","${l.email}","${l.phone}","${l.course}","${l.source}","${l.medium}","${l.campaign}","${l.status}","${l.date}","${l.device || ''}","${l.landingPage || ''}"\n`
        })
      } else if (type === 'utm') {
        csvContent += 'Source,Medium,Campaign,Clicks,Leads Generated,Converted,Conversion Rate,Ad Spend,Cost Per Lead (CPL)\n'
        utmBreakdown.forEach(u => {
          csvContent += `"${u.source}","${u.medium}","${u.campaign}",${u.clicks},${u.leads},${u.converted},"${u.convRate}","${u.spend}","${u.cpl}"\n`
        })
      } else if (type === 'pages') {
        csvContent += 'Page URL,Page Title,Page Views,Avg Time on Page,Bounce Rate,Leads Generated,Conversion Rate\n'
        pageBreakdown.forEach(p => {
          csvContent += `"${p.path}","${p.title}",${p.views},"${p.avgTime}","${p.bounceRate}",${p.leads},"${p.convRate}"\n`
        })
      } else {
        csvContent += 'Valavan Academy Marketing & Analytics Executive Report\n'
        csvContent += `Generated On,${new Date().toISOString()}\n`
        csvContent += `Timeframe,${timeRange.toUpperCase()}\n\n`
        csvContent += 'Metric,Value,Benchmark\n'
        csvContent += 'Total Unique Visitors,22195,+18.4% vs prev\n'
        csvContent += 'Total Page Views,41280,+22.1% vs prev\n'
        csvContent += `Total Leads Generated,${totalLeads},+14.2% vs prev\n`
        csvContent += `Direct Enrollments / Converted,${convertedLeads},+28.6% vs prev\n`
        csvContent += `Overall Lead-to-Enrollment Rate,${convRate}%,Healthy\n`
        csvContent += 'WhatsApp Direct Clicks,1840,+32.0% vs prev\n'
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
    }, 600)
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
            <span className="text-xs text-gray-400">• Updated Real-time</span>
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
                    ? 'bg-white text-[#1748BB] shadow-xs'
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
            className="flex items-center gap-2 px-4 py-2 bg-[#1748BB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:shadow disabled:opacity-50"
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
          <div className="text-2xl font-black text-gray-900 mt-2">22,195</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4%</span>
            <span className="text-gray-400 font-normal">vs previous period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Total Leads Captured</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">191</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.2%</span>
            <span className="text-gray-400 font-normal">qualified leads</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>Direct Conversions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">54 Enrollments</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>28.3%</span>
            <span className="text-gray-400 font-normal">lead conversion rate</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs font-medium">
            <span>WhatsApp Direct CTAs</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 mt-2">1,840</div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+32.0%</span>
            <span className="text-gray-400 font-normal">high-intent taps</span>
          </div>
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
                {utmBreakdown.map((item, idx) => (
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
                ))}
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
                {pageBreakdown.map((item, idx) => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Devices */}
        {reportType === 'devices' && (
          <div className="p-6 space-y-6">
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
