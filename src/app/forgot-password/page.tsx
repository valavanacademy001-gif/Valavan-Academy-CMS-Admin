'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      setSent(true)
      toast.success('Reset link sent! Check your email.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1748BB] rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-blue-200/70 text-sm mt-1">Valavan Academy Admin</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Check your email</h3>
              <p className="text-blue-200/70 text-sm mb-6">
                We sent a password reset link to <strong className="text-blue-200">{email}</strong>
              </p>
              <Link href="/login" className="text-blue-300 hover:text-blue-100 text-sm transition-colors">
                ← Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-blue-200/70 text-sm mb-4">
                Enter your admin email and we will send you a reset link.
              </p>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1748BB] hover:bg-[#0f3494] text-white font-semibold rounded-xl transition-all disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link href="/login" className="flex items-center gap-1 text-blue-300 hover:text-blue-100 text-sm transition-colors justify-center mt-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
