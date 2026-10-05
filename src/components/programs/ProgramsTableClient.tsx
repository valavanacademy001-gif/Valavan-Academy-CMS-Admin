'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export type ProgramRow = {
  id: string
  title: string
  slug: string
  duration: string | null
  status: string
  is_visible: boolean | null
  updated_at: string
  thumbnail_url: string | null
}

export default function ProgramsTableClient({ initialPrograms }: { initialPrograms: ProgramRow[] }) {
  const [programs, setPrograms] = useState<ProgramRow[]>(initialPrograms)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleToggleVisibility = async (programId: string, currentVisible: boolean) => {
    setTogglingId(programId)
    const nextVisible = !currentVisible
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('programs')
      .update({
        is_visible: nextVisible,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId)

    setTogglingId(null)

    if (error) {
      toast.error('Failed to update visibility: ' + error.message)
      return
    }

    setPrograms((prev) =>
      prev.map((p) => (p.id === programId ? { ...p, is_visible: nextVisible } : p))
    )

    const prog = programs.find((p) => p.id === programId)
    toast.success(
      nextVisible
        ? `✓ "${prog?.title ?? 'Program'}" is now visible on website`
        : `"${prog?.title ?? 'Program'}" is now hidden from website & Programs page`
    )
  }

  if (programs.length === 0) {
    return (
      <div className="py-16 text-center">
        <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
        <h3 className="text-gray-500 font-medium">No programs yet</h3>
        <Link href="/dashboard/programs/new" className="btn-primary inline-flex mt-4">
          Add First Program
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/50">
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Website Visibility</th>
            <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Updated</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {programs.map((program) => {
            const isVisible = program.is_visible !== false
            const isToggling = togglingId === program.id

            return (
              <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {program.thumbnail_url ? (
                      <img src={program.thumbnail_url} alt={program.title} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                    ) : (
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-[#1748BB]" />
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{program.title}</div>
                      <code className="text-xs text-gray-400">/{program.slug}</code>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  <span className="text-sm text-gray-500">{program.duration ?? '—'}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge ${
                    program.status === 'published' ? 'badge-published' :
                    program.status === 'draft' ? 'badge-draft' : 'badge-archived'
                  }`}>
                    {program.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(program.id, isVisible)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isVisible
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                    title={isVisible ? 'Click to hide from website' : 'Click to show on website'}
                  >
                    {isToggling ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isVisible ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs text-gray-400">{formatDate(program.updated_at)}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/dashboard/programs/${program.id}`} className="text-sm font-medium text-[#1748BB] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
