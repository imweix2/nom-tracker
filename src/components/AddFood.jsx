import { useRef, useState } from 'react'
import { Camera, ImageIcon, PenLine, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { analyseFoodPhoto } from '../lib/claude'
import { getApiKey } from '../lib/storage'

export default function AddFood({ onSave, onClose }) {
  const [mode, setMode] = useState('pick') // pick | preview | manual | confirm
  const [imageDataUrl, setImageDataUrl] = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [error, setError] = useState(null)
  const [draft, setDraft] = useState({ name: '', kcal: '', note: '' })
  const fileRef = useRef()
  const cameraRef = useRef()

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImageDataUrl(ev.target.result)
      setMode('preview')
    }
    reader.readAsDataURL(file)
  }

  async function analyse() {
    setAnalysing(true)
    setError(null)
    try {
      const apiKey = getApiKey()
      const result = await analyseFoodPhoto(imageDataUrl, apiKey)
      setDraft({ name: result.name, kcal: String(result.kcal), note: result.note || '' })
      setMode('confirm')
    } catch (err) {
      if (err.message === 'NO_API_KEY') {
        setError('No API key found. Add one in Settings to use photo recognition.')
      } else {
        setError(`Analysis failed: ${err.message}`)
      }
      // fall through to manual
      setDraft((p) => ({ ...p, name: '', kcal: '' }))
      setMode('confirm')
    } finally {
      setAnalysing(false)
    }
  }

  function save() {
    const kcal = parseInt(draft.kcal, 10)
    if (!draft.name.trim() || isNaN(kcal) || kcal < 0) return
    onSave({ name: draft.name.trim(), kcal, imageDataUrl, note: draft.note })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <span className="font-semibold tracking-wide uppercase text-sm">Add Food</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Pick mode */}
          {mode === 'pick' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => cameraRef.current.click()}
                  className="flex flex-col items-center gap-2 bg-green-400 hover:bg-green-300 text-black rounded-xl py-5 transition-colors font-semibold text-sm"
                >
                  <Camera size={24} />
                  Take photo
                </button>
                <button
                  onClick={() => fileRef.current.click()}
                  className="flex flex-col items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl py-5 transition-colors font-semibold text-sm"
                >
                  <ImageIcon size={24} />
                  Library
                </button>
              </div>
              <button
                onClick={() => setMode('manual')}
                className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-white text-sm py-2 transition-colors"
              >
                <PenLine size={16} /> Enter manually
              </button>
              <p className="text-xs text-zinc-600 text-center">
                Photo estimates are approximate — you confirm before saving.
              </p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
            </>
          )}

          {/* Preview mode */}
          {mode === 'preview' && (
            <>
              <img src={imageDataUrl} alt="food" className="w-full h-48 object-cover rounded-xl" />
              {analysing ? (
                <div className="flex items-center justify-center gap-2 py-4 text-zinc-400 text-sm">
                  <Loader2 size={18} className="animate-spin" />
                  Analysing with Claude…
                </div>
              ) : (
                <button onClick={analyse} className={btn}>
                  Analyse photo →
                </button>
              )}
              <button onClick={() => setMode('pick')} className="w-full text-zinc-500 hover:text-white text-sm py-1 transition-colors">
                ← Pick different photo
              </button>
            </>
          )}

          {/* Manual entry */}
          {mode === 'manual' && (
            <>
              <Field label="Food name">
                <input
                  className={input}
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Chicken rice"
                  autoFocus
                />
              </Field>
              <Field label="Calories (kcal)">
                <input
                  className={input}
                  type="number"
                  value={draft.kcal}
                  onChange={(e) => setDraft((p) => ({ ...p, kcal: e.target.value }))}
                  placeholder="e.g. 450"
                />
              </Field>
              <button onClick={save} className={btn}>
                <Check size={16} /> Save entry
              </button>
            </>
          )}

          {/* Confirm AI result */}
          {mode === 'confirm' && (
            <>
              {imageDataUrl && (
                <img src={imageDataUrl} alt="food" className="w-full h-32 object-cover rounded-xl" />
              )}
              {error && (
                <div className="flex gap-2 text-amber-400 text-xs bg-amber-400/10 rounded-lg p-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {draft.note && !error && (
                <p className="text-xs text-zinc-500">{draft.note}</p>
              )}
              <Field label="Food name">
                <input
                  className={input}
                  value={draft.name}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Food name"
                />
              </Field>
              <Field label="Kcal / portion">
                <input
                  className={input}
                  type="number"
                  value={draft.kcal}
                  onChange={(e) => setDraft((p) => ({ ...p, kcal: e.target.value }))}
                  placeholder="0"
                />
              </Field>
              <button onClick={save} disabled={!draft.name || !draft.kcal} className={btn + ' disabled:opacity-40'}>
                <Check size={16} /> Save entry
              </button>
              <button onClick={() => setMode('pick')} className="w-full text-zinc-500 hover:text-white text-sm py-1 transition-colors">
                ← Start over
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-zinc-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  )
}

const input =
  'w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors'

const btn =
  'w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl py-3.5 text-sm transition-colors'
