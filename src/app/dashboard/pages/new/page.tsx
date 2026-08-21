'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { generateSlug } from '@/lib/utils'
import { Loader2, ArrowLeft, Wand2 } from 'lucide-react'
import Link from 'next/link'

const TEMPLATES = [
  { slug: 'standard', label: 'Standard Page', desc: 'Hero, Content, CTA' },
  { slug: 'program', label: 'Program Page', desc: 'Course page with curriculum & enrollment' },
  { slug: 'landing', label: 'Landing Page', desc: 'High-conversion focused page' },
  { slug: 'course', label: 'Course Page', desc: 'Detailed course with modules & FAQ' },
  { slug: 'blank', label: 'Blank Page', desc: 'Empty — add sections manually' },
]

const DEFAULT_SECTIONS: Record<string, Array<{ name: string; slug: string; typeSlug: string }>> = {
  standard: [
    { name: 'Hero', slug: 'hero', typeSlug: 'hero' },
    { name: 'Text & Image', slug: 'text-image', typeSlug: 'text_image' },
    { name: 'Features', slug: 'features', typeSlug: 'features' },
    { name: 'Call to Action', slug: 'cta', typeSlug: 'cta' },
  ],
  program: [
    { name: 'Hero', slug: 'hero', typeSlug: 'hero' },
    { name: 'Features', slug: 'features', typeSlug: 'features' },
    { name: 'Curriculum', slug: 'curriculum', typeSlug: 'rich_text' },
    { name: 'Testimonials', slug: 'testimonials', typeSlug: 'testimonials' },
    { name: 'FAQ', slug: 'faq', typeSlug: 'faq' },
    { name: 'Call to Action', slug: 'cta', typeSlug: 'cta' },
  ],
  landing: [
    { name: 'Hero', slug: 'hero', typeSlug: 'hero' },
    { name: 'Features', slug: 'features', typeSlug: 'features' },
    { name: 'Stats', slug: 'stats', typeSlug: 'stats' },
    { name: 'Testimonials', slug: 'testimonials', typeSlug: 'testimonials' },
    { name: 'Call to Action', slug: 'cta', typeSlug: 'cta' },
  ],
  course: [
    { name: 'Hero', slug: 'hero', typeSlug: 'hero' },
    { name: 'Overview', slug: 'overview', typeSlug: 'text_image' },
    { name: 'Curriculum', slug: 'curriculum', typeSlug: 'rich_text' },
    { name: 'FAQ', slug: 'faq', typeSlug: 'faq' },
    { name: 'Call to Action', slug: 'cta', typeSlug: 'cta' },
  ],
  blank: [],
}

