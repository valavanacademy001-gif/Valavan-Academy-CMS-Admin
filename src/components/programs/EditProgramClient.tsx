'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, Trash2, Globe, Archive } from 'lucide-react'
import Link from 'next/link'
import DeleteConfirmModal from '@/components/editor/DeleteConfirmModal'

type ProgramData = {
  id: string; title: string; slug: string; subtitle: string | null;
  description: string | null; duration: string | null; level: string | null;
  cta_text: string | null; cta_url: string | null; thumbnail_url: string | null;
  banner_url: string | null; status: string; is_visible: boolean | null;
  is_featured: boolean | null; seo_title: string | null; seo_description: string | null;
  [key: string]: unknown
}

export default function EditProgramClient({ program: initialProgram }: { program: ProgramData }) {
  const router = useRouter()
  const [program, setProgram] = useState(initialProgram)
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [form, setForm] = useState({
    title: program.title,
    slug: program.slug,
    subtitle: program.subtitle ?? '',
    description: program.description ?? '',
    duration: program.duration ?? '',
    level: program.level ?? 'beginner',
    cta_text: program.cta_text ?? 'Enroll Now',
    cta_url: program.cta_url ?? '',
    thumbnail_url: program.thumbnail_url ?? '',
    banner_url: program.banner_url ?? '',
    status: program.status,
    is_visible: program.is_visible ?? true,
    is_featured: program.is_featured ?? false,
    seo_title: program.seo_title ?? '',
    seo_description: program.seo_description ?? '',
  })

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('programs')
      .update({
        title: form.title,
        slug: form.slug,
        subtitle: form.subtitle || null,
        description: form.description || null,
        duration: form.duration || null,
        level: form.level,
        cta_text: form.cta_text,
        cta_url: form.cta_url || null,
        thumbnail_url: form.thumbnail_url || null,
        banner_url: form.banner_url || null,
        status: form.status,
        is_visible: form.is_visible,
        is_featured: form.is_featured,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
        updated_by: user?.id,
      })
      .eq('id', program.id)

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    setProgram((prev) => ({ ...prev, ...form }))
    toast.success('✓ Program saved successfully')
  }

  const handlePublish = async () => {
    setPublishing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const newStatus = form.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('programs')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        updated_by: user?.id,
      })
      .eq('id', program.id)

    setPublishing(false)
    if (error) {
      toast.error(error.message)
      return
    }

    setForm((p) => ({ ...p, status: newStatus }))
    setProgram((p) => ({ ...p, status: newStatus }))
    toast.success(newStatus === 'published' ? '✓ Program published!' : 'Program set to draft')
  }

  const handleDelete = async () => {
    const supabase = createClient()
    const { error } = await supabase.from('programs').delete().eq('id', program.id)
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Program deleted')
    router.push('/dashboard/programs')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/programs" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{form.title}</h1>
              <span className={`badge ${
                form.status === 'published' ? 'badge-published' :
                form.status === 'draft' ? 'badge-draft' : 'badge-archived'
              }`}>
                {form.status}
              </span>
            </div>
            <code className="text-xs text-gray-400">/{form.slug}</code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn-secondary py-2"
          >
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> :
              form.status === 'published' ? <Archive className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {form.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => handleSave()}
            disabled={loading}
            className="btn-primary py-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-100">Program Details</h2>
          <div>
            <label className="label">Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required className="input" />
          </div>
          <div>
            <label className="label">URL Slug *</label>
            <input type="text" value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} required className="input font-mono" />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration</label>
              <input type="text" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Level</label>
              <select value={form.level} onChange={(e) => setForm((p) => ({ ...p, level: e.target.value }))} className="input">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Thumbnail URL</label>
            <input type="url" value={form.thumbnail_url} onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))} className="input" />
            {form.thumbnail_url && (
              <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CTA Text</label>
              <input type="text" value={form.cta_text} onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">CTA URL</label>
              <input type="text" value={form.cta_url} onChange={(e) => setForm((p) => ({ ...p, cta_url: e.target.value }))} className="input" />
            </div>
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-100">SEO Settings</h2>
          <div>
            <label className="label">SEO Title</label>
            <input type="text" value={form.seo_title} onChange={(e) => setForm((p) => ({ ...p, seo_title: e.target.value }))} className="input" />
          </div>
          <div>
            <label className="label">SEO Description</label>
            <textarea rows={2} value={form.seo_description} onChange={(e) => setForm((p) => ({ ...p, seo_description: e.target.value }))} className="input resize-none" />
          </div>
        </div>

        {/* Danger zone */}
        <div className="card p-6 flex items-center justify-between border-red-100 bg-red-50/20">
          <div>
            <div className="text-sm font-semibold text-red-900">Delete Program</div>
            <div className="text-xs text-red-500">Permanently delete this program from the database</div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="btn-danger"
          >
            <Trash2 className="w-4 h-4" />
            Delete Program
          </button>
        </div>
      </form>

      {deleteConfirm && (
        <DeleteConfirmModal
          title={`Delete "${form.title}"?`}
          description="Are you sure you want to delete this program? This action cannot be undone."
          onCancel={() => setDeleteConfirm(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
