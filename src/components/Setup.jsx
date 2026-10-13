import { useState } from 'react'
import { saveProfile, saveApiKey } from '../lib/storage'

export default function Setup({ onDone }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: 'Ron',
    startWeight: 66,
    goalWeight: 62,
    heightCm: 165,
    dailyCalorieGoal: 1800,
  })
  const [apiKey, setApiKey] = useState('')

  function upd(k, v) {
    setForm((p) => ({ ...p, [k]: v }))
  }

  function finish() {
    saveProfile({ ...form, setupDone: true })
    if (apiKey.trim()) saveApiKey(apiKey.trim())
    onDone()
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="text-4xl font-bold tracking-tight text-white">
            nom<span className="text-green-400">.</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1 tracking-widest uppercase">Calorie & Weight Tracker</p>
        </div>

        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Let's set you up</h2>
            <Field label="Your name">
              <input className={input} value={form.name} onChange={(e) => upd('name', e.target.value)} placeholder="Ron" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (cm)">
                <input className={input} type="number" value={form.heightCm} onChange={(e) => upd('heightCm', +e.target.value)} />
              </Field>
              <Field label="Current weight (kg)">
                <input className={input} type="number" step="0.1" value={form.startWeight} onChange={(e) => upd('startWeight', +e.target.value)} />
              </Field>
              <Field label="Goal weight (kg)">
                <input className={input} type="number" step="0.1" value={form.goalWeight} onChange={(e) => upd('goalWeight', +e.target.value)} />
              </Field>
              <Field label="Daily kcal budget">
                <input className={input} type="number" value={form.dailyCalorieGoal} onChange={(e) => upd('dailyCalorieGoal', +e.target.value)} />
              </Field>
            </div>
            <button onClick={() => setStep(1)} className={btn}>Continue →</button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Add your Anthropic API key</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              This powers AI photo food recognition. Your key is stored only in your browser — never sent anywhere except Google's API.
            </p>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-medium text-zinc-300">How to get a free key:</p>
              <ol className="list-decimal list-inside text-zinc-400 space-y-1">
                <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-green-400 underline">aistudio.google.com</a></li>
                <li>Click <strong className="text-zinc-300">Get API key</strong> → Create key</li>
                <li>Copy and paste below</li>
              </ol>
              <p className="text-zinc-500 text-xs pt-1">Free tier: 1,500 requests/day — no credit card needed.</p>
            </div>
            <Field label="Google AI API Key">
              <input
                className={input}
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy…"
              />
            </Field>
            <button onClick={finish} className={btn}>
              {apiKey.trim() ? 'Save & Start →' : 'Skip for now →'}
            </button>
            <p className="text-xs text-zinc-600 text-center">
              You can add your key later in Settings.
            </p>
          </div>
        )}
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
  'w-full bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl py-3.5 text-sm transition-colors'
