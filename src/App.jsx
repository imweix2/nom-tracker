import { useState, useCallback } from 'react'
import { Camera, Scale, BarChart2, Settings as SettingsIcon } from 'lucide-react'
import Setup from './components/Setup'
import AddFood from './components/AddFood'
import WeightModal from './components/WeightModal'
import { WeightChart, CalorieChart } from './components/Charts'
import SettingsPage from './components/Settings'
import {
  getProfile,
  getFoodLog,
  getFoodForDate,
  addFoodEntry,
  deleteFoodEntry,
  getWeightLog,
  logWeight,
  todayStr,
  formatDateLabel,
} from './lib/storage'

// ─── Main App ──────────────────────────────────────────────────────────────

export default function App() {
  const [profile, setProfile] = useState(getProfile())
  const [page, setPage] = useState('home') // home | stats | settings
  const [showAddFood, setShowAddFood] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [tick, setTick] = useState(0) // force re-render after storage writes

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  if (!profile.setupDone) {
    return (
      <Setup
        onDone={() => {
          setProfile(getProfile())
        }}
      />
    )
  }

  if (page === 'settings') {
    return (
      <SettingsPage
        onBack={() => {
          setProfile(getProfile())
          setPage('home')
        }}
      />
    )
  }

  return (
    <div className="min-h-dvh bg-[#0a0a0f] flex flex-col max-w-sm mx-auto">
      {page === 'home' && (
        <HomePage
          profile={profile}
          tick={tick}
          onAddFood={() => setShowAddFood(true)}
          onLogWeight={() => setShowWeightModal(true)}
          onSettings={() => setPage('settings')}
        />
      )}
      {page === 'stats' && (
        <StatsPage profile={profile} tick={tick} onBack={() => setPage('home')} />
      )}

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 flex z-20">
        <NavBtn icon={<Scale size={20} />} label="Today" active={page === 'home'} onClick={() => setPage('home')} />
        <NavBtn icon={<BarChart2 size={20} />} label="Stats" active={page === 'stats'} onClick={() => setPage('stats')} />
        <NavBtn icon={<SettingsIcon size={20} />} label="Settings" active={false} onClick={() => setPage('settings')} />
      </nav>

      {/* Modals */}
      {showAddFood && (
        <AddFood
          onSave={(entry) => {
            addFoodEntry(todayStr(), entry)
            refresh()
          }}
          onClose={() => setShowAddFood(false)}
        />
      )}
      {showWeightModal && (
        <WeightModal
          current={getWeightLog().find((e) => e.dateStr === todayStr())?.weight}
          onSave={(w) => {
            logWeight(todayStr(), w)
            refresh()
          }}
          onClose={() => setShowWeightModal(false)}
        />
      )}
    </div>
  )
}

// ─── Home page ─────────────────────────────────────────────────────────────

