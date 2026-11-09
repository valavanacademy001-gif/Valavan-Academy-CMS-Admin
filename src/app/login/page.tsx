'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setErrorMessage(error.message)
        toast.error(error.message || 'Invalid email or password')
        return
      }

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-100/40 via-blue-50/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none -z-10"
        style={{
          backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 p-2.5 shadow-md shadow-blue-500/10 border border-gray-200/80">
            <img src="/logo-icon.png" alt="Valavan Academy" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Valavan Academy</h1>
          <p className="text-gray-500 text-sm mt-1">Admin Control Center</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)]">
          <h2 className="text-xl font-bold text-gray-900 mb-6 tracking-tight">Sign in to CMS</h2>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm space-y-2">
              <div className="font-semibold flex items-center gap-1.5 text-red-900">
                <span>⚠ Authentication Error</span>
              </div>
              <p className="leading-relaxed">{errorMessage}</p>
              {errorMessage.includes('exceed_egress_quota') && (
                <div className="pt-2 border-t border-red-200 text-xs text-red-700 space-y-1">
                  <p className="font-semibold text-red-900">How to restore Supabase service:</p>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Go to your Supabase project dashboard (Settings &gt; Billing).</li>
                    <li>Remove Spend Caps or upgrade the project plan to restore egress access.</li>
                    <li>Or point <code className="bg-red-100 px-1 py-0.5 rounded font-mono">.env.local</code> to an active Supabase project.</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1748BB] focus:border-transparent transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1748BB] focus:border-transparent transition-all pr-12 shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#1748BB] hover:text-[#0E3594] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#1748BB] hover:bg-[#0E3594] text-white font-bold text-sm rounded-xl transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-blue-600/25 active:scale-[0.99] cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © {new Date().getFullYear()} Valavan Academy. All rights reserved.
        </p>
      </div>
    </div>
  )
}
