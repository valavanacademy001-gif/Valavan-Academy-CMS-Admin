import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, BookOpen } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Programs</h1>
          <p className="text-gray-500 text-sm mt-1">{programs?.length ?? 0} programs</p>
        </div>
        <Link href="/dashboard/programs/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Program
        </Link>
      </div>

      <div className="card overflow-hidden">
        {programs && programs.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Duration</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Updated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {program.thumbnail_url ? (
                        <img src={program.thumbnail_url} alt={program.title} className="w-10 h-10 rounded-lg object-cover" />
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
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-400">{formatDate(program.updated_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/dashboard/programs/${program.id}`} className="text-sm font-medium text-[#1748BB] hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">No programs yet</h3>
            <Link href="/dashboard/programs/new" className="btn-primary inline-flex mt-4">
              <Plus className="w-4 h-4" /> Add First Program
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
