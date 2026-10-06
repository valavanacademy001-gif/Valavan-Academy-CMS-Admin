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
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadMediaFile } from '@/lib/mediaUpload'
import { toast } from 'sonner'
import MediaPickerModal from '@/components/media/MediaPickerModal'

export interface MentorItem {
  id: string
  name: string
  designation: string
  role: string
  specialty: string
  bio: string
  experience: string
  skills: string
  image: string
}

interface MentorsEditorProps {
  mentors: MentorItem[]
  onChange: (mentors: MentorItem[]) => void
}

export default function MentorsEditor({ mentors, onChange }: MentorsEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [activeMediaPickerIndex, setActiveMediaPickerIndex] = useState<number | null>(null)
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})

  // Reorder helper
  const moveMentor = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= mentors.length ||
      toIndex >= mentors.length
    ) {
      return
    }
    const newMentors = [...mentors]
    const [moved] = newMentors.splice(fromIndex, 1)
    newMentors.splice(toIndex, 0, moved)
    onChange(newMentors)
    toast.success(`Mentor moved to position #${toIndex + 1}`)
  }

  // Add new mentor
  const handleAddMentor = () => {
    const newMentor: MentorItem = {
      id: `mentor-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: '',
      designation: '',
      role: '',
      specialty: '',
      bio: '',
      experience: '5+ Years',
      skills: '',
      image: '',
    }
    onChange([...mentors, newMentor])
    toast.success(`Added new mentor #${mentors.length + 1}`)
  }

  // Delete mentor
  const handleDeleteMentor = (index: number) => {
    const m = mentors[index]
    const mentorName = m.name.trim() || `Mentor ${index + 1}`
    if (confirm(`Are you sure you want to delete "${mentorName}"?`)) {
      const newMentors = mentors.filter((_, i) => i !== index)
      onChange(newMentors)
      toast.info(`Deleted ${mentorName}`)
    }
  }

  // Update specific mentor field
  const handleUpdateMentor = (
    index: number,
    field: keyof MentorItem,
    value: string
  ) => {
    const newMentors = [...mentors]
    newMentors[index] = { ...newMentors[index], [field]: value }
    onChange(newMentors)
  }

  // Handle direct image file upload
  const handleDirectUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingIndex(index)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const result = await uploadMediaFile(supabase, file, user?.id)

      if (result.file_url) {
        handleUpdateMentor(index, 'image', result.file_url)
        toast.success(`Image uploaded for Mentor #${index + 1}`)
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
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-blue-50/70 border border-blue-200/90 rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1748BB]" />
            <h3 className="text-sm font-bold text-gray-900">Mentors &amp; Instructors Manager</h3>
            <span className="text-xs bg-[#1748BB] text-white font-semibold px-2 py-0.5 rounded-full">
              {mentors.length} {mentors.length === 1 ? 'Mentor' : 'Mentors'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Drag cards up/down to reorder, add extra instructors, or update name, designation, specialization, and bio.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddMentor}
          className="btn-primary py-1.5 px-3.5 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Extra Mentor</span>
        </button>
      </div>

      {/* Mentors List */}
      {mentors.length === 0 ? (
        <div className="py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-600">No mentors in this section yet.</p>
          <button
            type="button"
            onClick={handleAddMentor}
            className="btn-primary mt-3 inline-flex items-center gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add First Mentor
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {mentors.map((mentor, index) => {
            const isDragging = draggedIndex === index
            const isDragOver = dragOverIndex === index
            const isUploading = uploadingIndex === index

            return (
              <div
                key={mentor.id}
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
                    moveMentor(draggedIndex, index)
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
                {/* Mentor Card Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/90 border-b border-gray-100 select-none">
                  {/* Left: Drag Handle + Badge + Name */}
                  <div className="flex items-center gap-2">
                    <div
                      className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded transition-colors"
                      title="Drag to reorder mentor"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-xs text-gray-700 bg-white border border-gray-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                      Mentor #{index + 1}
                    </span>
                    {mentor.name && (
                      <span className="text-xs text-gray-700 font-bold truncate max-w-[200px] sm:max-w-xs">
                        {mentor.name}
                      </span>
                    )}
                    {mentor.role && (
                      <span className="hidden sm:inline-block text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full uppercase font-semibold">
                        {mentor.role}
                      </span>
                    )}
                  </div>

                  {/* Right: Move Up / Down & Delete buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveMentor(index, index - 1)}
                      className="p-1.5 text-gray-500 hover:text-[#1748BB] hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="Move mentor up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === mentors.length - 1}
                      onClick={() => moveMentor(index, index + 1)}
                      className="p-1.5 text-gray-500 hover:text-[#1748BB] hover:bg-blue-50 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
                      title="Move mentor down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleDeleteMentor(index)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete mentor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Mentor Form Content */}
                <div className="p-4 sm:p-5 space-y-4">
                  {/* Row 1: Name & Role Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Mentor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={mentor.name}
                        onChange={(e) => handleUpdateMentor(index, 'name', e.target.value)}
                        placeholder="e.g. Valavan, RP Kiran Kumar, Ganapathi R"
                        className="input text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Front Role Badge
                      </label>
                      <input
                        type="text"
                        value={mentor.role}
                        onChange={(e) => handleUpdateMentor(index, 'role', e.target.value)}
                        placeholder="e.g. FOUNDER & LEAD MENTOR, CREATIVE DIRECTOR"
                        className="input text-sm py-2"
                      />
                    </div>
                  </div>

                  {/* Row 2: Designation & Specialization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Official Designation
                      </label>
                      <input
                        type="text"
                        value={mentor.designation}
                        onChange={(e) => handleUpdateMentor(index, 'designation', e.target.value)}
                        placeholder="e.g. Founder of Valavan Ventures, Senior Video Editor | CEO"
                        className="input text-sm py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Specialization (Front Card Footer)
                      </label>
                      <input
                        type="text"
                        value={mentor.specialty}
                        onChange={(e) => handleUpdateMentor(index, 'specialty', e.target.value)}
                        placeholder="e.g. Graphic Design & Creative Strategy"
                        className="input text-sm py-2"
                      />
                    </div>
                  </div>

                  {/* Row 3: About / Bio */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      About Mentor / Bio (Back Card Flip)
                    </label>
                    <textarea
                      rows={3}
                      value={mentor.bio}
                      onChange={(e) => handleUpdateMentor(index, 'bio', e.target.value)}
                      placeholder="e.g. Founder of Valavan Academy. Trained 10,000+ students..."
                      className="input text-xs sm:text-sm py-2 leading-relaxed"
                    />
                  </div>

                  {/* Row 4: Experience & Key Skills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Experience Badge
                      </label>
                      <input
                        type="text"
                        value={mentor.experience}
                        onChange={(e) => handleUpdateMentor(index, 'experience', e.target.value)}
                        placeholder="e.g. 15+ Years, 10+ Years, 5+ Years"
                        className="input text-sm py-2"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Key Skills &amp; Tools (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={mentor.skills}
                        onChange={(e) => handleUpdateMentor(index, 'skills', e.target.value)}
                        placeholder="e.g. Branding, Creative Direction, Typography, Visual Identity"
                        className="input text-sm py-2"
                      />
                    </div>
                  </div>

                  {/* Row 5: Mentor Image Card */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mentor Photo / Portrait Image
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
                        value={mentor.image.startsWith('data:') ? '[Uploaded Image File]' : mentor.image}
                        onChange={(e) => handleUpdateMentor(index, 'image', e.target.value)}
                        placeholder="e.g. /assets/about/valavan.webp or https://..."
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

                        {mentor.image && (
                          <button
                            type="button"
                            onClick={() => {
                              handleUpdateMentor(index, 'image', '')
                              toast.info(`Removed image for ${mentor.name || `Mentor #${index + 1}`}`)
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Visual Image Preview */}
                    {mentor.image && (
                      <div className="mt-2.5 p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                        <div
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative flex items-center justify-center bg-[#233876] shadow-2xs"
                        >
                          <img
                            src={mentor.image}
                            alt={mentor.name || `Mentor ${index + 1}`}
                            className="w-full h-full object-cover object-top"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src =
                                'https://placehold.co/100x100?text=Avatar'
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-xs font-semibold text-gray-800">
                              {mentor.name || `Mentor #${index + 1}`} Portrait
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Ready
                            </span>
                          </div>

                          <div className="text-xs text-gray-500 font-mono truncate max-w-sm mb-2">
                            {mentor.image.startsWith('data:') ? (
                              <span className="flex items-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Direct Uploaded Image File
                              </span>
                            ) : (
                              mentor.image
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Bottom Add Trigger */}
          <button
            type="button"
            onClick={handleAddMentor}
            className="w-full py-3.5 border-2 border-dashed border-blue-200 hover:border-[#1748BB] bg-blue-50/30 hover:bg-blue-50/70 text-[#1748BB] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-2xs hover:shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Extra Mentor (#{mentors.length + 1})</span>
          </button>
        </div>
      )}

      {/* Media Picker Modal */}
      {activeMediaPickerIndex !== null && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => setActiveMediaPickerIndex(null)}
          onSelect={(url) => {
            handleUpdateMentor(activeMediaPickerIndex, 'image', url)
            setActiveMediaPickerIndex(null)
          }}
          allowedType="image"
          title={`Choose photo for ${mentors[activeMediaPickerIndex]?.name || `Mentor #${activeMediaPickerIndex + 1}`}`}
        />
      )}
    </div>
  )
}
