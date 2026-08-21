'use client'

import { Image, Link, Play, Video, AlignLeft, ToggleLeft, Hash, Palette, Type } from 'lucide-react'

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
            <input
              type="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://... or /assets/image.jpg"
              className="input"
            />
            {value && (
              <div className="mt-2 relative w-full max-w-xs h-32 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>
        )

      case 'video':
        return (
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/assets/videos/video.mp4 or https://..."
            className="input font-mono text-sm"
          />
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
