'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Bell, LogOut, ExternalLink } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function AdminHeader({ user }: { user: User }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1748BB] transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Website
        </a>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-gray-800">
              {user.email?.split('@')[0]}
            </div>
            <div className="text-xs text-gray-400">Administrator</div>
          </div>
          <div className="w-8 h-8 bg-[#1748BB] rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
