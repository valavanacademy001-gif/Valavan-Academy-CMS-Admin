'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { parseYouTubeUrl, getYouTubeThumbnail } from '@/lib/utils'
import { ArrowLeft, Loader2, Youtube, Video } from 'lucide-react'
import Link from 'next/link'

export default function NewLearnerStoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    student_name: '',
    youtube_url: '',
    video_url: '',
    thumbnail_url: '',
    duration: '',
    is_visible: true,
  })

  const handleYoutubeUrlChange = (url: string) => {
    const { videoId } = parseYouTubeUrl(url)
    const autoThumb = videoId ? getYouTubeThumbnail(videoId, 'hq') : ''

    setForm((prev) => ({
      ...prev,
      youtube_url: url,
      thumbnail_url: prev.thumbnail_url || autoThumb,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { videoId } = parseYouTubeUrl(form.youtube_url)

    const { error } = await supabase.from('learner_stories').insert({
      title: form.title || form.student_name,
      student_name: form.student_name,
      youtube_url: form.youtube_url || null,
      youtube_video_id: videoId || null,
      video_url: form.video_url || null,
      thumbnail_url: form.thumbnail_url || null,
      duration: form.duration || null,
      is_visible: form.is_visible,
      created_by: user?.id,
    })

    setLoading(false)
    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('✓ Learner story added!')
    router.push('/dashboard/learner-stories')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/learner-stories" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Learner Story</h1>
          <p className="text-gray-500 text-sm">Add student video transformation story</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="label">Story Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. From College Student to 50k/month Freelancer"
            className="input"
          />
        </div>

        <div>
          <label className="label">Student Name *</label>
          <input
            type="text"
            value={form.student_name}
            onChange={(e) => setForm((p) => ({ ...p, student_name: e.target.value }))}
            required
            placeholder="e.g. Vignesh R"
            className="input"
          />
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-600" />
            YouTube Video / Shorts URL
          </label>
          <input
            type="url"
            value={form.youtube_url}
            onChange={(e) => handleYoutubeUrlChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://youtube.com/shorts/..."
            className="input font-mono text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Accepts regular YouTube videos and YouTube Shorts. Video ID & thumbnail are extracted automatically.
          </p>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-600" />
            Direct Video URL (MP4 / WebM)
          </label>
          <input
            type="url"
            value={form.video_url}
            onChange={(e) => setForm((p) => ({ ...p, video_url: e.target.value }))}
            placeholder="/assets/videos/... or https://..."
            className="input font-mono text-sm"
          />
        </div>

        <div>
          <label className="label">Custom Thumbnail URL</label>
          <input
            type="url"
            value={form.thumbnail_url}
            onChange={(e) => setForm((p) => ({ ...p, thumbnail_url: e.target.value }))}
            placeholder="https://... (auto-filled for YouTube)"
            className="input"
          />
          {form.thumbnail_url && (
            <div className="mt-2 relative aspect-video w-48 rounded-lg overflow-hidden border border-gray-200">
              <img src={form.thumbnail_url} alt="Thumbnail preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        <div>
          <label className="label">Duration</label>
          <input
            type="text"
            value={form.duration}
            onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
            placeholder="e.g. 1:45"
            className="input"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Link href="/dashboard/learner-stories" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Adding...' : 'Add Story'}
          </button>
        </div>
      </form>
    </div>
  )
}
