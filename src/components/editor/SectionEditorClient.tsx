'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ArrowLeft, Save, Loader2, Plus, ChevronRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import FieldEditor from './FieldEditor'
import AddFieldModal from './AddFieldModal'
import SkillsCardsEditor, { SkillCardItem } from './SkillsCardsEditor'
import MentorsEditor, { MentorItem } from './MentorsEditor'

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
  const isCardsSection =
    section.slug === 'skills_money' ||
    initialFields.some((f) => /^card_\d+_title$/.test(f.name))

  const isTeamSection =
    section.slug === 'team' ||
    initialFields.some((f) => /^mentor_\d+_name$/.test(f.name))

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

  // Extract initial cards if this is a card-driven section (e.g. skills_money)
  const initialCards = useMemo(() => {
    if (!isCardsSection) return []
    const cardMap: Record<number, { title: string; image: string }> = {}

    initialFields.forEach((f) => {
      const match = f.name.match(/^card_(\d+)_(title|image)$/)
      if (match) {
        const idx = parseInt(match[1], 10)
        if (!cardMap[idx]) cardMap[idx] = { title: '', image: '' }
        const val = Array.isArray(f.value) ? f.value[0] : f.value
        const strVal = val ? (val.value_text ?? val.value_url ?? '') : ''
        if (match[2] === 'title') cardMap[idx].title = strVal
        if (match[2] === 'image') cardMap[idx].image = strVal
      }
    })

    const sortedIndices = Object.keys(cardMap)
      .map(Number)
      .sort((a, b) => a - b)

    return sortedIndices.map((idx) => ({
      id: `card-${idx}-${Date.now()}`,
      title: cardMap[idx].title,
      image: cardMap[idx].image,
    }))
  }, [initialFields, isCardsSection])

  // Extract initial mentors if this is a team/mentors section (e.g. about.team)
  const initialMentors = useMemo(() => {
    if (!isTeamSection) return []
    const mentorMap: Record<number, Partial<MentorItem>> = {}

    initialFields.forEach((f) => {
      const match = f.name.match(/^mentor_(\d+)_(name|role|designation|specialty|bio|experience|skills|image)$/)
      if (match) {
        const idx = parseInt(match[1], 10)
        if (!mentorMap[idx]) {
          mentorMap[idx] = {
            id: `mentor-${idx}`,
            name: '',
            role: '',
            designation: '',
            specialty: '',
            bio: '',
            experience: '5+ Years',
            skills: '',
            image: '',
          }
        }
        const val = Array.isArray(f.value) ? f.value[0] : f.value
        const strVal = val ? (val.value_text ?? val.value_url ?? '') : ''
        const fieldKey = match[2] as keyof MentorItem
        ;(mentorMap[idx] as any)[fieldKey] = strVal
      }
    })

    const sortedIndices = Object.keys(mentorMap)
      .map(Number)
      .sort((a, b) => a - b)

    return sortedIndices.map((idx) => ({
      id: `mentor-${idx}-${Date.now()}`,
      name: mentorMap[idx].name || '',
      role: mentorMap[idx].role || '',
      designation: mentorMap[idx].designation || '',
      specialty: mentorMap[idx].specialty || '',
      bio: mentorMap[idx].bio || '',
      experience: mentorMap[idx].experience || '5+ Years',
      skills: mentorMap[idx].skills || '',
      image: mentorMap[idx].image || '',
    }))
  }, [initialFields, isTeamSection])

  const [cards, setCards] = useState<SkillCardItem[]>(initialCards)
  const [mentors, setMentors] = useState<MentorItem[]>(initialMentors)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isVisible, setIsVisible] = useState(section.is_visible)
  const [showAddField, setShowAddField] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Non-card / Non-mentor header fields
  const nonDynamicFields = useMemo(() => {
    if (isCardsSection) {
      return fields.filter((f) => !/^card_\d+_(title|image)$/.test(f.name))
    }
    if (isTeamSection) {
      return fields.filter((f) => !/^mentor_\d+_/.test(f.name))
    }
    return fields
  }, [fields, isCardsSection, isTeamSection])

  const handleValueChange = (fieldId: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    setHasChanges(true)
  }

  const handleCardsChange = (newCards: SkillCardItem[]) => {
    setCards(newCards)
    setHasChanges(true)
  }

  const handleMentorsChange = (newMentors: MentorItem[]) => {
    setMentors(newMentors)
    setHasChanges(true)
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Save standard (or header) fields
    for (const field of nonDynamicFields) {
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

    // 2. If this is a cards section (e.g. skills_money), sync all cards dynamically
    if (isCardsSection) {
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i]
        const cardIdx = i + 1
        const titleName = `card_${cardIdx}_title`
        const titleLabel = `Card ${cardIdx}: Title`
        const imageName = `card_${cardIdx}_image`
        const imageLabel = `Card ${cardIdx}: Image Card`

        // Ensure title field exists
        let { data: titleField } = await supabase
          .from('fields')
          .select('id')
          .eq('section_id', section.id)
          .eq('name', titleName)
          .maybeSingle()

        if (!titleField) {
          const { data: ins } = await supabase
            .from('fields')
            .insert({
              section_id: section.id,
              name: titleName,
              label: titleLabel,
              field_type: 'short_text',
              sort_order: 10 + i * 2,
            })
            .select('id')
            .single()
          titleField = ins
        } else {
          await supabase
            .from('fields')
            .update({
              label: titleLabel,
              sort_order: 10 + i * 2,
            })
            .eq('id', titleField.id)
        }

        // Ensure image field exists
        let { data: imageField } = await supabase
          .from('fields')
          .select('id')
          .eq('section_id', section.id)
          .eq('name', imageName)
          .maybeSingle()

        if (!imageField) {
          const { data: ins } = await supabase
            .from('fields')
            .insert({
              section_id: section.id,
              name: imageName,
              label: imageLabel,
              field_type: 'image',
              sort_order: 11 + i * 2,
            })
            .select('id')
            .single()
          imageField = ins
        } else {
          await supabase
            .from('fields')
            .update({
              label: imageLabel,
              sort_order: 11 + i * 2,
            })
            .eq('id', imageField.id)
        }

        // Upsert title field value
        if (titleField?.id) {
          const { data: existingTitleVal } = await supabase
            .from('field_values')
            .select('id')
            .eq('field_id', titleField.id)
            .maybeSingle()

          if (existingTitleVal?.id) {
            await supabase
              .from('field_values')
              .update({
                value_text: card.title,
                updated_by: user?.id,
                is_draft: true,
              })
              .eq('id', existingTitleVal.id)
          } else {
            await supabase.from('field_values').insert({
              field_id: titleField.id,
              section_id: section.id,
              page_id: page.id,
              value_text: card.title,
              updated_by: user?.id,
              is_draft: true,
            })
          }
        }

        // Upsert image field value
        if (imageField?.id) {
          const { data: existingImageVal } = await supabase
            .from('field_values')
            .select('id')
            .eq('field_id', imageField.id)
            .maybeSingle()

          if (existingImageVal?.id) {
            await supabase
              .from('field_values')
              .update({
                value_text: card.image,
                value_url: card.image,
                updated_by: user?.id,
                is_draft: true,
              })
              .eq('id', existingImageVal.id)
          } else {
            await supabase.from('field_values').insert({
              field_id: imageField.id,
              section_id: section.id,
              page_id: page.id,
              value_text: card.image,
              value_url: card.image,
              updated_by: user?.id,
              is_draft: true,
            })
          }
        }
      }

      // Cleanup excess fields if cards were deleted
      const { data: allSectionFields } = await supabase
        .from('fields')
        .select('id, name')
        .eq('section_id', section.id)

      if (allSectionFields) {
        for (const ef of allSectionFields) {
          const match = ef.name.match(/^card_(\d+)_(title|image)$/)
          if (match) {
            const idx = parseInt(match[1], 10)
            if (idx > cards.length) {
              await supabase.from('field_values').delete().eq('field_id', ef.id)
              await supabase.from('fields').delete().eq('id', ef.id)
            }
          }
        }
      }
    }

    // 3. If this is a team/mentors section, sync all mentors dynamically
    if (isTeamSection) {
      for (let i = 0; i < mentors.length; i++) {
        const m = mentors[i]
        const idx = i + 1
        const baseOrder = 10 + i * 10

        const mentorFieldsConfig = [
          { name: `mentor_${idx}_name`, label: `Mentor ${idx}: Name`, field_type: 'short_text', val: m.name, order: baseOrder + 1 },
          { name: `mentor_${idx}_role`, label: `Mentor ${idx}: Front Role Badge`, field_type: 'short_text', val: m.role, order: baseOrder + 2 },
          { name: `mentor_${idx}_designation`, label: `Mentor ${idx}: Designation`, field_type: 'short_text', val: m.designation, order: baseOrder + 3 },
          { name: `mentor_${idx}_specialty`, label: `Mentor ${idx}: Specialization`, field_type: 'short_text', val: m.specialty, order: baseOrder + 4 },
          { name: `mentor_${idx}_bio`, label: `Mentor ${idx}: Bio / About`, field_type: 'long_text', val: m.bio, order: baseOrder + 5 },
          { name: `mentor_${idx}_experience`, label: `Mentor ${idx}: Experience`, field_type: 'short_text', val: m.experience, order: baseOrder + 6 },
          { name: `mentor_${idx}_skills`, label: `Mentor ${idx}: Key Skills & Tools`, field_type: 'short_text', val: m.skills, order: baseOrder + 7 },
          { name: `mentor_${idx}_image`, label: `Mentor ${idx}: Photo Image`, field_type: 'image', val: m.image, order: baseOrder + 8 },
        ]

        for (const fc of mentorFieldsConfig) {
          let { data: fld } = await supabase
            .from('fields')
            .select('id')
            .eq('section_id', section.id)
            .eq('name', fc.name)
            .maybeSingle()

          if (!fld) {
            const { data: ins } = await supabase
              .from('fields')
              .insert({
                section_id: section.id,
                name: fc.name,
                label: fc.label,
                field_type: fc.field_type,
                sort_order: fc.order,
              })
              .select('id')
              .single()
            fld = ins
          } else {
            await supabase
              .from('fields')
              .update({
                label: fc.label,
                sort_order: fc.order,
              })
              .eq('id', fld.id)
          }

          if (fld?.id) {
            const { data: valRow } = await supabase
              .from('field_values')
              .select('id')
              .eq('field_id', fld.id)
              .maybeSingle()

            const valPayload = {
              section_id: section.id,
              field_id: fld.id,
              page_id: page.id,
              value_text: fc.val,
              value_url: fc.field_type === 'image' ? fc.val : null,
              updated_by: user?.id,
              is_draft: true,
            }

            if (valRow?.id) {
              await supabase.from('field_values').update(valPayload).eq('id', valRow.id)
            } else {
              await supabase.from('field_values').insert(valPayload)
            }
          }
        }
      }

      // Cleanup excess mentors if mentors were deleted
      const { data: allSectionFields } = await supabase
        .from('fields')
        .select('id, name')
        .eq('section_id', section.id)

      if (allSectionFields) {
        for (const ef of allSectionFields) {
          const match = ef.name.match(/^mentor_(\d+)_/)
          if (match) {
            const idx = parseInt(match[1], 10)
            if (idx > mentors.length) {
              await supabase.from('field_values').delete().eq('field_id', ef.id)
              await supabase.from('fields').delete().eq('id', ef.id)
            }
          }
        }
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

    // Query all fields and copy draft values to published values
    const { data: allFieldValues } = await supabase
      .from('field_values')
      .select('id, field_id, value_text, value_url')
      .eq('section_id', section.id)

    if (allFieldValues) {
      for (const fv of allFieldValues) {
        await supabase
          .from('field_values')
          .update({
            is_draft: false,
            published_value_text: fv.value_text || fv.value_url || '',
          })
          .eq('id', fv.id)
      }
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

      {/* Non-dynamic Header Settings */}
      {nonDynamicFields.length > 0 && (
        <div className="card divide-y divide-gray-100">
          <div className="flex items-center justify-between p-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Section Header &amp; Texts</h2>
              <p className="text-xs text-gray-400">Configure title, eyebrow, badge, description for this section</p>
            </div>
            {!isCardsSection && !isTeamSection && (
              <button onClick={() => setShowAddField(true)} className="btn-secondary py-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add Field
              </button>
            )}
          </div>

          {nonDynamicFields.map((field) => (
            <FieldEditor
              key={field.id}
              field={field}
              value={fieldValues[field.id] ?? ''}
              onChange={(val) => handleValueChange(field.id, val)}
            />
          ))}
        </div>
      )}

      {/* Specialized Editors */}
      {isCardsSection ? (
        <div className="card p-5">
          <SkillsCardsEditor cards={cards} onChange={handleCardsChange} />
        </div>
      ) : isTeamSection ? (
        <div className="card p-5">
          <MentorsEditor mentors={mentors} onChange={handleMentorsChange} />
        </div>
      ) : fields.length === 0 ? (
        <div className="card py-10 text-center text-gray-400">
          <p className="text-sm">No fields in this section yet.</p>
          <button onClick={() => setShowAddField(true)} className="btn-primary mt-3 inline-flex">
            <Plus className="w-4 h-4" />
            Add First Field
          </button>
        </div>
      ) : null}

      {/* Actions Bar */}
      <div className="card p-4 flex items-center justify-between sticky bottom-4 shadow-lg bg-white/95 backdrop-blur-sm z-30">
        <div className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
          {hasChanges ? (
            <span className="text-amber-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              All changes saved
            </span>
          )}
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
