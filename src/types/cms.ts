import { Database } from './database'

export type Page = Database['public']['Tables']['pages']['Row']
export type PageInsert = Database['public']['Tables']['pages']['Insert']
export type PageUpdate = Database['public']['Tables']['pages']['Update']

export type Section = Database['public']['Tables']['sections']['Row']
export type SectionInsert = Database['public']['Tables']['sections']['Insert']
export type SectionUpdate = Database['public']['Tables']['sections']['Update']

export type SectionType = Database['public']['Tables']['section_types']['Row']
export type PageTemplate = Database['public']['Tables']['page_templates']['Row']

export type Field = Database['public']['Tables']['fields']['Row']
export type FieldInsert = Database['public']['Tables']['fields']['Insert']

export type FieldValue = Database['public']['Tables']['field_values']['Row']
export type FieldValueUpsert = Database['public']['Tables']['field_values']['Insert']

export type Media = Database['public']['Tables']['media']['Row']
export type MediaInsert = Database['public']['Tables']['media']['Insert']

export type Program = Database['public']['Tables']['programs']['Row']
export type ProgramInsert = Database['public']['Tables']['programs']['Insert']
export type ProgramUpdate = Database['public']['Tables']['programs']['Update']

export type Testimonial = Database['public']['Tables']['testimonials']['Row']
export type LearnerStory = Database['public']['Tables']['learner_stories']['Row']
export type Certification = Database['public']['Tables']['certifications']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type Admin = Database['public']['Tables']['admins']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export type FieldType =
  | 'short_text' | 'long_text' | 'rich_text' | 'heading' | 'subheading'
  | 'number' | 'url' | 'email' | 'button' | 'image' | 'image_gallery'
  | 'video' | 'youtube' | 'icon' | 'color' | 'toggle' | 'date'
  | 'select' | 'json' | 'order'

export type PageStatus = 'draft' | 'published' | 'archived'
export type ProgramStatus = 'draft' | 'published' | 'archived'

export interface PageWithSections extends Page {
  sections: SectionWithFields[]
  template: PageTemplate | null
}

export interface SectionWithFields extends Section {
  section_type: SectionType | null
  fields: FieldWithValue[]
}

export interface FieldWithValue extends Field {
  value: FieldValue | null
}

export interface FieldDefinition {
  name: string
  label: string
  type: FieldType
  options?: string[]
  placeholder?: string
}

export interface DashboardStats {
  totalPages: number
  publishedPages: number
  draftPages: number
  totalSections: number
  totalPrograms: number
  totalMedia: number
  totalTestimonials: number
  recentChanges: AuditLog[]
}
