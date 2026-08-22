'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Award, FolderOpen, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import MediaPickerModal from '@/components/media/MediaPickerModal'

export default function NewCertificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Certificate Image URL *</label>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              Recommended: 1600 × 1200 px (4:3 ratio)
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))}
              required
              placeholder="e.g. /assets/certifications/2.webp or https://..."
              className="input font-mono text-sm flex-1"
            />
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="btn-secondary py-2 px-3 text-xs font-medium shrink-0 flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#1748BB] border-blue-200"
              title="Choose from Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
          </div>
          {form.image_url && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-4">
              <div className="w-40 h-28 rounded-lg overflow-hidden bg-black/5 border border-gray-200 shrink-0 relative flex items-center justify-center">
                <img
                  src={form.image_url}
                  alt="Certificate preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.startsWith('http://localhost:3000') && form.image_url.startsWith('/')) {
                      target.src = `http://localhost:3000${form.image_url}`;
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-0 text-xs text-gray-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800 text-sm">Certificate Preview</span>
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1748BB] hover:underline bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs hover:bg-gray-50"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Replace Image
                  </button>
                </div>
                <div className="text-gray-400 truncate text-[11px] font-mono">{form.image_url}</div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px]">
                  <span>Target: 1600 × 1200 px</span>
                  <span>•</span>
                  <span>4:3 Ratio</span>
                </div>
              </div>
            </div>
          )}
          <MediaPickerModal
            isOpen={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onSelect={(url) => setForm((p) => ({ ...p, image_url: url }))}
            allowedType="image"
            title="Choose Certificate Image"
          />
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
