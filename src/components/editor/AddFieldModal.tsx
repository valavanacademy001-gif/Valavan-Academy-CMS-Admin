'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

const FIELD_TYPES = [
  { value: 'short_text', label: 'Short Text', desc: 'Single line text' },
  { value: 'long_text', label: 'Long Text', desc: 'Multi-line text' },
  { value: 'rich_text', label: 'Rich Text', desc: 'HTML content' },
  { value: 'heading', label: 'Heading', desc: 'Large heading' },
  { value: 'url', label: 'URL', desc: 'Link address' },
  { value: 'image', label: 'Image', desc: 'Image URL' },
  { value: 'youtube', label: 'YouTube URL', desc: 'YouTube video link' },
  { value: 'video', label: 'Video URL', desc: 'Direct video file URL' },
  { value: 'color', label: 'Color', desc: 'Color picker' },
  { value: 'toggle', label: 'Toggle', desc: 'On/Off switch' },
  { value: 'number', label: 'Number', desc: 'Numeric value' },
  { value: 'json', label: 'JSON', desc: 'Structured data' },
]

type FieldData = {
  id: string; name: string; label: string; field_type: string;
  sort_order: number; placeholder: string | null; options: unknown
  value: unknown
}

export default function AddFieldModal({
  sectionId,
  currentFieldCount,
  onClose,
  onAdded,
}: {
  sectionId: string
  currentFieldCount: number
  onClose: () => void
  onAdded: (field: any) => void
}) {
  const [form, setForm] = useState({ name: '', label: '', field_type: 'short_text', placeholder: '' })
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.label) return
    setAdding(true)

    const supabase = createClient()
    const { data: field, error } = await supabase
      .from('fields')
      .insert({
        section_id: sectionId,
        name: form.name.toLowerCase().replace(/\s+/g, '_'),
        label: form.label,
        field_type: form.field_type,
        placeholder: form.placeholder || null,
        sort_order: currentFieldCount,
      })
      .select()
      .single()

    setAdding(false)
    if (error || !field) return
    onAdded({ ...(field as any), value: null })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">Add Custom Field</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAdd} className="p-5 space-y-4">
          <div>
            <label className="label">Field Label *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm((p) => ({ ...p, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              required
              placeholder="e.g. Instructor Name"
              className="input"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Field Name (key) *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              required
              placeholder="instructor_name"
              className="input font-mono text-sm"
            />
          </div>
          <div>
            <label className="label">Field Type *</label>
            <select value={form.field_type} onChange={(e) => setForm((p) => ({ ...p, field_type: e.target.value }))} className="input">
              {FIELD_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Placeholder (optional)</label>
            <input type="text" value={form.placeholder} onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))} placeholder="Enter placeholder text..." className="input" />
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? 'Adding...' : 'Add Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
