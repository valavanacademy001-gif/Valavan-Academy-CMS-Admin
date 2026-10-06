'use client'

import { useState, useRef } from 'react'
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  FolderOpen,
  X,
  Loader2,
  ImageIcon,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadMediaFile } from '@/lib/mediaUpload'
import { toast } from 'sonner'
import MediaPickerModal from '@/components/media/MediaPickerModal'

export interface SkillCardItem {
  id: string
  title: string
  image: string
}

interface SkillsCardsEditorProps {
  cards: SkillCardItem[]
  onChange: (cards: SkillCardItem[]) => void
}

export default function SkillsCardsEditor({ cards, onChange }: SkillsCardsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [activeMediaPickerIndex, setActiveMediaPickerIndex] = useState<number | null>(null)
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Reorder helper
  const moveCard = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= cards.length || toIndex >= cards.length) {
      return
    }
    const newCards = [...cards]
    const [moved] = newCards.splice(fromIndex, 1)
    newCards.splice(toIndex, 0, moved)
    onChange(newCards)
    toast.success(`Card moved to position #${toIndex + 1}`)
  }

  // Add new card
  const handleAddCard = () => {
    const newCard: SkillCardItem = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: '',
      image: '',
    }
    onChange([...cards, newCard])
    toast.success(`Added new card #${cards.length + 1}`)
  }

  // Delete card
  const handleDeleteCard = (index: number) => {
    const cardToDelete = cards[index]
    const cardTitle = cardToDelete.title.trim() || `Card ${index + 1}`
    if (confirm(`Are you sure you want to delete "${cardTitle}"?`)) {
      const newCards = cards.filter((_, i) => i !== index)
      onChange(newCards)
      toast.info(`Deleted ${cardTitle}`)
    }
  }

  // Update card field
  const handleUpdateCard = (index: number, field: 'title' | 'image', value: string) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], [field]: value }
    onChange(newCards)
  }

  // Handle direct file upload
  const handleDirectUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const result = await uploadMediaFile(supabase, file, user?.id)

      if (result.file_url) {
        handleUpdateCard(index, 'image', result.file_url)
        toast.success(`Image uploaded for Card #${index + 1}`)
      } else {
        toast.error('Upload failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(err?.message || 'Upload error')
    } finally {
      setUploadingIndex(null)
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = ''
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#1748BB]" />
            <h3 className="text-sm font-bold text-gray-900">Skills Cards Reordering & Manager</h3>
            <span className="text-xs bg-[#1748BB] text-white font-semibold px-2 py-0.5 rounded-full">
              {cards.length} {cards.length === 1 ? 'Card' : 'Cards'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Drag cards up or down to reorder, use the arrows (↑/↓), or add extra cards dynamically.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddCard}
          className="btn-primary py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Extra Card</span>
        </button>
      </div>

      {/* Cards list */}
      {cards.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">No cards in this section yet.</p>
          <button
            type="button"
            onClick={handleAddCard}
            className="btn-primary mt-3 inline-flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Card
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {cards.map((card, index) => {
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index
            const isUploading = uploadingIndex === index

            return (
              <div
                key={card.id}
                draggable
                onDragStart={(e) => {
                  setDraggedIndex(index)
                  e.dataTransfer.effectAllowed = 'move'
                  e.dataTransfer.setData('text/plain', index.toString())
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.dataTransfer.dropEffect = 'move'
                  if (dragOverIndex !== index) {
                    setDragOverIndex(index)
                  }
                }}
                onDragLeave={() => {
                  if (dragOverIndex === index) {
                    setDragOverIndex(null)
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  if (draggedIndex !== null && draggedIndex !== index) {
                    moveCard(draggedIndex, index)
                  }
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                }}
                onDragEnd={() => {
                  setDraggedIndex(null)
                  setDragOverIndex(null)
                }}
                className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs ${
                  isDragging
                    ? 'opacity-40 border-[#1748BB] shadow-lg scale-[0.99]'
                    : isDragOver
                    ? 'border-[#1748BB] ring-2 ring-[#1748BB]/20 shadow-md translate-y-[-2px]'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {/* Card Top Control Header */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-gray-50/80 border-b border-gray-100 select-none">
                  {/* Left: Drag Handle + Badge */}
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded transition-colors"
                      title="Drag to reorder card"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      Card #{index + 1}
                    </span>
                    {card.title && (
                      <span className="text-xs text-gray-500 font-medium truncate max-w-[220px] sm:max-w-xs">
                        — {card.title}
                      </span>
                    )}
                  </div>

                  {/* Right: Move Up / Down & Delete buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveCard(index, index - 1)}
                      className="p-1.5 text-gray-500 hover:text-[#1748BB] hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="Move card up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === cards.length - 1}
                      onClick={() => moveCard(index, index + 1)}
                      className="p-1.5 text-gray-500 hover:text-[#1748BB] hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="Move card down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(index)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Fields Content */}
                <div className="p-4 space-y-3.5">
                  {/* Card Title */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Card {index + 1}: Title
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleUpdateCard(index, 'title', e.target.value)}
                      placeholder="e.g. Video Editing Mastery"
                      className="input text-sm py-2"
                    />
                  </div>

                  {/* Card Image */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Card {index + 1}: Image Card
                    </label>

                    {/* Hidden input for direct upload */}
                    <input
                      type="file"
                      ref={(el) => {
                        fileInputRefs.current[index] = el
                      }}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleDirectUpload(index, e)}
                    />

                    {/* Path & Upload Controls */}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                      <input
                        type="text"
                        value={card.image.startsWith('data:') ? '[Uploaded Image File]' : card.image}
                        onChange={(e) => handleUpdateCard(index, 'image', e.target.value)}
                        placeholder="e.g. /assets/programs/full-stack-creator/skills-modules/video-editing.webp"
                        className="input font-mono text-xs sm:text-sm flex-1 text-gray-700"
                      />

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRefs.current[index]?.click()}
                          disabled={isUploading}
                          className="btn-primary py-2 px-3 text-xs font-semibold shrink-0 flex items-center gap-1.5 shadow-sm"
                          title="Upload image from computer"
                        >
                          {isUploading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveMediaPickerIndex(index)}
                          className="btn-secondary py-2 px-3 text-xs font-medium shrink-0 flex items-center gap-1.5 bg-blue-50/80 hover:bg-blue-100 text-[#1748BB] border-blue-200"
                          title="Choose from Media Library"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Library</span>
                        </button>

                        {card.image && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateCard(index, 'image', '')
                              toast.info(`Removed image from Card #${index + 1}`)
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Live Image Preview & Management Card */}
                    {card.image && (
                      <div className="mt-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                        {/* Checkerboard thumbnail */}
                        <div
                          className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg overflow-hidden border border-neutral-200 shrink-0 relative flex items-center justify-center bg-white shadow-2xs"
                          style={{
                            backgroundImage:
                              'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                            backgroundSize: '10px 10px',
                            backgroundPosition: '0 0, 0 5px, 5px -5px, -5px 0px',
                          }}
                        >
                          <img
                            src={card.image}
                            alt={card.title || `Card ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                'https://placehold.co/100x75?text=Invalid+Image'
                            }}
                          />
                        </div>

                        {/* Metadata & Quick Actions */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold text-gray-800">
                              Card {index + 1}: Image Card
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Live Preview
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 font-mono truncate max-w-sm mb-2">
                            {card.image.startsWith('data:') ? (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Direct Uploaded Image File (Ready)
                              </span>
                            ) : (
                              card.image
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRefs.current[index]?.click()}
                              className="text-xs text-[#1748BB] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Upload New
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => setActiveMediaPickerIndex(index)}
                              className="text-xs text-[#1748BB] hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <FolderOpen className="w-3 h-3" />
                              Choose from Library
                            </button>
                            <span className="text-gray-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCard(index, 'image', '')}
                              className="text-xs text-red-600 hover:underline font-medium inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Add card bottom trigger */}
          <button
            type="button"
            onClick={handleAddCard}
            className="w-full py-3.5 border-2 border-dashed border-blue-200 hover:border-[#1748BB] bg-blue-50/30 hover:bg-blue-50/70 text-[#1748BB] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-2xs hover:shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Extra Card (#{cards.length + 1})</span>
          </button>
        </div>
      )}

      {/* Media Picker Modal */}
      {activeMediaPickerIndex !== null && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setActiveMediaPickerIndex(null)}
          onSelect={(url) => {
            handleUpdateCard(activeMediaPickerIndex, 'image', url)
            setActiveMediaPickerIndex(null)
          }}
          allowedType="image"
          title={`Choose image for Card #${activeMediaPickerIndex + 1}`}
        />
      )}
    </div>
  )
}
