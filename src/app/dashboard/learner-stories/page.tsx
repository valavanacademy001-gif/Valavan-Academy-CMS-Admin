import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Video } from 'lucide-react'
import { getYouTubeThumbnail, parseYouTubeUrl } from '@/lib/utils'

export default async function LearnerStoriesPage() {
  const supabase = await createClient()
  const { data: stories } = await supabase
    .from('learner_stories')
    .select('*')
    .order('sort_order', { ascending: true })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learner Stories</h1>
          <p className="text-gray-500 text-sm mt-1">{stories?.length ?? 0} video stories</p>
        </div>
        <Link href="/dashboard/learner-stories/new" className="btn-primary">
          <Plus className="w-4 h-4" /> Add Story
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stories && stories.length > 0 ? (
          stories.map((story) => {
            const parsed = story.youtube_url ? parseYouTubeUrl(story.youtube_url) : null
            const videoId = story.youtube_video_id || parsed?.videoId || null
            const thumb = story.thumbnail_url || (videoId ? getYouTubeThumbnail(videoId) : null)
            return (
              <div key={story.id} className="card overflow-hidden group">
                <div className="relative aspect-video bg-gray-100">
                  {thumb ? (
                    <img src={thumb} alt={story.title ?? 'Story'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                      <Video className="w-5 h-5 text-[#1748BB]" />
                    </div>
                  </div>
                  {!story.is_visible && (
                    <div className="absolute top-2 right-2 badge badge-archived">Hidden</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-800 truncate">{story.title ?? 'Untitled'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{story.student_name ?? 'Unknown Student'}</div>
                  <Link href={`/dashboard/learner-stories/${story.id}`} className="text-xs font-medium text-[#1748BB] hover:underline mt-2 block">Edit</Link>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-4 card py-16 text-center">
            <Video className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <h3 className="text-gray-500 font-medium">No learner stories yet</h3>
            <Link href="/dashboard/learner-stories/new" className="btn-primary inline-flex mt-4">
              <Plus className="w-4 h-4" /> Add First Story
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
