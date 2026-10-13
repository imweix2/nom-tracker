// ─── Storage helpers ───────────────────────────────────────────────────────

const KEYS = {
  PROFILE: 'nom_profile',
  FOOD_LOG: 'nom_food_log',
  WEIGHT_LOG: 'nom_weight_log',
  API_KEY: 'nom_api_key',
}

function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Storage write failed:', e)
  }
}

// ─── Profile ───────────────────────────────────────────────────────────────

export function getProfile() {
  return get(KEYS.PROFILE, {
    name: '',
    startWeight: 66,
    goalWeight: 62,
    heightCm: 165,
    dailyCalorieGoal: 1800,
    setupDone: false,
  })
}

export function saveProfile(profile) {
  set(KEYS.PROFILE, profile)
}

// ─── API Key ───────────────────────────────────────────────────────────────

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key)
}

// ─── Food log ──────────────────────────────────────────────────────────────
// Structure: { [dateStr]: [ { id, name, kcal, imageDataUrl?, time } ] }

export function getFoodLog() {
  return get(KEYS.FOOD_LOG, {})
}

export function getFoodForDate(dateStr) {
  const log = getFoodLog()
  return log[dateStr] || []
}

export function addFoodEntry(dateStr, entry) {
  const log = getFoodLog()
  if (!log[dateStr]) log[dateStr] = []
  log[dateStr].unshift({ ...entry, id: crypto.randomUUID(), time: Date.now() })
  set(KEYS.FOOD_LOG, log)
}

export function deleteFoodEntry(dateStr, id) {
  const log = getFoodLog()
  if (log[dateStr]) {
    log[dateStr] = log[dateStr].filter((e) => e.id !== id)
  }
  set(KEYS.FOOD_LOG, log)
}

export function updateFoodEntry(dateStr, id, updates) {
  const log = getFoodLog()
  if (log[dateStr]) {
    log[dateStr] = log[dateStr].map((e) => (e.id === id ? { ...e, ...updates } : e))
  }
  set(KEYS.FOOD_LOG, log)
}

// ─── Weight log ────────────────────────────────────────────────────────────
// Structure: [ { dateStr, weight } ]

export function getWeightLog() {
  return get(KEYS.WEIGHT_LOG, [])
}

export function logWeight(dateStr, weight) {
  const log = getWeightLog()
  const idx = log.findIndex((e) => e.dateStr === dateStr)
  if (idx >= 0) {
    log[idx].weight = weight
  } else {
    log.push({ dateStr, weight })
    log.sort((a, b) => a.dateStr.localeCompare(b.dateStr))
  }
  set(KEYS.WEIGHT_LOG, log)
}

export function deleteWeightEntry(dateStr) {
  const log = getWeightLog().filter((e) => e.dateStr !== dateStr)
  set(KEYS.WEIGHT_LOG, log)
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateLabel(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-SG', {
    day: 'numeric',
    month: 'short',
  })
}
