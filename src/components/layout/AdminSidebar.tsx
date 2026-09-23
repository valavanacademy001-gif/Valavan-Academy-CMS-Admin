'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, FileText, BookOpen, Users, Video,
  Image, Settings, Award, Star, ChevronRight, BarChart3,
  Target, Activity, FileSpreadsheet, Sparkles, Filter, Megaphone,
  Globe, Code, Shield, Search, Zap, Layers, Lock, Sliders, X
} from 'lucide-react'

const websiteItems = [
  { label: 'Pages', href: '/dashboard/pages', icon: FileText },
  { label: 'Programs', href: '/dashboard/programs', icon: BookOpen },
  { label: 'Media Library', href: '/dashboard/media', icon: Image },
  { label: 'Testimonials', href: '/dashboard/testimonials', icon: Star },
  { label: 'Learner Stories', href: '/dashboard/learner-stories', icon: Video },
  { label: 'Certifications', href: '/dashboard/certifications', icon: Award },
]

const marketingItems = [
  { label: 'Tracking & Pixels', href: '/dashboard/marketing/tracking', icon: BarChart3, badge: 'Active' },
  { label: 'Page Tracking', href: '/dashboard/marketing/page-tracking', icon: Layers, badge: 'New' },
  { label: 'Lead Management', href: '/dashboard/marketing/leads', icon: Users, badge: 'Leads' },
  { label: 'Conversion Settings', href: '/dashboard/marketing/conversion-settings', icon: Target },
  { label: 'SEO & AEO Engine', href: '/dashboard/marketing/seo', icon: Search, badge: 'AEO' },
  { label: 'Session Recordings', href: '/dashboard/marketing/recordings', icon: Video, badge: 'Clarity' },
  { label: 'Live Event Stream', href: '/dashboard/marketing/events', icon: Activity },
  { label: 'Connections Hub', href: '/dashboard/marketing/connections', icon: Zap, badge: 'Hub' },
  { label: 'Reports & Export', href: '/dashboard/marketing/reports', icon: FileSpreadsheet },
]

const settingsItems = [
  { label: 'Domain Manager', href: '/dashboard/settings/domains', icon: Globe, badge: 'SSL' },
  { label: 'SEO Settings', href: '/dashboard/settings/seo', icon: Search },
  { label: 'Branding', href: '/dashboard/settings/branding', icon: Sliders },
  { label: 'Custom Code', href: '/dashboard/settings/custom-code', icon: Code },
  { label: 'Cookie Consent', href: '/dashboard/settings/cookie-consent', icon: Shield },
]

export default function AdminSidebar({
  onClose,
  isMobile = false,
}: {
  onClose?: () => void
  isMobile?: boolean
} = {}) {
  const pathname = usePathname()

  const isNavActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <aside className={`w-[275px] bg-white border-r border-gray-200 flex flex-col h-full shrink-0 overflow-y-auto select-none ${isMobile ? 'w-full border-r-0' : ''}`}>
      {/* Logo Header */}
      <div className="p-4.5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1748BB] to-blue-700 flex items-center justify-center shrink-0 overflow-hidden shadow-xs text-white font-black text-sm">
            VA
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 leading-tight">Valavan Academy</div>
            <div className="text-[11px] text-[#1748BB] font-semibold flex items-center gap-1">
              <span>Enterprise CMS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-5">
        {/* Dashboard Link */}
        <div>
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
              pathname === '/dashboard'
                ? 'bg-blue-50 text-[#1748BB] font-bold shadow-2xs'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 shrink-0 ${pathname === '/dashboard' ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-gray-600'}`} />
            <span className="flex-1">Dashboard</span>
            {pathname === '/dashboard' && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
          </Link>
        </div>

        {/* SECTION 1: WEBSITE */}
        <div className="space-y-0.5">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-1.5 flex items-center justify-between">
            <span>Website</span>
          </div>
          {websiteItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-1.8 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? 'bg-blue-50 text-[#1748BB] font-bold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
              </Link>
            )
          })}
        </div>

        {/* SECTION 2: MARKETING & TRACKING */}
        <div className="space-y-0.5 pt-2 border-t border-gray-100">
          <div className="text-[10px] font-bold text-[#1748BB] uppercase tracking-wider px-3 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-[#1748BB]" />
              <span>Marketing & Tracking</span>
            </div>
            <span className="text-[8px] font-bold bg-blue-100 text-[#1748BB] px-1 py-0.2 rounded">PRO</span>
          </div>
          {marketingItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-1.8 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? 'bg-blue-50 text-[#1748BB] font-bold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-[#1748BB]'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && !active && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    item.badge === 'New' ? 'bg-amber-100 text-amber-800' :
                    item.badge === 'Hub' ? 'bg-purple-100 text-purple-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
              </Link>
            )
          })}
        </div>

        {/* SECTION 3: WEBSITE SETTINGS */}
        <div className="space-y-0.5 pt-2 border-t border-gray-100">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-gray-500" />
              <span>Website Settings</span>
            </div>
          </div>
          {settingsItems.map((item) => {
            const Icon = item.icon
            const active = isNavActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-2.5 px-3 py-1.8 rounded-xl text-xs font-medium transition-all group ${
                  active
                    ? 'bg-blue-50 text-[#1748BB] font-bold shadow-2xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#1748BB]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#1748BB]" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom User Info */}
      <div className="p-3.5 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
          <div className="w-7 h-7 rounded-lg bg-[#1748BB] flex items-center justify-center shrink-0 shadow-xs">
            <Users className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-gray-800 truncate">Super Admin</div>
            <div className="text-[10px] text-gray-400 truncate">valavanacademy001@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
