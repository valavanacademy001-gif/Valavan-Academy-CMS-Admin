import { createClient } from '@/lib/supabase/server'
import CustomCodeClient from '@/components/settings/CustomCodeClient'

export default async function CustomCodePage() {
  const supabase = await createClient()

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialCode = null

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVals } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)

      const fieldVal = fieldVals?.find((f: any) => f.field?.name === 'custom_code_data')

      if (fieldVal) {
        try {
          const raw = fieldVal.published_value_text || fieldVal.value_text
          if (raw) initialCode = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing custom code data', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <CustomCodeClient initialCode={initialCode} />
    </div>
  )
}
