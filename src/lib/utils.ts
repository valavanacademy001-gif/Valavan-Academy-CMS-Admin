// Utility helpers for the CMS

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Parse YouTube URL and extract video ID
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/shorts/
 */
export function parseYouTubeUrl(url: string): { videoId: string | null; type: 'video' | 'shorts' | null } {
  if (!url) return { videoId: null, type: null }

  // Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
  if (shortsMatch) return { videoId: shortsMatch[1], type: 'shorts' }

  // Standard: youtube.com/watch?v=VIDEO_ID
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
  if (watchMatch) return { videoId: watchMatch[1], type: 'video' }

  // Short URL: youtu.be/VIDEO_ID
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
  if (shortMatch) return { videoId: shortMatch[1], type: 'video' }

  return { videoId: null, type: null }
}

/**
 * Get YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(videoId: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`
}

/**
 * Get YouTube embed URL from video ID
 */
export function getYouTubeEmbedUrl(videoId: string, options?: { autoplay?: boolean; muted?: boolean; loop?: boolean }): string {
  const params = new URLSearchParams()
  if (options?.autoplay) params.set('autoplay', '1')
  if (options?.muted) params.set('mute', '1')
  if (options?.loop) { params.set('loop', '1'); params.set('playlist', videoId) }
  const query = params.toString()
  return `https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ''}`
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date to readable string
 */
export function formatDate(date: string | null): string {
  if (!date) return 'Never'
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Merge Tailwind class names safely
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/**
 * Truncate text to a given length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800'
    case 'draft': return 'bg-yellow-100 text-yellow-800'
    case 'archived': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

/**
 * Generate unique section slug for a page
 */
export function generateSectionSlug(name: string, existingSlugs: string[]): string {
  let slug = generateSlug(name)
  let counter = 1
  while (existingSlugs.includes(slug)) {
    slug = `${generateSlug(name)}-${counter}`
    counter++
  }
  return slug
}
