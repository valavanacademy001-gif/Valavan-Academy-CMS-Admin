'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
  arrayMove, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft, Plus, Settings, Eye, EyeOff, Copy, Trash2,
  GripVertical, ExternalLink, Globe, Archive, FileEdit,
  Loader2, Save, ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import AddSectionModal from '@/components/editor/AddSectionModal'
import DeleteConfirmModal from '@/components/editor/DeleteConfirmModal'

type PageData = {
  id: string; title: string; slug: string; description: string | null;
  status: string; seo_title: string | null; seo_description: string | null;
  template: { id: string; name: string; slug: string } | null
  [key: string]: unknown
}

type SectionData = {
  id: string; name: string; slug: string; sort_order: number;
  is_visible: boolean; page_id: string;
  section_type: { id: string; name: string; slug: string; icon: string | null } | null
  [key: string]: unknown
}

type SectionTypeData = {
  id: string; name: string; slug: string; icon: string | null;
  description: string | null; default_fields: unknown
}

function SortableSectionRow({
  section, index, onEdit, onToggleVisibility, onDuplicate, onDelete
}: {
  section: SectionData
  index: number
  onEdit: (id: string) => void
  onToggleVisibility: (id: string, visible: boolean) => void
  onDuplicate: (section: SectionData) => void
  onDelete: (section: SectionData) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group ${isDragging ? 'bg-blue-50 shadow-lg z-50' : ''}`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Index */}
      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
        {String(index + 1).padStart(2, '0')}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${section.is_visible ? 'text-gray-900' : 'text-gray-400'}`}>
          {section.name}
        </div>
        <div className="text-xs text-gray-400 mt-0.5">
          {section.section_type?.name ?? 'Custom'} • #{section.slug}
          {!section.is_visible && <span className="ml-2 text-yellow-500 font-medium">Hidden</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onToggleVisibility(section.id, !section.is_visible)}
          className={`p-1.5 rounded-lg transition-colors ${
            section.is_visible
              ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              : 'text-yellow-500 hover:bg-yellow-50'
          }`}
          title={section.is_visible ? 'Hide section' : 'Show section'}
        >
          {section.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onDuplicate(section)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Duplicate section"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(section)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          title="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onEdit(section.id)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#1748BB] hover:bg-blue-50 rounded-lg transition-colors shrink-0"
      >
        Edit
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export default function PageEditorClient({
  page: initialPage,
  initialSections,
  sectionTypes,
}: {
  page: PageData
  initialSections: SectionData[]
  sectionTypes: SectionTypeData[]
}) {
  const router = useRouter()
  const [page, setPage] = useState(initialPage)
  const [sections, setSections] = useState(initialSections)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showAddSection, setShowAddSection] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SectionData | null>(null)
  const [deletePageConfirm, setDeletePageConfirm] = useState(false)
  const [pageSettings, setPageSettings] = useState({
    title: page.title,
    slug: page.slug,
    description: page.description ?? '',
    seo_title: page.seo_title ?? '',
    seo_description: page.seo_description ?? '',
  })
  const [showSettings, setShowSettings] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    const newOrder = arrayMove(sections, oldIndex, newIndex)
    setSections(newOrder)

    // Persist new order
    const supabase = createClient()
    await Promise.all(
      newOrder.map((section, idx) =>
        supabase.from('sections').update({ sort_order: idx }).eq('id', section.id)
      )
    )
    toast.success('Section order saved')
  }, [sections])

  const handleToggleVisibility = async (sectionId: string, visible: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('sections')
      .update({ is_visible: visible })
      .eq('id', sectionId)

    if (error) { toast.error('Failed to update visibility'); return }
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, is_visible: visible } : s))
    toast.success(visible ? 'Section visible' : 'Section hidden')
  }

  const handleDuplicate = async (section: SectionData) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const newSlug = `${section.slug}-copy-${Date.now()}`

    const { data: newSection, error } = await supabase
      .from('sections')
      .insert({
        page_id: section.page_id,
        section_type_id: section.section_type?.id ?? null,
        name: `${section.name} (Copy)`,
        slug: newSlug,
        sort_order: sections.length,
        is_visible: section.is_visible,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select(`*, section_type:section_types(id, name, slug, icon, default_fields)`)
      .single()

    if (error) { toast.error('Failed to duplicate section'); return }
    setSections((prev) => [...prev, newSection])
    toast.success('Section duplicated')
  }

  const handleDeleteSection = async () => {
    if (!deleteTarget) return
    const supabase = createClient()
    const { error } = await supabase.from('sections').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Failed to delete section'); return }
    setSections((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
    toast.success('Section deleted')
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('pages')
      .update({
        title: pageSettings.title,
        slug: pageSettings.slug,
        description: pageSettings.description || null,
        seo_title: pageSettings.seo_title || null,
        seo_description: pageSettings.seo_description || null,
        updated_by: user?.id,
      })
      .eq('id', page.id)

    setSaving(false)
    if (error) { toast.error(error.message); return }
    setPage((p) => ({ ...p, ...pageSettings }))
    setShowSettings(false)
    toast.success('Page settings saved')
  }

  const handlePublish = async () => {
    setPublishing(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const newStatus = page.status === 'published' ? 'draft' : 'published'
    const { error } = await supabase
      .from('pages')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
        updated_by: user?.id,
      })
      .eq('id', page.id)

    setPublishing(false)
    if (error) { toast.error(error.message); return }
    setPage((p) => ({ ...p, status: newStatus }))

    await supabase.from('audit_logs').insert({
      admin_id: user?.id,
      action: newStatus === 'published' ? 'published' : 'unpublished',
      entity_type: 'page',
      entity_id: page.id,
      entity_name: page.title,
    })

    toast.success(newStatus === 'published' ? '✓ Page published!' : 'Page moved to draft')
  }

  const handleDeletePage = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('audit_logs').insert({
      admin_id: user?.id,
      action: 'deleted',
      entity_type: 'page',
      entity_id: page.id,
      entity_name: page.title,
    })
    await supabase.from('pages').delete().eq('id', page.id)
    toast.success('Page deleted')
    router.push('/dashboard/pages')
  }

  const handleSectionAdded = (newSection: SectionData) => {
    setSections((prev) => [...prev, newSection])
    setShowAddSection(false)
    toast.success(`"${newSection.name}" section added`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + Header */}
      <div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Link href="/dashboard/pages" className="hover:text-gray-600">Pages</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{page.title}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/dashboard/pages" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{page.title}</h1>
                <span className={`badge ${
                  page.status === 'published' ? 'badge-published' :
                  page.status === 'draft' ? 'badge-draft' : 'badge-archived'
                } shrink-0`}>
                  {page.status}
                </span>
              </div>
              <code className="text-xs text-gray-400">/{page.slug}</code>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`http://localhost:3000/${page.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className={`btn-primary py-2 ${page.status === 'published' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> :
                page.status === 'published' ? <Archive className="w-4 h-4" /> : <Globe className="w-4 h-4" />
              }
              {page.status === 'published' ? 'Unpublish' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Page Settings Card */}
      <div className="card">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Settings className="w-4 h-4" />
            Page Settings
          </div>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
        </button>

        {showSettings && (
          <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Page Title</label>
                <input type="text" value={pageSettings.title} onChange={(e) => setPageSettings((p) => ({ ...p, title: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">URL Slug</label>
                <input type="text" value={pageSettings.slug} onChange={(e) => setPageSettings((p) => ({ ...p, slug: e.target.value }))} className="input font-mono" />
              </div>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea rows={2} value={pageSettings.description} onChange={(e) => setPageSettings((p) => ({ ...p, description: e.target.value }))} className="input resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">SEO Title</label>
                <input type="text" value={pageSettings.seo_title} onChange={(e) => setPageSettings((p) => ({ ...p, seo_title: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">SEO Description</label>
                <input type="text" value={pageSettings.seo_description} onChange={(e) => setPageSettings((p) => ({ ...p, seo_description: e.target.value }))} className="input" />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-between">
              <button
                onClick={() => setDeletePageConfirm(true)}
                className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete Page
              </button>
              <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">Sections</h2>
            <p className="text-xs text-gray-400 mt-0.5">{sections.length} sections • Drag to reorder</p>
          </div>
          <button onClick={() => setShowAddSection(true)} className="btn-primary py-2">
            <Plus className="w-4 h-4" />
            Add Section
          </button>
        </div>

        {sections.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section, index) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  index={index}
                  onEdit={(id) => router.push(`/dashboard/pages/${page.id}/sections/${id}`)}
                  onToggleVisibility={handleToggleVisibility}
                  onDuplicate={handleDuplicate}
                  onDelete={setDeleteTarget}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="py-12 text-center">
            <FileEdit className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No sections yet.</p>
            <p className="text-gray-400 text-xs mt-1">Click "Add Section" to add content.</p>
          </div>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddSection && (
        <AddSectionModal
          pageId={page.id}
          sectionTypes={sectionTypes}
          currentSectionsCount={sections.length}
          onClose={() => setShowAddSection(false)}
          onAdded={handleSectionAdded}
        />
      )}

      {/* Delete Section Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={`Delete "${deleteTarget.name}"?`}
          description="This will permanently remove this section and all its content. This action cannot be undone."
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDeleteSection}
        />
      )}

      {/* Delete Page Confirm */}
      {deletePageConfirm && (
        <DeleteConfirmModal
          title={`Delete "${page.title}"?`}
          description={`This will permanently remove the page, all its sections, fields, and content. The public URL /${page.slug} will stop working.`}
          onCancel={() => setDeletePageConfirm(false)}
          onConfirm={handleDeletePage}
        />
      )}
    </div>
  )
}
