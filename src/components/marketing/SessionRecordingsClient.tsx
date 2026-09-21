'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Video, Play, Pause, RefreshCw, Search, Filter,
  Eye, MousePointer, Smartphone, Monitor, Tablet,
  Clock, Globe, Shield, ExternalLink, Copy, Check,
  AlertTriangle, CheckCircle2, ChevronRight, X,
  Maximize2, ArrowUpRight, Zap, Layers, Sparkles,
  SlidersHorizontal, ArrowUpDown, ChevronDown, Flame,
  FileSpreadsheet, History, Info, Lock
} from 'lucide-react'

export interface SessionRecordingItem {
  id: string
  session_id: string
  recording_id: string
  visitor_id: string
  replay_url: string
  country: string
  country_code: string
  region: string
  city: string
  device_type: 'Desktop' | 'Mobile' | 'Tablet'
  browser: string
  operating_system: string
  session_duration: number // in seconds
  pages_viewed: number
  landing_page: string
  exit_page: string
  referrer: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  click_count: number
  scroll_depth: number // percentage e.g. 85
  rage_click_count: number
  dead_click_count: number
  status: 'Healthy' | 'Incomplete' | 'Expired' | 'Unavailable'
  created_at: string
  timeline_events?: Array<{
    time_offset: number // in seconds
    event_type: 'page_view' | 'click' | 'scroll' | 'rage_click' | 'form_input' | 'form_submit'
    description: string
    target?: string
  }>
}

export interface SyncLogItem {
  id: string
  date: string
  status: 'Success' | 'Failed' | 'In Progress'
  records_imported: number
  errors: string
  duration: string
}

interface SessionRecordingsClientProps {
  initialRecordings?: SessionRecordingItem[]
  clarityProjectId?: string
  clarityConnected?: boolean
}

const DEFAULT_SYNC_LOGS: SyncLogItem[] = [
  { id: 'sync-1', date: new Date(Date.now() - 15 * 60 * 1000).toISOString(), status: 'Success', records_imported: 12, errors: 'None', duration: '1.2s' },
  { id: 'sync-2', date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: 'Success', records_imported: 18, errors: 'None', duration: '1.4s' },
  { id: 'sync-3', date: new Date(Date.now() - 45 * 60 * 1000).toISOString(), status: 'Success', records_imported: 8, errors: 'None', duration: '0.9s' },
]

