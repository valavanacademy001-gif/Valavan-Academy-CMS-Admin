'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Award } from 'lucide-react'
import Link from 'next/link'

export default function NewCertificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    is_visible: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.image_url) {
      toast.error('Image URL is required')
      return
    }
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('certifications').insert({
      title: form.title || 'Certification Award',
      description: form.description || null,
      image_url: form.image_url,
      is_visible: form.is_visible,
      created_by: user?.id,
    })

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('✓ Certification added!')
    router.push('/dashboard/certifications')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/certifications" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Certification</h1>
          <p className="text-gray-500 text-sm">Upload or add a certificate image to the gallery</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Certificate Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            placeholder="e.g. Master Graphic Designer Certification"
            className="input"
          />
        </div>

        <div>
          <label className="label">Certificate Image URL *</label>
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
            required
            placeholder="https://... or /assets/certifications/..."
            className="input"
          />
          {form.image_url && (
            <div className="mt-3 relative aspect-[4/3] w-64 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={form.image_url}
                alt="Certificate preview"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="label">Description (optional)</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="Details about this certificate..."
            className="input resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link href="/dashboard/certifications" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Adding...' : 'Add Certificate'}
          </button>
        </div>
      </form>
    </div>
  )
}
