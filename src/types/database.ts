export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['admins']['Insert']>
      }
      pages: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          template_id: string | null
          status: string
          sort_order: number
          seo_title: string | null
          seo_description: string | null
          og_title: string | null
          og_description: string | null
          og_image_url: string | null
          canonical_url: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['pages']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['pages']['Insert']>
      }
      page_templates: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          default_sections: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['page_templates']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['page_templates']['Insert']>
      }
      sections: {
        Row: {
          id: string
          page_id: string
          section_type_id: string | null
          name: string
          slug: string
          sort_order: number
          is_visible: boolean
          settings: Json
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['sections']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['sections']['Insert']>
      }
      section_types: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          default_fields: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['section_types']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['section_types']['Insert']>
      }
      fields: {
        Row: {
          id: string
          section_id: string
          name: string
          label: string
          field_type: string
          sort_order: number
          is_required: boolean
          options: Json | null
          placeholder: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['fields']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['fields']['Insert']>
      }
      field_values: {
        Row: {
          id: string
          field_id: string
          section_id: string
          page_id: string
          value_text: string | null
          value_number: number | null
          value_boolean: boolean | null
          value_json: Json | null
          value_url: string | null
          is_draft: boolean
          published_value_text: string | null
          published_value_json: Json | null
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['field_values']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['field_values']['Insert']>
      }
      media: {
        Row: {
          id: string
          filename: string
          original_name: string
          file_url: string
          file_type: string
          mime_type: string | null
          file_size: number | null
          width: number | null
          height: number | null
          alt_text: string | null
          caption: string | null
          storage_path: string | null
          bucket_name: string
          used_in: Json
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['media']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['media']['Insert']>
      }
      programs: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          description: string | null
          duration: string | null
          level: string | null
          thumbnail_url: string | null
          banner_url: string | null
          cta_text: string | null
          cta_url: string | null
          price: number | null
          original_price: number | null
          currency: string | null
          is_featured: boolean | null
          is_visible: boolean | null
          sort_order: number | null
          status: string
          modules: Json | null
          software_tools: Json | null
          skills: Json | null
          seo_title: string | null
          seo_description: string | null
          page_id: string | null
          created_by: string | null
          updated_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['programs']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['programs']['Insert']>
      }
      testimonials: {
        Row: {
          id: string
          student_name: string
          student_role: string | null
          student_photo_url: string | null
          testimonial: string
          video_url: string | null
          youtube_url: string | null
          rating: number | null
          program_id: string | null
          is_featured: boolean | null
          is_visible: boolean | null
          sort_order: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['testimonials']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['testimonials']['Insert']>
      }
      learner_stories: {
        Row: {
          id: string
          title: string | null
          student_name: string | null
          video_url: string | null
          youtube_url: string | null
          youtube_video_id: string | null
          thumbnail_url: string | null
          duration: string | null
          program_id: string | null
          is_visible: boolean | null
          sort_order: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['learner_stories']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['learner_stories']['Insert']>
      }
      certifications: {
        Row: {
          id: string
          title: string
          description: string | null
          image_url: string
          program_id: string | null
          is_visible: boolean | null
          sort_order: number | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['certifications']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['certifications']['Insert']>
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          value_json: Json | null
          label: string | null
          description: string | null
          setting_type: string
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id' | 'updated_at'> & { id?: string; updated_at?: string }
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
      content_versions: {
        Row: {
          id: string
          field_value_id: string
          field_id: string
          section_id: string
          page_id: string
          value_text: string | null
          value_json: Json | null
          version_number: number
          created_by: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_versions']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['content_versions']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          admin_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          entity_name: string | null
          old_value: Json | null
          new_value: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
