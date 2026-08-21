import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageEditorClient from '@/components/editor/PageEditorClient'

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select(`*, template:page_templates(id, name, slug)`)
    .eq('id', pageId)
    .single()

  if (!page) notFound()

  const { data: sections } = await supabase
    .from('sections')
    .select(`*, section_type:section_types(id, name, slug, icon, default_fields)`)
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  const { data: sectionTypes } = await supabase
    .from('section_types')
    .select('*')
    .order('name')

  return (
    <PageEditorClient
      page={page}
      initialSections={sections ?? []}
      sectionTypes={sectionTypes ?? []}
    />
  )
}
