'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Plus, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import FieldEditor from './FieldEditor'
import AddFieldModal from './AddFieldModal'

type FieldValue = {
  id: string; field_id: string; value_text: string | null; value_json: unknown;
  value_url: string | null; value_boolean: boolean | null; is_draft: boolean
}

type FieldData = {
  id: string; name: string; label: string; field_type: string;
  sort_order: number; placeholder: string | null; options: unknown
  value: FieldValue[] | null
}

type SectionData = {
  id: string; name: string; slug: string; is_visible: boolean;
  section_type: { name: string } | null
  [key: string]: unknown
}

type PageData = { id: string; title: string; slug: string }

export default function SectionEditorClient({
  page,
  section,
  initialFields,
}: {
  page: PageData
  section: SectionData
  initialFields: FieldData[]
}) {
  const [fields, setFields] = useState(initialFields)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => {
    const values: Record<string, string> = {}
    initialFields.forEach((f) => {
      const val = Array.isArray(f.value) ? f.value[0] : f.value
      if (val) {
        values[f.id] = val.value_text ?? val.value_url ?? (val.value_json ? JSON.stringify(val.value_json) : '') ?? ''
      }
    })
    return values
  })
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isVisible, setIsVisible] = useState(section.is_visible)
  const [showAddField, setShowAddField] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleValueChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    setHasChanges(true)
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    for (const field of fields) {
      const value = fieldValues[field.id] ?? ''
      const existingValue = Array.isArray(field.value) ? field.value[0] : field.value

      const payload = {
        field_id: field.id,
        section_id: section.id,
        page_id: page.id,
        value_text: ['short_text','long_text','rich_text','heading','subheading','color','select'].includes(field.field_type) ? value : null,
        value_url: ['url','email','youtube','video','image'].includes(field.field_type) ? value : null,
        value_boolean: field.field_type === 'toggle' ? value === 'true' : null,
        value_json: field.field_type === 'json' ? (value ? JSON.parse(value) : null) : null,
        is_draft: true,
        updated_by: user?.id,
      }

      if (existingValue?.id) {
        await supabase.from('field_values').update(payload).eq('id', existingValue.id)
      } else {
        await supabase.from('field_values').insert(payload)
      }
    }

    // Update section visibility
    await supabase.from('sections').update({ is_visible: isVisible, updated_by: user?.id }).eq('id', section.id)

    setSaving(false)
    setHasChanges(false)
    toast.success('✓ Draft saved successfully')
  }

  const handlePublish = async () => {
    await handleSaveDraft()
    setPublishing(true)
    const supabase = createClient()

    // Move draft values to published
    for (const field of fields) {
      const value = fieldValues[field.id] ?? ''
      await supabase.from('field_values')
        .update({
          is_draft: false,
          published_value_text: value,
        })
        .eq('field_id', field.id)
        .eq('section_id', section.id)
    }

    setPublishing(false)
    toast.success('✓ Section published!')
  }

  const handleFieldAdded = (newField: FieldData) => {
    setFields((prev) => [...prev, newField])
    setShowAddField(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-2">
          <Link href="/dashboard/pages" className="hover:text-gray-600">Pages</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/dashboard/pages/${page.id}`} className="hover:text-gray-600">{page.title}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-600 font-medium">{section.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/pages/${page.id}`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{section.name}</h1>
              <p className="text-xs text-gray-400">{section.section_type?.name ?? 'Custom Section'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsVisible(!isVisible); setHasChanges(true) }}
              className={`btn-secondary py-2 ${!isVisible ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : ''}`}
            >
              {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-yellow-500" />}
              {isVisible ? 'Visible' : 'Hidden'}
            </button>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="card divide-y divide-gray-100">
        <div className="flex items-center justify-between p-5">
          <h2 className="text-sm font-semibold text-gray-700">Content Fields</h2>
          <button onClick={() => setShowAddField(true)} className="btn-secondary py-1.5 text-xs">
            <Plus className="w-3.5 h-3.5" />
            Add Field
          </button>
        </div>

        {fields.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-sm">No fields in this section yet.</p>
            <button onClick={() => setShowAddField(true)} className="btn-primary mt-3 inline-flex">
              <Plus className="w-4 h-4" />
              Add First Field
            </button>
          </div>
        ) : (
          fields.map((field) => (
            <FieldEditor
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? ''}
              onChange={(val) => handleValueChange(field.id, val)}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="card p-4 flex items-center justify-between">
        <div className="text-xs text-gray-400">
          {hasChanges ? '⚠ Unsaved changes' : '✓ All changes saved'}
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/pages/${page.id}`} className="btn-secondary">
            Back to Page
          </Link>
          <button onClick={handleSaveDraft} disabled={saving} className="btn-secondary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublish} disabled={publishing || saving} className="btn-primary">
            {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>

      {showAddField && (
        <AddFieldModal
          sectionId={section.id}
          currentFieldCount={fields.length}
          onClose={() => setShowAddField(false)}
          onAdded={handleFieldAdded}
        />
      )}
    </div>
  )
}
