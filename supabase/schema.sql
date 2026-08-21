-- ============================================================
-- VALAVAN ACADEMY CMS — COMPLETE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ADMINS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. PAGE TEMPLATES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  default_sections JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default templates
INSERT INTO public.page_templates (name, slug, description, default_sections) VALUES
('Standard Page', 'standard', 'General purpose page with hero, content, and CTA', '["hero","text_image","features","cta"]'),
('Program Page', 'program', 'Course/program landing page with curriculum and enrollment', '["hero","features","curriculum","testimonials","pricing","faq","cta"]'),
('Landing Page', 'landing', 'High-conversion landing page', '["hero","features","stats","testimonials","cta"]'),
('Course Page', 'course', 'Detailed course page', '["hero","overview","curriculum","instructor","requirements","faq","cta"]'),
('Blank Page', 'blank', 'Empty page — add sections manually', '[]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 3. PAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  template_id UUID REFERENCES public.page_templates(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- ============================================================
-- 4. SECTION TYPES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.section_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  default_fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.section_types (name, slug, description, icon, default_fields) VALUES
('Hero', 'hero', 'Full-width hero section with heading, description and CTA', 'Layout', '[{"name":"eyebrow","label":"Eyebrow Text","type":"short_text"},{"name":"heading","label":"Heading","type":"heading"},{"name":"description","label":"Description","type":"long_text"},{"name":"primary_button_text","label":"Primary Button Text","type":"short_text"},{"name":"primary_button_url","label":"Primary Button URL","type":"url"},{"name":"secondary_button_text","label":"Secondary Button Text","type":"short_text"},{"name":"secondary_button_url","label":"Secondary Button URL","type":"url"},{"name":"background_video","label":"Background Video","type":"video"},{"name":"background_image","label":"Background Image","type":"image"}]'),
('Text + Image', 'text_image', 'Text content alongside an image', 'AlignLeft', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"description","label":"Description","type":"rich_text"},{"name":"image","label":"Image","type":"image"},{"name":"image_position","label":"Image Position","type":"select","options":["left","right"]}]'),
('Features', 'features', 'Feature cards or list', 'Star', '[{"name":"heading","label":"Section Heading","type":"heading"},{"name":"subheading","label":"Subheading","type":"short_text"},{"name":"features","label":"Features List","type":"json"}]'),
('Programs', 'programs', 'Programs grid or list', 'BookOpen', '[{"name":"heading","label":"Section Heading","type":"heading"},{"name":"description","label":"Description","type":"long_text"}]'),
('Testimonials', 'testimonials', 'Student testimonial cards', 'Quote', '[{"name":"heading","label":"Section Heading","type":"heading"}]'),
('Video', 'video', 'Single video player', 'Play', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"video_url","label":"Video URL","type":"video"},{"name":"youtube_url","label":"YouTube URL","type":"youtube"},{"name":"thumbnail","label":"Thumbnail","type":"image"}]'),
('YouTube Gallery', 'youtube_gallery', 'Grid of YouTube videos', 'Youtube', '[{"name":"heading","label":"Section Heading","type":"heading"},{"name":"videos","label":"Videos","type":"json"}]'),
('FAQ', 'faq', 'Frequently asked questions accordion', 'HelpCircle', '[{"name":"heading","label":"Section Heading","type":"heading"},{"name":"faqs","label":"FAQ Items","type":"json"}]'),
('Stats', 'stats', 'Statistics / numbers showcase', 'BarChart', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"stats","label":"Stats","type":"json"}]'),
('CTA', 'cta', 'Call-to-action section', 'Zap', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"description","label":"Description","type":"long_text"},{"name":"button_text","label":"Button Text","type":"short_text"},{"name":"button_url","label":"Button URL","type":"url"},{"name":"background_color","label":"Background Color","type":"color"}]'),
('Image Gallery', 'image_gallery', 'Grid of images', 'Image', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"images","label":"Images","type":"json"}]'),
('Logo Grid', 'logo_grid', 'Brand/tool logo grid', 'Grid', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"logos","label":"Logos","type":"json"}]'),
('Certification Gallery', 'certification_gallery', 'Certification images showcase', 'Award', '[{"name":"heading","label":"Heading","type":"heading"}]'),
('Rich Text', 'rich_text', 'Full rich text / article content', 'FileText', '[{"name":"content","label":"Content","type":"rich_text"}]'),
('Cards', 'cards', 'Content cards grid', 'LayoutGrid', '[{"name":"heading","label":"Heading","type":"heading"},{"name":"cards","label":"Cards","type":"json"}]'),
('Custom Content', 'custom', 'Custom HTML / embed content', 'Code', '[{"name":"content","label":"Custom Content","type":"rich_text"}]'),
('Blank Section', 'blank', 'Empty section — add fields manually', 'Square', '[]')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 5. SECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  section_type_id UUID REFERENCES public.section_types(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_id, slug)
);

