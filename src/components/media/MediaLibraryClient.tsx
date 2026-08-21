'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Upload, Search, Image, Video, File, Trash2, Copy, X, Loader2 } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/utils'

type MediaItem = {
  id: string; filename: string; original_name: string; file_url: string;
  file_type: string; file_size: number | null; width: number | null;
  height: number | null; created_at: string; alt_text: string | null
}

export default function MediaLibraryClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const [media, setMedia] = useState(initialMedia)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'document'>('all')
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState<MediaItem | null>(null)

  const filtered = media.filter((m) => {
    const matchSearch = m.original_name.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || m.file_type === filter
    return matchSearch && matchFilter
  })

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const path = `uploads/${filename}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(path)

      const fileType = file.type.startsWith('image') ? 'image' :
        file.type.startsWith('video') ? 'video' : 'document'

      const { data: mediaRecord } = await supabase.from('media').insert({
        filename,
        original_name: file.name,
        file_url: publicUrl,
        file_type: fileType,
        mime_type: file.type,
        file_size: file.size,
        storage_path: path,
        bucket_name: 'cms-media',
        uploaded_by: user?.id,
      }).select().single()

      if (mediaRecord) {
        setMedia((prev) => [mediaRecord, ...prev])
        toast.success(`✓ ${file.name} uploaded`)
      }
    }

    setUploading(false)
    e.target.value = ''
  }, [])

  const handleDelete = async (item: MediaItem) => {
    const supabase = createClient()
    await supabase.storage.from('cms-media').remove([`uploads/${item.filename}`])
    await supabase.from('media').delete().eq('id', item.id)
    setMedia((prev) => prev.filter((m) => m.id !== item.id))
    setSelected(null)
    toast.success('Media deleted')
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const fileIcon = (type: string) => {
    if (type === 'image') return <Image className="w-5 h-5" />
    if (type === 'video') return <Video className="w-5 h-5" />
    return <File className="w-5 h-5" />
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2">
          {['all','image','video','document'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === f ? 'bg-[#1748BB] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search media..." className="input pl-9" />
        </div>
        <label className={`btn-primary cursor-pointer ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload'}
          <input type="file" multiple accept="image/*,video/*,.pdf" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      <div className="flex gap-5">
        {/* Grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="card py-16 text-center">
              <Image className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">{search ? 'No media found' : 'No media uploaded yet'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`card overflow-hidden text-left group transition-all ${
                    selected?.id === item.id ? 'ring-2 ring-[#1748BB]' : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  {item.file_type === 'image' ? (
                    <div className="aspect-square bg-gray-50">
                      <img src={item.file_url} alt={item.alt_text ?? item.original_name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-50 flex items-center justify-center text-gray-400">
                      {fileIcon(item.file_type)}
                    </div>
                  )}
                  <div className="p-2">
                    <div className="text-xs text-gray-600 truncate">{item.original_name}</div>
                    {item.file_size && <div className="text-[10px] text-gray-400 mt-0.5">{formatFileSize(item.file_size)}</div>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-64 shrink-0">
            <div className="card p-4 space-y-4 sticky top-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Details</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selected.file_type === 'image' && (
                <img src={selected.file_url} alt={selected.original_name} className="w-full rounded-lg border border-gray-200 object-cover" />
              )}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-gray-400">Filename</div>
                  <div className="font-medium text-gray-700 break-all">{selected.original_name}</div>
                </div>
                <div>
                  <div className="text-gray-400">Type</div>
                  <div className="font-medium text-gray-700 capitalize">{selected.file_type}</div>
                </div>
                {selected.file_size && (
                  <div>
                    <div className="text-gray-400">Size</div>
                    <div className="font-medium text-gray-700">{formatFileSize(selected.file_size)}</div>
                  </div>
                )}
                {selected.width && (
                  <div>
                    <div className="text-gray-400">Dimensions</div>
                    <div className="font-medium text-gray-700">{selected.width} × {selected.height}px</div>
                  </div>
                )}
                <div>
                  <div className="text-gray-400">Uploaded</div>
                  <div className="font-medium text-gray-700">{formatDate(selected.created_at)}</div>
                </div>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => handleCopyUrl(selected.file_url)}
                  className="w-full btn-secondary text-xs py-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy URL
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="w-full btn-danger text-xs py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
