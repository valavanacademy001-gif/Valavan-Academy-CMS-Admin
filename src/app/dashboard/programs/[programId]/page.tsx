import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditProgramClient from '@/components/programs/EditProgramClient'

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>
}) {
  const { programId } = await params
  const supabase = await createClient()

  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single()

  if (!program) notFound()

  return <EditProgramClient program={program} />
}
