'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Star } from 'lucide-react'
import Link from 'next/link'

export default function NewTestimonialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    student_name: '',
    student_role: '',
    student_photo_url: '',
    testimonial: '',
    rating: 5,
    is_visible: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('testimonials').insert({
      student_name: form.student_name,
      student_role: form.student_role || null,
      student_photo_url: form.student_photo_url || null,
      testimonial: form.testimonial,
      rating: form.rating,
      is_visible: form.is_visible,
      created_by: user?.id,
    })

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('✓ Testimonial added!')
    router.push('/dashboard/testimonials')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/testimonials" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Testimonial</h1>
          <p className="text-gray-500 text-sm">Add student review & feedback</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Student Name *</label>
          <input
            type="text"
            value={form.student_name}
            onChange={(e) => setForm((p) => ({ ...p, student_name: e.target.value }))}
            required
            placeholder="e.g. Priya Dharshini"
            className="input"
          />
        </div>

        <div>
          <label className="label">Student Role / Batch</label>
          <input
            type="text"
            value={form.student_role}
            onChange={(e) => setForm((p) => ({ ...p, student_role: e.target.value }))}
            placeholder="e.g. Graphic Design Batch 12"
            className="input"
          />
        </div>

        <div>
          <label className="label">Photo URL</label>
          <input
            type="url"
            value={form.student_photo_url}
            onChange={(e) => setForm((p) => ({ ...p, student_photo_url: e.target.value }))}
            placeholder="https://... or /assets/..."
            className="input"
          />
        </div>

        <div>
          <label className="label">Testimonial Text *</label>
          <textarea
            rows={4}
            value={form.testimonial}
            onChange={(e) => setForm((p) => ({ ...p, testimonial: e.target.value }))}
            required
            placeholder="Write student feedback here..."
            className="input resize-none"
          />
        </div>

        <div>
          <label className="label">Rating (1 to 5 Stars)</label>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm((p) => ({ ...p, rating: star }))}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${form.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                />
              </button>
            ))}
            <span className="text-sm font-semibold text-gray-700 ml-2">{form.rating} Stars</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link href="/dashboard/testimonials" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Adding...' : 'Add Testimonial'}
          </button>
        </div>
      </form>
    </div>
  )
}
