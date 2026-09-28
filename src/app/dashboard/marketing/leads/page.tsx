import { createClient } from '@/lib/supabase/server'
import LeadsAttributionClient from '@/components/marketing/LeadsAttributionClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeadsPage() {
  const supabase = await createClient()

  // Fetch leads and sales team from global_settings -> tracking_analytics -> leads_data & sales_team_data
  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialLeads: any[] = []
  let initialSalesTeam: any[] = []

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVals } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)

      const leadsVal = fieldVals?.find((fv: any) => fv.field?.name === 'leads_data')
      if (leadsVal) {
        try {
          const raw = leadsVal.published_value_text || leadsVal.value_text
          if (raw) initialLeads = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing leads json', e)
        }
      }

      const teamVal = fieldVals?.find((fv: any) => fv.field?.name === 'sales_team_data')
      if (teamVal) {
        try {
          const raw = teamVal.published_value_text || teamVal.value_text
          if (raw) initialSalesTeam = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing sales team json', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <LeadsAttributionClient initialLeads={initialLeads} initialSalesTeam={initialSalesTeam} />
    </div>
  )
}
