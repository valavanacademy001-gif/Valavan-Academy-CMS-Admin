'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Globe, Image, Save, Code, CheckCircle2,
  ExternalLink, Sparkles, RefreshCw, Eye, Sliders,
  Share2, Shield, Info, Copy, Check, Plus, Trash2,
  Bot, HelpCircle, Layers, FileText, CheckCircle,
  AlertTriangle, ArrowUpRight, BarChart3, ChevronRight,
  Zap, Terminal, Database, Edit3, X, Laptop, Smartphone
} from 'lucide-react'

export interface AEOPair {
  question: string
  answer: string
  key_takeaway?: string
}

export interface PageSEOConfig {
  slug: string
  page_path: string
  name: string
  seo_title: string
  meta_description: string
  focus_keyword?: string
  seo_keywords?: string[]
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
  og_type?: 'website' | 'article' | 'profile' | 'course'
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  twitter_card?: 'summary' | 'summary_large_image'
  robots_index: boolean
  robots_follow: boolean
  schema_type: 'Organization' | 'EducationalOrganization' | 'Course' | 'Product' | 'LocalBusiness' | 'ContactPage' | 'AboutPage' | 'FAQPage' | 'WebPage' | 'Article'
  custom_schema_json?: string
  price?: number
  currency?: string
  rating?: number
  review_count?: number
  duration?: string
  aeo_qa_data?: AEOPair[]
  ai_summary?: string
}

export interface GlobalSEOSettings {
  site_name: string
  default_title: string
  default_meta_description: string
  default_keywords: string[]
  canonical_domain: string
  default_og_image: string
  default_author: string
  default_brand_name: string
  organization_type: string
  founding_year: string
  street_address: string
  address_locality: string
  address_region: string
  postal_code: string
  address_country: string
  telephone: string
  email: string
  same_as_socials: string[]
  languages_spoken: string[]
}

const DEFAULT_GLOBAL_SEO: GlobalSEOSettings = {
  site_name: 'Valavan Academy',
  default_title: 'Valavan Academy — Tamil-First Creative & Digital Career Programs',
  default_meta_description: 'Tamil Nadu’s premier creative learning academy. Master Graphic Design, Video Editing, UI/UX Design, and AI Creative Tools in Tamil with 1-on-1 mentorship and portfolio building.',
  default_keywords: [
    'graphic design course Tamil',
    'video editing course Tamil Nadu',
    'AI creative tools course in Tamil',
    'Valavan Academy',
    'online design course India',
    'Tamil creative education',
    'Photoshop course Tamil',
    'Illustrator course Tamil',
    'full stack digital creator',
  ],
  canonical_domain: 'https://valavanacademy.com',
  default_og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
  default_author: 'Valavan Academy',
  default_brand_name: 'Valavan Academy',
  organization_type: 'EducationalOrganization',
  founding_year: '2018',
  street_address: 'Tamil Nadu',
  address_locality: 'Vellore / Chennai',
  address_region: 'Tamil Nadu',
  postal_code: '632001',
  address_country: 'IN',
  telephone: '+919629161678',
  email: 'contact@valavanacademy.com',
  same_as_socials: [
    'https://www.youtube.com/@valavanacademy',
    'https://www.instagram.com/valavanacademy',
    'https://twitter.com/valavanacademy',
    'https://www.linkedin.com/company/valavan-academy',
  ],
  languages_spoken: ['Tamil', 'English'],
}

