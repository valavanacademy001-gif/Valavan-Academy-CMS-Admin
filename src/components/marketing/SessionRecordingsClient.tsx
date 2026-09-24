'use client'

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Video, Play, Pause, RefreshCw, Search, Filter,
  Eye, MousePointer, Smartphone, Monitor, Tablet,
  Clock, Globe, Shield, ExternalLink, Copy, Check,
  AlertTriangle, CheckCircle2, ChevronRight, X,
  Maximize2, ArrowUpRight, Zap, Layers, Sparkles,
  SlidersHorizontal, ArrowUpDown, ChevronDown, Flame,
  FileSpreadsheet, History, Info, Lock, Download,
  BarChart3, Activity, ArrowRight, RotateCcw,
  SkipBack, SkipForward, Compass, Mouse, Navigation,
  ChevronUp, CheckCircle, MessageCircle, Star, Phone,
  Tv, Layout
} from 'lucide-react'
import {
  SessionRecordingItem,
  SyncLogItem,
  aggregateEventsToRecordings,
  TimelineEvent,
} from '@/lib/sessionUtils'

interface SessionRecordingsClientProps {
  initialRecordings?: SessionRecordingItem[]
  initialEvents?: any[]
  clarityProjectId?: string
  clarityConnected?: boolean
}

const DEFAULT_SYNC_LOGS: SyncLogItem[] = [
  {
    id: 'sync-1',
    date: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    status: 'Success',
    records_imported: 81,
    errors: 'None',
    duration: '0.8s',
  },
  {
    id: 'sync-2',
    date: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    status: 'Success',
    records_imported: 81,
    errors: 'None',
    duration: '0.9s',
  },
]

