import { useState } from 'react'
import { X, Check } from 'lucide-react'

export default function WeightModal({ current, onSave, onClose }) {
  const [val, setVal] = useState(current ? String(current) : '')

  function save() {
    const w = parseFloat(val)
    if (isNaN(w) || w < 30 || w > 300) return
    onSave(w)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <span className="font-semibold tracking-wide uppercase text-sm">Log Weight</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-widest">Today's weight (kg)</label>
            <input
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-2xl text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors text-center font-mono"
              type="number"
              step="0.1"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
              placeholder="65.0"
            />
          </div>
          <button
            onClick={save}
            disabled={!val}
            className="w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl py-3.5 text-sm transition-colors disabled:opacity-40"
          >
            <Check size={16} /> Save weight
          </button>
        </div>
      </div>
    </div>
  )
}