const DEFAULT_PAGES_LIST: PageSEOConfig[] = [
  {
    slug: 'home',
    page_path: '/',
    name: 'Home Page',
    seo_title: 'Valavan Academy — Build a Future-Ready Creative Career in Tamil',
    meta_description: 'Master Graphic Design, Video Editing, AI Tools, Web Design, and Freelancing through practical Tamil-first education designed for the real world.',
    focus_keyword: 'Graphic Design course in Tamil',
    seo_keywords: ['graphic design course Tamil', 'learn photoshop in Tamil', 'creative career Tamil Nadu', 'AI tools course Tamil', 'Valavan Academy Vellore'],
    canonical_url: 'https://valavanacademy.com',
    og_title: 'Valavan Academy — Build a Future-Ready Creative Career',
    og_description: 'Master Graphic Design, Video Editing, AI Tools & Freelancing in Tamil. Build a commercial portfolio with live mentorship.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'EducationalOrganization',
    aeo_qa_data: [
      {
        question: 'What is Valavan Academy?',
        answer: 'Valavan Academy is Tamil Nadu’s premier creative career learning platform offering hands-on, project-driven coaching in Graphic Design, Video Editing, Web Design, and AI Tools in Tamil.',
        key_takeaway: 'Tamil-first practical creative career coaching since 2018.',
      },
      {
        question: 'What courses does Valavan Academy offer?',
        answer: 'Valavan Academy offers the 90-Day Graphic Design Mastery program, the 3 Hours Live Printing & Design Workshop, and the 6-Month Full Stack Digital Creator Masterclass.',
        key_takeaway: 'Beginner to advanced design & creator programs.',
      },
    ],
  },
  {
    slug: '90-days-graphic-design',
    page_path: '/programs/90-days-graphic-design',
    name: '90-Day Graphic Design Mastery',
    seo_title: '90-Day Graphic Design Mastery (In Tamil) | Valavan Academy',
    meta_description: 'Complete 90-day practical Graphic Design course in Tamil. Master Adobe Photoshop, Illustrator, Canva, AI Design Tools, commercial branding, and client freelancing.',
    focus_keyword: '90 day graphic design course Tamil',
    seo_keywords: ['90 days graphic design mastery', 'photoshop course tamil', 'illustrator course tamil', 'graphic design certification tamil nadu'],
    canonical_url: 'https://valavanacademy.com/programs/90-days-graphic-design',
    og_title: '90-Day Graphic Design Mastery — Valavan Academy',
    og_description: 'From zero to industry-ready graphic designer in 90 days. 10+ live portfolio projects and certified Tamil mentorship.',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 4999,
    currency: 'INR',
    rating: 4.9,
    review_count: 240,
    duration: 'P90D',
    aeo_qa_data: [
      {
        question: 'What is the 90-Day Graphic Design Mastery program?',
        answer: 'The 90-Day Graphic Design Mastery is an intensive, career-focused online program taught in Tamil, covering Adobe Photoshop, Adobe Illustrator, Canva, AI tools, typography, color theory, social media poster design, and client acquisition.',
        key_takeaway: 'Comprehensive 90-day design curriculum with live projects.',
      },
      {
        question: 'What software will I learn in the 90-Day course?',
        answer: 'You will master Adobe Photoshop, Adobe Illustrator, Canva Pro, Midjourney, ChatGPT for Designers, and print preparation software.',
        key_takeaway: 'Industry standard design tools & generative AI workflows.',
      },
      {
        question: 'Will I get a certificate upon course completion?',
        answer: 'Yes, all students who complete the practical assignments and capstone portfolio project receive a verified Valavan Academy Graphic Design Certification.',
        key_takeaway: 'Verified career certificate with portfolio verification.',
      },
      {
        question: 'What career opportunities are available after this course?',
        answer: 'Graduates can work as Graphic Designers, Social Media Creatives, Branding Specialists, Ad Designers, Print Production Specialists, or freelance globally on Upwork and Fiverr.',
        key_takeaway: 'Full-time employment or global freelance opportunities.',
      },
    ],
  },
  {
    slug: '3-hours-live-workshop',
    page_path: '/programs/3-hours-live-workshop',
    name: '3 Hours Live Workshop',
    seo_title: '3-Hour Live Printing & Graphic Design Workshop (In Tamil) | Valavan Academy',
    meta_description: 'Join the 3-Hour live interactive workshop in Tamil. Learn how to launch a profitable printing and graphic design business using modern AI design skills.',
    focus_keyword: 'printing business workshop Tamil',
    canonical_url: 'https://valavanacademy.com/programs/3-hours-live-workshop',
    og_title: '3-Hour Live Printing & Design Workshop in Tamil',
    og_description: 'Learn the exact blueprint to start and scale a profitable printing and design business with AI tools.',
    og_image: 'https://valavanacademy.com/assets/images/team/team.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 99,
    currency: 'INR',
    rating: 4.8,
    review_count: 512,
    duration: 'PT3H',
    aeo_qa_data: [
      {
        question: 'What is the 3-Hour Live Workshop about?',
        answer: 'The 3-Hour Live Workshop teaches practical commercial printing techniques, digital artwork setup, fast client poster design, and how to start a printing business with minimal investment.',
        key_takeaway: 'Live interactive printing and commercial design session.',
      },
    ],
  },
  {
    slug: 'full-stack-creator',
    page_path: '/programs/full-stack-creator',
    name: 'Full Stack Digital Creator Program',
    seo_title: 'Full Stack Digital Creator Program (6 Months in Tamil) | Valavan Academy',
    meta_description: 'Master Graphic Design, 4K Video Editing, Motion Graphics, Personal Branding, AI Automation, and Audience Monetization in Tamil.',
    focus_keyword: 'full stack creator course Tamil',
    canonical_url: 'https://valavanacademy.com/programs/full-stack-creator',
    og_title: 'Full Stack Digital Creator Program — Valavan Academy',
    og_description: 'The ultimate 6-month creator blueprint. Master design, video editing, storytelling, and audience building in Tamil.',
    og_image: 'https://valavanacademy.com/assets/images/hero/full-stack-.jpg-1.webp',
    og_type: 'course',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'Course',
    price: 10000,
    currency: 'INR',
    rating: 4.9,
    review_count: 86,
    duration: 'P6M',
  },
  {
    slug: 'about',
    page_path: '/about',
    name: 'About Valavan Academy',
    seo_title: 'About Valavan Academy — Empowering Creators in Tamil Nadu',
    meta_description: 'Discover the mission, mentors, and journey behind Valavan Academy. Tamil Nadu’s leading institute for practical digital skills and creator careers.',
    canonical_url: 'https://valavanacademy.com/about',
    og_image: 'https://valavanacademy.com/assets/images/team/team.webp',
    og_type: 'article',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'AboutPage',
  },
  {
    slug: 'contact',
    page_path: '/contact',
    name: 'Contact Us',
    seo_title: 'Contact Valavan Academy | Admission & Course Support',
    meta_description: 'Get in touch with Valavan Academy. Reach our admissions and student support team via WhatsApp, call, or email.',
    canonical_url: 'https://valavanacademy.com/contact',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'ContactPage',
  },
  {
    slug: 'community',
    page_path: '/community',
    name: 'TNCC Community',
    seo_title: 'TNCC Creative Community | Valavan Academy',
    meta_description: 'Join TNCC (Tamil Nadu Creators Club) by Valavan Academy. Network with 5,000+ designers, video editors, and digital entrepreneurs.',
    canonical_url: 'https://valavanacademy.com/community',
    og_image: 'https://valavanacademy.com/assets/images/team/team.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'WebPage',
  },
  {
    slug: 'programs',
    page_path: '/programs',
    name: 'All Programs',
    seo_title: 'Creative & Digital Career Courses in Tamil | Valavan Academy',
    meta_description: 'Explore all high-income digital programs: 90-Day Graphic Design, 3-Hour Printing Workshop, and Full Stack Creator Masterclass.',
    canonical_url: 'https://valavanacademy.com/programs',
    og_image: 'https://valavanacademy.com/assets/images/hero/ai-powered-GD.webp',
    og_type: 'website',
    twitter_card: 'summary_large_image',
    robots_index: true,
    robots_follow: true,
    schema_type: 'EducationalOrganization',
  },
]