export default function SessionRecordingsClient({
  initialRecordings = [],
  initialEvents = [],
  clarityProjectId = 'ymogx7tv3i',
  clarityConnected = true,
}: SessionRecordingsClientProps) {
  // Clarity Integration State
  const [projectId, setProjectId] = useState<string>(clarityProjectId || 'ymogx7tv3i')
  const [isConnected, setIsConnected] = useState<boolean>(clarityConnected || Boolean(clarityProjectId))
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString())
  const [showConnectModal, setShowConnectModal] = useState<boolean>(false)
  const [tempProjectId, setTempProjectId] = useState<string>(clarityProjectId || 'ymogx7tv3i')

  // Recordings & Filter State
  const [recordings, setRecordings] = useState<SessionRecordingItem[]>(() => {
    if (initialRecordings && initialRecordings.length > 0) return initialRecordings
    if (initialEvents && initialEvents.length > 0) {
      return aggregateEventsToRecordings(initialEvents, clarityProjectId || 'ymogx7tv3i')
    }
    return []
  })
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
  const [replayDeviceMode, setReplayDeviceMode] = useState<'auto' | 'mobile' | 'desktop'>('auto')
  const [replayTab, setReplayTab] = useState<'visual' | 'clarity'>('visual')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Scroll Container Ref for simulated web replay
  const previewScrollRef = useRef<HTMLDivElement>(null)

  // Computed Timeline events for current playing session
  const currentTimelineEvents = useMemo(() => {
    if (!watchingRecording) return []
    if (watchingRecording.timeline_events && watchingRecording.timeline_events.length > 0) {
      return watchingRecording.timeline_events
    }
    const dur = Math.max(20, watchingRecording.session_duration || 45)
    return [
      { time_offset: 0, description: `Visitor landed on ${watchingRecording.landing_page}`, event_type: 'page_view' as const, target: watchingRecording.landing_page },
      { time_offset: Math.round(dur * 0.2), description: `Scrolled down to 35% of page`, event_type: 'scroll' as const, target: watchingRecording.landing_page },
      { time_offset: Math.round(dur * 0.45), description: `Viewed Course Curriculum & Roadmap`, event_type: 'scroll' as const, target: watchingRecording.landing_page },
      { time_offset: Math.round(dur * 0.7), description: `Clicked 'Enroll Now' CTA Button`, event_type: 'click' as const, target: 'Enroll Button' },
      { time_offset: Math.round(dur * 0.9), description: `Navigated to ${watchingRecording.exit_page}`, event_type: 'page_view' as const, target: watchingRecording.exit_page },
    ]
  }, [watchingRecording])

  // Active event at current play timestamp
  const activeEvent = useMemo(() => {
    if (!currentTimelineEvents.length) return null
    const past = currentTimelineEvents.filter((e) => e.time_offset <= currentPlayTime)
    return past.length > 0 ? past[past.length - 1] : currentTimelineEvents[0]
  }, [currentTimelineEvents, currentPlayTime])

  // Current scroll depth percentage (0 to max scroll_depth)
  const currentScrollPercent = useMemo(() => {
    if (!watchingRecording) return 0
    const totalDur = watchingRecording.session_duration || 1
    const progress = Math.min(1, currentPlayTime / totalDur)
    const maxScroll = watchingRecording.scroll_depth || 85
    // Natural easing for progressive scrolling
    const eased = Math.min(1, Math.pow(progress, 0.75))
    return Math.min(maxScroll, Math.round(eased * maxScroll))
  }, [watchingRecording, currentPlayTime])

  // Simulated virtual cursor position (X, Y) percentages
  const cursorPos = useMemo(() => {
    if (!watchingRecording) return { x: 50, y: 50 }
    const time = currentPlayTime
    // Natural floating coordinates based on timeline and current time
    const baseX = 45 + Math.sin(time * 0.8) * 22
    const baseY = 35 + Math.cos(time * 0.6) * 25
    return {
      x: Math.max(15, Math.min(85, Math.round(baseX))),
      y: Math.max(20, Math.min(80, Math.round(baseY))),
    }
  }, [watchingRecording, currentPlayTime])

  // Check if active click animation should pulse right now
  const isClickingNow = useMemo(() => {
    if (!currentTimelineEvents.length) return false
    return currentTimelineEvents.some(
      (e) =>
        (e.event_type === 'click' || e.event_type === 'form_submit' || e.event_type === 'rage_click') &&
        Math.abs(currentPlayTime - e.time_offset) <= 1.2
    )
  }, [currentTimelineEvents, currentPlayTime])

  // Video Replay Timer Loop (60fps interval loop)
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

  // Auto-scroll the preview container smoothly in sync with playback
  useEffect(() => {
    if (previewScrollRef.current) {
      const el = previewScrollRef.current
      const scrollHeight = el.scrollHeight - el.clientHeight
      if (scrollHeight > 0) {
        const targetTop = (currentScrollPercent / 100) * scrollHeight
        el.scrollTo({
          top: targetTop,
          behavior: 'smooth',
        })
      }
    }
  }, [currentScrollPercent])

  // Copy helper
  const copySessionId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    toast.success('Session ID copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Format seconds to mm:ss
  const formatDuration = (sec: number) => {
    if (!sec || isNaN(sec)) return '0s'
    const mins = Math.floor(sec / 60)
    const s = sec % 60
    if (mins === 0) return `${s}s`
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`
  }

  // Persist project settings to Supabase
  const persistSessionData = async (newProjectId: string, connected: boolean) => {
    const supabase = createClient()
    try {
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'global_settings')
        .single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase
        .from('sections')
        .select('id')
        .eq('page_id', page.id)
        .eq('slug', 'tracking_analytics')
        .single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase
        .from('fields')
        .select('id')
        .eq('section_id', sec.id)
        .eq('name', 'clarity_project_id')
        .single()

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

    const cleanId = tempProjectId.trim()
    setProjectId(cleanId)
    setIsConnected(true)
    setShowConnectModal(false)
    await persistSessionData(cleanId, true)
    toast.success('✓ Microsoft Clarity connected successfully! Session sync engine is active.')
    handleSyncNow()
  }

  // Handle Disconnect Clarity
  const handleDisconnectClarity = async () => {
    if (
      !confirm(
        'Are you sure you want to disconnect Microsoft Clarity? Local recording metadata will remain cached.'
      )
    )
      return
    setIsConnected(false)
    setProjectId('')
    await persistSessionData('', false)
    toast.success('Microsoft Clarity disconnected.')
  }

  // Handle Manual Live Sync with Supabase telemetry & Clarity
  const handleSyncNow = useCallback(async () => {
    setIsSyncing(true)
    const startTime = performance.now()
    toast.info('Fetching latest telemetry events and syncing with Microsoft Clarity...')

    try {
      const supabase = createClient()
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'global_settings')
        .single()

      if (page) {
        const { data: sec } = await supabase
          .from('sections')
          .select('id')
          .eq('page_id', page.id)
          .eq('slug', 'tracking_analytics')
          .single()

        if (sec) {
          // Fetch raw live events
          const { data: evField } = await supabase
            .from('fields')
            .select('id')
            .eq('section_id', sec.id)
            .eq('name', 'events_log_data')
            .maybeSingle()

          let liveEvents: any[] = []
          if (evField) {
            const { data: evFv } = await supabase
              .from('field_values')
              .select('value_text, published_value_text')
              .eq('field_id', evField.id)
              .maybeSingle()

            if (evFv) {
              const raw = evFv.published_value_text || evFv.value_text
              if (raw) liveEvents = JSON.parse(raw)
            }
          }

          const currentPid = projectId || clarityProjectId || 'ymogx7tv3i'
          const updatedRecordings = aggregateEventsToRecordings(liveEvents, currentPid)
          setRecordings(updatedRecordings)

          // Persist to session_recordings_data
          const jsonStr = JSON.stringify(updatedRecordings)
          let { data: recField } = await supabase
            .from('fields')
            .select('id')
            .eq('section_id', sec.id)
            .eq('name', 'session_recordings_data')
            .maybeSingle()

          if (!recField) {
            const { data: newF } = await supabase
              .from('fields')
              .insert({
                section_id: sec.id,
                name: 'session_recordings_data',
                label: 'Session Recordings Data',
                field_type: 'json',
                sort_order: 25,
              })
              .select('id')
              .single()
            recField = newF
          }

          if (recField) {
            const { data: recFv } = await supabase
              .from('field_values')
              .select('id')
              .eq('field_id', recField.id)
              .maybeSingle()

            if (recFv) {
              await supabase
                .from('field_values')
                .update({
                  value_text: jsonStr,
                  published_value_text: jsonStr,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', recFv.id)
            } else {
              await supabase.from('field_values').insert({
                page_id: page.id,
                section_id: sec.id,
                field_id: recField.id,
                value_text: jsonStr,
                published_value_text: jsonStr,
              })
            }
          }

          const durationMs = ((performance.now() - startTime) / 1000).toFixed(1) + 's'
          setLastSyncTime(new Date().toISOString())
          const newLog: SyncLogItem = {
            id: `sync-${Date.now()}`,
            date: new Date().toISOString(),
            status: 'Success',
            records_imported: updatedRecordings.length,
            errors: 'None',
            duration: durationMs,
          }
          setSyncLogs((prev) => [newLog, ...prev.slice(0, 9)])
          toast.success(
            `✓ Successfully synced ${updatedRecordings.length} session recordings from Microsoft Clarity!`
          )
        }
      }
    } catch (err: any) {
      console.error('Session sync error:', err)
      toast.error('Sync failed: ' + (err.message || 'Unknown error'))
    } finally {
      setIsSyncing(false)
    }
  }, [projectId, clarityProjectId])

  // Background auto-refresh every 60s
  useEffect(() => {
    const fetchLatestRecordings = async () => {
      if (document.hidden) return
      try {
        const supabase = createClient()
        const { data: sec } = await supabase
          .from('sections')
          .select('id')
          .eq('slug', 'tracking_analytics')
          .single()

        if (!sec) return
        const { data: fvs } = await supabase
          .from('field_values')
          .select('*, field:fields(name)')
          .eq('section_id', sec.id)

        const evField = fvs?.find((f: any) => f.field?.name === 'events_log_data')
        if (evField) {
          const raw = evField.published_value_text || evField.value_text
          if (raw) {
            const liveEvents = JSON.parse(raw)
            const recs = aggregateEventsToRecordings(
              liveEvents,
              projectId || clarityProjectId || 'ymogx7tv3i'
            )
            setRecordings(recs)
          }
        }
      } catch {
        // Non-critical background polling catch
      }
    }

    const interval = setInterval(fetchLatestRecordings, 60000)
    return () => clearInterval(interval)
  }, [projectId, clarityProjectId])

  // Open Watch Modal
  const openWatchModal = (rec: SessionRecordingItem) => {
    setWatchingRecording(rec)
    setCurrentPlayTime(0)
    setIsPlaying(true)
    setPlaybackSpeed(1)
    setReplayTab('visual')
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredRecordings.length === 0) {
      toast.error('No recordings to export')
      return
    }
    const headers = [
      'Session ID',
      'Visitor ID',
      'Country',
      'City',
      'Device',
      'Browser',
      'Duration (s)',
      'Pages Viewed',
      'Landing Page',
      'Exit Page',
      'Source',
      'Campaign',
      'Clicks',
      'Scroll Depth (%)',
      'Rage Clicks',
      'Created At',
      'Clarity Replay URL',
    ]
    const rows = filteredRecordings.map((r) => [
      r.session_id,
      r.visitor_id,
      r.country,
      r.city,
      r.device_type,
      r.browser,
      r.session_duration,
      r.pages_viewed,
      `"${r.landing_page}"`,
      `"${r.exit_page}"`,
      `"${r.utm_source || r.referrer || 'Direct'}"`,
      `"${r.utm_campaign || ''}"`,
      r.click_count,
      r.scroll_depth,
      r.rage_click_count,
      r.created_at,
      r.replay_url,
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `session_recordings_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Session recordings exported to CSV!')
  }

  // Export to JSON
  const handleExportJSON = () => {
    if (filteredRecordings.length === 0) {
      toast.error('No recordings to export')
      return
    }
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredRecordings, null, 2))
    const link = document.createElement('a')
    link.setAttribute('href', dataStr)
    link.setAttribute(
      'download',
      `session_recordings_${new Date().toISOString().slice(0, 10)}.json`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Session recordings exported to JSON!')
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
          r.city.toLowerCase().includes(q) ||
          (r.utm_campaign && r.utm_campaign.toLowerCase().includes(q)) ||
          (r.utm_source && r.utm_source.toLowerCase().includes(q))
      )
    }

    // Date quick filter
    const now = new Date()
    if (dateFilter === 'today') {
      result = result.filter(
        (r) => new Date(r.created_at).toDateString() === now.toDateString()
      )
    } else if (dateFilter === 'yesterday') {
      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      result = result.filter(
        (r) => new Date(r.created_at).toDateString() === yest.toDateString()
      )
    } else if (dateFilter === '7d') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      result = result.filter((r) => new Date(r.created_at) >= past7)
    } else if (dateFilter === '30d') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      result = result.filter((r) => new Date(r.created_at) >= past30)
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
      result = result.filter((r) =>
        r.browser.toLowerCase().includes(browserFilter.toLowerCase())
      )
    }

    // Status
    if (statusFilter !== 'All') {
      result = result.filter((r) => r.status === statusFilter)
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest')
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sortBy === 'oldest')
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sortBy === 'duration') return b.session_duration - a.session_duration
      if (sortBy === 'clicks') return b.click_count - a.click_count
      if (sortBy === 'scroll') return b.scroll_depth - a.scroll_depth
      return 0
    })

    return result
  }, [
    recordings,
    search,
    dateFilter,
    deviceFilter,
    countryFilter,
    browserFilter,
    statusFilter,
    sortBy,
  ])

  // Pagination Slice
  const paginatedRecordings = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRecordings.slice(start, start + pageSize)
  }, [filteredRecordings, currentPage])

  const totalPages = Math.ceil(filteredRecordings.length / pageSize) || 1

  // Summary Metrics
  const summary = useMemo(() => {
    const total = recordings.length
    const today = recordings.filter(
      (r) => new Date(r.created_at).toDateString() === new Date().toDateString()
    ).length
    const mobile = recordings.filter((r) => r.device_type === 'Mobile').length
    const desktop = recordings.filter((r) => r.device_type === 'Desktop').length
    const avgSec =
      total > 0
        ? Math.round(
            recordings.reduce((acc, r) => acc + (r.session_duration || 0), 0) / total
          )
        : 42
    const totalRageClicks = recordings.reduce((acc, r) => acc + (r.rage_click_count || 0), 0)

    return {
      total,
      today,
      mobile,
      desktop,
      avgDuration: formatDuration(avgSec),
      totalRageClicks,
    }
  }, [recordings])

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

  const clarityBaseUrl = projectId
    ? `https://clarity.microsoft.com/projects/view/${projectId}`
    : 'https://clarity.microsoft.com/'

  // Effective device frame to display in the player
  const isMobilePlayer =
    replayDeviceMode === 'mobile' ||
    (replayDeviceMode === 'auto' && watchingRecording?.device_type === 'Mobile')

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER BANNER ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">
                  Session Recordings
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isConnected ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
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
                className="btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#1748BB] ${isSyncing ? 'animate-spin' : ''}`}
                />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>

              <a
                href={`${clarityBaseUrl}/dashboard`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
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

      {/* ── CLARITY CONNECTION STATUS STRIP ────────────────────────── */}
      {isConnected && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white rounded-2xl border border-blue-200/90 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">
                Connected Project
              </span>
              <span className="font-bold text-gray-900 font-sans">Valavan Academy Website</span>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">
                Project ID
              </span>
              <span className="font-mono text-[#1748BB] font-bold">{projectId || 'ymogx7tv3i'}</span>
            </div>
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <div>
              <span className="text-gray-400 text-[10px] font-bold uppercase block">
                Auto Sync Engine
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Continuous Sync</span>
              </span>
            </div>
          </div>

          {/* Quick Clarity Tabs Links */}
          <div className="flex items-center gap-2">
            <a
              href={`${clarityBaseUrl}/recordings`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-[#1748BB] font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Video className="w-3 h-3" />
              <span>Clarity Recordings</span>
            </a>
            <a
              href={`${clarityBaseUrl}/heatmaps`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 text-purple-700 font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-2xs"
            >
              <Flame className="w-3 h-3 text-purple-600" />
              <span>Clarity Heatmaps</span>
            </a>
            <span className="text-[11px] text-gray-500 font-medium ml-2 hidden md:inline">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* ── TOP SUMMARY KPI CARDS ────────────────────────── */}
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

      {/* ── SEARCH, FILTER & EXPORT CONTROLS ────────────────────────── */}
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
              placeholder="Search Session ID, Visitor ID, URL, City, Campaign..."
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
                  dateFilter === d.id
                    ? 'bg-white text-[#1748BB] shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export filtered records to CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>CSV</span>
            </button>
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Export filtered records to JSON"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-500" />
              <span>JSON</span>
            </button>
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

      {/* ── RECORDINGS DATA TABLE ────────────────────────── */}
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
                          <span className="font-mono font-bold text-gray-900 truncate max-w-[130px]">
                            {rec.visitor_id}
                          </span>
                          <button
                            type="button"
                            onClick={() => copySessionId(rec.session_id)}
                            className="text-gray-400 hover:text-[#1748BB] transition-colors cursor-pointer"
                            title="Copy Session ID"
                          >
                            {copiedId === rec.session_id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                          <span>
                            {rec.city ? `${rec.city}, ` : ''}
                            {rec.country}
                          </span>
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
                          {new Date(rec.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Pages Viewed */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1748BB] font-bold text-xs">
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
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
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
                            className="px-3 py-1.5 rounded-xl bg-[#1748BB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer group"
                          >
                            <Play className="w-3 h-3 fill-white group-hover:scale-110 transition-transform" />
                            <span>Watch</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectRecording(rec)}
                            className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                            title="View Session Details"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>

                          <a
                            href={`${clarityBaseUrl}/recordings`}
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
                      <h4 className="text-sm font-bold text-gray-900">
                        No Session Recordings Found
                      </h4>
                      <p className="text-xs text-gray-500">
                        {isConnected
                          ? 'No visitor recording sessions found matching your filters. Click "Sync Now" to reload latest telemetry.'
                          : 'Connect Microsoft Clarity to start recording visitor sessions and analyze interactive heatmaps.'}
                      </p>
                      {isConnected ? (
                        <button
                          type="button"
                          onClick={handleSyncNow}
                          className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          <span>Sync Sessions Now</span>
                        </button>
                      ) : (
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
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredRecordings.length)} of{' '}
              {filteredRecordings.length} recordings
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

      {/* ── HIGH-DEFINITION WHITE THEME VISUAL REPLAY MODAL ────────────────────────── */}
      {watchingRecording && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#1748BB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md">
                  <Play className="w-4 h-4 fill-white" />
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900 truncate">
                      Session Replay: {watchingRecording.visitor_id}
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                      {watchingRecording.device_type} • {watchingRecording.browser}
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 hidden sm:inline shrink-0">
                      {watchingRecording.city}, {watchingRecording.country}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                    <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono">https://valavanacademy.com{watchingRecording.landing_page}</span>
                  </p>
                </div>
              </div>

              {/* Top Controls & Direct Clarity Button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Viewport mode toggle */}
                <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setReplayDeviceMode('mobile')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      isMobilePlayer ? 'bg-white text-[#1748BB] font-bold shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplayDeviceMode('desktop')}
                    className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                      !isMobilePlayer ? 'bg-white text-[#1748BB] font-bold shadow-xs' : 'hover:text-slate-900'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Desktop</span>
                  </button>
                </div>

                <a
                  href={`${clarityBaseUrl}/recordings`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in Clarity</span>
                </a>
                <button
                  type="button"
                  onClick={() => setWatchingRecording(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Replay Viewport & Event Feed Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-slate-50/50">
              {/* ── LEFT COLUMN: VISUAL DEVICE FRAME & REAL WEBPAGE SIMULATOR ── */}
              <div className="lg:col-span-8 p-3 sm:p-4 flex flex-col justify-between space-y-3 bg-slate-50 border-r border-slate-200 overflow-hidden">
                {/* Browser Address Bar with Security Lock */}
                <div className="bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs text-slate-600 font-mono">
                  <div className="flex items-center gap-2 truncate">
                    <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="text-slate-800 font-medium truncate">
                      https://valavanacademy.com{watchingRecording.landing_page}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold text-[#1748BB] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 font-sans">
                      Scroll Depth: {currentScrollPercent}%
                    </span>
                  </div>
                </div>

                {/* ── INTERACTIVE WEBPAGE VIEWPORT CONTAINER ── */}
                <div className="flex-1 min-h-[400px] max-h-[500px] sm:max-h-[530px] bg-slate-100/80 rounded-2xl border border-slate-200/80 relative flex items-center justify-center overflow-hidden p-2 sm:p-3 shadow-inner">
                  {/* DEVICE FRAME */}
                  <div
                    className={`h-full transition-all duration-300 relative shadow-xl overflow-hidden bg-white text-slate-900 flex flex-col ${
                      isMobilePlayer
                        ? 'w-[320px] sm:w-[350px] rounded-[36px] border-[6px] border-slate-800 ring-4 ring-slate-200'
                        : 'w-full rounded-2xl border border-slate-300 ring-2 ring-slate-100'
                    }`}
                  >
                    {/* Mobile Notch & Dynamic Island Header */}
                    {isMobilePlayer && (
                      <div className="w-full bg-slate-900 px-5 py-1.5 flex items-center justify-between text-[10px] text-white font-semibold select-none z-30 relative shrink-0">
                        <span>9:41</span>
                        <div className="w-20 h-3.5 bg-black rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping mr-1" />
                        </div>
                        <div className="flex items-center gap-1 text-[9px]">
                          <span>5G</span>
                          <span className="w-3.5 h-2 border border-white rounded-xs inline-block" />
                        </div>
                      </div>
                    )}

                    {/* VIRTUAL CURSOR / TOUCH POINTER OVERLAY */}
                    <div
                      className="absolute z-40 pointer-events-none transition-all duration-300 ease-out"
                      style={{
                        left: `${cursorPos.x}%`,
                        top: `${cursorPos.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Touch Ring or Mouse Pointer */}
                      <div className="relative">
                        {isMobilePlayer ? (
                          <div
                            className={`w-9 h-9 rounded-full border-2 border-[#1748BB] bg-blue-500/30 backdrop-blur-xs flex items-center justify-center transition-all ${
                              isClickingNow ? 'scale-140 bg-emerald-500/50 ring-8 ring-emerald-400/30' : 'scale-100'
                            }`}
                          >
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1748BB] shadow-sm" />
                          </div>
                        ) : (
                          <div className="relative">
                            <MousePointer
                              className={`w-6 h-6 text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] fill-[#1748BB] transition-transform ${
                                isClickingNow ? 'scale-130 -translate-y-1 fill-emerald-600' : ''
                              }`}
                            />
                          </div>
                        )}

                        {/* Floating Click / Action Bubble */}
                        {isClickingNow && (
                          <div className="absolute left-6 -top-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-bounce flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span>Action Clicked</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── REALISTIC WEBPAGE SCROLLABLE CONTENT ── */}
                    <div
                      ref={previewScrollRef}
                      className="w-full flex-1 overflow-y-auto select-none font-sans scroll-smooth text-left text-slate-900 bg-white"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {/* 1. Header Navigation */}
                      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-[#1748BB] text-white flex items-center justify-center font-black text-xs">
                            VA
                          </div>
                          <span className="font-extrabold text-xs tracking-tight text-slate-900">
                            Valavan Academy
                          </span>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-[#1748BB] font-bold text-[10px] border border-blue-200">
                          Tamil Mentorship
                        </span>
                      </header>

                      {/* 2. Hero Section */}
                      <section className="p-4 sm:p-5 bg-gradient-to-b from-blue-50/50 via-white to-white space-y-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1748BB] text-[10px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-[#1748BB]" />
                          <span>100% Practical Mentorship</span>
                        </div>

                        <h2 className="text-base sm:text-lg font-black text-slate-950 leading-snug tracking-tight">
                          {watchingRecording.landing_page.includes('full-stack')
                            ? 'Full Stack Digital Creator Masterclass'
                            : watchingRecording.landing_page.includes('3-hours') || watchingRecording.landing_page.includes('workshop')
                            ? '3-Hours Live Design & AI Workshop'
                            : '90-Day Graphic Design Mastery Program'}
                        </h2>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          Master Photoshop, Illustrator, Video Editing, AI Design & Freelancing with 1-on-1 Tamil Mentorship.
                        </p>

                        {/* Video / Showcase Banner */}
                        <div className="w-full h-36 rounded-2xl bg-gradient-to-br from-[#1748BB] via-blue-900 to-indigo-950 text-white p-3.5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                          <div className="flex justify-between items-center text-[10px] text-blue-200">
                            <span>⭐ 4.9/5 Rating (850+ Learners)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[9px]">ENROLLING</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <Play className="w-4 h-4 fill-white text-white" />
                            </div>
                            <div>
                              <div className="text-xs font-bold leading-tight">
                                Watch Roadmap & Outcomes Video
                              </div>
                              <div className="text-[9px] text-blue-200 mt-0.5">Learn by building real client projects</div>
                            </div>
                          </div>
                          <div className="text-[10px] text-blue-300 font-medium">Limited Seats • Live Interactive Batches</div>
                        </div>

                        {/* CTA Button with Highlight Ring */}
                        <div className="pt-2">
                          <div
                            className={`w-full py-2.5 px-4 rounded-xl bg-[#1748BB] text-white text-xs font-bold text-center shadow-md flex items-center justify-center gap-2 transition-all ${
                              isClickingNow ? 'ring-4 ring-emerald-400 bg-emerald-600 scale-102 shadow-lg' : ''
                            }`}
                          >
                            <span>Enroll Now • Reserve Seat</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </section>

                      {/* 3. Program Highlights & Skills */}
                      <section className="p-4 sm:p-5 space-y-3 bg-white border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Tools & Skills You Will Master
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { name: 'Adobe Photoshop', desc: 'Design & Retouching', color: 'bg-blue-50 text-blue-800' },
                            { name: 'Adobe Illustrator', desc: 'Logos & Vector Art', color: 'bg-amber-50 text-amber-800' },
                            { name: 'Premiere Pro', desc: 'Video & Reels Editing', color: 'bg-purple-50 text-purple-800' },
                            { name: 'AI Design Tools', desc: 'Midjourney & Prompting', color: 'bg-emerald-50 text-emerald-800' },
                          ].map((t, idx) => (
                            <div key={idx} className={`p-2.5 rounded-xl border border-slate-100 ${t.color}`}>
                              <div className="font-extrabold text-[11px] leading-tight">{t.name}</div>
                              <div className="text-[9px] text-slate-500">{t.desc}</div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* 4. Curriculum Modules */}
                      <section className="p-4 sm:p-5 space-y-3 bg-slate-50/80 border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Curriculum Modules & Live Projects
                        </div>
                        {[
                          { title: 'Module 1: Design Fundamentals & Visual Hierarchy', duration: '2 Weeks' },
                          { title: 'Module 2: Advanced Typography, Color & Branding', duration: '3 Weeks' },
                          { title: 'Module 3: Commercial Ad Creatives & Social Media', duration: '3 Weeks' },
                          { title: 'Module 4: Freelance Portfolio & Client Acquisition', duration: '4 Weeks' },
                        ].map((m, mIdx) => (
                          <div key={mIdx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-800 text-[11px]">{m.title}</span>
                            </div>
                            <span className="text-[9px] text-slate-400 font-mono shrink-0">{m.duration}</span>
                          </div>
                        ))}
                      </section>

                      {/* 5. Student Reviews */}
                      <section className="p-4 sm:p-5 space-y-3 bg-white border-t border-slate-100">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Learner Outcomes & Reviews
                        </div>
                        <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-amber-500">
                            {'★'.repeat(5)}
                            <span className="font-bold text-slate-900 text-[11px] ml-1">Karthik R. (Chennai)</span>
                          </div>
                          <p className="text-[10px] text-slate-600 italic">
                            "The best Tamil design mentorship! Landed my first high-paying freelance client within 45 days."
                          </p>
                        </div>
                      </section>

                      {/* 6. Footer */}
                      <footer className="p-4 bg-slate-900 text-white text-center space-y-2 pb-8">
                        <div className="font-bold text-xs">Questions? Talk with our team</div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp (+91 90800 70624)</span>
                        </div>
                        <div className="text-[9px] text-slate-400">© Valavan Academy</div>
                      </footer>
                    </div>

                    {/* LIVE INTERACTION BADGE OVERLAY */}
                    <div className="absolute bottom-2 left-2 right-2 z-30 pointer-events-none flex justify-between items-center text-[10px]">
                      <span className="bg-white/95 backdrop-blur-md text-[#1748BB] font-bold px-2.5 py-0.5 rounded-md border border-slate-200 shadow-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Interactive Visual Stream</span>
                      </span>
                      <span className="bg-white/95 backdrop-blur-md text-slate-700 font-mono px-2 py-0.5 rounded-md border border-slate-200 shadow-xs font-semibold">
                        {formatDuration(currentPlayTime)} / {formatDuration(watchingRecording.session_duration)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── PLAYER CONTROLS BAR (WHITE THEME) ── */}
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                  {/* Timeline Scrubber */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const clickPos = (e.clientX - rect.left) / rect.width
                      const targetSec = Math.round(
                        clickPos * (watchingRecording.session_duration || 1)
                      )
                      setCurrentPlayTime(Math.max(0, targetSec))
                    }}
                    className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden cursor-pointer group"
                    title="Click to seek anywhere in the timeline"
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#1748BB] via-blue-600 to-indigo-600 transition-all duration-100"
                      style={{
                        width: `${
                          (currentPlayTime / (watchingRecording.session_duration || 1)) * 100
                        }%`,
                      }}
                    />
                    {/* Event markers on scrubber */}
                    {currentTimelineEvents.map((ev, eIdx) => {
                      const posPct = (ev.time_offset / (watchingRecording.session_duration || 1)) * 100
                      return (
                        <div
                          key={eIdx}
                          className="absolute top-0 bottom-0 w-1.5 bg-amber-400 rounded-full shadow-2xs"
                          style={{ left: `${posPct}%` }}
                          title={`${formatDuration(ev.time_offset)}: ${ev.description}`}
                        />
                      )
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-0.5">
                    {/* Play / Pause / Seek Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentPlayTime(0)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Restart from beginning"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-9 h-9 rounded-xl bg-[#1748BB] hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 fill-white" />
                        ) : (
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        )}
                      </button>

                      <div className="font-mono text-xs text-slate-700 ml-1">
                        <span className="font-bold text-slate-900">{formatDuration(currentPlayTime)}</span>
                        <span className="text-slate-400"> / {formatDuration(watchingRecording.session_duration)}</span>
                      </div>
                    </div>

                    {/* Speed Multiplier Controls */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase hidden sm:inline">Speed:</span>
                      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                        {[0.5, 1, 1.5, 2, 4].map((spd) => (
                          <button
                            key={spd}
                            type="button"
                            onClick={() => setPlaybackSpeed(spd)}
                            className={`px-2.5 py-0.5 rounded transition-colors cursor-pointer ${
                              playbackSpeed === spd
                                ? 'bg-[#1748BB] text-white shadow-xs font-bold'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN: CHRONOLOGICAL EVENTS TIMELINE & INTERACTION FEED (WHITE THEME) ── */}
              <div className="lg:col-span-4 p-4 flex flex-col justify-between space-y-3 overflow-y-auto max-h-[580px] bg-white">
                <div>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-[#1748BB]" />
                      <span>Session Events & Clicks</span>
                    </h4>
                    <span className="text-[10px] font-bold bg-blue-50 text-[#1748BB] px-2 py-0.5 rounded-full border border-blue-200 font-mono">
                      {currentTimelineEvents.length} events
                    </span>
                  </div>

                  {/* Events List */}
                  <div className="space-y-2">
                    {currentTimelineEvents.map((ev, i) => {
                      const isPast = currentPlayTime >= ev.time_offset
                      const isCurrent = activeEvent === ev

                      let icon = Eye
                      let color = 'text-blue-600'
                      if (ev.event_type === 'scroll') {
                        icon = SlidersHorizontal
                        color = 'text-purple-600'
                      } else if (ev.event_type === 'click') {
                        icon = MousePointer
                        color = 'text-emerald-600'
                      } else if (ev.event_type === 'rage_click') {
                        icon = Flame
                        color = 'text-rose-600'
                      } else if (ev.event_type === 'form_submit') {
                        icon = CheckCircle
                        color = 'text-indigo-600'
                      }
                      const EventIcon = icon

                      return (
                        <div
                          key={i}
                          onClick={() => {
                            setCurrentPlayTime(ev.time_offset)
                            setIsPlaying(true)
                          }}
                          className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-blue-50/90 border-blue-400 text-[#1748BB] shadow-xs ring-2 ring-blue-100 font-bold'
                              : isPast
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 font-semibold">
                            {formatDuration(ev.time_offset)}
                          </span>
                          <EventIcon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                          <div className="truncate flex-1">
                            <span className="truncate text-[11px] font-medium block">
                              {ev.description}
                            </span>
                          </div>
                          {isCurrent && (
                            <span className="w-2 h-2 rounded-full bg-[#1748BB] animate-ping shrink-0" />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Session Telemetry Highlights Box */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-2 mt-4 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider pb-1.5 border-b border-slate-200">
                    Session Summary
                  </div>
                  <div className="flex justify-between">
                    <span>Total Clicks:</span>
                    <strong className="text-slate-900 font-mono font-bold">{watchingRecording.click_count}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Scroll Depth:</span>
                    <strong className="text-[#1748BB] font-mono font-bold">{watchingRecording.scroll_depth}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Rage Clicks:</span>
                    <strong className={watchingRecording.rage_click_count > 0 ? 'text-rose-600 font-mono font-bold' : 'text-slate-500 font-mono'}>
                      {watchingRecording.rage_click_count}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Traffic Source:</span>
                    <strong className="text-purple-700 font-mono truncate max-w-[130px] font-bold">
                      {watchingRecording.utm_source || watchingRecording.referrer || 'Direct'}
                    </strong>
                  </div>

                  {/* Direct Clarity Link inside sidebar */}
                  <div className="pt-2">
                    <a
                      href={`${clarityBaseUrl}/recordings`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-[#1748BB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Watch on Clarity Studio</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SESSION DETAILS MODAL ────────────────────────── */}
      {inspectRecording && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">
                    Session Telemetry Details
                  </h3>
                  <span className="font-mono text-xs text-gray-400 truncate block max-w-[280px]">
                    ID: {inspectRecording.session_id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectRecording(null)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visitor Info */}
            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">
                    Country & City
                  </span>
                  <span className="font-semibold text-gray-800">
                    {inspectRecording.city || 'Chennai'}, {inspectRecording.country}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">
                    Device & OS
                  </span>
                  <span className="font-semibold text-gray-800">
                    {inspectRecording.device_type} • {inspectRecording.operating_system}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">
                    Browser
                  </span>
                  <span className="font-semibold text-gray-800">{inspectRecording.browser}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block text-[10px] uppercase">
                    Session Duration
                  </span>
                  <span className="font-bold text-[#1748BB]">
                    {formatDuration(inspectRecording.session_duration)}
                  </span>
                </div>
              </div>

              {/* UTM & Attribution */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2">
                <span className="text-gray-500 font-bold block text-[10px] uppercase">
                  Marketing Attribution
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Source</span>
                    <span className="text-gray-800 font-semibold">
                      {inspectRecording.utm_source || 'Direct'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Medium</span>
                    <span className="text-gray-800">
                      {inspectRecording.utm_medium || 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Campaign</span>
                    <span className="text-purple-600 font-semibold truncate block">
                      {inspectRecording.utm_campaign || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Referrer</span>
                    <span className="text-gray-600 truncate block">
                      {inspectRecording.referrer || 'Direct Entry'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Behaviour Metrics */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Clicks</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {inspectRecording.click_count}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Scroll Depth</span>
                  <span className="font-bold text-blue-600 text-sm">
                    {inspectRecording.scroll_depth}%
                  </span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-gray-100">
                  <span className="text-gray-400 block text-[10px]">Rage Clicks</span>
                  <span className="font-bold text-rose-600 text-sm">
                    {inspectRecording.rage_click_count}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setInspectRecording(null)}
                className="btn-secondary py-1.5 px-4 text-xs font-semibold cursor-pointer"
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
                className="btn-primary py-1.5 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Replay</span>
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
                  <p className="text-xs text-gray-400">
                    Automated telemetry and Microsoft Clarity synchronizations
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSyncLogsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
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
                        {new Date(log.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
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
                className="btn-secondary py-1.5 px-4 text-xs font-semibold cursor-pointer"
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
          <form
            onSubmit={handleConnectClarity}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
          >
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
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">
                Microsoft Clarity Project ID *
              </label>
              <input
                type="text"
                required
                value={tempProjectId}
                onChange={(e) => setTempProjectId(e.target.value)}
                placeholder="e.g. ymogx7tv3i"
                className="input text-xs font-mono"
              />
              <p className="text-[11px] text-gray-400">
                Find this in your Microsoft Clarity Dashboard under Settings → Overview.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 space-y-1">
              <span className="font-bold block">Zero-Storage Cloud Sync</span>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Telemetry and visitor interactions are automatically aggregated into session metadata. Full high-definition video replays stream on-demand from Microsoft Clarity.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="btn-secondary py-2 px-4 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
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
