import { createClient } from '@/lib/supabase/server'
import TrackingAnalyticsClient from '@/components/marketing/TrackingAnalyticsClient'

export const metadata = {
  title: 'Tracking & Analytics System | Valavan Academy CMS',
  description: 'Real-time telemetry, visitor analytics, Meta Pixel, and conversion tracking dashboard',
}

export default async function TrackingPage() {
  const supabase = await createClient()

  // Fetch tracking fields from global_settings -> tracking_analytics
  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let fieldsMap: Record<string, string> = {}
  let initialEvents: any[] = []
  let initialLeads: any[] = []

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

      fieldVals?.forEach((fv: any) => {
        const fieldName = fv.field?.name
        if (fieldName) {
          const val = fv.published_value_text || fv.value_text || ''
          fieldsMap[fieldName] = val

          if (fieldName === 'events_log_data' && val) {
            try {
              initialEvents = JSON.parse(val)
            } catch (e) {
              console.error('Error parsing events_log_data:', e)
            }
          }

          if (fieldName === 'leads_data' && val) {
            try {
              initialLeads = JSON.parse(val)
            } catch (e) {
              console.error('Error parsing leads_data:', e)
            }
          }
        }
      })
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <TrackingAnalyticsClient
        initialFields={fieldsMap}
        initialEvents={initialEvents}
        initialLeads={initialLeads}
      />
    </div>
  )
}
