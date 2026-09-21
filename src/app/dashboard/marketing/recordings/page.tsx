import { createClient } from '@/lib/supabase/server'
import SessionRecordingsClient from '@/components/marketing/SessionRecordingsClient'

export default async function SessionRecordingsPage() {
  const supabase = await createClient()

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialRecordings: any[] = []
  let clarityProjectId = ''
  let clarityConnected = false

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      // 1. Fetch Clarity Project ID and status
      const { data: clarityField } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)
        .eq('field.name', 'clarity_project_id')
        .maybeSingle()

      if (clarityField) {
        clarityProjectId = clarityField.published_value_text || clarityField.value_text || ''
        clarityConnected = Boolean(clarityProjectId.trim())
      }

      // 2. Fetch Session Recordings Metadata
      const { data: recField } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)
        .eq('field.name', 'session_recordings_data')
        .maybeSingle()

      if (recField) {
        try {
          const raw = recField.published_value_text || recField.value_text
          if (raw) initialRecordings = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing session recordings data', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SessionRecordingsClient
        initialRecordings={initialRecordings}
        clarityProjectId={clarityProjectId}
        clarityConnected={clarityConnected}
      />
    </div>
  )
}
