'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save, Trash2, Globe, Archive, FolderOpen, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import DeleteConfirmModal from '@/components/editor/DeleteConfirmModal'
import MediaPickerModal from '@/components/media/MediaPickerModal'

type ProgramData = {
  id: string; title: string; slug: string; subtitle: string | null;
  description: string | null; duration: string | null; level: string | null;
  cta_text: string | null; cta_url: string | null; thumbnail_url: string | null;
  banner_url: string | null; status: string; is_visible: boolean | null;
  is_featured: boolean | null; seo_title: string | null; seo_description: string | null;
  software_tools?: string[] | null;
  [key: string]: unknown
}

export const TOOL_PRESETS = [
  { name: 'Photoshop', image: '/assets/tools/ps.png', category: 'Graphic Design' },
  { name: 'Illustrator', image: '/assets/tools/illustrator.png', category: 'Graphic Design' },
  { name: 'Canva', image: '/assets/tools/canva.png', category: 'Graphic Design' },
  { name: 'CorelDraw', image: '/assets/tools/coreldraw.png', category: 'Graphic Design' },
  { name: 'InDesign', image: '/assets/tools/indesign.png', category: 'Graphic Design' },
  { name: 'Color Palette', image: '/assets/tools/color wheel.png', category: 'Design' },
  { name: 'Premiere Pro', image: '/assets/tools/premiere-pro.png', category: 'Video Editing' },
  { name: 'After Effects', image: '/assets/tools/after-effects.png', category: 'Video Editing' },
  { name: 'Media Encoder', image: '/assets/tools/media-encoder.png', category: 'Video Editing' },
  { name: 'Adobe Podcast', image: '/assets/tools/adobe-podcast.png', category: 'Audio' },
  { name: 'WordPress', image: '/assets/tools/wordpress.png', category: 'Web' },
  { name: 'Elementor Pro', image: '/assets/tools/elementor-pro.png', category: 'Web' },
  { name: 'WooCommerce', image: '/assets/tools/woocommerce.png', category: 'Web' },
  { name: 'Rank Math', image: '/assets/tools/rank-math.png', category: 'SEO' },
  { name: 'WP Rocket', image: '/assets/tools/wp-rocket.png', category: 'Web' },
  { name: 'ChatGPT', image: '/assets/tools/chatgpt.png', category: 'AI Tools' },
  { name: 'Gemini AI', image: '/assets/tools/gemini-ai.png', category: 'AI Tools' },
  { name: 'HeyGen', image: '/assets/tools/heygen.png', category: 'AI Tools' },
]

