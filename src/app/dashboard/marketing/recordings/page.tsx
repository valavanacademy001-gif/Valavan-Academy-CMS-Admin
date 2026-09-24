import { createClient } from '@/lib/supabase/server'
import SessionRecordingsClient from '@/components/marketing/SessionRecordingsClient'
import { aggregateEventsToRecordings, SessionRecordingItem } from '@/lib/sessionUtils'

export default async function SessionRecordingsPage() {
  const supabase = await createClient()

  const { data: page } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', 'global_settings')
    .maybeSingle()

  let initialRecordings: SessionRecordingItem[] = []
  let rawEvents: any[] = []
  let clarityProjectId = ''
  let clarityConnected = false

  if (page) {
    const { data: sec } = await supabase
      .from('sections')
      .select('id')
      .eq('page_id', page.id)
      .eq('slug', 'tracking_analytics')
      .maybeSingle()

    if (sec) {
      const { data: fieldVals } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)

      // 1. Fetch Clarity Project ID and status
      const clarityField = fieldVals?.find((f: any) => f.field?.name === 'clarity_project_id')
      if (clarityField) {
        clarityProjectId = clarityField.published_value_text || clarityField.value_text || ''
        clarityConnected = Boolean(clarityProjectId.trim())
      }
      if (!clarityProjectId) {
        clarityProjectId = 'ymogx7tv3i'
        clarityConnected = true
      }

      // 2. PRIORITY 1: Fetch Clarity-synced recordings (real Clarity data — protected field)
      // This field is only written by /api/clarity-sync and the push script, never by /api/track
      const clarityRecField = fieldVals?.find(
        (f: any) => f.field?.name === 'clarity_recordings_data'
      )
      if (clarityRecField) {
        try {
          const raw = clarityRecField.published_value_text || clarityRecField.value_text
          if (raw) {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed) && parsed.length > 0) {
              initialRecordings = parsed
            }
          }
        } catch (e) {
          console.error('Error parsing clarity_recordings_data', e)
        }
      }

      // 3. PRIORITY 2: Fall back to session_recordings_data if no Clarity data
      if (initialRecordings.length === 0) {
        const recField = fieldVals?.find(
          (f: any) =>
            f.field?.name === 'session_recordings_data' || f.field?.name === 'visitor_sessions_data'
        )
        if (recField) {
          try {
            const raw = recField.published_value_text || recField.value_text
            if (raw) initialRecordings = JSON.parse(raw)
          } catch (e) {
            console.error('Error parsing session recordings data', e)
          }
        }
      }

      // 4. Fetch raw events (for local sync only)
      const eventsField = fieldVals?.find((f: any) => f.field?.name === 'events_log_data')
      if (eventsField) {
        try {
          const raw = eventsField.published_value_text || eventsField.value_text
          if (raw) rawEvents = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing events log data', e)
        }
      }

      // 5. Last resort: aggregate from events only if nothing else exists
      if (initialRecordings.length === 0 && rawEvents.length > 0) {
        initialRecordings = aggregateEventsToRecordings(rawEvents, clarityProjectId)
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SessionRecordingsClient
        initialRecordings={initialRecordings}
        initialEvents={rawEvents}
        clarityProjectId={clarityProjectId}
        clarityConnected={clarityConnected}
      />
    </div>
  )
}
