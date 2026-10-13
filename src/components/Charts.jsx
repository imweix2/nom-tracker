import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { formatDateLabel } from '../lib/storage'

const TOOLTIP_STYLE = {
  contentStyle: {
    background: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: 10,
    fontSize: 12,
    color: '#e4e4e7',
  },
  labelStyle: { color: '#71717a' },
}

export function WeightChart({ weightLog, goalWeight, range }) {
  const data = buildWeightData(weightLog, range)
  if (!data.length) return <EmptyChart />

  const min = Math.min(...data.map((d) => d.weight), goalWeight) - 1
  const max = Math.max(...data.map((d) => d.weight)) + 1

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="label" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis domain={[min, max]} tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v} kg`, 'Weight']} />
        <ReferenceLine y={goalWeight} stroke="#4ade8055" strokeDasharray="4 4" />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="#4ade80"
          strokeWidth={2}
          dot={{ fill: '#4ade80', strokeWidth: 0, r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function CalorieChart({ foodLog, goalKcal, range }) {
  const data = buildCalorieData(foodLog, range)
  if (!data.length) return <EmptyChart />

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="label" tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#52525b', fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
        <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`${v} kcal`, 'Eaten']} />
        <ReferenceLine y={goalKcal} stroke="#facc1555" strokeDasharray="4 4" />
        <Bar dataKey="kcal" fill="#4ade80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildWeightData(weightLog, range) {
  const sorted = [...weightLog].sort((a, b) => a.dateStr.localeCompare(b.dateStr))
  const sliced = range === 'week' ? sorted.slice(-7) : range === 'month' ? sorted.slice(-30) : sorted
  return sliced.map((e) => ({ label: formatDateLabel(e.dateStr), weight: e.weight, dateStr: e.dateStr }))
}

function buildCalorieData(foodLog, range) {
  const keys = Object.keys(foodLog).sort()
  const sliced = range === 'week' ? keys.slice(-7) : range === 'month' ? keys.slice(-30) : keys
  return sliced.map((dateStr) => ({
    label: formatDateLabel(dateStr),
    kcal: foodLog[dateStr]?.reduce((s, e) => s + e.kcal, 0) || 0,
    dateStr,
  }))
}

function EmptyChart() {
  return (
    <div className="h-[180px] flex items-center justify-center text-zinc-600 text-sm">
      No data yet
    </div>
  )
}
