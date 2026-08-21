'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { useState } from 'react'

export default function DeleteConfirmModal({
  title,
  description,
  onCancel,
  onConfirm,
}: {
  title: string
  description: string
  onCancel: () => void
  onConfirm: () => void | Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onCancel} className="btn-secondary">Cancel</button>
          <button onClick={handleConfirm} disabled={loading} className="btn-danger">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