export default function EditProgramClient({ program: initialProgram }: { program: ProgramData }) {
  const router = useRouter()
  const [program, setProgram] = useState(initialProgram)
  const [loading, setLoading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [customToolInput, setCustomToolInput] = useState('')
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
    software_tools: Array.isArray(program.software_tools) ? (program.software_tools as string[]) : [],
  })

  const toggleTool = (toolName: string) => {
    setForm((p) => {
      const exists = p.software_tools.includes(toolName)
      return {
        ...p,
        software_tools: exists
          ? p.software_tools.filter((t) => t !== toolName)
          : [...p.software_tools, toolName],
      }
    })
  }

  const addCustomTool = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customToolInput.trim()
    if (!trimmed) return
    if (!form.software_tools.includes(trimmed)) {
      setForm((p) => ({ ...p, software_tools: [...p.software_tools, trimmed] }))
    }
    setCustomToolInput('')
  }

  const removeTool = (toolName: string) => {
    setForm((p) => ({
      ...p,
      software_tools: p.software_tools.filter((t) => t !== toolName),
    }))
  }

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
        software_tools: form.software_tools,
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Thumbnail URL</label>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Recommended: 1200 × 750 px (16:10 ratio)
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={form.thumbnail_url}
                onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
                placeholder="e.g. /assets/images/hero/ai-powered-GD.webp or https://..."
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
            {form.thumbnail_url && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-4">
                <div className="w-36 h-22 rounded-lg overflow-hidden bg-black/5 border border-gray-200 shrink-0 relative flex items-center justify-center">
                  <img
                    src={form.thumbnail_url}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.startsWith('http://localhost:3000') && form.thumbnail_url.startsWith('/')) {
                        target.src = `http://localhost:3000${form.thumbnail_url}`;
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs text-gray-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">Active Thumbnail Preview</span>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1748BB] hover:underline bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs hover:bg-gray-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replace Image
                    </button>
                  </div>
                  <div className="text-gray-400 truncate text-[11px] font-mono">{form.thumbnail_url}</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[11px]">
                    <span>Target: 1200 × 750 px</span>
                    <span>•</span>
                    <span>16:10 Ratio</span>
                  </div>
                </div>
              </div>
            )}
            <MediaPickerModal
              isOpen={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={(url) => setForm((p) => ({ ...p, thumbnail_url: url }))}
              allowedType="image"
              title="Choose Program Thumbnail"
            />
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

        {/* ── Tools Mastered (Software & AI Tools) ── */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-800">Tools Mastered (Software & AI)</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage the tools and logos displayed under &quot;TOOLS MASTERED&quot; on the program card.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
              {form.software_tools.length} Tools Selected
            </span>
          </div>

          {/* Active Tools List */}
          <div>
            <label className="label mb-2">Active Tools for this Program</label>
            {form.software_tools.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {form.software_tools.map((toolName, idx) => {
                  const preset = TOOL_PRESETS.find(
                    (p) => p.name.toLowerCase() === toolName.toLowerCase()
                  )
                  return (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300 shadow-2xs group hover:border-red-300 transition-colors"
                    >
                      {preset?.image ? (
                        <img
                          src={preset.image}
                          alt={toolName}
                          className="w-5 h-5 object-contain shrink-0"
                          onError={(e) => {
                            const target = e.currentTarget
                            if (!target.src.startsWith('http://localhost:3000') && preset.image.startsWith('/')) {
                              target.src = `http://localhost:3000${preset.image}`
                            }
                          }}
                        />
                      ) : (
                        <div className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                          {toolName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-800">{toolName}</span>
                      <button
                        type="button"
                        onClick={() => removeTool(toolName)}
                        className="text-gray-400 hover:text-red-600 p-0.5 rounded transition-colors"
                        title="Remove tool"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 text-xs">
                No tools selected. Click on any preset below to add tools.
              </div>
            )}
          </div>

          {/* Quick Preset Library */}
          <div>
            <label className="label mb-2">Quick Tool Presets (Click to Add / Remove)</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {TOOL_PRESETS.map((preset) => {
                const isSelected = form.software_tools.some(
                  (t) => t.toLowerCase() === preset.name.toLowerCase()
                )
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => toggleTool(preset.name)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all text-xs font-medium cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-[#1748BB] text-[#1748BB] shadow-xs font-semibold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-gray-50 p-0.5 shrink-0 flex items-center justify-center">
                      <img
                        src={preset.image}
                        alt={preset.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (!target.src.startsWith('http://localhost:3000') && preset.image.startsWith('/')) {
                            target.src = `http://localhost:3000${preset.image}`
                          }
                        }}
                      />
                    </div>
                    <span className="truncate flex-1">{preset.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                        isSelected ? 'bg-[#1748BB] text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Add Custom Tool */}
          <div className="pt-2 border-t border-gray-100 flex gap-2 items-center">
            <input
              type="text"
              value={customToolInput}
              onChange={(e) => setCustomToolInput(e.target.value)}
              placeholder="Add custom software/tool name (e.g. Figma, DaVinci Resolve)..."
              className="input text-xs flex-1"
            />
            <button
              type="button"
              onClick={addCustomTool}
              className="btn-secondary py-2 px-4 text-xs font-semibold shrink-0"
            >
              + Add Tool
            </button>
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
