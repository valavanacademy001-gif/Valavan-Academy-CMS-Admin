import { createClient } from '@/lib/supabase/server'
import TrackingAnalyticsClient from '@/components/marketing/TrackingAnalyticsClient'

export default async function TrackingPage() {
  const supabase = await createClient()

  // Fetch tracking fields from global_settings -> tracking_analytics
  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let fieldsMap: Record<string, string> = {}

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVals } = await supabase.from('field_values').select('*, field:fields(name)').eq('section_id', sec.id)
      fieldVals?.forEach((fv: any) => {
        const fieldName = fv.field?.name
        if (fieldName) {
          fieldsMap[fieldName] = fv.published_value_text || fv.value_text || ''
        }
      })
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <TrackingAnalyticsClient initialFields={fieldsMap} />
    </div>
  )
}
