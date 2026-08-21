import { createClient } from '@/lib/supabase/server'
import MediaLibraryClient from '@/components/media/MediaLibraryClient'

export default async function MediaPage() {
  const supabase = await createClient()
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-500 text-sm mt-1">Upload and manage images, videos and documents</p>
      </div>
      <MediaLibraryClient initialMedia={media ?? []} />
    </div>
  )
}