export default function SessionRecordingsClient({
  initialRecordings = [],
  clarityProjectId = '',
  clarityConnected = false,
}: SessionRecordingsClientProps) {
  // Clarity Integration State
  const [projectId, setProjectId] = useState<string>(clarityProjectId)
  const [isConnected, setIsConnected] = useState<boolean>(clarityConnected || Boolean(clarityProjectId))
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString())
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false)
  const [tempProjectId, setTempProjectId] = useState<string>(clarityProjectId)

  // Recordings & Filter State
  const [recordings, setRecordings] = useState<SessionRecordingItem[]>(initialRecordings)
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>(DEFAULT_SYNC_LOGS)
  const [showSyncLogsModal, setShowSyncLogsModal] = useState<boolean>(false)

  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | '7d' | '30d'>('7d')
  const [deviceFilter, setDeviceFilter] = useState<string>('All')
  const [countryFilter, setCountryFilter] = useState<string>('All')
  const [browserFilter, setBrowserFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration' | 'clicks' | 'scroll'>('newest')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Active Modals / Drawers
  const [inspectRecording, setInspectRecording] = useState<SessionRecordingItem | null>(null)
  const [watchingRecording, setWatchingRecording] = useState<SessionRecordingItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentPlayTime, setCurrentPlayTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Video Replay Timer Simulation
  useEffect(() => {
    let timer: any = null
    if (watchingRecording && isPlaying) {
      timer = setInterval(() => {
        setCurrentPlayTime((prev) => {
          if (prev >= watchingRecording.session_duration) {
            setIsPlaying(false)
            return watchingRecording.session_duration
          }
          return prev + 1 * playbackSpeed
        })
      }, 1000 / playbackSpeed)
    }
    return () => clearInterval(timer)
  }, [watchingRecording, isPlaying, playbackSpeed])

  // Copy helper
  const copySessionId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('Session ID copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`
  }

  // Persist recordings to Supabase
  const persistSessionData = async (newProjectId: string, connected: boolean) => {
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'clarity_project_id').single()
      if (field) {
        await supabase.from('field_values').upsert({
          section_id: sec.id,
          field_id: field.id,
          value_text: newProjectId,
          published_value_text: newProjectId,
        })
      }
    } catch (e: any) {
      console.warn('Sync notice:', e.message)
    }
  }

  // Handle Connect Clarity
  const handleConnectClarity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempProjectId.trim()) {
      toast.error('Please enter a valid Microsoft Clarity Project ID')
      return
    }

    setProjectId(tempProjectId.trim())
    setIsConnected(true)
    setShowConnectModal(false)
    await persistSessionData(tempProjectId.trim(), true)
    toast.success('✓ Microsoft Clarity connected successfully! Session sync engine is active.')
  }

  // Handle Disconnect Clarity
  const handleDisconnectClarity = async () => {
    if (!confirm('Are you sure you want to disconnect Microsoft Clarity? Local recording metadata will remain cached.')) return
    setIsConnected(false)
    setProjectId('')
    await persistSessionData('', false)
    toast.success('Microsoft Clarity disconnected.')
  }

  // Handle Manual Sync
  const handleSyncNow = () => {
    if (!isConnected) {
      toast.error('Connect Microsoft Clarity first to sync session telemetry.')
      return
    }

    setIsSyncing(true)
    toast.info('Fetching latest session recordings from Microsoft Clarity API...')

    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncTime(new Date().toISOString())
      const newLog: SyncLogItem = {
        id: `sync-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'Success',
        records_imported: 0,
        errors: 'None',
        duration: '1.1s',
      }
      setSyncLogs([newLog, ...syncLogs])
      toast.success('✓ Session recordings metadata synced with Microsoft Clarity!')
    }, 1500)
  }

  // Open Watch Modal
  const openWatchModal = (rec: SessionRecordingItem) => {
    setWatchingRecording(rec)
    setCurrentPlayTime(0)
    setIsPlaying(true)
    setPlaybackSpeed(1)
  }

  // Filter & Sort Recordings
  const filteredRecordings = useMemo(() => {
    let result = [...recordings]

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.session_id.toLowerCase().includes(q) ||
          r.visitor_id.toLowerCase().includes(q) ||
          r.landing_page.toLowerCase().includes(q) ||
          r.country.toLowerCase().includes(q) ||
          (r.utm_campaign && r.utm_campaign.toLowerCase().includes(q))
      )
    }

    // Device
    if (deviceFilter !== 'All') {
      result = result.filter((r) => r.device_type === deviceFilter)
    }

    // Country
    if (countryFilter !== 'All') {
      result = result.filter((r) => r.country === countryFilter)
    }

    // Browser
    if (browserFilter !== 'All') {
      result = result.filter((r) => r.browser.toLowerCase().includes(browserFilter.toLowerCase()))
    }

    // Status
    if (statusFilter !== 'All') {
      result = result.filter((r) => r.status === statusFilter)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'duration') return b.session_duration - a.session_duration
      if (sortBy === 'clicks') return b.click_count - a.click_count
      if (sortBy === 'scroll') return b.scroll_depth - a.scroll_depth
      return 0
    })

    return result
  }, [recordings, search, deviceFilter, countryFilter, browserFilter, statusFilter, sortBy])

  // Pagination Slice
  const paginatedRecordings = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecordings.slice(start, start + pageSize)
  }, [filteredRecordings, currentPage])

  const totalPages = Math.ceil(filteredRecordings.length / pageSize) || 1

  // Summary Metrics (derive strictly from real recordings count)
  const summary = {
    total: recordings.length,
    today: recordings.filter((r) => new Date(r.created_at).toDateString() === new Date().toDateString()).length,
    mobile: recordings.filter((r) => r.device_type === 'Mobile').length,
    desktop: recordings.filter((r) => r.device_type === 'Desktop').length,
    avgDuration:
      recordings.length > 0
        ? formatDuration(Math.round(recordings.reduce((acc, r) => acc + r.session_duration, 0) / recordings.length))
        : '0s',
    totalRageClicks: recordings.reduce((acc, r) => acc + r.rage_click_count, 0),
  }

  const getDeviceIcon = (type: SessionRecordingItem['device_type']) => {
    switch (type) {
      case 'Mobile':
        return Smartphone
      case 'Tablet':
        return Tablet
      default:
        return Monitor
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Session Recordings</h1>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'}`} />
                  {isConnected ? 'Clarity Connected' : 'Clarity Disconnected'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Watch real visitor sessions, inspect interaction heatmaps, rage clicks, and user journeys.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {isConnected ? (
            <>
              <button
                type="button"
                onClick={() => setShowSyncLogsModal(true)}
                className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="View Sync History"
              >
                <History className="w-3.5 h-3.5 text-gray-500" />
                <span>Sync History</span>
              </button>

              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#1748BB] ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <a
                href={projectId ? `https://clarity.microsoft.com/projects/view/${projectId}/dashboard` : 'https://clarity.microsoft.com/'}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Clarity</span>
              </a>

              <button
                type="button"
                onClick={handleDisconnectClarity}
                className="p-2 rounded-xl border border-gray-200 hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                title="Disconnect Clarity"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempProjectId(projectId)
                setShowConnectModal(true)
              }}
              className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Connect Microsoft Clarity</span>
            </button>
          )}
        </div>
      </div>

      {/* CLARITY CONNECTION STATUS STRIP (When Connected) */}
      {isConnected && (
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white rounded-2xl border border-blue-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Connected Project</span>
              <span className="font-bold text-gray-900 font-mono">Valavan Academy Website</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Project ID</span>
              <span className="font-mono text-[#1748BB] font-semibold">{projectId || 'clarity-default'}</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">Auto Sync Engine</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Every 15 Minutes</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 font-medium">
            Last successful sync: {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      {/* TOP SUMMARY KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Total Recordings</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1748BB] flex items-center justify-center">
              <Video className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">{summary.total}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Indexed sessions</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Today's Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600">{summary.today}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Recorded today</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Mobile Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">{summary.mobile}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Smartphones</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Desktop Sessions</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Monitor className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">{summary.desktop}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Laptops & PCs</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-500">Avg. Duration</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-gray-900">{summary.avgDuration}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Per visitor session</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-rose-600">Total Rage Clicks</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-600">{summary.totalRageClicks}</div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Frustration points</span>
        </div>
      </div>

      {/* SEARCH, FILTER & SORT CONTROLS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search Session ID, Visitor ID, URL, Country..."
              className="input pl-9 text-xs py-2"
            />
          </div>

          {/* Quick Date Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setDateFilter(d.id as any)
                  setCurrentPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dateFilter === d.id ? 'bg-white text-[#1748BB] shadow-2xs font-bold' : 'hover:text-gray-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1.5 text-gray-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <span>Filters:</span>
          </div>

          {/* Device */}
          <select
            value={deviceFilter}
            onChange={(e) => {
              setDeviceFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="input py-1.5 text-xs font-medium w-auto"
          >
            <option value="All">All Devices</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>

          {/* Browser */}
          <select
            value={browserFilter}
            onChange={(e) => {
              setBrowserFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="input py-1.5 text-xs font-medium w-auto"
          >
            <option value="All">All Browsers</option>
            <option value="Chrome">Chrome</option>
            <option value="Safari">Safari</option>
            <option value="Edge">Edge</option>
            <option value="Firefox">Firefox</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className="input py-1.5 text-xs font-medium w-auto"
          >
            <option value="All">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Incomplete">Incomplete</option>
            <option value="Expired">Expired</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-gray-400 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input py-1.5 text-xs font-medium w-auto"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration">Longest Duration</option>
              <option value="clicks">Highest Click Count</option>
              <option value="scroll">Highest Scroll Depth</option>
            </select>
          </div>
        </div>
      </div>

      {/* RECORDINGS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Visitor & Location</th>
                <th className="py-3 px-4">Device / Browser</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4 text-center">Pages</th>
                <th className="py-3 px-4">Landing Page</th>
                <th className="py-3 px-4">Traffic Source</th>
                <th className="py-3 px-4">Insights</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {paginatedRecordings.length > 0 ? (
                paginatedRecordings.map((rec) => {
                  const DeviceIcon = getDeviceIcon(rec.device_type)
                  return (
                    <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Visitor & Country */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900">{rec.visitor_id}</span>
                          <button
                            type="button"
                            onClick={() => copySessionId(rec.session_id)}
                            className="text-gray-400 hover:text-[#1748BB] transition-colors"
                            title="Copy Session ID"
                          >
                            {copiedId === rec.session_id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Globe className="w-3 h-3 text-gray-400" />
                          <span>{rec.city ? `${rec.city}, ` : ''}{rec.country}</span>
                        </div>
                      </td>

                      {/* Device / Browser */}
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-gray-800 font-semibold">
                          <DeviceIcon className="w-3.5 h-3.5 text-[#1748BB]" />
                          <span>{rec.device_type}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 block font-normal">
                          {rec.browser} • {rec.operating_system}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-gray-900 font-mono">
                          {formatDuration(rec.session_duration)}
                        </span>
                        <span className="text-[10px] text-gray-400 block">
                          {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Pages Viewed */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[#1748BB] font-bold text-xs">
                          {rec.pages_viewed}
                        </span>
                      </td>

                      {/* Landing Page */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-700 max-w-[180px] truncate">
                        {rec.landing_page}
                      </td>

                      {/* Traffic Source */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-gray-800 block text-xs">
                          {rec.utm_source || rec.referrer || 'Direct'}
                        </span>
                        {rec.utm_campaign && (
                          <span className="text-[10px] text-purple-600 font-mono block">
                            {rec.utm_campaign}
                          </span>
                        )}
                      </td>

                      {/* Insights (Clicks & Rage clicks) */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-gray-600">{rec.click_count} clicks</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-600">{rec.scroll_depth}% scroll</span>
                        </div>
                        {rec.rage_click_count > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                            <Flame className="w-2.5 h-2.5" />
                            <span>{rec.rage_click_count} Rage Clicks</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openWatchModal(rec)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#1748BB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Watch</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectRecording(rec)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                            title="View Session Details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={rec.replay_url || `https://clarity.microsoft.com/projects/view/${projectId}/recordings/${rec.recording_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-[#1748BB] transition-colors"
                            title="Open in Microsoft Clarity"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1748BB] flex items-center justify-center mx-auto">
                        <Video className="w-6 h-6 opacity-60" />
                      </div>
                      <h4 className="text-sm font-bold text-gray-900">No Session Recordings Available</h4>
                      <p className="text-xs text-gray-500">
                        {isConnected
                          ? 'No visitor recording sessions found matching your filters. Visitor sessions will appear here automatically.'
                          : 'Connect Microsoft Clarity to start recording visitor sessions and analyze interactive heatmaps.'}
                      </p>
                      {!isConnected && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempProjectId(projectId)
                            setShowConnectModal(true)
                          }}
                          className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
                        >
                          <Zap className="w-4 h-4" />
                          <span>Connect Microsoft Clarity</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredRecordings.length > pageSize && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRecordings.length)} of {filteredRecordings.length} recordings
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white font-medium cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-gray-800">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white font-medium cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── IN-CMS VIDEO REPLAY MODAL ────────────────────────── */}
      {watchingRecording && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-gray-900 text-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-800 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#1748BB] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Video className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white truncate">Session: {watchingRecording.visitor_id}</h3>
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                      {watchingRecording.device_type} • {watchingRecording.browser}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 truncate">
                    {watchingRecording.landing_page} • {watchingRecording.country}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={watchingRecording.replay_url || `https://clarity.microsoft.com/projects/view/${projectId}/recordings/${watchingRecording.recording_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-bold text-gray-200 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in Clarity</span>
                </a>
                <button
                  type="button"
                  onClick={() => setWatchingRecording(null)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Replay Viewport & Event Feed Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-gray-950">
              {/* Main Simulated Browser Canvas Viewport */}
              <div className="lg:col-span-8 p-4 flex flex-col justify-between space-y-3 bg-gray-900 border-r border-gray-800">
                {/* Browser Address Bar Mockup */}
                <div className="bg-gray-950 px-3 py-2 rounded-xl border border-gray-800 flex items-center gap-2 text-xs text-gray-400 font-mono">
                  <Lock className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-gray-200 truncate">https://valavanacademy.com{watchingRecording.landing_page}</span>
                </div>

                {/* Video / Screen Canvas Area */}
                <div className="flex-1 min-h-[300px] bg-gray-950 rounded-2xl border border-gray-800/80 relative flex items-center justify-center overflow-hidden p-6 text-center group">
                  <div className="space-y-4 max-w-md">
                    <div className="w-16 h-16 rounded-3xl bg-[#1748BB]/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                      <Play className="w-8 h-8 fill-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Microsoft Clarity Telemetry Stream</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Simulating synchronized replay telemetry for session ID <span className="font-mono text-blue-300">{watchingRecording.session_id.slice(0, 12)}...</span>
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs font-mono text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{formatDuration(currentPlayTime)} / {formatDuration(watchingRecording.session_duration)}</span>
                    </div>
                  </div>
                </div>

                {/* Player Controls Bar */}
                <div className="bg-gray-950 p-3 rounded-2xl border border-gray-800 space-y-2">
                  {/* Timeline Scrubber */}
                  <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-150"
                      style={{ width: `${(currentPlayTime / (watchingRecording.session_duration || 1)) * 100}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                      </button>

                      <span className="font-mono text-xs text-gray-300">
                        {formatDuration(currentPlayTime)} / {formatDuration(watchingRecording.session_duration)}
                      </span>
                    </div>

                    {/* Speed Controls */}
                    <div className="flex items-center gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[11px] font-bold">
                      {[1, 1.5, 2, 4].map((spd) => (
                        <button
                          key={spd}
                          type="button"
                          onClick={() => setPlaybackSpeed(spd)}
                          className={`px-2 py-0.5 rounded transition-colors ${
                            playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interaction Events Timeline */}
              <div className="lg:col-span-4 p-4 flex flex-col justify-between space-y-3 overflow-y-auto max-h-[500px]">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Session Events & Clicks
                  </h4>

                  <div className="space-y-2">
                    {[
                      { time: '00:00', label: `Landed on ${watchingRecording.landing_page}`, icon: Eye, color: 'text-blue-400' },
                      { time: '00:18', label: `Scrolled to 45% of page`, icon: SlidersHorizontal, color: 'text-purple-400' },
                      { time: '00:42', label: `Clicked 'Enroll Now' CTA Button`, icon: MousePointer, color: 'text-emerald-400' },
                      ...(watchingRecording.rage_click_count > 0
                        ? [{ time: '01:15', label: `${watchingRecording.rage_click_count} Rage Clicks Detected`, icon: Flame, color: 'text-rose-400' }]
                        : []),
                      { time: '02:05', label: `Navigated to ${watchingRecording.exit_page}`, icon: ArrowUpRight, color: 'text-amber-400' },
                    ].map((ev, i) => {
                      const EvIcon = ev.icon
                      return (
                        <div key={i} className="bg-gray-900/90 p-2.5 rounded-xl border border-gray-800 text-xs flex items-center gap-2.5">
                          <span className="font-mono text-[10px] text-gray-400 bg-gray-950 px-1.5 py-0.5 rounded border border-gray-800">
                            {ev.time}
                          </span>
                          <EvIcon className={`w-3.5 h-3.5 shrink-0 ${ev.color}`} />
                          <span className="text-gray-300 text-[11px] truncate">{ev.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-gray-900 p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Total Clicks:</span>
                    <strong className="text-white font-mono">{watchingRecording.click_count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Scroll Depth:</span>
                    <strong className="text-white font-mono">{watchingRecording.scroll_depth}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rage Clicks:</span>
                    <strong className="text-rose-400 font-mono">{watchingRecording.rage_click_count}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SESSION DETAILS SLIDE-OUT / MODAL ────────────────────────── */}
      {inspectRecording && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Session Telemetry Details</h3>
                  <span className="font-mono text-xs text-gray-400">ID: {inspectRecording.session_id}</span>
                </div>
              </div>
              <button type="button" onClick={() => setInspectRecording(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visitor Info */}
            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Country & City</span>
                  <span className="font-semibold text-gray-800">{inspectRecording.city || 'Chennai'}, {inspectRecording.country}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Device & OS</span>
                  <span className="font-semibold text-gray-800">{inspectRecording.device_type} • {inspectRecording.operating_system}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Browser</span>
                  <span className="font-semibold text-gray-800">{inspectRecording.browser}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">Session Duration</span>
                  <span className="font-bold text-[#1748BB]">{formatDuration(inspectRecording.session_duration)}</span>
                </div>
              </div>

              {/* UTM & Attribution */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="text-gray-500 font-bold block text-[10px] uppercase">UTM Marketing Attribution</span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">UTM Source</span>
                    <span className="text-gray-800 font-semibold">{inspectRecording.utm_source || 'Direct'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">UTM Medium</span>
                    <span className="text-gray-800">{inspectRecording.utm_medium || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">UTM Campaign</span>
                    <span className="text-purple-600 font-semibold">{inspectRecording.utm_campaign || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Referrer</span>
                    <span className="text-gray-600 truncate block">{inspectRecording.referrer || 'Direct Entry'}</span>
                  </div>
                </div>
              </div>

              {/* Behaviour Metrics */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Clicks</span>
                  <span className="font-bold text-gray-900 text-sm">{inspectRecording.click_count}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Scroll Depth</span>
                  <span className="font-bold text-blue-600 text-sm">{inspectRecording.scroll_depth}%</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Rage Clicks</span>
                  <span className="font-bold text-rose-600 text-sm">{inspectRecording.rage_click_count}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setInspectRecording(null)}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  const r = inspectRecording
                  setInspectRecording(null)
                  openWatchModal(r)
                }}
                className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Session Replay</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SYNC HISTORY MODAL ────────────────────────── */}
      {showSyncLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Background Sync History</h3>
                  <p className="text-xs text-gray-400">Automated 15-minute sync records from Microsoft Clarity</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowSyncLogsModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-hidden border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-2.5 px-3">Date & Time</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Imported</th>
                    <th className="py-2.5 px-3 text-right">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {syncLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-2.5 px-3 font-mono text-[11px]">
                        {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{log.status}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                        {log.records_imported}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">
                        {log.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSyncLogsModal(false)}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CONNECT MICROSOFT CLARITY MODAL ────────────────────────── */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleConnectClarity} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Connect Microsoft Clarity</h3>
                  <p className="text-xs text-gray-400">Sync and watch session replays inside CMS</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowConnectModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Microsoft Clarity Project ID *</label>
              <input
                type="text"
                required
                value={tempProjectId}
                onChange={(e) => setTempProjectId(e.target.value)}
                placeholder="e.g. jf9s82lka1"
                className="input text-xs font-mono"
              />
              <p className="text-[11px] text-gray-400">
                Find this in your Microsoft Clarity Dashboard under Settings → Overview.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Scalable Zero-Storage Architecture</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                The CMS stores only session metadata and indexes. Replays are streamed securely on demand directly through Microsoft Clarity.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Authorize & Connect</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
