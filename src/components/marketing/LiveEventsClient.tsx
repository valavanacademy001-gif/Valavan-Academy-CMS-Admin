'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Activity, Search, Filter, Play, Pause, RefreshCw,
  Eye, MousePointer, MessageCircle, FileText, Smartphone,
  Monitor, Tablet, Clock, Code, X, ChevronRight, Sparkles
} from 'lucide-react'

export interface EventLogItem {
  id: string
  event_name: string
  page_url: string
  visitor_id: string
  device: string
  browser: string
  timestamp: string
  metadata?: Record<string, any>
}

export default function LiveEventsClient({ initialEvents }: { initialEvents: EventLogItem[] }) {
  const [events, setEvents] = useState<EventLogItem[]>(initialEvents)
  const [isLive, setIsLive] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string>('All')
  const [inspectEvent, setInspectEvent] = useState<EventLogItem | null>(null)

  // Auto poll / refresh simulation for live telemetry
  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => {
      // Periodic check for new events
    }, 5000)
    return () => clearInterval(interval)
  }, [isLive])

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.event_name.toLowerCase().includes(search.toLowerCase()) ||
        ev.page_url.toLowerCase().includes(search.toLowerCase()) ||
        ev.visitor_id.toLowerCase().includes(search.toLowerCase())
      const matchType = selectedEvent === 'All' || ev.event_name === selectedEvent
      return matchSearch && matchType
    })
  }, [events, search, selectedEvent])

  const getEventBadge = (name: string) => {
    switch (name) {
      case 'whatsapp_click':
        return { label: 'WhatsApp Click', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: MessageCircle }
      case 'button_click':
        return { label: 'Button Click', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: MousePointer }
      case 'contact_form_submit':
      case 'form_submit':
        return { label: 'Form Submit', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: FileText }
      case 'video_play':
        return { label: 'Video Play', color: 'bg-red-50 text-red-700 border-red-200', icon: Play }
      case 'scroll_depth_75':
      case 'scroll_depth_50':
        return { label: 'Scroll Depth', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Activity }
      default:
        return { label: 'Page View', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Eye }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Live Event Stream & Telemetry</h1>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isLive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-600 animate-ping' : 'bg-gray-400'}`} />
                  {isLive ? 'Streaming Live' : 'Stream Paused'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Real-time stream of clicks, page views, video interactions, scroll depths, and form actions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsLive(!isLive)}
            className={`btn-secondary py-2 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              !isLive ? 'bg-amber-50 text-amber-700 border-amber-200' : ''
            }`}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />}
            <span>{isLive ? 'Pause Stream' : 'Resume Live Stream'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search event, page URL, visitor ID..."
            className="input pl-9 text-xs py-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="input py-2 text-xs font-medium"
          >
            <option value="All">All Event Types</option>
            <option value="page_view">Page Views</option>
            <option value="whatsapp_click">WhatsApp Clicks</option>
            <option value="button_click">Button Clicks</option>
            <option value="contact_form_submit">Form Submissions</option>
            <option value="video_play">Video Plays</option>
            <option value="scroll_depth_75">Scroll Depths</option>
          </select>
        </div>
      </div>

      {/* Events Stream Feed */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
              <tr>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Page Location</th>
                <th className="py-3 px-4">Visitor & Device</th>
                <th className="py-3 px-4">Browser</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((ev) => {
                  const badge = getEventBadge(ev.event_name)
                  const BadgeIcon = badge.icon
                  return (
                    <tr key={ev.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                        {ev.page_url}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <span className="font-mono text-xs text-gray-800 font-bold block">{ev.visitor_id}</span>
                        <span className="text-[10px] text-gray-400 block">{ev.device}</span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 text-xs">
                        {ev.browser}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 whitespace-nowrap">
                        {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setInspectEvent(ev)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1748BB] hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    No live events matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* METADATA INSPECTOR MODAL */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-base text-gray-900">Telemetry Event Payload</h3>
                <p className="text-xs text-gray-400 font-mono">{inspectEvent.event_name} • {inspectEvent.visitor_id}</p>
              </div>
              <button
                type="button"
                onClick={() => setInspectEvent(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400 font-bold block">Page URL</span>
                  <span className="font-mono text-gray-800 font-semibold">{inspectEvent.page_url}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block">Timestamp</span>
                  <span className="font-mono text-gray-800">{new Date(inspectEvent.timestamp).toISOString()}</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-gray-700 block mb-1">Payload JSON</span>
                <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(inspectEvent.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setInspectEvent(null)}
                className="btn-secondary py-1.5 px-4 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
