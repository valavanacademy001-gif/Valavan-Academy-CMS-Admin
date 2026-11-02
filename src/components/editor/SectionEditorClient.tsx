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
import FooterEditor, { FooterData, FooterLinkItem } from './FooterEditor'

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

  const isFooterSection =
    section.slug === 'footer' ||
    initialFields.some((f) => f.name === 'navigate_links' || f.name === 'reach_phone')

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

  // Extract initial footer data if this is a footer section
  const initialFooterData: FooterData = useMemo(() => {
    if (!isFooterSection) {
      return {
        brand_description: '',
        facebook_url: '',
        instagram_url: '',
        youtube_url: '',
        linkedin_url: '',
        reach_phone: '',
        reach_email: '',
        reach_address: '',
        reach_hours: '',
        copyright_text: '',
        bottom_tagline: '',
        navigate_links: [],
        programs_links: [],
        account_links: [],
      }
    }

    const getVal = (name: string, fallback: string = '') => {
      const fld = initialFields.find((f) => f.name === name)
      if (!fld) return fallback
      const v = Array.isArray(fld.value) ? fld.value[0] : fld.value
      return v?.value_text ?? v?.value_url ?? fallback
    }

    const getJsonVal = (name: string, fallback: FooterLinkItem[] = []) => {
      const fld = initialFields.find((f) => f.name === name)
      if (!fld) return fallback
      const v = Array.isArray(fld.value) ? fld.value[0] : fld.value
      if (v?.value_json && Array.isArray(v.value_json)) {
        return v.value_json as FooterLinkItem[]
      }
      if (typeof v?.value_text === 'string' && v.value_text.startsWith('[')) {
        try {
          return JSON.parse(v.value_text)
        } catch {}
      }
      return fallback
    }

    return {
      brand_description: getVal(
        'brand_description',
        'Graphic Design · Video Editing · Web Design · UI/UX · AI Tools · Digital Skills — taught in Tamil, built for careers.'
      ),
      facebook_url: getVal('facebook_url', 'https://www.facebook.com/ValavanAcademy'),
      instagram_url: getVal('instagram_url', 'https://www.instagram.com/valavanacademy'),
      youtube_url: getVal('youtube_url', 'https://www.youtube.com/@ValavanAcademyofficial'),
      linkedin_url: getVal('linkedin_url', 'https://www.linkedin.com/in/valavan-p-813383337/'),
      reach_phone: getVal('reach_phone', '+91 93428 96977'),
      reach_email: getVal('reach_email', 'valavanacademy@gmail.com'),
      reach_address: getVal(
        'reach_address',
        'SF No 157/3, Mandabam Street, Salaipettai, Pernambut Taluk, Vellore Dist - 635810'
      ),
      reach_hours: getVal('reach_hours', 'Mon–Sat · 9am–7pm IST'),
      copyright_text: getVal('copyright_text', '© 2026 Valavan Academy. All rights reserved.'),
      bottom_tagline: getVal('bottom_tagline', 'Tamil-first Creative Learning Academy'),
      navigate_links: getJsonVal('navigate_links', [
        { id: '1', label: 'Home', href: '/' },
        { id: '2', label: 'Programs', href: '/programs' },
        { id: '3', label: 'About', href: '/about' },
        { id: '4', label: 'Community', href: '/community' },
        { id: '5', label: 'Contact', href: '/contact' },
        { id: '6', label: 'Terms & Conditions', href: '/terms-conditions' },
        { id: '7', label: 'Privacy Policy', href: '/privacy-policy' },
      ]),
      programs_links: getJsonVal('programs_links', [
        { id: '1', label: '90-Day Graphic Design', href: '/programs/90-days-graphic-design' },
        { id: '2', label: 'Full Stack Creator', href: '/programs/full-stack-creator' },
      ]),
      account_links: getJsonVal('account_links', [
        { id: '1', label: 'Log In', href: 'https://learn.valavanacademy.com/clientapp/login' },
        { id: '2', label: 'Get Started', href: 'https://rzp.io/rzp/4ydecO7' },
        { id: '3', label: 'TNCC Community', href: 'https://tamilnaducreatorsclub.com/' },
      ]),
    }
  }, [initialFields, isFooterSection])

  const [cards, setCards] = useState<SkillCardItem[]>(initialCards)
  const [mentors, setMentors] = useState<MentorItem[]>(initialMentors)
  const [footerData, setFooterData] = useState<FooterData>(initialFooterData)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [isVisible, setIsVisible] = useState(section.is_visible)
  const [showAddField, setShowAddField] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Non-card / Non-mentor / Non-footer header fields
  const nonDynamicFields = useMemo(() => {
    if (isFooterSection) return []
    if (isCardsSection) {
      return fields.filter((f) => !/^card_\d+_(title|image)$/.test(f.name))
    }
    if (isTeamSection) {
      return fields.filter((f) => !/^mentor_\d+_/.test(f.name))
    }
    return fields
  }, [fields, isCardsSection, isTeamSection, isFooterSection])

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

  const handleFooterChange = (newFooterData: FooterData) => {
    setFooterData(newFooterData)
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

    // 4. If this is a footer section, sync all footer fields dynamically
    if (isFooterSection) {
      const footerFieldsConfig = [
        { name: 'brand_description', label: 'Brand Description', field_type: 'long_text', val: footerData.brand_description, is_json: false },
        { name: 'facebook_url', label: 'Facebook URL', field_type: 'url', val: footerData.facebook_url, is_json: false },
        { name: 'instagram_url', label: 'Instagram URL', field_type: 'url', val: footerData.instagram_url, is_json: false },
        { name: 'youtube_url', label: 'YouTube URL', field_type: 'url', val: footerData.youtube_url, is_json: false },
        { name: 'linkedin_url', label: 'LinkedIn URL', field_type: 'url', val: footerData.linkedin_url, is_json: false },
        { name: 'reach_phone', label: 'Reach Us: Phone', field_type: 'short_text', val: footerData.reach_phone, is_json: false },
        { name: 'reach_email', label: 'Reach Us: Email', field_type: 'short_text', val: footerData.reach_email, is_json: false },
        { name: 'reach_address', label: 'Reach Us: Address', field_type: 'long_text', val: footerData.reach_address, is_json: false },
        { name: 'reach_hours', label: 'Reach Us: Working Hours', field_type: 'short_text', val: footerData.reach_hours, is_json: false },
        { name: 'copyright_text', label: 'Copyright Text', field_type: 'short_text', val: footerData.copyright_text, is_json: false },
        { name: 'bottom_tagline', label: 'Bottom Tagline', field_type: 'short_text', val: footerData.bottom_tagline, is_json: false },
        { name: 'navigate_links', label: 'Navigate Links', field_type: 'json', val: footerData.navigate_links, is_json: true },
        { name: 'programs_links', label: 'Programs Links', field_type: 'json', val: footerData.programs_links, is_json: true },
        { name: 'account_links', label: 'Account Links', field_type: 'json', val: footerData.account_links, is_json: true },
      ]

      for (const fc of footerFieldsConfig) {
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
              sort_order: 1,
            })
            .select('id')
            .single()
          fld = ins
        }

        if (fld?.id) {
          const { data: existingVal } = await supabase
            .from('field_values')
            .select('id')
            .eq('field_id', fld.id)
            .maybeSingle()

          const valPayload = {
            field_id: fld.id,
            section_id: section.id,
            page_id: page.id,
            value_text: fc.is_json ? JSON.stringify(fc.val) : (fc.val as string),
            value_url: fc.field_type === 'url' ? (fc.val as string) : null,
            value_json: fc.is_json ? fc.val : null,
            published_value_text: fc.is_json ? JSON.stringify(fc.val) : (fc.val as string),
            published_value_json: fc.is_json ? fc.val : null,
            updated_by: user?.id,
            is_draft: true,
          }

          if (existingVal?.id) {
            await supabase.from('field_values').update(valPayload).eq('id', existingVal.id)
          } else {
            await supabase.from('field_values').insert(valPayload)
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
      .select('id, field_id, value_text, value_url, value_json')
      .eq('section_id', section.id)

    if (allFieldValues) {
      for (const fv of allFieldValues) {
        await supabase
          .from('field_values')
          .update({
            is_draft: false,
            published_value_text: fv.value_text || fv.value_url || '',
            published_value_json: fv.value_json || null,
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
    <div className="max-w-4xl mx-auto space-y-6">
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
            {!isCardsSection && !isTeamSection && !isFooterSection && (
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
      {isFooterSection ? (
        <FooterEditor data={footerData} onChange={handleFooterChange} />
      ) : isCardsSection ? (
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
