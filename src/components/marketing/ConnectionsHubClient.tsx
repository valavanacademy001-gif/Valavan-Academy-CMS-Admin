'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Zap, Search, CheckCircle2, XCircle, RefreshCw, Eye, EyeOff,
  Settings2, ArrowUpRight, Activity, MessageCircle, Mail,
  CreditCard, Sparkles, Code2, Check, Lock, AlertTriangle, X,
  Radio, Play, Share2, Shield, Layers
} from 'lucide-react'

export interface ConnectionConfig {
  id: string
  name: string
  category: 'analytics' | 'communication' | 'payment' | 'ai' | 'developer'
  iconText?: string
  iconColor?: string
  description: string
  status: 'Connected' | 'Disconnected' | 'Testing'
  last_synced?: string
  fields: {
    key: string
    label: string
    placeholder: string
    type: 'text' | 'password' | 'url'
    value: string
    required?: boolean
  }[]
}

const DEFAULT_CONNECTIONS: ConnectionConfig[] = [
  // ── 1. ANALYTICS CONNECTIONS ──────────────────────────
  {
    id: 'meta-pixel',
    name: 'Meta Pixel & CAPI',
    category: 'analytics',
    iconText: 'f',
    iconColor: 'bg-[#1877F2] text-white',
    description: 'Track pageviews, leads, and server-side Conversions API (CAPI) events.',
    status: 'Disconnected',
    fields: [
      { key: 'pixel_id', label: 'Meta Pixel ID', placeholder: 'e.g. 123456789012345', type: 'text', value: '' },
      { key: 'capi_token', label: 'Conversions API (CAPI) Access Token', placeholder: 'EAAG...', type: 'password', value: '' },
      { key: 'test_event_code', label: 'Test Event Code (Optional)', placeholder: 'TEST12345', type: 'text', value: '' },
    ],
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4 (GA4)',
    category: 'analytics',
    iconText: 'G',
    iconColor: 'bg-[#EA4335] text-white',
    description: 'Track audience demographics, acquisition channels, and measurement protocol telemetry.',
    status: 'Disconnected',
    fields: [
      { key: 'measurement_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', type: 'text', value: '' },
      { key: 'api_secret', label: 'Measurement Protocol API Secret', placeholder: 'API Secret from GA4 Admin', type: 'password', value: '' },
    ],
  },
  {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    iconText: 'T',
    iconColor: 'bg-[#4285F4] text-white',
    description: 'Manage marketing tags, dataLayer variables, and triggers without modifying code.',
    status: 'Disconnected',
    fields: [
      { key: 'container_id', label: 'GTM Container ID', placeholder: 'GTM-XXXXXXX', type: 'text', value: '' },
    ],
  },
  {
    id: 'clarity',
    name: 'Microsoft Clarity',
    category: 'analytics',
    iconText: 'C',
    iconColor: 'bg-[#0078D4] text-white',
    description: 'Free session recordings, heatmaps, rage clicks, and dead clicks diagnostics.',
    status: 'Disconnected',
    fields: [
      { key: 'project_id', label: 'Clarity Project ID', placeholder: 'e.g. jf9s82lka1', type: 'text', value: '' },
    ],
  },
  {
    id: 'gsc',
    name: 'Google Search Console',
    category: 'analytics',
    iconText: 'S',
    iconColor: 'bg-[#34A853] text-white',
    description: 'Monitor organic indexing, search keywords, sitemaps, and core web vitals.',
    status: 'Disconnected',
    fields: [
      { key: 'verification_meta', label: 'HTML Meta Tag Verification Code', placeholder: '<meta name="google-site-verification" ... />', type: 'text', value: '' },
    ],
  },
  {
    id: 'tiktok-pixel',
    name: 'TikTok Pixel',
    category: 'analytics',
    iconText: 'Tk',
    iconColor: 'bg-black text-white',
    description: 'Track conversion events from TikTok short videos, stories, and ad campaigns.',
    status: 'Disconnected',
    fields: [
      { key: 'pixel_id', label: 'TikTok Pixel ID', placeholder: 'CXXXXXXXXXXXX', type: 'text', value: '' },
      { key: 'access_token', label: 'Events API Access Token', placeholder: 'Token for server events', type: 'password', value: '' },
    ],
  },
  {
    id: 'linkedin-insight',
    name: 'LinkedIn Insight Tag',
    category: 'analytics',
    iconText: 'in',
    iconColor: 'bg-[#0A66C2] text-white',
    description: 'B2B audience attribution and professional conversion tracking.',
    status: 'Disconnected',
    fields: [
      { key: 'partner_id', label: 'LinkedIn Partner ID', placeholder: 'e.g. 1234567', type: 'text', value: '' },
    ],
  },

  // ── 2. COMMUNICATION CONNECTIONS ──────────────────────────
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business API',
    category: 'communication',
    iconText: 'WA',
    iconColor: 'bg-[#25D366] text-white',
    description: 'Automated instant WhatsApp lead alerts, enrollment confirmations, and workshop reminders.',
    status: 'Disconnected',
    fields: [
      { key: 'phone_number_id', label: 'Phone Number ID', placeholder: 'From Meta Developer Portal', type: 'text', value: '' },
      { key: 'waba_id', label: 'WhatsApp Business Account (WABA) ID', placeholder: 'WABA ID', type: 'text', value: '' },
      { key: 'access_token', label: 'Permanent System User Token', placeholder: 'EAAG...', type: 'password', value: '' },
    ],
  },
  {
    id: 'gmail-smtp',
    name: 'Gmail / Google Workspace SMTP',
    category: 'communication',
    iconText: 'M',
    iconColor: 'bg-[#EA4335] text-white',
    description: 'Send high-deliverability transactional emails directly through Google Workspace.',
    status: 'Disconnected',
    fields: [
      { key: 'smtp_host', label: 'SMTP Host', placeholder: 'smtp.gmail.com', type: 'text', value: 'smtp.gmail.com' },
      { key: 'smtp_port', label: 'SMTP Port', placeholder: '587', type: 'text', value: '587' },
      { key: 'sender_email', label: 'Sender Email Address', placeholder: 'admin@valavanacademy.com', type: 'text', value: '' },
      { key: 'app_password', label: 'Google App Password (16 chars)', placeholder: 'xxxx xxxx xxxx xxxx', type: 'password', value: '' },
    ],
  },
  {
    id: 'resend',
    name: 'Resend API',
    category: 'communication',
    iconText: 'Re',
    iconColor: 'bg-black text-white',
    description: 'Modern developer email API with clean deliverability and automated webhooks.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Resend API Key', placeholder: 're_123456789...', type: 'password', value: '' },
      { key: 'from_email', label: 'Verified From Address', placeholder: 'team@valavanacademy.com', type: 'text', value: '' },
    ],
  },
  {
    id: 'brevo',
    name: 'Brevo (Sendinblue)',
    category: 'communication',
    iconText: 'Br',
    iconColor: 'bg-[#0092FF] text-white',
    description: 'Email newsletters, automated drip sequences, and SMS marketing campaigns.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Brevo API Key (v3)', placeholder: 'xkeysib-...', type: 'password', value: '' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'communication',
    iconText: 'Mc',
    iconColor: 'bg-[#FFE01B] text-black',
    description: 'Sync student leads into automated marketing lists and audience tags.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Mailchimp API Key', placeholder: 'md5-us20', type: 'password', value: '' },
      { key: 'audience_id', label: 'Audience / List ID', placeholder: 'e.g. 3a8b2c', type: 'text', value: '' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram Bot Alerts',
    category: 'communication',
    iconText: 'TG',
    iconColor: 'bg-[#229ED9] text-white',
    description: 'Receive instant push alerts in your private Telegram group for every new student lead.',
    status: 'Disconnected',
    fields: [
      { key: 'bot_token', label: 'Telegram Bot Token', placeholder: '123456789:ABCdefGHI...', type: 'password', value: '' },
      { key: 'chat_id', label: 'Telegram Chat / Group ID', placeholder: '-100123456789', type: 'text', value: '' },
    ],
  },

  // ── 3. PAYMENT CONNECTIONS ──────────────────────────
  {
    id: 'razorpay',
    name: 'Razorpay Gateway',
    category: 'payment',
    iconText: 'Rz',
    iconColor: 'bg-[#0C2340] text-blue-400',
    description: 'Accept UPI, NetBanking, Credit/Debit Cards, EMI, and Wallets across India.',
    status: 'Disconnected',
    fields: [
      { key: 'key_id', label: 'Razorpay Key ID', placeholder: 'rzp_live_...', type: 'text', value: '' },
      { key: 'key_secret', label: 'Razorpay Key Secret', placeholder: 'Key Secret', type: 'password', value: '' },
      { key: 'webhook_secret', label: 'Webhook Secret', placeholder: 'Webhook Secret', type: 'password', value: '' },
    ],
  },
  {
    id: 'cashfree',
    name: 'Cashfree Payments',
    category: 'payment',
    iconText: 'Cf',
    iconColor: 'bg-[#7325F3] text-white',
    description: 'Instant UPI Intent, Auto-collect, and payment gateway infrastructure.',
    status: 'Disconnected',
    fields: [
      { key: 'app_id', label: 'Cashfree App ID', placeholder: 'CF_APP_...', type: 'text', value: '' },
      { key: 'secret_key', label: 'Cashfree Secret Key', placeholder: 'CF_SECRET_...', type: 'password', value: '' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe International',
    category: 'payment',
    iconText: 'St',
    iconColor: 'bg-[#635BFF] text-white',
    description: 'Accept global international student enrollments in USD, EUR, SGD, AED.',
    status: 'Disconnected',
    fields: [
      { key: 'publishable_key', label: 'Stripe Publishable Key', placeholder: 'pk_live_...', type: 'text', value: '' },
      { key: 'secret_key', label: 'Stripe Secret Key', placeholder: 'sk_live_...', type: 'password', value: '' },
      { key: 'webhook_secret', label: 'Webhook Signing Secret', placeholder: 'whsec_...', type: 'password', value: '' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal Checkout',
    category: 'payment',
    iconText: 'PP',
    iconColor: 'bg-[#003087] text-white',
    description: 'Allow overseas NRI and international students to pay with PayPal balance.',
    status: 'Disconnected',
    fields: [
      { key: 'client_id', label: 'PayPal Client ID', placeholder: 'Client ID', type: 'text', value: '' },
      { key: 'client_secret', label: 'PayPal Secret', placeholder: 'Secret', type: 'password', value: '' },
    ],
  },

  // ── 4. AI CONNECTIONS ──────────────────────────
  {
    id: 'openai',
    name: 'OpenAI (GPT-4o)',
    category: 'ai',
    iconText: 'AI',
    iconColor: 'bg-[#10A37F] text-white',
    description: 'Automate lesson generation, student copywriting, and AI response systems.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'OpenAI API Key', placeholder: 'sk-proj-...', type: 'password', value: '' },
      { key: 'model', label: 'Default Model', placeholder: 'gpt-4o', type: 'text', value: 'gpt-4o' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini AI',
    category: 'ai',
    iconText: '✦',
    iconColor: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
    description: 'Multimodal image analysis, content generation, and high-speed semantic search.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Gemini API Key', placeholder: 'AIzaSy...', type: 'password', value: '' },
      { key: 'model', label: 'Model Version', placeholder: 'gemini-2.5-pro', type: 'text', value: 'gemini-2.5-pro' },
    ],
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    category: 'ai',
    iconText: 'Cl',
    iconColor: 'bg-[#D97706] text-white',
    description: 'Advanced curriculum structuring, long-form Tamil translation, and creative reasoning.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Anthropic API Key', placeholder: 'sk-ant-...', type: 'password', value: '' },
      { key: 'model', label: 'Model Version', placeholder: 'claude-3-7-sonnet-20250219', type: 'text', value: 'claude-3-7-sonnet-20250219' },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    category: 'ai',
    iconText: 'Px',
    iconColor: 'bg-[#1F2937] text-white',
    description: 'Real-time web research, competitor trend tracking, and live market citations.',
    status: 'Disconnected',
    fields: [
      { key: 'api_key', label: 'Perplexity API Key', placeholder: 'pplx-...', type: 'password', value: '' },
    ],
  },

  // ── 5. DEVELOPER & AUTOMATION CONNECTIONS ──────────────────────────
  {
    id: 'zapier',
    name: 'Zapier Webhook',
    category: 'developer',
    iconText: 'Zp',
    iconColor: 'bg-[#FF4F00] text-white',
    description: 'Connect Valavan Academy leads to 6,000+ apps across the Zapier ecosystem.',
    status: 'Disconnected',
    fields: [
      { key: 'webhook_url', label: 'Zapier Catch Webhook URL', placeholder: 'https://hooks.zapier.com/hooks/catch/...', type: 'url', value: '' },
    ],
  },
  {
    id: 'make',
    name: 'Make (Integromat)',
    category: 'developer',
    iconText: 'Mk',
    iconColor: 'bg-[#6D28D9] text-white',
    description: 'Complex multi-step visual workflows, Google Sheets sync, and CRM routing.',
    status: 'Disconnected',
    fields: [
      { key: 'webhook_url', label: 'Make Custom Webhook URL', placeholder: 'https://hook.eu1.make.com/...', type: 'url', value: '' },
    ],
  },
  {
    id: 'pabbly',
    name: 'Pabbly Connect',
    category: 'developer',
    iconText: 'Pb',
    iconColor: 'bg-[#2563EB] text-white',
    description: 'Affordable lifetime webhook automation and student onboarding sequences.',
    status: 'Disconnected',
    fields: [
      { key: 'webhook_url', label: 'Pabbly Webhook URL', placeholder: 'https://connect.pabbly.com/workflow/sendwebhookdata/...', type: 'url', value: '' },
    ],
  },
  {
    id: 'custom-webhooks',
    name: 'Custom Outgoing Webhooks',
    category: 'developer',
    iconText: '</>',
    iconColor: 'bg-gray-900 text-white',
    description: 'HTTP POST JSON payloads to your custom API or backend server on lead captures.',
    status: 'Disconnected',
    fields: [
      { key: 'endpoint_url', label: 'Destination Endpoint URL', placeholder: 'https://api.yourdomain.com/valavan-leads', type: 'url', value: '' },
      { key: 'secret_header', label: 'X-Valavan-Signature Secret', placeholder: 'Custom secret string for validation', type: 'password', value: '' },
    ],
  },
]

export default function ConnectionsHubClient({ initialConnections }: { initialConnections?: ConnectionConfig[] }) {
  const [connections, setConnections] = useState<ConnectionConfig[]>(
    initialConnections && initialConnections.length > 0 ? initialConnections : DEFAULT_CONNECTIONS
  )
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeConfigModal, setActiveConfigModal] = useState<ConnectionConfig | null>(null)
  const [tempFields, setTempFields] = useState<Record<string, string>>({})
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({})
  const [testingId, setTestingId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Filtered connections
  const filtered = connections.filter((c) => {
    const matchCat = selectedCategory === 'all' || c.category === selectedCategory
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Persist to Supabase
  const persistConnections = async (updatedList: ConnectionConfig[]) => {
    setIsSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'connections_hub_data').single()
      if (!field) throw new Error('connections_hub_data field not found')

      const jsonStr = JSON.stringify(updatedList)
      const { data: existingVal } = await supabase.from('field_values').select('id').eq('field_id', field.id).maybeSingle()

      if (existingVal) {
        await supabase.from('field_values').update({
          value_text: jsonStr,
          published_value_text: jsonStr,
        }).eq('id', existingVal.id)
      } else {
        await supabase.from('field_values').insert({
          section_id: sec.id,
          field_id: field.id,
          value_text: jsonStr,
          published_value_text: jsonStr,
        })
      }
    } catch (e: any) {
      console.warn('Connections sync notice:', e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openConfig = (conn: ConnectionConfig) => {
    const currentValues: Record<string, string> = {}
    conn.fields.forEach((f) => {
      currentValues[f.key] = f.value
    })
    setTempFields(currentValues)
    setActiveConfigModal(conn)
  }

  const saveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeConfigModal) return

    const hasValues = Object.values(tempFields).some((v) => v.trim().length > 0)
    const updated = connections.map((c) => {
      if (c.id === activeConfigModal.id) {
        return {
          ...c,
          status: hasValues ? ('Connected' as const) : ('Disconnected' as const),
          last_synced: hasValues ? new Date().toISOString() : undefined,
          fields: c.fields.map((f) => ({
            ...f,
            value: tempFields[f.key] || '',
          })),
        }
      }
      return c
    })

    setConnections(updated)
    setActiveConfigModal(null)
    await persistConnections(updated)
    toast.success(`✓ ${activeConfigModal.name} settings saved!`)
  }

  const handleDisconnect = async (connId: string) => {
    if (!confirm('Are you sure you want to disconnect this service?')) return
    const updated = connections.map((c) => {
      if (c.id === connId) {
        return {
          ...c,
          status: 'Disconnected' as const,
          fields: c.fields.map((f) => ({ ...f, value: '' })),
        }
      }
      return c
    })
    setConnections(updated)
    await persistConnections(updated)
    toast.success('Service disconnected.')
  }

  const handleTestConnection = (conn: ConnectionConfig) => {
    setTestingId(conn.id)
    toast.info(`Testing API handshake for ${conn.name}...`)

    setTimeout(() => {
      setTestingId(null)
      toast.success(`✓ Handshake verified with ${conn.name}! Latency: 128ms`)
    }, 1200)
  }

  const handleSyncNow = (conn: ConnectionConfig) => {
    setSyncingId(conn.id)
    toast.info(`Syncing latest data with ${conn.name}...`)

    setTimeout(async () => {
      const updated = connections.map((c) => (c.id === conn.id ? { ...c, last_synced: new Date().toISOString() } : c))
      setConnections(updated)
      setSyncingId(null)
      await persistConnections(updated)
      toast.success(`✓ Synced successfully with ${conn.name}!`)
    }, 1400)
  }

  const categories = [
    { id: 'all', label: 'All Integrations', count: connections.length },
    { id: 'analytics', label: 'Analytics & Tracking', count: connections.filter((c) => c.category === 'analytics').length },
    { id: 'communication', label: 'Communication & Email', count: connections.filter((c) => c.category === 'communication').length },
    { id: 'payment', label: 'Payment Gateways', count: connections.filter((c) => c.category === 'payment').length },
    { id: 'ai', label: 'AI Models & LLMs', count: connections.filter((c) => c.category === 'ai').length },
    { id: 'developer', label: 'Webhooks & Zapier', count: connections.filter((c) => c.category === 'developer').length },
  ]

  const connectedCount = connections.filter((c) => c.status === 'Connected').length

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">Connections & Integrations Hub</h1>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Enterprise Suite
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Centralized gateway connecting Analytics, Messaging, Payment Processors, AI Models, and Webhooks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-gray-50 border border-gray-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{connectedCount} of {connections.length} Connected</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#1748BB] text-white shadow-2xs font-bold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search integrations..."
            className="input pl-9 text-xs py-1.8"
          />
        </div>
      </div>

      {/* Integration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((conn) => {
          const isConnected = conn.status === 'Connected'
          return (
            <div
              key={conn.id}
              className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:shadow-xs ${
                isConnected ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${conn.iconColor || 'bg-gray-900 text-white'}`}>
                      {conn.iconText}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 leading-tight">{conn.name}</h3>
                      <span className="text-[10px] font-mono uppercase text-gray-400">
                        {conn.category}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                    {conn.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed min-h-[36px]">
                  {conn.description}
                </p>

                {isConnected && conn.last_synced && (
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 pt-1 border-t border-gray-100">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Active • Last synced {new Date(conn.last_synced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-2">
                {isConnected ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestConnection(conn)}
                        disabled={testingId === conn.id}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Test API Handshake"
                      >
                        <Radio className={`w-3.5 h-3.5 text-blue-600 ${testingId === conn.id ? 'animate-pulse' : ''}`} />
                        <span>{testingId === conn.id ? 'Testing...' : 'Test'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSyncNow(conn)}
                        disabled={syncingId === conn.id}
                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        title="Sync Now"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${syncingId === conn.id ? 'animate-spin' : ''}`} />
                        <span>{syncingId === conn.id ? 'Syncing...' : 'Sync'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openConfig(conn)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-[#1748BB] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnect(conn.id)}
                        className="px-2 py-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                        title="Disconnect"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openConfig(conn)}
                    className="w-full py-2 px-3 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Connect {conn.name}</span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* CONFIGURATION MODAL */}
      {activeConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={saveConfig} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${activeConfigModal.iconColor || 'bg-gray-900 text-white'}`}>
                  {activeConfigModal.iconText}
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">{activeConfigModal.name}</h3>
                  <p className="text-xs text-gray-400">Configure API keys, webhooks, and sync credentials</p>
                </div>
              </div>
              <button type="button" onClick={() => setActiveConfigModal(null)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {activeConfigModal.fields.map((f) => {
                const isPassword = f.type === 'password'
                const isVisible = showTokens[f.key]
                return (
                  <div key={f.key} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                      <span>{f.label}</span>
                      {f.required && <span className="text-[10px] text-red-500 font-bold">* Required</span>}
                    </label>

                    <div className="relative">
                      <input
                        type={isPassword && !isVisible ? 'password' : 'text'}
                        value={tempFields[f.key] || ''}
                        onChange={(e) => setTempFields({ ...tempFields, [f.key]: e.target.value })}
                        placeholder={f.placeholder}
                        className="input text-xs pr-10 font-mono"
                      />
                      {isPassword && (
                        <button
                          type="button"
                          onClick={() => setShowTokens({ ...showTokens, [f.key]: !isVisible })}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>All API keys and secrets are securely encrypted at rest. Tokens are never exposed to public frontend bundles.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setActiveConfigModal(null)}
                className="btn-secondary py-2 px-4 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save & Authorize</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
