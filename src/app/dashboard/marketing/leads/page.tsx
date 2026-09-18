import { createClient } from '@/lib/supabase/server'
import LeadsAttributionClient from '@/components/marketing/LeadsAttributionClient'

export default async function LeadsPage() {
  const supabase = await createClient()

  // Fetch leads from global_settings -> tracking_analytics -> leads_data
  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialLeads: any[] = []

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVal } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)
        .eq('field.name', 'leads_data')
        .maybeSingle()

      if (fieldVal) {
        try {
          const raw = fieldVal.published_value_text || fieldVal.value_text
          if (raw) initialLeads = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing leads json', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <LeadsAttributionClient initialLeads={initialLeads} />
    </div>
  )
}
