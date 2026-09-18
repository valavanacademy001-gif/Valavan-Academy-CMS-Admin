'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, Users, Video,
  Image, Settings, Award, Star, ChevronRight, BarChart3,
  Target, Activity, FileSpreadsheet, Sparkles, Filter, Megaphone
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Pages', href: '/dashboard/pages', icon: FileText },
  { label: 'Programs', href: '/dashboard/programs', icon: BookOpen },
  { label: 'Testimonials', href: '/dashboard/testimonials', icon: Star },
  { label: 'Learner Stories', href: '/dashboard/learner-stories', icon: Video },
  { label: 'Certifications', href: '/dashboard/certifications', icon: Award },
  { label: 'Media Library', href: '/dashboard/media', icon: Image },
  { label: 'Site Settings', href: '/dashboard/settings', icon: Settings },
]

const marketingItems = [
  { label: 'Tracking & Pixels', href: '/dashboard/marketing/tracking', icon: BarChart3, badge: 'Live' },
  { label: 'Leads & Attribution', href: '/dashboard/marketing/leads', icon: Users },
  { label: 'Funnels & Goals', href: '/dashboard/marketing/funnels', icon: Target },
  { label: 'Live Event Stream', href: '/dashboard/marketing/events', icon: Activity },
  { label: 'Reports & Export', href: '/dashboard/marketing/reports', icon: FileSpreadsheet },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[270px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto select-none">
      {/* Logo */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
            <img src="/logo-icon.png" alt="Valavan Academy" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">Valavan Academy</div>
            <div className="text-xs text-[#1748BB] font-semibold">Admin CMS</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6">
        {/* Core Navigation */}
        <div className="space-y-1">
          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <span>Navigation</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && !pathname.startsWith('/dashboard/marketing'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-50 text-[#1748BB] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-gray-600'}`} style={{ width: '18px', height: '18px' }} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
              </Link>
            )
          })}
        </div>

        {/* Marketing & Tracking System */}
        <div className="space-y-1 pt-2 border-t border-gray-100">
          <div className="text-[11px] font-bold text-[#1748BB] uppercase tracking-wider px-3 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#1748BB]" />
              <span>Marketing & Tracking</span>
            </div>
            <span className="text-[9px] font-bold bg-blue-100 text-[#1748BB] px-1.5 py-0.5 rounded uppercase">v2.0</span>
          </div>

          {marketingItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.2 rounded-lg text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-50 text-[#1748BB] font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-[#1748BB]'}`} style={{ width: '18px', height: '18px' }} />
                <span className="flex-1">{item.label}</span>
                {item.badge && !isActive && (
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom User Info */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
          <div className="w-7 h-7 rounded-full bg-[#1748BB] flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-800 truncate">Super Admin</div>
            <div className="text-[10px] text-gray-400 truncate">valavanacademy001@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