export default function NewPagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('standard')
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    seo_title: '',
    seo_description: '',
    status: 'draft',
  })
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: slugManuallyEdited ? prev.slug : generateSlug(value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.slug) {
      toast.error('Page title and slug are required')
      return
    }
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // 1. Get template ID
      const { data: template } = await supabase
        .from('page_templates')
        .select('id')
        .eq('slug', selectedTemplate)
        .single()

      // 2. Create the page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .insert({
          title: form.title,
          slug: form.slug,
          description: form.description || null,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
          status: form.status,
          template_id: template?.id ?? null,
          sort_order: 0,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single()

      if (pageError) {
        if (pageError.code === '23505') {
          toast.error('A page with this slug already exists. Please choose a different URL.')
        } else {
          toast.error(pageError.message)
        }
        return
      }

      // 3. Create default sections from template
      const defaultSections = DEFAULT_SECTIONS[selectedTemplate] || []
      if (defaultSections.length > 0) {
        // Get section type IDs
        const { data: sectionTypes } = await supabase
          .from('section_types')
          .select('id, slug')

        const typeMap = Object.fromEntries(
          (sectionTypes || []).map((t) => [t.slug, t.id])
        )

        const sectionsToInsert = defaultSections.map((s, idx) => ({
          page_id: page.id,
          section_type_id: typeMap[s.typeSlug] ?? null,
          name: s.name,
          slug: s.slug,
          sort_order: idx,
          is_visible: true,
          created_by: user?.id,
          updated_by: user?.id,
        }))

        const { data: createdSections } = await supabase
          .from('sections')
          .insert(sectionsToInsert)
          .select()

        // 4. Create default fields for each section
        if (createdSections) {
          for (const section of createdSections) {
            const sectionType = sectionTypes?.find((t) => t.id === section.section_type_id)
            if (!sectionType) continue

            // Get default fields from section type
            const { data: sectionTypeData } = await supabase
              .from('section_types')
              .select('default_fields')
              .eq('id', sectionType.id)
              .single()

            const defaultFields = sectionTypeData?.default_fields as Array<{
              name: string; label: string; type: string; options?: string[]
            }> || []

            if (defaultFields.length > 0) {
              await supabase.from('fields').insert(
                defaultFields.map((f, idx) => ({
                  section_id: section.id,
                  name: f.name,
                  label: f.label,
                  field_type: f.type,
                  sort_order: idx,
                  options: f.options ? JSON.stringify(f.options) : null,
                }))
              )
            }
          }
        }
      }

      // 5. Log audit
      await supabase.from('audit_logs').insert({
        admin_id: user?.id,
        action: 'created',
        entity_type: 'page',
        entity_id: page.id,
        entity_name: page.title,
      })

      toast.success(`Page "${form.title}" created successfully!`)
      router.push(`/dashboard/pages/${page.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to create page. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/pages" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Page</h1>
          <p className="text-gray-500 text-sm">Fill in the details to create a new page</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Page Information */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">
            Page Information
          </h2>

          <div>
            <label className="label">Page Name *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="e.g. Graphic Design Course"
              className="input"
            />
          </div>

          <div>
            <label className="label">URL Slug *</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-mono shrink-0">/</span>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true)
                  setForm((p) => ({ ...p, slug: generateSlug(e.target.value) }))
                }}
                required
                placeholder="graphic-design-course"
                className="input font-mono"
              />
              <button
                type="button"
                onClick={() => {
                  setSlugManuallyEdited(false)
                  setForm((p) => ({ ...p, slug: generateSlug(p.title) }))
                }}
                className="btn-secondary shrink-0 py-2"
                title="Auto-generate from title"
              >
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Public URL will be: <strong>/{form.slug || 'your-page-slug'}</strong>
            </p>
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="Brief description of this page..."
              className="input resize-none"
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className="input"
            >
              <option value="draft">Draft — not publicly visible</option>
              <option value="published">Published — visible to public</option>
            </select>
          </div>
        </div>

        {/* Template Selection */}
        <div className="card p-6">
          <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100 mb-4">
            Page Template
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.slug}
                type="button"
                onClick={() => setSelectedTemplate(t.slug)}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  selectedTemplate === t.slug
                    ? 'border-[#1748BB] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`text-sm font-semibold ${selectedTemplate === t.slug ? 'text-[#1748BB]' : 'text-gray-800'}`}>
                  {t.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                {selectedTemplate === t.slug && (
                  <div className="text-xs text-[#1748BB] mt-2 font-medium">
                    ✓ {DEFAULT_SECTIONS[t.slug]?.length ?? 0} default sections will be created
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 pb-3 border-b border-gray-100">
            SEO Settings
          </h2>
          <div>
            <label className="label">SEO Title</label>
            <input
              type="text"
              value={form.seo_title}
              onChange={(e) => setForm((p) => ({ ...p, seo_title: e.target.value }))}
              placeholder={form.title || 'Page SEO Title'}
              className="input"
            />
          </div>
          <div>
            <label className="label">SEO Description</label>
            <textarea
              value={form.seo_description}
              onChange={(e) => setForm((p) => ({ ...p, seo_description: e.target.value }))}
              rows={2}
              placeholder="Brief description for search engines (150-160 chars)..."
              className="input resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Link href="/dashboard/pages" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Creating...' : 'Create Page'}
          </button>
        </div>
      </form>
    </div>
  )
}
