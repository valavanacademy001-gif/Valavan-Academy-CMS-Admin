import { createClient } from '@/lib/supabase/server'
import SEOAEODashboardClient from '@/components/marketing/SEOAEODashboardClient'

export const metadata = {
  title: 'SEO & AEO Engine | Valavan Academy CMS',
  description: 'Manage Global SEO, Answer Engine Optimization (AEO), Schema Markup, Sitemap, and Robots.txt for Valavan Academy',
}

export default async function MarketingSEOPage() {
  const supabase = await createClient()

  let initialGlobalSEO = undefined
  let initialPageSEO = undefined

  try {
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'global_settings')
      .maybeSingle()

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

        if (fieldVals && fieldVals.length > 0) {
          const globalVal = fieldVals.find(
            (fv: any) => fv.field?.name === 'global_seo_data'
          )
          if (globalVal) {
            const raw = globalVal.published_value_text || globalVal.value_text
            if (raw) {
              try {
                initialGlobalSEO = JSON.parse(raw)
              } catch (e) {
                console.error('Error parsing global_seo_data:', e)
              }
            }
          }

          const pagesVal = fieldVals.find(
            (fv: any) => fv.field?.name === 'seo_settings_data'
          )
          if (pagesVal) {
            const raw = pagesVal.published_value_text || pagesVal.value_text
            if (raw) {
              try {
                initialPageSEO = JSON.parse(raw)
              } catch (e) {
                console.error('Error parsing seo_settings_data:', e)
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Failed fetching SEO settings in MarketingSEOPage:', err)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <SEOAEODashboardClient
        initialGlobalSEO={initialGlobalSEO}
        initialPageSEO={initialPageSEO}
      />
    </div>
  )
}
