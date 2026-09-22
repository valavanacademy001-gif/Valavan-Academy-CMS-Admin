import { createClient } from '@/lib/supabase/server'
import ConversionSettingsClient, { DEFAULT_PROGRAM_CONVERSIONS, ProgramConversionConfig } from '@/components/marketing/ConversionSettingsClient'

export const metadata = {
  title: 'Program Conversion Settings | Valavan Academy CMS',
  description: 'Manage Razorpay payment links, WhatsApp group redirects, and thank-you pages for each program.',
}

export default async function ConversionSettingsPage() {
  const supabase = await createClient()

  let initialSettings: ProgramConversionConfig[] = DEFAULT_PROGRAM_CONVERSIONS

  try {
    const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').maybeSingle()
    if (page) {
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').maybeSingle()
      if (sec) {
        const { data: fieldVals } = await supabase
          .from('field_values')
          .select('*, field:fields(name)')
          .eq('section_id', sec.id)

        const fieldVal = fieldVals?.find((f: any) => f.field?.name === 'program_conversion_settings')

        if (fieldVal) {
          const raw = fieldVal.published_value_text || fieldVal.value_text
          if (raw) {
            try {
              const parsed = JSON.parse(raw)
              if (Array.isArray(parsed) && parsed.length > 0) {
                initialSettings = parsed
              }
            } catch (e) {
              console.error('Error parsing program conversion settings:', e)
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed fetching conversion settings:', err)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <ConversionSettingsClient initialSettings={initialSettings} />
    </div>
  )
}
