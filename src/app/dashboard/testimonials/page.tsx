import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Star } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function TestimonialsPage() {
  const supabase = await createClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-500 text-sm mt-1">{testimonials?.length ?? 0} testimonials</p>
        </div>
        <Link href="/dashboard/testimonials/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Testimonial
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials && testimonials.length > 0 ? (
          testimonials.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start gap-3 mb-3">
                {t.student_photo_url ? (
                  <img src={t.student_photo_url} alt={t.student_name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 text-[#1748BB] font-bold">
                    {t.student_name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.student_name}</div>
                  <div className="text-xs text-gray-400">{t.student_role ?? 'Student'}</div>
                </div>
                <div className={`ml-auto badge ${t.is_visible ? 'badge-published' : 'badge-archived'}`}>
                  {t.is_visible ? 'Visible' : 'Hidden'}
                </div>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-3">{t.testimonial}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className={`w-3.5 h-3.5 ${(t.rating ?? 0) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
                <Link href={`/dashboard/testimonials/${t.id}`} className="text-sm font-medium text-[#1748BB] hover:underline">Edit</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 card py-16 text-center">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">No testimonials yet</h3>
            <Link href="/dashboard/testimonials/new" className="btn-primary inline-flex mt-4">
              <Plus className="w-4 h-4" /> Add First Testimonial
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
