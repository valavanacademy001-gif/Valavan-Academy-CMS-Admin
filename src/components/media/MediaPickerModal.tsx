'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Search, Image, Video, File, X, Upload, Check, Loader2 } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'

export type MediaItem = {
  id: string
  filename: string
  original_name: string
  file_url: string
  file_type: string
  file_size: number | null
  alt_text: string | null
}

interface MediaPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  allowedType?: 'image' | 'video' | 'all'
  title?: string
}

export default function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  allowedType = 'image',
  title = 'Choose from Media Library',
}: MediaPickerModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>(
    allowedType === 'video' ? 'video' : allowedType === 'image' ? 'image' : 'all'
  )
  const [uploading, setUploading] = useState(false)

  const fetchMedia = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from('media').select('*').order('created_at', { ascending: false })
    if (allowedType !== 'all') {
      query = query.eq('file_type', allowedType)
    }
    const { data, error } = await query
    if (!error && data) {
      setMediaList(data)
    }
    setLoading(false)
  }, [allowedType])

  useEffect(() => {
    if (isOpen) {
      fetchMedia()
    }
  }, [isOpen, fetchMedia])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const path = `uploads/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(path)
      const fileType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document'

      const { data: mediaRecord } = await supabase.from('media').insert({
        filename,
        original_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        file_size: file.size,
        alt_text: file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
        storage_path: path,
        bucket_name: 'cms-media',
        uploaded_by: user?.id,
      }).select().single()

      if (mediaRecord) {
        setMediaList((prev) => [mediaRecord, ...prev])
        toast.success(`✓ ${file.name} uploaded`)
      }
    }

    setUploading(false)
    e.target.value = ''
  }

  if (!isOpen) return null

  const filtered = mediaList.filter((m) => {
    const query = search.toLowerCase()
    const matchesSearch =
      m.original_name?.toLowerCase().includes(query) ||
      m.filename?.toLowerCase().includes(query) ||
      m.alt_text?.toLowerCase().includes(query) ||
      m.file_url?.toLowerCase().includes(query)

    const matchesFilter = filter === 'all' || m.file_type === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">Click any image or video to select it directly for this field.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="btn-primary text-xs py-2 px-3.5 cursor-pointer inline-flex items-center gap-2">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
              <input type="file" multiple onChange={handleUpload} className="hidden" accept={allowedType === 'video' ? 'video/*' : 'image/*,video/*'} />
            </label>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 bg-gray-50/50 shrink-0">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by file name or keyword (e.g. certificate, logo, team, hero)..."
              className="input pl-9 text-sm bg-white"
            />
          </div>
          {allowedType === 'all' && (
            <div className="flex gap-1 bg-gray-200/60 p-1 rounded-lg shrink-0">
              {(['all', 'image', 'video'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-colors ${
                    filter === f ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#1748BB] mb-3" />
              <p className="text-sm">Loading media library...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Image className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No media found matching &quot;{search}&quot;</p>
              <p className="text-xs mt-1 text-gray-400">Try searching for &quot;certifications&quot;, &quot;programs&quot;, or &quot;hero&quot;.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.file_url)
                    toast.success(`Selected ${item.original_name}`)
                    onClose()
                  }}
                  className="group card overflow-hidden border border-gray-200 hover:border-[#1748BB] hover:shadow-md transition-all text-left flex flex-col bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1748BB]"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden flex items-center justify-center">
                    {item.file_type === 'image' ? (
                      <img
                        src={item.file_url}
                        alt={item.alt_text || item.original_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget
                          if (!target.src.startsWith('http://localhost:3000') && item.file_url.startsWith('/')) {
                            target.src = `http://localhost:3000${item.file_url}`
                          }
                        }}
                      />
                    ) : item.file_type === 'video' ? (
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <Video className="w-8 h-8 text-[#1748BB]" />
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Video MP4</span>
                      </div>
                    ) : (
                      <File className="w-8 h-8 text-gray-400" />
                    )}

                    {/* Hover select overlay */}
                    <div className="absolute inset-0 bg-[#1748BB]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-[#1748BB] font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Select
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
                    <div className="text-xs font-semibold text-gray-800 truncate group-hover:text-[#1748BB] transition-colors">
                      {item.original_name}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                      <span className="truncate">{item.file_size ? formatFileSize(item.file_size) : item.file_type}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Showing {filtered.length} media assets</span>
          <button onClick={onClose} className="btn-secondary py-1.5 px-4 text-xs">Close</button>
        </div>
      </div>
    </div>
  )
}
