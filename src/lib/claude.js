// ─── Gemini Vision — food photo analysis ────────────────────────────────────
// Uses Google Gemini Flash (free tier: 1,500 req/day, 15 req/min).
// Get a free key at https://aistudio.google.com → "Get API key"
// No backend required — calls Gemini directly from the browser.

export async function analyseFoodPhoto(imageDataUrl, apiKey) {
  if (!apiKey) {
    throw new Error('NO_API_KEY')
  }

  // Convert data URL to base64 + media type
  const [header, base64] = imageDataUrl.split(',')
  const mediaType = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg'

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: mediaType,
              data: base64,
            },
          },
          {
            text: `You are a nutrition assistant. Look at this food photo and estimate:
1. What the food is (short name, max 40 chars)
2. Estimated calories (kcal) for what's visible

Respond ONLY with valid JSON in this exact shape:
{"name":"<food name>","kcal":<number>,"note":"<1 sentence about portion or accuracy>"}

Be practical and concise. If you cannot identify food, return:
{"name":"Unknown food","kcal":0,"note":"Could not identify food in photo."}`,
          },
        ],
      },
    ],
    generationConfig: {
      maxOutputTokens: 256,
      temperature: 0.2,
    },
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON (Gemini sometimes wraps in markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Unexpected response format from Gemini')

  return JSON.parse(jsonMatch[0])
}
