'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'
import { ArrowLeft, Loader2, Wand2 } from 'lucide-react'
import Link from 'next/link'

export default function NewProgramPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [slugManual, setSlugManual] = useState(false)
  const [form, setForm] = useState({
    title: '', slug: '', subtitle: '', description: '',
    duration: '', level: 'beginner', cta_text: 'Enroll Now',
    cta_url: '', thumbnail_url: '', status: 'draft',
    seo_title: '', seo_description: '',
  })

  const handleTitleChange = (val: string) => {
    setForm((p) => ({ ...p, title: val, slug: slugManual ? p.slug : generateSlug(val) }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: program, error } = await supabase.from('programs').insert({
      title: form.title, slug: form.slug, subtitle: form.subtitle || null,
      description: form.description || null, duration: form.duration || null,
      level: form.level, cta_text: form.cta_text, cta_url: form.cta_url || null,
      thumbnail_url: form.thumbnail_url || null, status: form.status,
      seo_title: form.seo_title || null, seo_description: form.seo_description || null,
      sort_order: 0, is_visible: true, is_featured: false,
      created_by: user?.id, updated_by: user?.id,
    }).select().single()

    setLoading(false)
    if (error) { toast.error(error.code === '23505' ? 'Slug already exists' : error.message); return }
    
    await supabase.from('audit_logs').insert({ admin_id: user?.id, action: 'created', entity_type: 'program', entity_id: program.id, entity_name: program.title })
    toast.success('Program created!')
    router.push(`/dashboard/programs/${program.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/programs" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Program</h1>
          <p className="text-gray-500 text-sm">Create a new course or program</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 pb-3 border-b border-gray-100">Program Details</h2>
          <div>
            <label className="label">Program Title *</label>
            <input type="text" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required placeholder="e.g. 90-Day Graphic Design Mastery" className="input" />
          </div>
          <div>
            <label className="label">URL Slug *</label>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-400 font-mono">/</span>
              <input type="text" value={form.slug} onChange={(e) => { setSlugManual(true); setForm((p) => ({ ...p, slug: generateSlug(e.target.value) })) }} required className="input font-mono flex-1" />
              <button type="button" onClick={() => { setSlugManual(false); setForm((p) => ({ ...p, slug: generateSlug(p.title) })) }} className="btn-secondary py-2"><Wand2 className="w-4 h-4" /></button>
            </div>
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input type="text" value={form.subtitle} onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Short catchy subtitle" className="input" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Program description..." className="input resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Duration</label>
              <input type="text" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} placeholder="e.g. 90 Days" className="input" />
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
            <input type="url" value={form.thumbnail_url} onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))} placeholder="https://... or /assets/..." className="input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">CTA Button Text</label>
              <input type="text" value={form.cta_text} onChange={(e) => setForm((p) => ({ ...p, cta_text: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">CTA Button URL</label>
              <input type="text" value={form.cta_url} onChange={(e) => setForm((p) => ({ ...p, cta_url: e.target.value }))} placeholder="/programs/..." className="input" />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))} className="input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/dashboard/programs" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating...' : 'Create Program'}
          </button>
        </div>
      </form>
    </div>
  )
}
