// ─── Gemini Vision — food photo analysis ────────────────────────────────────
// Uses Google Gemini Flash (free tier: 1,500 req/day, 15 req/min).

export async function analyseFoodPhoto(imageDataUrl, apiKey) {
  if (!apiKey) throw new Error('NO_API_KEY')

  const [header, base64] = imageDataUrl.split(',')
  const mediaType = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg'

  const body = {
    contents: [{
      parts: [
        { inline_data: { mime_type: mediaType, data: base64 } },
        { text: `You are a nutrition assistant. Look at this food photo and estimate:
1. What the food is (short name, max 40 chars)
2. Estimated calories (kcal) for what's visible

Respond ONLY with valid JSON in this exact shape:
{"name":"<food name>","kcal":<number>,"note":"<1 sentence about portion or accuracy>"}

Be practical and concise. If you cannot identify food, return:
{"name":"Unknown food","kcal":0,"note":"Could not identify food in photo."}` }
      ]
    }],
    generationConfig: { maxOutputTokens: 256, temperature: 0.2 },
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`

  async function attempt() {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
    }
    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Unexpected response format from Gemini')
    return JSON.parse(jsonMatch[0])
  }

  // Try up to 3 times with a short delay between attempts
  for (let i = 0; i < 3; i++) {
    try {
      return await attempt()
    } catch (err) {
      if (i === 2) throw err
      await new Promise(r => setTimeout(r, 2000 + i * 1000)) // 2s, 3s
    }
  }
}