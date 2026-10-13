# nom. — Calorie & Weight Tracker

A personal calorie and weight tracker with **AI photo food logging**, built with React + Vite. Host it yourself on GitHub Pages for free.

<img width="300" alt="nom tracker screenshot" src="https://placehold.co/300x600/0a0a0f/4ade80?text=nom." />

## Features

- 📸 **Photo food logging** — take or upload a photo, Claude AI estimates the calories
- ✏️ Manual food entry fallback
- ⚖️ Daily weight logging
- 📊 Weight & calorie charts (week / month / all time)
- 🎯 Goal tracking with BMI
- 💾 All data stored locally in your browser — no backend, no account needed

---

## Quick start (local)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/nom-tracker.git
cd nom-tracker

# 2. Install dependencies
npm install

# 3. Run locally
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Getting your Anthropic API key

Photo recognition uses Claude's vision API. To enable it:

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in → **API Keys** → **Create key**
3. Copy the key (starts with `sk-ant-…`)
4. Paste it in the app under **Settings → API Key**

Your key is stored only in your browser's localStorage. It is never sent anywhere except Anthropic's API when you analyse a food photo.

> **Cost:** Claude's API has a free tier with $5 credit. Each photo analysis costs roughly $0.001–0.003, so the free tier covers thousands of photos.

---

## Deploy to GitHub Pages

```bash
# 1. Set your repo as the base in vite.config.js if needed:
#    base: '/nom-tracker/'  ← add this if your repo name isn't the domain root

# 2. Install gh-pages (already in devDependencies)
npm install

# 3. Deploy
npm run deploy
```

Your app will be live at `https://YOUR_USERNAME.github.io/nom-tracker/`

> One-time setup: in your GitHub repo → Settings → Pages → Source: `gh-pages` branch.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| AI | Anthropic Claude API (vision) |
| Storage | Browser localStorage |
| Deploy | GitHub Pages |

---

## Data & privacy

- All data lives in your browser's `localStorage` — nothing is stored on any server
- Food photos are sent to Anthropic's API only when you tap "Analyse photo" — they are not stored by Anthropic beyond the API call
- Your API key is stored in `localStorage` under the key `nom_api_key`

---

## Customising your defaults

Edit `src/lib/storage.js` → `getProfile()` to change default values:

```js
return get(KEYS.PROFILE, {
  name: 'Ron',
  startWeight: 66,
  goalWeight: 62,
  heightCm: 165,
  dailyCalorieGoal: 1800,
  setupDone: false,
})
```

Or just change them in the app's **Settings** page after first launch.

---

Made with ☕ and [Claude Code](https://claude.ai/claude-code)
