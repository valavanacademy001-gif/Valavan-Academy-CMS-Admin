'use client'

import { useState } from 'react'
import { Image, Link, Play, Video, AlignLeft, ToggleLeft, Hash, Palette, Type, FolderOpen, RefreshCw } from 'lucide-react'
import MediaPickerModal from '@/components/media/MediaPickerModal'

type FieldData = {
  id: string; name: string; label: string; field_type: string;
  placeholder: string | null; options: unknown
}

const fieldTypeIcon: Record<string, React.ReactNode> = {
  short_text: <Type className="w-4 h-4" />,
  long_text: <AlignLeft className="w-4 h-4" />,
  rich_text: <AlignLeft className="w-4 h-4" />,
  heading: <Type className="w-4 h-4" />,
  subheading: <Type className="w-4 h-4" />,
  number: <Hash className="w-4 h-4" />,
  url: <Link className="w-4 h-4" />,
  email: <Link className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  video: <Video className="w-4 h-4" />,
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
  const placeholder = field.placeholder ?? ''

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
            {value && value.includes('youtube') && (
              <div className="text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                ✓ YouTube URL detected — video will be embedded automatically
              </div>
            )}
          </div>
        )

      case 'image':
        return (
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="e.g. /assets/certifications/2.webp or https://..."
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
              <div className="mt-2.5 p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-4">
                <div className="w-32 h-22 rounded-lg overflow-hidden bg-black/5 border border-gray-200 shrink-0 relative flex items-center justify-center shadow-xs">
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.startsWith('http://localhost:3000') && value.startsWith('/')) {
                        target.src = `http://localhost:3000${value}`;
                      }
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-xs text-gray-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800 text-sm">Active Preview</span>
                    <button
                      type="button"
                      onClick={() => setShowMediaPicker(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1748BB] hover:underline bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs hover:bg-gray-50"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Replace Image
                    </button>
                  </div>
                  <div className="text-gray-400 truncate text-[11px] font-mono">{value}</div>
                  <div className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[#1748BB] font-mono text-[10px] font-medium border border-blue-100">
                    Card Render: 340 × 240 px (680 × 480 px HD)
                  </div>
                </div>
              </div>
            )}
            <MediaPickerModal
              isOpen={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={(url) => onChange(url)}
              allowedType="image"
              title={`Choose image for "${field.label}"`}
            />
          </div>
        )

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
                <Video className="w-3.5 h-3.5 shrink-0" />
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