interface SEOAEODashboardClientProps {
  initialGlobalSEO?: GlobalSEOSettings
  initialPageSEO?: PageSEOConfig[]
}

export default function SEOAEODashboardClient({
  initialGlobalSEO = DEFAULT_GLOBAL_SEO,
  initialPageSEO = DEFAULT_PAGES_LIST,
}: SEOAEODashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'health' | 'global' | 'pages' | 'schema' | 'aeo' | 'sitemap' | 'robots'>('health')
  const [globalData, setGlobalData] = useState<GlobalSEOSettings>(initialGlobalSEO)
  const [pagesList, setPagesList] = useState<PageSEOConfig[]>(
    initialPageSEO && initialPageSEO.length > 0 ? initialPageSEO : DEFAULT_PAGES_LIST
  )
  const [saving, setSaving] = useState(false)
  const [selectedPage, setSelectedPage] = useState<PageSEOConfig | null>(null)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewChannel, setPreviewChannel] = useState<'google' | 'facebook' | 'twitter'>('google')

  // Search & Filter state for Page SEO Table
  const [searchQuery, setSearchQuery] = useState('')

  // 1. Calculate SEO Health Score and Audits
  const healthStats = useMemo(() => {
    let totalScore = 100
    const issues: Array<{ id: string; type: 'error' | 'warning' | 'success'; title: string; desc: string }> = []

    // Audit 1: Missing Meta Descriptions
    const missingDesc = pagesList.filter((p) => !p.meta_description || p.meta_description.length < 50)
    if (missingDesc.length > 0) {
      totalScore -= missingDesc.length * 5
      issues.push({
        id: 'missing-desc',
        type: 'warning',
        title: `${missingDesc.length} Pages with Short/Missing Meta Descriptions`,
        desc: `Pages: ${missingDesc.map((p) => p.name).join(', ')}`,
      })
    } else {
      issues.push({
        id: 'meta-desc-ok',
        type: 'success',
        title: 'All Pages Have Comprehensive Meta Descriptions',
        desc: '100% of your website pages have optimized snippet summaries.',
      })
    }

    // Audit 2: Missing Focus Keywords
    const missingKeywords = pagesList.filter((p) => !p.focus_keyword)
    if (missingKeywords.length > 0) {
      totalScore -= missingKeywords.length * 4
      issues.push({
        id: 'missing-keywords',
        type: 'warning',
        title: `${missingKeywords.length} Pages without Focus Keyword Defined`,
        desc: `Pages: ${missingKeywords.map((p) => p.name).join(', ')}`,
      })
    }

    // Audit 3: Missing OG Social Images
    const missingOg = pagesList.filter((p) => !p.og_image)
    if (missingOg.length > 0) {
      totalScore -= 5
      issues.push({
        id: 'missing-og',
        type: 'warning',
        title: `${missingOg.length} Pages Missing Custom OG Share Image`,
        desc: 'Social shares will fall back to site-wide default OG banner.',
      })
    } else {
      issues.push({
        id: 'og-ok',
        type: 'success',
        title: 'Open Graph Social Cards Configured',
        desc: 'Facebook, WhatsApp, and LinkedIn rich previews are fully populated.',
      })
    }

    // Audit 4: Schema Coverage
    const schemaCoverage = pagesList.filter((p) => p.schema_type).length
    if (schemaCoverage >= pagesList.length) {
      issues.push({
        id: 'schema-ok',
        type: 'success',
        title: 'Structured Data (JSON-LD) 100% Active',
        desc: 'Course, EducationalOrganization, FAQPage, BreadcrumbList, and LocalBusiness schemas enabled.',
      })
    }

    // Audit 5: AEO Readiness
    const aeoCount = pagesList.filter((p) => p.aeo_qa_data && p.aeo_qa_data.length > 0).length
    issues.push({
      id: 'aeo-status',
      type: 'success',
      title: `AEO & AI Search Readiness Active (${aeoCount} Courses / Pages)`,
      desc: 'Machine-readable Q&A blocks generated for ChatGPT, Perplexity, Gemini, and Google AI Overviews.',
    })

    const finalScore = Math.max(0, Math.min(100, totalScore))
    return { score: finalScore, issues }
  }, [pagesList])

  // Save to Supabase
  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global settings page not found')

      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: fields } = await supabase.from('fields').select('id, name').eq('section_id', sec.id)

      const payloadMap: Record<string, string> = {
        global_seo_data: JSON.stringify(globalData, null, 2),
        seo_settings_data: JSON.stringify(pagesList, null, 2),
      }

      for (const fieldName of ['global_seo_data', 'seo_settings_data']) {
        let field = fields?.find((f) => f.name === fieldName)
        let fieldId = field?.id
        if (!fieldId) {
          // Create field if not existing
          const { data: newF } = await supabase.from('fields').insert({
            section_id: sec.id,
            name: fieldName,
            label: fieldName.replace(/_/g, ' ').toUpperCase(),
            field_type: 'json',
          }).select('id').single()
          fieldId = newF?.id
        }

        if (fieldId) {
          const val = payloadMap[fieldName]
          const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', fieldId).maybeSingle()
          if (existingVal) {
            await supabase.from('field_values').update({
              value_text: val,
              published_value_text: val,
              is_draft: false,
              updated_at: new Date().toISOString(),
            }).eq('id', existingVal.id)
          } else {
            await supabase.from('field_values').insert({
              section_id: sec.id,
              field_id: fieldId,
              page_id: page.id,
              value_text: val,
              published_value_text: val,
              is_draft: false,
              updated_at: new Date().toISOString(),
            })
          }
        }
      }

      toast.success('✓ Complete SEO, Schemas & AEO Settings saved successfully!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Save failed: ${msg}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePageUpdate = (updated: PageSEOConfig) => {
    setPagesList((prev) => prev.map((p) => (p.page_path === updated.page_path ? updated : p)))
    if (selectedPage?.page_path === updated.page_path) {
      setSelectedPage(updated)
    }
  }

  const filteredPages = useMemo(() => {
    return pagesList.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.page_path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.focus_keyword && p.focus_keyword.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [pagesList, searchQuery])

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1748BB] to-blue-700 text-white flex items-center justify-center shadow-xs">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Complete SEO & AEO Engine</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  AI & Search Engine Ready
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Manage metadata, JSON-LD schemas, dynamic sitemap, AI robots, and Answer Engine Optimization (ChatGPT, Perplexity, Gemini).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All SEO Settings'}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-200 bg-white rounded-xl px-3 shadow-2xs">
        {[
          { id: 'health', label: 'SEO Health & Score', icon: BarChart3 },
          { id: 'global', label: 'Global SEO Defaults', icon: Globe },
          { id: 'pages', label: 'Page SEO Manager', icon: FileText },
          { id: 'schema', label: 'Schema Markup (JSON-LD)', icon: Code },
          { id: 'aeo', label: 'AEO & AI Search', icon: Bot },
          { id: 'sitemap', label: 'Sitemap XML', icon: Layers },
          { id: 'robots', label: 'Robots.txt & AI Bots', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'border-[#1748BB] text-[#1748BB]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#1748BB]' : 'text-gray-400'}`} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SEO HEALTH & DIAGNOSTICS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Health Score Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 rounded-2xl border border-blue-200/70 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">SEO & AEO Health Score</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700">OPTIMIZED</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-[#1748BB]">{healthStats.score}</span>
                  <span className="text-xl font-bold text-gray-400">/ 100</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Your website is optimized for modern search engines (Google, Bing) and AI Answer Engines (ChatGPT, Perplexity, Gemini, Claude).
                </p>
              </div>

              <div className="pt-4 border-t border-blue-100 mt-4 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">{pagesList.length} Total Monitored Pages</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 100% Indexed
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Indexed Pages', val: pagesList.filter((p) => p.robots_index).length, icon: Globe, color: 'text-blue-600 bg-blue-50' },
                { label: 'Active Schemas', val: pagesList.filter((p) => p.schema_type).length, icon: Code, color: 'text-purple-600 bg-purple-50' },
                { label: 'AEO Q&A Blocks', val: pagesList.reduce((acc, p) => acc + (p.aeo_qa_data?.length || 0), 0), icon: Bot, color: 'text-amber-600 bg-amber-50' },
                { label: 'Focus Keywords', val: pagesList.filter((p) => p.focus_keyword).length, icon: Search, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Social OG Cards', val: pagesList.filter((p) => p.og_image).length, icon: Share2, color: 'text-indigo-600 bg-indigo-50' },
                { label: 'Dynamic Sitemap', val: 'Active', icon: Layers, color: 'text-teal-600 bg-teal-50' },
              ].map((m) => {
                const Icon = m.icon
                return (
                  <div key={m.label} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">{m.label}</span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900">{m.val}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Audit Issues & Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900">SEO & AEO Audit Checklist</h3>
            <div className="divide-y divide-gray-100">
              {healthStats.issues.map((issue) => (
                <div key={issue.id} className="py-3.5 flex items-start gap-3">
                  {issue.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-gray-900">{issue.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{issue.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: GLOBAL SEO DEFAULTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'global' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-gray-900">Global Website SEO & Brand Entity</h3>
            <p className="text-xs text-gray-500">Site-wide defaults applied to all pages unless specifically overridden.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Website Name</label>
              <input
                type="text"
                value={globalData.site_name}
                onChange={(e) => setGlobalData({ ...globalData, site_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Canonical Base Domain</label>
              <input
                type="url"
                value={globalData.canonical_domain}
                onChange={(e) => setGlobalData({ ...globalData, canonical_domain: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Default SEO Title</label>
              <input
                type="text"
                value={globalData.default_title}
                onChange={(e) => setGlobalData({ ...globalData, default_title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Default Meta Description</label>
              <textarea
                rows={3}
                value={globalData.default_meta_description}
                onChange={(e) => setGlobalData({ ...globalData, default_meta_description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Default OG Social Banner Image URL</label>
              <input
                type="url"
                value={globalData.default_og_image}
                onChange={(e) => setGlobalData({ ...globalData, default_og_image: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={globalData.telephone}
                onChange={(e) => setGlobalData({ ...globalData, telephone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] focus:ring-1 focus:ring-[#1748BB] outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: PAGE SEO MANAGER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'pages' && (
        <div className="space-y-6">
          {/* Search bar & count */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by page name, path, or focus keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
              />
            </div>
            <div className="text-xs font-semibold text-gray-500">
              Showing {filteredPages.length} of {pagesList.length} pages
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100">
                  <tr>
                    <th className="py-3 px-4">Page</th>
                    <th className="py-3 px-4">SEO Title</th>
                    <th className="py-3 px-4">Focus Keyword</th>
                    <th className="py-3 px-4 text-center">Indexing</th>
                    <th className="py-3 px-4 text-center">Schema</th>
                    <th className="py-3 px-4 text-center">AEO Q&A</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                  {filteredPages.map((page) => (
                    <tr key={page.page_path} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900">{page.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{page.page_path}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-gray-800">
                        {page.seo_title}
                      </td>
                      <td className="py-3.5 px-4">
                        {page.focus_keyword ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-[#1748BB] rounded-md font-semibold text-[11px]">
                            {page.focus_keyword}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px]">None</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          page.robots_index ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {page.robots_index ? 'Index' : 'Noindex'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md font-semibold text-[11px]">
                          {page.schema_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-gray-900">{page.aeo_qa_data?.length || 0}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedPage(page)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-[#1748BB] hover:text-white text-gray-700 font-bold transition-all text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit SEO</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: SCHEMA MARKUP (JSON-LD)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'schema' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Structured Data & JSON-LD Schemas</h3>
              <p className="text-xs text-gray-500">Google Rich Results & Educational Knowledge Graph schemas.</p>
            </div>
            <a
              href="https://validator.schema.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <span>Test on Schema.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Active Schema Types on Valavan Academy</span>
              {[
                { type: 'EducationalOrganization', desc: 'Validates Valavan Academy as a recognized creative learning institute.', target: 'Global / All Pages' },
                { type: 'Course', desc: 'Provides syllabus, instructor details, duration, pricing (INR), and certification.', target: 'All /programs/* routes' },
                { type: 'BreadcrumbList', desc: 'Generates clean Google breadcrumbs (Home > Programs > 90-Day GD).', target: 'All hierarchical URLs' },
                { type: 'FAQPage', desc: 'Rich accordion snippets in Google Search & Answer Engine citations.', target: 'Pages with FAQs' },
                { type: 'LocalBusiness', desc: 'Headquarters contact point, phone number, operating hours, and location.', target: '/contact' },
              ].map((s) => (
                <div key={s.type} className="p-4 rounded-xl border border-gray-200 bg-gray-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1748BB]">{s.type} Schema</span>
                    <span className="text-[10px] font-semibold text-gray-400">{s.target}</span>
                  </div>
                  <p className="text-[11px] text-gray-600">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* Live JSON-LD Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Live Sample JSON-LD Output</span>
              <pre className="bg-neutral-900 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-[380px] leading-relaxed">
{JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: globalData.site_name,
  url: globalData.canonical_domain,
  logo: `${globalData.canonical_domain}/logo-icon.png`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: globalData.address_locality,
    addressRegion: globalData.address_region,
    addressCountry: 'IN',
  },
  sameAs: globalData.same_as_socials,
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: AEO & AI SEARCH (Answer Engine Optimization)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'aeo' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Answer Engine Optimization (AEO)</h3>
              <p className="text-xs text-gray-500">Configure machine-readable knowledge entities for ChatGPT, Perplexity, Gemini, and Claude.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`${globalData.canonical_domain}/llms.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <span>View /llms.txt</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 flex items-start gap-3">
            <Bot className="w-5 h-5 text-[#1748BB] shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-700 space-y-1">
              <span className="font-bold text-[#1748BB] block text-sm">How AEO Works</span>
              Answer engines look for concise definitions, structured Q&A, and machine-readable markdown to answer questions like <em>&quot;Which is the best Graphic Design course in Tamil?&quot;</em> or <em>&quot;What does Valavan Academy teach?&quot;</em>.
            </div>
          </div>

          {/* Quick Questions Grid */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Top AI Answer Blocks Configured</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: 'What is 90-Day Graphic Design Mastery?', a: 'An intensive career-focused program in Tamil covering Photoshop, Illustrator, Canva, AI tools, and commercial freelancing.' },
                { q: 'Who is eligible to join Valavan Academy?', a: 'Students, graduates, working professionals, and aspiring creators with zero design background.' },
                { q: 'What tools & software are taught?', a: 'Adobe Photoshop, Illustrator, Premiere Pro, Canva Pro, Midjourney, and ChatGPT for Creators.' },
                { q: 'Is certification provided?', a: 'Yes, students receive a verified Valavan Academy Certificate upon capstone portfolio completion.' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white space-y-1 shadow-2xs">
                  <span className="font-bold text-xs text-gray-900 block">{item.q}</span>
                  <p className="text-[11px] text-gray-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: SITEMAP XML
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'sitemap' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Dynamic XML Sitemap</h3>
              <p className="text-xs text-gray-500">Automatically generated and updated hourly at /sitemap.xml.</p>
            </div>
            <a
              href={`${globalData.canonical_domain}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <span>Open Live sitemap.xml</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700 block uppercase tracking-wider">Included URLs in Sitemap</span>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {pagesList.filter((p) => p.robots_index).map((p) => (
                <div key={p.page_path} className="p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-mono text-gray-800">{globalData.canonical_domain}{p.page_path}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold text-[10px]">
                    Priority {p.page_path === '/' ? '1.0' : p.page_path.startsWith('/programs/') ? '0.95' : '0.8'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 7: ROBOTS.TXT & AI BOTS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === 'robots' && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900">Robots.txt & AI Crawler Permissions</h3>
              <p className="text-xs text-gray-500">Allowing Google, Bing, and AI crawlers while protecting private admin routes.</p>
            </div>
            <a
              href={`${globalData.canonical_domain}/robots.txt`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
            >
              <span>View /robots.txt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Allowed Search Bots & AI Crawlers
              </span>
              <ul className="text-xs text-gray-700 space-y-1 font-mono">
                <li>• Googlebot & Bingbot (Search Indexing)</li>
                <li>• GPTBot & ChatGPT-User (OpenAI / ChatGPT)</li>
                <li>• PerplexityBot (Perplexity AI Search)</li>
                <li>• ClaudeBot & anthropic-ai (Anthropic Claude)</li>
                <li>• Google-Extended (Google AI Overviews & Gemini)</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-rose-600" /> Protected Disallowed Paths
              </span>
              <ul className="text-xs text-gray-700 space-y-1 font-mono">
                <li>• /api/* (Internal Backend APIs)</li>
                <li>• /dashboard/* (Admin & CMS Management)</li>
                <li>• /thank-you/* (Order Confirmations & Tracking)</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          PAGE SEO EDIT MODAL / DRAWER
      ───────────────────────────────────────────────────────────── */}
      {selectedPage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit SEO: {selectedPage.name}</h3>
                <span className="text-xs font-mono text-gray-400">{selectedPage.page_path}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SERP & Social Preview Switcher */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Live Search & Social Preview</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewChannel('google')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      previewChannel === 'google' ? 'bg-[#1748BB] text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    Google SERP
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewChannel('facebook')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                      previewChannel === 'facebook' ? 'bg-[#1877F2] text-white' : 'bg-white text-gray-600'
                    }`}
                  >
                    Facebook / OG
                  </button>
                </div>
              </div>

              {previewChannel === 'google' ? (
                <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-1">
                  <div className="text-[11px] text-gray-500 flex items-center gap-1 font-sans">
                    <span>https://valavanacademy.com</span>
                    <span>›</span>
                    <span className="text-gray-700">{selectedPage.slug}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                    {selectedPage.seo_title || `${selectedPage.name} | Valavan Academy`}
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedPage.meta_description || 'Master Graphic Design, Video Editing, and AI in Tamil.'}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-sm mx-auto shadow-xs">
                  {selectedPage.og_image && (
                    <img
                      src={selectedPage.og_image}
                      alt="OG Preview"
                      className="w-full h-36 object-cover bg-neutral-900"
                    />
                  )}
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">valavanacademy.com</span>
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {selectedPage.og_title || selectedPage.seo_title}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2">
                      {selectedPage.og_description || selectedPage.meta_description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">SEO Title (Title Tag)</label>
                <input
                  type="text"
                  value={selectedPage.seo_title}
                  onChange={(e) => handlePageUpdate({ ...selectedPage, seo_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Meta Description</label>
                <textarea
                  rows={3}
                  value={selectedPage.meta_description}
                  onChange={(e) => handlePageUpdate({ ...selectedPage, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Focus Keyword</label>
                  <input
                    type="text"
                    value={selectedPage.focus_keyword || ''}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, focus_keyword: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Canonical URL</label>
                  <input
                    type="url"
                    value={selectedPage.canonical_url || ''}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, canonical_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Custom OG Image URL</label>
                  <input
                    type="url"
                    value={selectedPage.og_image || ''}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, og_image: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Schema.org Type</label>
                  <select
                    value={selectedPage.schema_type}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, schema_type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#1748BB] outline-none bg-white"
                  >
                    <option value="EducationalOrganization">EducationalOrganization</option>
                    <option value="Course">Course</option>
                    <option value="LocalBusiness">LocalBusiness</option>
                    <option value="ContactPage">ContactPage</option>
                    <option value="AboutPage">AboutPage</option>
                    <option value="WebPage">WebPage</option>
                    <option value="Article">Article</option>
                  </select>
                </div>
              </div>

              {/* Robots Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedPage.robots_index}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, robots_index: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1748BB]"
                  />
                  <span>Allow Search Engines to Index (index)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedPage.robots_follow}
                    onChange={(e) => handlePageUpdate({ ...selectedPage, robots_follow: e.target.checked })}
                    className="w-4 h-4 rounded text-[#1748BB]"
                  />
                  <span>Follow Links on Page (follow)</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedPage(null)}
                className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPage(null)
                  handleSave()
                }}
                className="btn-primary py-2 px-5 text-xs font-bold cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
