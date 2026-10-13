import { useState } from 'react'
import { ArrowLeft, Eye, EyeOff, Save } from 'lucide-react'
import { getProfile, saveProfile, getApiKey, saveApiKey } from '../lib/storage'

export default function Settings({ onBack }) {
  const [profile, setProfile] = useState(getProfile())
  const [apiKey, setApiKey] = useState(getApiKey())
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  function upd(k, v) {
    setProfile((p) => ({ ...p, [k]: v }))
  }

  function save() {
    saveProfile(profile)
    saveApiKey(apiKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] max-w-sm mx-auto px-5 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 py-5 sticky top-0 bg-[#0a0a0f] z-10">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-sm uppercase tracking-widest">Settings</span>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Section title="Profile">
          <Field label="Name">
            <input className={input} value={profile.name} onChange={(e) => upd('name', e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)">
              <input className={input} type="number" value={profile.heightCm} onChange={(e) => upd('heightCm', +e.target.value)} />
            </Field>
            <Field label="Daily kcal goal">
              <input className={input} type="number" value={profile.dailyCalorieGoal} onChange={(e) => upd('dailyCalorieGoal', +e.target.value)} />
            </Field>
            <Field label="Start weight (kg)">
              <input className={input} type="number" step="0.1" value={profile.startWeight} onChange={(e) => upd('startWeight', +e.target.value)} />
            </Field>
            <Field label="Goal weight (kg)">
              <input className={input} type="number" step="0.1" value={profile.goalWeight} onChange={(e) => upd('goalWeight', +e.target.value)} />
            </Field>
          </div>
        </Section>

        {/* API key */}
        <Section title="Anthropic API Key">
          <p className="text-xs text-zinc-500 leading-relaxed">
            Required for AI photo food recognition. Stored only in your browser.{' '}
            <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="text-green-400 underline">
              Get a key →
            </a>
          </p>
          <div className="relative">
            <input
              className={input + ' pr-10'}
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-api03-…"
            />
            <button
              onClick={() => setShowKey((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Section>

        <button
          onClick={save}
          className="w-full flex items-center justify-center gap-2 bg-green-400 hover:bg-green-300 text-black font-semibold rounded-xl py-3.5 text-sm transition-colors"
        >
          {saved ? '✓ Saved!' : <><Save size={16} /> Save settings</>}
        </button>

        {/* Data info */}
        <Section title="Data">
          <p className="text-xs text-zinc-500 leading-relaxed">
            All data is stored locally in your browser. Nothing is sent to any server except Anthropic's API when you analyse a photo.
          </p>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500 uppercase tracking-widest">{title}</p>
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-3">
        {children}
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
  'w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors'
