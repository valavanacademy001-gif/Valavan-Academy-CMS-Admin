'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import type { User } from '@supabase/supabase-js'

export default function AdminLayoutWrapper({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile sidebar automatically whenever navigation happens
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop Sidebar (hidden on mobile, visible on lg and above) */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Sidebar Off-Canvas Drawer + Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Off-canvas Sidebar Content */}
          <div className="relative flex-1 flex flex-col max-w-[280px] w-full bg-white z-10 shadow-2xl">
            <AdminSidebar onClose={() => setMobileMenuOpen(false)} isMobile />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader user={user} onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 md:p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
