import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import SectionEditorClient from '@/components/editor/SectionEditorClient'

export default async function SectionEditorPage({
  params,
}: {
  params: Promise<{ pageId: string; sectionId: string }>
}) {
  const { pageId, sectionId } = await params
  const supabase = await createClient()

  const [{ data: page }, { data: section }, { data: fields }] = await Promise.all([
    supabase.from('pages').select('id, title, slug').eq('id', pageId).single(),
    supabase.from('sections')
      .select(`*, section_type:section_types(id, name, slug, default_fields)`)
      .eq('id', sectionId)
      .single(),
    supabase.from('fields')
      .select(`*, value:field_values(*)`)
      .eq('section_id', sectionId)
      .order('sort_order'),
  ])

  if (!page || !section) notFound()

  return (
    <SectionEditorClient
      page={page}
      section={section}
      initialFields={fields ?? []}
    />
  )
}
