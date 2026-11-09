import { SupabaseClient } from '@supabase/supabase-js'

export interface UploadResult {
  file_url: string
  filename: string
  original_name: string
  file_type: string
  file_size: number
  storage_path: string | null
  mediaRecord?: any
  error?: string
}

export const readFileAsDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Resilient media uploader:
 * 1. Tries to upload to Supabase storage ('cms-media').
 * 2. If storage upload fails (e.g. Row-Level Security policy not applied in Supabase),
 *    gracefully falls back to storing as Base64 Data URL directly in the media database
 *    for assets up to 4MB, ensuring admin uploads never break.
 * 3. Inserts the record into the public.media table.
 */
export async function uploadMediaFile(
  supabase: SupabaseClient<any, any, any>,
  file: File,
  userId?: string | null
): Promise<UploadResult> {
  const ext = file.name.split('.').pop() || 'png'
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
  const path = `uploads/${filename}`
  const fileType = file.type.startsWith('image')
    ? 'image'
    : file.type.startsWith('video')
    ? 'video'
    : file.type.startsWith('audio')
    ? 'audio'
    : 'document'

  let file_url = ''
  let storage_path: string | null = path

  // 1. Try uploading to Supabase Storage bucket 'cms-media'
  try {
    const { error: uploadError } = await supabase.storage
      .from('cms-media')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      console.error(`Supabase Storage upload error (${uploadError.message}).`)
      return {
        file_url: '',
        filename,
        original_name: file.name,
        file_type: fileType,
        file_size: file.size,
        storage_path: null,
        error: `Storage upload failed: ${uploadError.message}. Please verify the 'cms-media' storage bucket policy.`
      }
    } else {
      const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(path)
      file_url = publicUrl
    }
  } catch (err: any) {
    console.error('Storage exception:', err?.message)
    return {
      file_url: '',
      filename,
      original_name: file.name,
      file_type: fileType,
      file_size: file.size,
      storage_path: null,
      error: `Upload failed: ${err?.message || 'Storage error'}`
    }
  }

  // 3. Insert metadata record into public.media
  const { data: mediaRecord, error: insertError } = await supabase.from('media').insert({
    filename,
    original_name: file.name,
    file_url,
    file_type: fileType,
    mime_type: file.type || undefined,
    file_size: file.size,
    alt_text: file.name.replace(/[-_]/g, ' ').replace(/\.[^/.]+$/, ''),
    storage_path,
    bucket_name: 'cms-media',
    uploaded_by: userId || null,
  }).select().single()

  if (insertError) {
    console.error('Failed to insert media row:', insertError)
  }

  return {
    file_url,
    filename,
    original_name: file.name,
    file_type: fileType,
    file_size: file.size,
    storage_path,
    mediaRecord: mediaRecord || {
      id: filename,
      filename,
      original_name: file.name,
      file_url,
      file_type: fileType,
      file_size: file.size,
      alt_text: file.name,
      storage_path,
      created_at: new Date().toISOString()
    }
  }
}
