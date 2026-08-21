'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search } from 'lucide-react'

type SectionType = {
  id: string; name: string; slug: string; icon: string | null;
  description: string | null; default_fields: unknown
}

type SectionData = {
  id: string; name: string; slug: string; sort_order: number;
  is_visible: boolean; page_id: string;
  section_type: { id: string; name: string; slug: string; icon: string | null } | null
  [key: string]: unknown
}

export default function AddSectionModal({
  pageId,
  sectionTypes,
  currentSectionsCount,
  onClose,
  onAdded,
}: {
  pageId: string
  sectionTypes: SectionType[]
  currentSectionsCount: number
  onClose: () => void
  onAdded: (section: SectionData) => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SectionType | null>(null)
  const [customName, setCustomName] = useState('')
  const [adding, setAdding] = useState(false)

  const filtered = sectionTypes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = async () => {
    if (!selected) return
    setAdding(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const name = customName.trim() || selected.name
    const slug = `${selected.slug}-${Date.now()}`

    const { data: section, error } = await supabase
      .from('sections')
      .insert({
        page_id: pageId,
        section_type_id: selected.id,
        name,
        slug,
        sort_order: currentSectionsCount,
        is_visible: true,
        created_by: user?.id,
        updated_by: user?.id,
      })
      .select(`*, section_type:section_types(id, name, slug, icon, default_fields)`)
      .single()

    if (error || !section) { setAdding(false); return }

    // Create default fields for this section type
    const defaultFields = selected.default_fields as Array<{
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

    setAdding(false)
    onAdded(section as SectionData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Add Section</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose a section type to add</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search section types..."
              className="input pl-9"
              autoFocus
            />
          </div>
        </div>

        {/* Section type grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filtered.map((type) => (
              <button
                key={type.id}
                onClick={() => { setSelected(type); setCustomName(type.name) }}
                className={`text-left p-3 rounded-xl border-2 transition-all ${
                  selected?.id === type.id
                    ? 'border-[#1748BB] bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className={`text-sm font-semibold ${selected?.id === type.id ? 'text-[#1748BB]' : 'text-gray-800'}`}>
                  {type.name}
                </div>
                {type.description && (
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-2">{type.description}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: custom name + confirm */}
        {selected && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div>
              <label className="label">Section Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selected.name}
                className="input"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary">Cancel</button>
              <button onClick={handleAdd} disabled={adding} className="btn-primary">
                {adding ? 'Adding...' : `Add "${customName || selected.name}"`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