-- ============================================================
-- 6. FIELDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'short_text', 'long_text', 'rich_text', 'heading', 'subheading',
    'number', 'url', 'email', 'button', 'image', 'image_gallery',
    'video', 'youtube', 'icon', 'color', 'toggle', 'date',
    'select', 'json', 'order'
  )),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT false,
  options JSONB,
  placeholder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(section_id, name)
);

-- ============================================================
-- 7. FIELD VALUES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  value_text TEXT,
  value_number NUMERIC,
  value_boolean BOOLEAN,
  value_json JSONB,
  value_url TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  published_value_text TEXT,
  published_value_json JSONB,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(field_id)
);

-- ============================================================
-- 8. MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document', 'audio', 'other')),
  mime_type TEXT,
  file_size BIGINT,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  caption TEXT,
  storage_path TEXT,
  bucket_name TEXT NOT NULL DEFAULT 'cms-media',
  used_in JSONB DEFAULT '[]',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 9. PROGRAMS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  duration TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
  thumbnail_url TEXT,
  banner_url TEXT,
  cta_text TEXT DEFAULT 'Enroll Now',
  cta_url TEXT,
  price NUMERIC,
  original_price NUMERIC,
  currency TEXT DEFAULT 'INR',
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  modules JSONB DEFAULT '[]',
  software_tools JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  page_id UUID REFERENCES public.pages(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- ============================================================
-- 10. TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_name TEXT NOT NULL,
  student_role TEXT,
  student_photo_url TEXT,
  testimonial TEXT NOT NULL,
  video_url TEXT,
  youtube_url TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. LEARNER STORIES (Video Testimonials)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.learner_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  student_name TEXT,
  video_url TEXT,
  youtube_url TEXT,
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 12. CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  program_id UUID REFERENCES public.programs(id) ON DELETE SET NULL,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 13. SITE SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  value_json JSONB,
  label TEXT,
  description TEXT,
  setting_type TEXT NOT NULL DEFAULT 'text' CHECK (setting_type IN ('text', 'url', 'image', 'json', 'toggle', 'color')),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default site settings
INSERT INTO public.site_settings (key, value, label, description, setting_type) VALUES
('academy_name', 'Valavan Academy', 'Academy Name', 'The main name of the academy', 'text'),
('logo_url', '', 'Logo URL', 'Main logo image URL', 'image'),
('favicon_url', '', 'Favicon URL', 'Browser favicon URL', 'image'),
('email', 'valavanacademy001@gmail.com', 'Contact Email', 'Primary contact email', 'text'),
('phone', '', 'Phone Number', 'Contact phone number', 'text'),
('facebook_url', 'https://www.facebook.com/ValavanAcademy', 'Facebook URL', 'Facebook page link', 'url'),
('instagram_url', 'https://www.instagram.com/valavanacademy', 'Instagram URL', 'Instagram profile link', 'url'),
('youtube_url', 'https://www.youtube.com/@ValavanAcademyofficial', 'YouTube URL', 'YouTube channel link', 'url'),
('linkedin_url', 'https://www.linkedin.com/in/Valavan-p-813383337/', 'LinkedIn URL', 'LinkedIn profile link', 'url'),
('community_url', 'https://tamilnaducreatorsclub.com/', 'Community URL', 'TNCC community link', 'url'),
('default_seo_title', 'Valavan Academy — Your Career Changing Partner', 'Default SEO Title', 'Fallback SEO title for all pages', 'text'),
('default_seo_description', 'Tamil-first creative learning platform for digital skills', 'Default SEO Description', 'Fallback SEO description', 'text')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 14. CONTENT VERSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.content_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_value_id UUID NOT NULL REFERENCES public.field_values(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  value_text TEXT,
  value_json JSONB,
  version_number INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 15. AUDIT LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- UPDATED AT TRIGGER FUNCTION
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON public.admins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_fields_updated_at BEFORE UPDATE ON public.fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_field_values_updated_at BEFORE UPDATE ON public.field_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON public.media FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_learner_stories_updated_at BEFORE UPDATE ON public.learner_stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON public.certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- AUTO-CREATE ADMIN RECORD ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admins (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: is authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins
    WHERE id = auth.uid() AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PAGES: public read published, admins full access
CREATE POLICY "Public can read published pages" ON public.pages FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can manage pages" ON public.pages USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PAGE TEMPLATES: everyone can read
CREATE POLICY "Anyone can read page templates" ON public.page_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage page templates" ON public.page_templates USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SECTION TYPES: everyone can read
CREATE POLICY "Anyone can read section types" ON public.section_types FOR SELECT USING (true);

-- SECTIONS: public read visible sections of published pages, admins full
CREATE POLICY "Public can read visible sections" ON public.sections FOR SELECT USING (
  is_visible = true AND EXISTS (
    SELECT 1 FROM public.pages WHERE id = sections.page_id AND status = 'published'
  )
);
CREATE POLICY "Admins can manage sections" ON public.sections USING (public.is_admin()) WITH CHECK (public.is_admin());

-- FIELDS: public read, admins full
CREATE POLICY "Public can read fields" ON public.fields FOR SELECT USING (true);
CREATE POLICY "Admins can manage fields" ON public.fields USING (public.is_admin()) WITH CHECK (public.is_admin());

-- FIELD VALUES: public reads published values, admins full
CREATE POLICY "Public can read published field values" ON public.field_values FOR SELECT USING (is_draft = false);
CREATE POLICY "Admins can manage field values" ON public.field_values USING (public.is_admin()) WITH CHECK (public.is_admin());

-- MEDIA: everyone can read, admins can write
CREATE POLICY "Anyone can read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON public.media USING (public.is_admin()) WITH CHECK (public.is_admin());

-- PROGRAMS: public read published, admins full
CREATE POLICY "Public can read published programs" ON public.programs FOR SELECT USING (status = 'published' AND is_visible = true);
CREATE POLICY "Admins can manage programs" ON public.programs USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TESTIMONIALS: public read visible, admins full
CREATE POLICY "Public can read visible testimonials" ON public.testimonials FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LEARNER STORIES: public read visible, admins full
CREATE POLICY "Public can read visible learner stories" ON public.learner_stories FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage learner stories" ON public.learner_stories USING (public.is_admin()) WITH CHECK (public.is_admin());

-- CERTIFICATIONS: public read visible, admins full
CREATE POLICY "Public can read visible certifications" ON public.certifications FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can manage certifications" ON public.certifications USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SITE SETTINGS: everyone read, admins write
CREATE POLICY "Anyone can read site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ADMINS: can only read/update own record
CREATE POLICY "Admins can read own profile" ON public.admins FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can update own profile" ON public.admins FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Super admins can manage all admins" ON public.admins USING (
  EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid() AND role = 'super_admin')
);

-- CONTENT VERSIONS: admins only
CREATE POLICY "Admins can read versions" ON public.content_versions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can create versions" ON public.content_versions FOR INSERT WITH CHECK (public.is_admin());

-- AUDIT LOGS: admins read only
CREATE POLICY "Admins can read audit logs" ON public.audit_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "System can create audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKETS (run separately if needed)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cms-media', 'cms-media', true) ON CONFLICT DO NOTHING;
-- CREATE POLICY "Public can read cms media" ON storage.objects FOR SELECT USING (bucket_id = 'cms-media');
-- CREATE POLICY "Admins can upload cms media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cms-media' AND public.is_admin());
-- CREATE POLICY "Admins can delete cms media" ON storage.objects FOR DELETE USING (bucket_id = 'cms-media' AND public.is_admin());

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON public.sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_sort_order ON public.sections(page_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_fields_section_id ON public.fields(section_id);
CREATE INDEX IF NOT EXISTS idx_field_values_field_id ON public.field_values(field_id);
CREATE INDEX IF NOT EXISTS idx_field_values_section_id ON public.field_values(section_id);
CREATE INDEX IF NOT EXISTS idx_field_values_page_id ON public.field_values(page_id);
CREATE INDEX IF NOT EXISTS idx_programs_slug ON public.programs(slug);
CREATE INDEX IF NOT EXISTS idx_programs_status ON public.programs(status);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
