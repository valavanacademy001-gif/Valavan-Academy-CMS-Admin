import { createClient } from '@/lib/supabase/server'
import CookieConsentClient from '@/components/settings/CookieConsentClient'

export default async function CookieConsentPage() {
  const supabase = await createClient()

  const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
  let initialConfig = null

  if (page) {
    const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
    if (sec) {
      const { data: fieldVal } = await supabase
        .from('field_values')
        .select('*, field:fields(name)')
        .eq('section_id', sec.id)
        .eq('field.name', 'cookie_consent_data')
        .maybeSingle()

      if (fieldVal) {
        try {
          const raw = fieldVal.published_value_text || fieldVal.value_text
          if (raw) initialConfig = JSON.parse(raw)
        } catch (e) {
          console.error('Error parsing cookie consent data', e)
        }
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <CookieConsentClient initialConfig={initialConfig} />
    </div>
  )
}
