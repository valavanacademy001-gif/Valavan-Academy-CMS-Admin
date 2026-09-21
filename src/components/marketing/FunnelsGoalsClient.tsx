'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Target, ArrowDown, Users, CheckCircle2, TrendingUp,
  Plus, Sparkles, MessageCircle, ShoppingBag, Eye,
  Trash2, X, RefreshCw, Layers, ShieldCheck, Zap
} from 'lucide-react'

export interface ConversionGoal {
  id: string
  name: string
  trigger_type: 'url_contains' | 'exact_url' | 'whatsapp_click' | 'form_submit' | 'event_name'
  trigger_value: string
  is_active: boolean
  completions_count: number
}

export default function FunnelsGoalsClient({ initialGoals }: { initialGoals: ConversionGoal[] }) {
  const [goals, setGoals] = useState<ConversionGoal[]>(initialGoals)
  const [showAddGoalModal, setShowAddGoalModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [newGoal, setNewGoal] = useState<Partial<ConversionGoal>>({
    name: '',
    trigger_type: 'url_contains',
    trigger_value: '',
    is_active: true,
    completions_count: 0,
  })

  const persistGoals = async (updatedList: ConversionGoal[]) => {
    setIsSaving(true)
    const supabase = createClient()
    try {
      const { data: page } = await supabase.from('pages').select('id').eq('slug', 'global_settings').single()
      if (!page) throw new Error('Global page not found')
      const { data: sec } = await supabase.from('sections').select('id').eq('page_id', page.id).eq('slug', 'tracking_analytics').single()
      if (!sec) throw new Error('Tracking section not found')

      const { data: field } = await supabase.from('fields').select('id').eq('section_id', sec.id).eq('name', 'conversion_goals_data').single()
      if (!field) throw new Error('conversion_goals_data field not found')

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
      toast.error(`Sync error: ${e.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleGoal = async (id: string) => {
    const updated = goals.map((g) => (g.id === id ? { ...g, is_active: !g.is_active } : g))
    setGoals(updated)
    await persistGoals(updated)
    toast.success('Goal updated!')
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversion goal?')) return
    const updated = goals.filter((g) => g.id !== id)
    setGoals(updated)
    await persistGoals(updated)
    toast.success('Goal removed!')
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoal.name || !newGoal.trigger_value) {
      toast.error('Please enter Goal Name and Trigger Value')
      return
    }

    const created: ConversionGoal = {
      id: `goal-${Date.now()}`,
      name: newGoal.name || '',
      trigger_type: newGoal.trigger_type || 'url_contains',
      trigger_value: newGoal.trigger_value || '',
      is_active: true,
      completions_count: 0,
    }

    const updated = [created, ...goals]
    setGoals(updated)
    setShowAddGoalModal(false)
    setNewGoal({
      name: '',
      trigger_type: 'url_contains',
      trigger_value: '',
      is_active: true,
      completions_count: 0,
    })
    await persistGoals(updated)
    toast.success('✓ Conversion goal created!')
  }

  // Funnel Stages Data - Dynamic based on actual tracked events (defaults to 0 if no events tracked)
  const hasFunnelData = false // Toggle true when telemetry pipeline logs funnel stages
  const funnelSteps = [
    {
      step: 1,
      title: 'Landing Page Views',
      count: 0,
      rate: '0%',
      dropoff: '—',
      color: 'from-blue-600 to-indigo-600',
      icon: Eye,
    },
    {
      step: 2,
      title: 'Lead Form & Curriculum Interactions',
      count: 0,
      rate: '0%',
      dropoff: '—',
      color: 'from-indigo-600 to-purple-600',
      icon: Users,
    },
    {
      step: 3,
      title: 'WhatsApp & Inquiry CTA Clicks',
      count: 0,
      rate: '0%',
      dropoff: '—',
      color: 'from-purple-600 to-pink-600',
      icon: MessageCircle,
    },
    {
      step: 4,
      title: 'Enrollment Checkout / Form Page',
      count: 0,
      rate: '0%',
      dropoff: '—',
      color: 'from-pink-600 to-amber-600',
      icon: Layers,
    },
    {
      step: 5,
      title: 'Final Student Enrollment / Purchase',
      count: 0,
      rate: '0%',
      dropoff: '—',
      color: 'from-amber-600 to-emerald-600',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1748BB] text-white flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Funnel Analytics & Conversion Goals</h1>
              <p className="text-xs text-gray-500">
                Visual conversion drop-off stages and custom goal triggers across all user journeys.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddGoalModal(true)}
          className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Conversion Goal</span>
        </button>
      </div>

      {/* MODULE 7: VISUAL CONVERSION FUNNEL */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Student Acquisition Funnel</h3>
            <p className="text-xs text-gray-400">Step conversion percentage and drop-off rate from first visit to enrolled student</p>
          </div>
          <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200">
            Overall Funnel CR: 0.00%
          </span>
        </div>

        {/* Funnel Visual Stack or Empty State */}
        {hasFunnelData ? (
          <div className="space-y-3 max-w-4xl mx-auto py-2">
            {funnelSteps.map((s, index) => {
              const Icon = s.icon
              const widthPct = Math.max(28, 100 - index * 16)
              return (
                <div key={s.step} className="flex flex-col items-center">
                  <div
                    className={`w-full rounded-2xl p-4 bg-gradient-to-r ${s.color} text-white shadow-md transition-all duration-300 hover:scale-[1.01]`}
                    style={{ maxWidth: `${widthPct}%` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xs shrink-0 backdrop-blur-xs">
                          {s.step}
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 opacity-80" />
                            <span>{s.title}</span>
                          </div>
                          <span className="text-[11px] text-white/70">
                            {s.count.toLocaleString()} visitors
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-white">{s.rate}</div>
                        {s.dropoff !== '—' && (
                          <div className="text-[10px] text-red-200 font-semibold">{s.dropoff} drop-off</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < funnelSteps.length - 1 && (
                    <div className="py-1 text-gray-300">
                      <ArrowDown className="w-4 h-4 animate-bounce" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-12 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1748BB] flex items-center justify-center mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">No Funnel Conversion Data Yet</h4>
            <p className="text-xs text-gray-500 max-w-md mt-1 mb-4">
              Funnel conversion drop-off stages will automatically be calculated as visitors progress from landing pages to form inquiries and enrollments.
            </p>
          </div>
        )}
      </div>

      {/* MODULE 8: CONVERSION GOALS MANAGEMENT */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900">Custom Conversion Goals</h3>
            <p className="text-xs text-gray-400">Trigger custom conversions based on URL parameters or user actions</p>
          </div>
        </div>

        {goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g) => (
              <div
                key={g.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  g.is_active
                    ? 'bg-white border-blue-200 shadow-2xs hover:border-blue-300'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1748BB] flex items-center justify-center font-bold text-xs shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{g.name}</h4>
                      <span className="text-[10px] font-mono text-gray-400 uppercase">
                        Type: {g.trigger_type}
                      </span>
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleGoal(g.id)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      g.is_active ? 'bg-[#1748BB]' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      g.is_active ? 'translate-x-4.5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-[11px] font-mono text-gray-600 truncate">
                  Trigger: <span className="text-[#1748BB] font-semibold">{g.trigger_value}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-gray-500 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>{g.completions_count}</strong> completions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteGoal(g.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Delete Goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
            <p className="text-xs">No custom conversion goals created yet.</p>
            <button
              type="button"
              onClick={() => setShowAddGoalModal(true)}
              className="mt-2 text-xs text-[#1748BB] font-bold hover:underline"
            >
              + Create your first conversion goal
            </button>
          </div>
        )}
      </div>

      {/* CREATE GOAL MODAL */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateGoal} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">Create Conversion Goal</h3>
              <button type="button" onClick={() => setShowAddGoalModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Goal Name *</label>
              <input
                type="text"
                required
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                placeholder="e.g. Workshop Registration Success"
                className="input text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Trigger Condition Type</label>
              <select
                value={newGoal.trigger_type}
                onChange={(e) => setNewGoal({ ...newGoal, trigger_type: e.target.value as any })}
                className="input text-xs"
              >
                <option value="url_contains">Page URL Contains (e.g. thank-you)</option>
                <option value="exact_url">Exact Page URL (e.g. /registration-success)</option>
                <option value="whatsapp_click">WhatsApp CTA Button Click</option>
                <option value="form_submit">Form Submission Event</option>
                <option value="event_name">Custom Event Name</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">Trigger Value / URL Pattern *</label>
              <input
                type="text"
                required
                value={newGoal.trigger_value}
                onChange={(e) => setNewGoal({ ...newGoal, trigger_value: e.target.value })}
                placeholder="e.g. /registration-success or contact_form_submit"
                className="input text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setShowAddGoalModal(false)} className="btn-secondary py-2 px-4 text-xs font-semibold">
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2 px-5 text-xs font-bold">
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
