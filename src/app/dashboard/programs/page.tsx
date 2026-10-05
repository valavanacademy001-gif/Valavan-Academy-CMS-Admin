import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ProgramsTableClient from '@/components/programs/ProgramsTableClient'

export default async function ProgramsPage() {
  const supabase = await createClient()
  const { data: programs } = await supabase
    .from('programs')
    .select('id, title, slug, duration, status, is_visible, updated_at, thumbnail_url')
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

      {/* Info Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-800 flex items-start gap-2.5">
        <span className="font-bold text-blue-900">Visibility Control:</span>
        <span>
          Toggle the <strong>Website Visibility</strong> button on any program to instantly show or hide it from the website and the Programs page workshop banner. You can also reorder and toggle page sections under <strong>Pages → Programs</strong>.
        </span>
      </div>

      <div className="card overflow-hidden">
        <ProgramsTableClient initialPrograms={programs ?? []} />
      </div>
    </div>
  )
}
