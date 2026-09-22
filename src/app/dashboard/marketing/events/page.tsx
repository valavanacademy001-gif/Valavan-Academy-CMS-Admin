import { createClient } from '@/lib/supabase/server'
import LiveEventsClient from '@/components/marketing/LiveEventsClient'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialEvents: any[] = []

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVals } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)

      const fieldVal = fieldVals?.find((f: any) => f.field?.name === 'events_log_data')

      if (fieldVal) {
        try {
          const raw = fieldVal.published_value_text || fieldVal.value_text
          if (raw) initialEvents = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing event logs json', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <LiveEventsClient initialEvents={initialEvents} />
    </div>
  )
}
