import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText, BookOpen, Image, Star, Video, Award,
  Plus, TrendingUp, Eye, Clock
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalPages },
    { count: publishedPages },
    { count: draftPages },
    { count: totalPrograms },
    { count: totalMedia },
    { count: totalTestimonials },
    { data: recentLogs },
  ] = await Promise.all([
    supabase.from('pages').select('*', { count: 'exact', head: true }),
    supabase.from('pages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('pages').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('programs').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }),
    supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(8),
  ])

  const stats = [
    { label: 'Total Pages', value: totalPages ?? 0, icon: FileText, color: 'bg-blue-50 text-blue-600', href: '/dashboard/pages' },
    { label: 'Published', value: publishedPages ?? 0, icon: Eye, color: 'bg-green-50 text-green-600', href: '/dashboard/pages?status=published' },
    { label: 'Drafts', value: draftPages ?? 0, icon: Clock, color: 'bg-yellow-50 text-yellow-600', href: '/dashboard/pages?status=draft' },
    { label: 'Programs', value: totalPrograms ?? 0, icon: BookOpen, color: 'bg-purple-50 text-purple-600', href: '/dashboard/programs' },
    { label: 'Media Files', value: totalMedia ?? 0, icon: Image, color: 'bg-pink-50 text-pink-600', href: '/dashboard/media' },
    { label: 'Testimonials', value: totalTestimonials ?? 0, icon: Star, color: 'bg-orange-50 text-orange-600', href: '/dashboard/testimonials' },
  ]

  const quickActions = [
    { label: 'New Page', href: '/dashboard/pages/new', icon: FileText, desc: 'Create a new website page' },
    { label: 'New Program', href: '/dashboard/programs/new', icon: BookOpen, desc: 'Add a new course/program' },
    { label: 'Upload Media', href: '/dashboard/media', icon: Image, desc: 'Upload images or videos' },
    { label: 'Add Testimonial', href: '/dashboard/testimonials/new', icon: Star, desc: 'Add a student testimonial' },
    { label: 'Add Story', href: '/dashboard/learner-stories/new', icon: Video, desc: 'Add a learner video story' },
    { label: 'Add Certificate', href: '/dashboard/certifications/new', icon: Award, desc: 'Add a certification image' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here is an overview of your website.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link key={stat.label} href={stat.href} className="card p-4 hover:shadow-md transition-shadow group">
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#1748BB]" />
              Quick Actions
            </h2>
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#1748BB]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800 group-hover:text-[#1748BB] transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" />
                        {action.label}
                      </div>
                      <div className="text-xs text-gray-400">{action.desc}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1748BB]" />
              Recent Activity
            </h2>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-2 h-2 rounded-full bg-[#1748BB] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium capitalize">{log.action}</span>
                        {log.entity_name && <> — <span className="text-gray-500">{log.entity_name}</span></>}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(log.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recent activity yet.</p>
                <p className="text-xs mt-1">Start by creating a page or adding a program.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
