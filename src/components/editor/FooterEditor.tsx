'use client'

import React, { useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Clock,
  ExternalLink,
  Layers,
  Columns3,
  Sparkles,
  Link2,
  Share2,
  Eye,
  Info
} from 'lucide-react'

export interface FooterLinkItem {
  id: string
  label: string
  href: string
}

export interface FooterData {
  brand_description: string
  facebook_url: string
  instagram_url: string
  youtube_url: string
  linkedin_url: string
  reach_phone: string
  reach_email: string
  reach_address: string
  reach_hours: string
  copyright_text: string
  bottom_tagline: string
  navigate_links: FooterLinkItem[]
  programs_links: FooterLinkItem[]
  account_links: FooterLinkItem[]
}

interface FooterEditorProps {
  data: FooterData
  onChange: (data: FooterData) => void
}

export default function FooterEditor({ data, onChange }: FooterEditorProps) {
  const [activeTab, setActiveTab] = useState<'columns' | 'preview'>('columns')

  const updateField = <K extends keyof FooterData>(key: K, value: FooterData[K]) => {
    onChange({
      ...data,
      [key]: value,
    })
  }

  // Column link helpers
  const handleAddLink = (columnKey: 'navigate_links' | 'programs_links' | 'account_links') => {
    const newLink: FooterLinkItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: 'New Link',
      href: '/',
    }
    updateField(columnKey, [...data[columnKey], newLink])
  }

  const handleUpdateLink = (
    columnKey: 'navigate_links' | 'programs_links' | 'account_links',
    index: number,
    field: 'label' | 'href',
    val: string
  ) => {
    const updated = [...data[columnKey]]
    updated[index] = { ...updated[index], [field]: val }
    updateField(columnKey, updated)
  }

  const handleDeleteLink = (
    columnKey: 'navigate_links' | 'programs_links' | 'account_links',
    index: number
  ) => {
    const updated = data[columnKey].filter((_, i) => i !== index)
    updateField(columnKey, updated)
  }

  const handleMoveLink = (
    columnKey: 'navigate_links' | 'programs_links' | 'account_links',
    index: number,
    direction: 'up' | 'down'
  ) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= data[columnKey].length) return
    const updated = [...data[columnKey]]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIdx, 0, moved)
    updateField(columnKey, updated)
  }

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Columns3 className="w-5 h-5 text-[#1748BB]" />
            Footer Layout &amp; Content Editor
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure the 5 columns, contact reach us details, and bottom copyright row.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('columns')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'columns'
                ? 'bg-white text-[#1748BB] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Column &amp; Content Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-[#1748BB] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {activeTab === 'columns' ? (
        <div className="space-y-8">
          {/* ── ROW 1: THE 5 FOOTER COLUMNS ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1748BB]" />
                Row 1: The 5 Navigation &amp; Info Columns
              </span>
              <span className="text-xs text-gray-400">Matches website footer grid</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {/* ── COLUMN 1: Brand & Socials ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#1748BB] font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">Column 1: Brand &amp; Bio</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">
                        Brand Tagline / Description
                      </label>
                      <textarea
                        rows={3}
                        value={data.brand_description}
                        onChange={(e) => updateField('brand_description', e.target.value)}
                        placeholder="Graphic Design · Video Editing..."
                        className="input text-xs"
                      />
                    </div>

                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Share2 className="w-3 h-3 text-gray-400" />
                        Social Media Links
                      </span>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Facebook URL</label>
                        <input
                          type="url"
                          value={data.facebook_url}
                          onChange={(e) => updateField('facebook_url', e.target.value)}
                          className="input text-xs"
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Instagram URL</label>
                        <input
                          type="url"
                          value={data.instagram_url}
                          onChange={(e) => updateField('instagram_url', e.target.value)}
                          className="input text-xs"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">YouTube URL</label>
                        <input
                          type="url"
                          value={data.youtube_url}
                          onChange={(e) => updateField('youtube_url', e.target.value)}
                          className="input text-xs"
                          placeholder="https://youtube.com/..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">LinkedIn URL</label>
                        <input
                          type="url"
                          value={data.linkedin_url}
                          onChange={(e) => updateField('linkedin_url', e.target.value)}
                          className="input text-xs"
                          placeholder="https://linkedin.com/..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── COLUMN 2: Navigate ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#1748BB] font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">Column 2: Navigate</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink('navigate_links')}
                    className="text-xs text-[#1748BB] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Link
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {data.navigate_links.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            handleUpdateLink('navigate_links', idx, 'label', e.target.value)
                          }
                          className="input text-xs py-1 font-semibold text-gray-800"
                          placeholder="Link Label"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveLink('navigate_links', idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink('navigate_links', idx, 'down')}
                            disabled={idx === data.navigate_links.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink('navigate_links', idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) =>
                          handleUpdateLink('navigate_links', idx, 'href', e.target.value)
                        }
                        className="input text-[11px] py-1 text-gray-500"
                        placeholder="/path or https://"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── COLUMN 3: Programs ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#1748BB] font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">Column 3: Programs</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink('programs_links')}
                    className="text-xs text-[#1748BB] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Link
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {data.programs_links.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            handleUpdateLink('programs_links', idx, 'label', e.target.value)
                          }
                          className="input text-xs py-1 font-semibold text-gray-800"
                          placeholder="Program Name"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveLink('programs_links', idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink('programs_links', idx, 'down')}
                            disabled={idx === data.programs_links.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink('programs_links', idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) =>
                          handleUpdateLink('programs_links', idx, 'href', e.target.value)
                        }
                        className="input text-[11px] py-1 text-gray-500"
                        placeholder="/programs/..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── COLUMN 4: Account ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#1748BB] font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">Column 4: Account</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddLink('account_links')}
                    className="text-xs text-[#1748BB] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Link
                  </button>
                </div>

                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {data.account_links.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 hover:bg-white hover:border-gray-200 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={link.label}
                          onChange={(e) =>
                            handleUpdateLink('account_links', idx, 'label', e.target.value)
                          }
                          className="input text-xs py-1 font-semibold text-gray-800"
                          placeholder="Action Label"
                        />
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveLink('account_links', idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLink('account_links', idx, 'down')}
                            disabled={idx === data.account_links.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLink('account_links', idx)}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={link.href}
                        onChange={(e) =>
                          handleUpdateLink('account_links', idx, 'href', e.target.value)
                        }
                        className="input text-[11px] py-1 text-gray-500"
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* ── COLUMN 5: Reach Us (Image 3 Reference) ── */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-50 text-[#1748BB] font-bold text-xs flex items-center justify-center">
                      5
                    </span>
                    <h3 className="font-bold text-gray-900 text-sm">
                      Column 5: Reach Us (3rd Image Reference)
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-[#1748BB] bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Contact &amp; Hours
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#1748BB]" />
                      Official Phone Number
                    </label>
                    <input
                      type="text"
                      value={data.reach_phone}
                      onChange={(e) => updateField('reach_phone', e.target.value)}
                      placeholder="+91 93428 96977"
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#1748BB]" />
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={data.reach_email}
                      onChange={(e) => updateField('reach_email', e.target.value)}
                      placeholder="valavanacademy@gmail.com"
                      className="input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1748BB]" />
                      Physical Address (Shown in 3 lines on Footer)
                    </label>
                    <textarea
                      rows={2}
                      value={data.reach_address}
                      onChange={(e) => updateField('reach_address', e.target.value)}
                      placeholder="SF No 157/3, Mandabam Street, Salaipettai, Pernambut Taluk, Vellore Dist - 635810"
                      className="input text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 block mb-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1748BB]" />
                      Working Hours Display
                    </label>
                    <input
                      type="text"
                      value={data.reach_hours}
                      onChange={(e) => updateField('reach_hours', e.target.value)}
                      placeholder="Mon–Sat · 9am–7pm IST"
                      className="input text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── ROW 2: BOTTOM COPYRIGHT BAR ── */}
          <div className="space-y-4">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1748BB]" />
              Row 2: Bottom Copyright Bar
            </span>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Copyright Notice
                </label>
                <input
                  type="text"
                  value={data.copyright_text}
                  onChange={(e) => updateField('copyright_text', e.target.value)}
                  placeholder="© 2026 Valavan Academy. All rights reserved."
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Bottom Right Tagline
                </label>
                <input
                  type="text"
                  value={data.bottom_tagline}
                  onChange={(e) => updateField('bottom_tagline', e.target.value)}
                  placeholder="Tamil-first Creative Learning Academy"
                  className="input text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── LIVE PREVIEW MODE ── */
        <div className="bg-[#0D0F14] text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10 space-y-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <span className="text-xs font-bold tracking-widest text-white/50 uppercase">
              Live Preview of Website Footer
            </span>
            <span className="text-xs text-[#1748BB] font-semibold bg-[#1748BB]/10 px-3 py-1 rounded-full border border-[#1748BB]/20">
              Matches valavanacademy.com
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Col 1 */}
            <div className="space-y-4">
              <div className="font-bold text-lg text-white">Valavan Academy</div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
                {data.brand_description || 'Graphic Design · Video Editing · Digital Skills...'}
              </p>
              <div className="flex gap-2 text-xs text-neutral-400">
                {data.facebook_url && <span className="hover:text-white">FB</span>}
                {data.instagram_url && <span className="hover:text-white">IG</span>}
                {data.youtube_url && <span className="hover:text-white">YT</span>}
                {data.linkedin_url && <span className="hover:text-white">IN</span>}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-xs uppercase tracking-wider">Navigate</p>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {data.navigate_links.map((link) => (
                  <li key={link.id || link.label} className="hover:text-white">
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-xs uppercase tracking-wider">Programs</p>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {data.programs_links.map((link) => (
                  <li key={link.id || link.label} className="hover:text-white">
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-xs uppercase tracking-wider">Account</p>
              <ul className="space-y-1.5 text-xs text-neutral-400">
                {data.account_links.map((link) => (
                  <li key={link.id || link.label} className="hover:text-white">
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 5 */}
            <div className="space-y-3">
              <p className="font-semibold text-white text-xs uppercase tracking-wider">Reach Us</p>
              <div className="space-y-2 text-xs text-neutral-300">
                <p className="text-white font-medium">{data.reach_phone || '+91 93428 96977'}</p>
                <p className="break-all">{data.reach_email || 'valavanacademy@gmail.com'}</p>
                <p className="text-neutral-400 leading-relaxed text-[11px]">
                  {data.reach_address || 'SF No 157/3, Mandabam Street...'}
                </p>
                <p className="text-neutral-500 text-[10px] pt-1">
                  {data.reach_hours || 'Mon–Sat · 9am–7pm IST'}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500 gap-2">
            <p>{data.copyright_text || '© 2026 Valavan Academy. All rights reserved.'}</p>
            <p>{data.bottom_tagline || 'Tamil-first Creative Learning Academy'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
