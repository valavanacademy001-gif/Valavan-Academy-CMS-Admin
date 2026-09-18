'use client'

import { useState, useRef } from 'react'
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Play,
  Video as VideoIcon,
  AlignLeft,
  ToggleLeft,
  Hash,
  Palette,
  Type,
  FolderOpen,
  RefreshCw,
  Upload,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react'
import MediaPickerModal from '@/components/media/MediaPickerModal'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

type FieldData = {
  id: string
  name: string
  label: string
  field_type: string
  placeholder: string | null
  options: unknown
}

const fieldTypeIcon: Record<string, React.ReactNode> = {
  short_text: <Type className="w-4 h-4" />,
  long_text: <AlignLeft className="w-4 h-4" />,
  rich_text: <AlignLeft className="w-4 h-4" />,
  heading: <Type className="w-4 h-4" />,
  subheading: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  url: <LinkIcon className="w-4 h-4" />,
  email: <LinkIcon className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  video: <VideoIcon className="w-4 h-4" />,
  youtube: <Play className="w-4 h-4 text-red-500" />,
  color: <Palette className="w-4 h-4" />,
  toggle: <ToggleLeft className="w-4 h-4" />,
}

export default function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldData
  value: string
  onChange: (val: string) => void
}) {
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const placeholder = field.placeholder ?? ''

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
      const path = `uploads/${filename}`

      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        toast.error(`Failed to upload: ${uploadError.message}`)
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(path)

      // Save to media library table too
      await supabase.from('media').insert({
        filename,
        original_name: file.name,
        file_url: publicUrl,
        file_type: 'image',
        file_size: file.size,
        alt_text: file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
        storage_path: path,
        bucket_name: 'cms-media',
        uploaded_by: user?.id,
      })

      onChange(publicUrl)
      toast.success('✓ Image uploaded and updated!')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Upload error: ${message}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const isImageField = field.field_type === 'image' || field.name.endsWith('_image') || field.name.endsWith('_logo') || field.name.endsWith('_banner')

  const renderInput = () => {
    switch (field.field_type) {
      case 'heading':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'Enter heading...'}
            className="input text-lg font-semibold"
          />
        )

      case 'short_text':
      case 'subheading':
        if (isImageField) {
          return renderImageComponent()
        }
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="input"
          />
        )

      case 'long_text':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            placeholder={placeholder || `Enter ${field.label.toLowerCase()}...`}
            className="input resize-none"
          />
        )

      case 'rich_text':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder="Enter content (HTML supported)..."
            className="input resize-y font-mono text-sm"
          />
        )

      case 'url':
      case 'email':
        if (isImageField) {
          return renderImageComponent()
        }
        return (
          <input
            type={field.field_type === 'email' ? 'email' : 'url'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || 'https://...'}
            className="input font-mono text-sm"
          />
        )

      case 'youtube':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..."
              className="input font-mono text-sm"
            />
            {value && (value.includes('youtube') || value.includes('youtu.be')) && (
              <div className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-green-600 fill-green-600" />
                <span>YouTube URL detected — video will be embedded automatically</span>
              </div>
            )}
          </div>
        )

      case 'image':
        return renderImageComponent()

      case 'video':
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. /assets/videos/hero-bg.mp4 or https://..."
                className="input font-mono text-sm flex-1"
              />
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="btn-secondary py-2 px-3 text-xs font-medium shrink-0 flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#1748BB] border-blue-200"
                title="Choose from Media Library"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>
            </div>
            {value && (
              <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <VideoIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate font-mono">{value}</span>
              </div>
            )}
            <MediaPickerModal
              isOpen={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={(url) => onChange(url)}
              allowedType="video"
              title={`Choose video for "${field.label}"`}
            />
          </div>
        )

      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={value || '#1748BB'}
              onChange={(e) => onChange(e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#1748BB"
              className="input flex-1 font-mono text-sm"
            />
          </div>
        )

      case 'toggle':
        return (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange(value === 'true' ? 'false' : 'true')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value === 'true' ? 'bg-[#1748BB]' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value === 'true' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="text-sm text-gray-600">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
          </div>
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="input"
          />
        )

      case 'select':
        const options = (field.options as string[]) ?? []
        return (
          <select value={value} onChange={(e) => onChange(e.target.value)} className="input">
            <option value="">Select...</option>
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'json':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={6}
            placeholder='[{"key": "value"}]'
            className="input resize-y font-mono text-xs"
          />
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="input"
          />
        )
    }
  }

  const renderImageComponent = () => {
    return (
      <div className="space-y-3">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handleDirectUpload}
        />

        {/* Input & Action Bar */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. /assets/tools/indesign.png or https://..."
            className="input font-mono text-xs sm:text-sm flex-1"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="btn-primary py-2 px-3 text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-sm"
              title="Upload new image directly from computer"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="btn-secondary py-2 px-3 text-xs font-medium shrink-0 flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#1748BB] border-blue-200"
              title="Choose from Media Library"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  toast.info('Image removed / canceled')
                }}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                title="Cancel / Remove current image"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Visual Image Preview & Management Card */}
        {value && (
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Image Thumbnail with Checkerboard Background for Clean PNG Transparency */}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative flex items-center justify-center bg-white shadow-inner"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              <img
                src={value}
                alt={field.label}
                className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.startsWith('http://localhost:3000') && value.startsWith('/')) {
                    target.src = `http://localhost:3000${value}`;
                  } else if (!target.src.includes('valavanacademy.vercel.app') && value.startsWith('/')) {
                    target.src = `https://valavanacademy.vercel.app${value}`;
                  }
                }}
              />
            </div>

            {/* Details & Quick Action Controls */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800 text-sm">{field.label}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Live Preview
                  </span>
                </div>
              </div>

              <div className="text-gray-500 font-mono text-xs break-all bg-white px-2.5 py-1.5 rounded-md border border-neutral-200">
                {value}
              </div>

              {/* Action Buttons: Upload New / Library / Cancel & Remove */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1748BB] bg-white hover:bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload New
                </button>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 shadow-2xs transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                  Choose from Library
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange('')
                    toast.info('Image removed. Click upload or library to add a new one.')
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-white hover:bg-red-50 px-3 py-1 rounded-lg border border-red-200 shadow-2xs transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  Cancel / Remove
                </button>
              </div>
            </div>
          </div>
        )}

        <MediaPickerModal
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={(url) => {
            onChange(url)
            setShowMediaPicker(false)
            toast.success('✓ Image selected from library')
          }}
          allowedType="image"
          title={`Choose image for "${field.label}"`}
        />
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-400">{fieldTypeIcon[field.field_type] ?? <Type className="w-4 h-4" />}</span>
        <label className="text-sm font-medium text-gray-700">{field.label}</label>
        <span className="text-xs text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded font-mono">{field.field_type}</span>
      </div>
      {renderInput()}
    </div>
  )
}