function HomePage({ profile, tick, onAddFood, onLogWeight, onSettings }) {
  const today = todayStr()
  const foods = getFoodForDate(today)
  const totalKcal = foods.reduce((s, e) => s + e.kcal, 0)
  const kcalLeft = profile.dailyCalorieGoal - totalKcal
  const weightLog = getWeightLog()
  const todayWeight = weightLog.find((e) => e.dateStr === today)
  const lastWeight = weightLog.length ? weightLog[weightLog.length - 1] : null
  const [, refresh] = useState(0)

  const bmi = todayWeight
    ? (todayWeight.weight / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
    : null

  function deleteEntry(id) {
    deleteFoodEntry(today, id)
    refresh((t) => t + 1)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4 scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-xs text-green-400 font-mono uppercase tracking-widest">
            {new Date().toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
          <p className="text-zinc-500 text-xs mt-0.5">Hey {profile.name} 👋</p>
        </div>
        <button onClick={onSettings} className="text-zinc-500 hover:text-white transition-colors">
          <SettingsIcon size={18} />
        </button>
      </div>

      {/* Calories card */}
      <div className="mx-5 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Calories left today</p>
        <p className={`text-6xl font-bold font-mono tracking-tight leading-none ${kcalLeft < 0 ? 'text-red-400' : 'text-green-400'}`}>
          {kcalLeft}
        </p>
        <p className="text-xs text-zinc-500 font-mono">
          {totalKcal} of {profile.dailyCalorieGoal} kcal eaten
        </p>

        {/* Calorie bar */}
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${kcalLeft < 0 ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${Math.min(100, (totalKcal / profile.dailyCalorieGoal) * 100)}%` }}
          />
        </div>

        {/* Weight pill */}
        <div className="flex items-center justify-between pt-1">
          <div>
            {lastWeight ? (
              <span className="text-xs text-zinc-400 font-mono">
                {lastWeight.weight} kg{' '}
                {lastWeight.weight < profile.goalWeight ? (
                  <span className="text-green-400">✓ Goal reached!</span>
                ) : (
                  <span className="text-zinc-600">→ {profile.goalWeight} kg goal</span>
                )}
              </span>
            ) : (
              <span className="text-xs text-zinc-600">No weight logged yet</span>
            )}
          </div>
          {bmi && (
            <span className="text-xs font-mono text-zinc-500">BMI {bmi}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onLogWeight}
            className="flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium rounded-xl py-2.5 transition-colors"
          >
            <Scale size={14} /> Log weight
          </button>
          <button
            onClick={onAddFood}
            className="flex items-center justify-center gap-1.5 bg-green-400 hover:bg-green-300 text-black text-xs font-semibold rounded-xl py-2.5 transition-colors"
          >
            <Camera size={14} /> Add food
          </button>
        </div>
      </div>

      {/* Today's food */}
      <div className="px-5 mt-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Today's food</p>
        {foods.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-8">
            No food logged yet. Tap <span className="text-green-400">Add food</span> to start.
          </p>
        ) : (
          <div className="space-y-2">
            {foods.map((entry) => (
              <FoodRow key={entry.id} entry={entry} onDelete={() => deleteEntry(entry.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FoodRow({ entry, onDelete }) {
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
      {entry.imageDataUrl ? (
        <img src={entry.imageDataUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-lg shrink-0">🍽️</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{entry.name}</p>
        <p className="text-xs text-zinc-500 font-mono">
          {new Date(entry.time).toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <span className="text-sm font-mono font-semibold text-green-400 shrink-0">{entry.kcal}</span>
      <button
        onClick={onDelete}
        className="text-zinc-600 hover:text-red-400 transition-colors text-lg ml-1"
        aria-label="Delete"
      >
        ×
      </button>
    </div>
  )
}

// ─── Stats page ────────────────────────────────────────────────────────────

function StatsPage({ profile, tick }) {
  const [weightRange, setWeightRange] = useState('week')
  const [calRange, setCalRange] = useState('week')
  const weightLog = getWeightLog()
  const foodLog = getFoodLog()

  // Summary
  const latest = weightLog.length ? weightLog[weightLog.length - 1] : null
  const first = weightLog.length ? weightLog[0] : null
  const totalLost = first && latest ? (first.weight - latest.weight).toFixed(1) : null

  return (
    <div className="flex-1 overflow-y-auto pb-4 px-5 scrollbar-hide">
      <div className="py-6">
        <p className="text-xs text-zinc-500 uppercase tracking-widest">Stats</p>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <Tile label="Current" value={latest ? `${latest.weight}kg` : '—'} />
        <Tile label="Goal" value={`${profile.goalWeight}kg`} />
        <Tile label="Lost" value={totalLost !== null && totalLost > 0 ? `-${totalLost}kg` : '—'} accent={totalLost > 0} />
      </div>

      {/* Weight chart */}
      <ChartCard title="Weight" range={weightRange} onRange={setWeightRange}>
        <WeightChart weightLog={weightLog} goalWeight={profile.goalWeight} range={weightRange} />
      </ChartCard>

      {/* Calorie chart */}
      <ChartCard title="Calories" range={calRange} onRange={setCalRange}>
        <CalorieChart foodLog={foodLog} goalKcal={profile.dailyCalorieGoal} range={calRange} />
      </ChartCard>

      {/* Weight log list */}
      <div className="mt-4">
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Weight log</p>
        {weightLog.length === 0 ? (
          <p className="text-zinc-600 text-sm text-center py-6">No weight entries yet.</p>
        ) : (
          <div className="space-y-2">
            {[...weightLog].reverse().slice(0, 14).map((e) => (
              <div key={e.dateStr} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
                <span className="text-sm text-zinc-400">{formatDateLabel(e.dateStr)}</span>
                <span className="text-sm font-mono font-semibold">{e.weight} kg</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, range, onRange, children }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-semibold text-sm uppercase tracking-widest">{title}</p>
        <div className="flex gap-1">
          {['week', 'month', 'all'].map((r) => (
            <button
              key={r}
              onClick={() => onRange(r)}
              className={`text-xs px-3 py-1 rounded-full transition-colors capitalize ${
                range === r ? 'bg-green-400 text-black font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {children}
    </div>
  )
}

function Tile({ label, value, accent }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-lg font-mono font-semibold ${accent ? 'text-green-400' : 'text-white'}`}>{value}</p>
    </div>
  )
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
        active ? 'text-green-400' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
