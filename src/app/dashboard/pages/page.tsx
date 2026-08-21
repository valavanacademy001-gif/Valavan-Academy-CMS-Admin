import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, FileText, Search } from 'lucide-react'
import { formatDate, getStatusColor } from '@/lib/utils'

export default async function PagesListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('pages')
    .select(`*, template:page_templates(name)`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.q) {
    query = query.ilike('title', `%${params.q}%`)
  }

  const { data: pages } = await query

  const statusFilters = [
    { label: 'All', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ]

  const activeStatus = params.status || 'all'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-500 text-sm mt-1">{pages?.length ?? 0} pages total</p>
        </div>
        <Link href="/dashboard/pages/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <Link
              key={f.value}
              href={`/dashboard/pages?status=${f.value}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeStatus === f.value
                  ? 'bg-[#1748BB] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <form>
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search pages..."
              className="input pl-9"
            />
          </form>
        </div>
      </div>

      {/* Pages Table */}
      <div className="card overflow-hidden">
        {pages && pages.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Page</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Template</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Updated</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-[#1748BB]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{page.title}</div>
                        {page.description && (
                          <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{page.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">/{page.slug}</code>
                  </td>
                  <td className="px-5 py-4 hidden lg:table-cell">
                    <span className="text-sm text-gray-500">
                      {(page.template as { name: string } | null)?.name ?? 'Standard'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      page.status === 'published' ? 'badge-published' :
                      page.status === 'draft' ? 'badge-draft' : 'badge-archived'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden xl:table-cell">
                    <span className="text-xs text-gray-400">{formatDate(page.updated_at)}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/dashboard/pages/${page.id}`}
                      className="text-sm font-medium text-[#1748BB] hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">No pages found</h3>
            <p className="text-gray-400 text-sm mt-1">
              {params.q ? `No results for "${params.q}"` : 'Create your first page to get started'}
            </p>
            {!params.q && (
              <Link href="/dashboard/pages/new" className="btn-primary inline-flex mt-4">
                <Plus className="w-4 h-4" />
                Create First Page
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
