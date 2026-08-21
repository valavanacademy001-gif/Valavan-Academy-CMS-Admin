import { createClient } from '@/lib/supabase/server'
import SiteSettingsClient from '@/components/settings/SiteSettingsClient'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .order('key')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Global settings for the entire website</p>
      </div>
      <SiteSettingsClient initialSettings={settings ?? []} />
    </div>
  )
}
