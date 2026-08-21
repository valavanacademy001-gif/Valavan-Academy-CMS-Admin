import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Award } from 'lucide-react'

export default async function CertificationsPage() {
  const supabase = await createClient()
  const { data: certs } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-500 text-sm mt-1">{certs?.length ?? 0} certificates</p>
        </div>
        <Link href="/dashboard/certifications/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Certificate
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {certs && certs.length > 0 ? (
          certs.map((cert) => (
            <div key={cert.id} className="card overflow-hidden group">
              <div className="relative aspect-[4/3] bg-gray-50">
                <img src={cert.image_url} alt={cert.title} className="w-full h-full object-cover" />
                {!cert.is_visible && (
                  <div className="absolute top-2 right-2 badge badge-archived">Hidden</div>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm font-semibold text-gray-800 truncate">{cert.title}</div>
                <Link href={`/dashboard/certifications/${cert.id}`} className="text-xs font-medium text-[#1748BB] hover:underline mt-1 block">Edit</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 card py-16 text-center">
            <Award className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">No certifications yet</h3>
            <Link href="/dashboard/certifications/new" className="btn-primary inline-flex mt-4">
              <Plus className="w-4 h-4" /> Add Certificate
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
