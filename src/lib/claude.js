// ─── Gemini Vision — food photo analysis ────────────────────────────────────
// Uses Google Gemini 3.5 Flash Lite (free tier).
// Get a free key at https://aistudio.google.com → "Get API key"

export async function analyseFoodPhoto(imageDataUrl, apiKey) {
  if (!apiKey) throw new Error('NO_API_KEY')

  const [header, base64] = imageDataUrl.split(',')
  const mediaType = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg'

  const prompt =
    'Estimate the calories in this food photo. Reply ONLY with raw JSON (no markdown, no code blocks): ' +
    '{"identified":true,"name":"food name","kcal":number,"note":"one sentence"}. ' +
    'kcal = estimated calories for the whole portion shown. ' +
    'If not food: {"identified":false,"name":"Unknown","kcal":0,"note":"Not food."}'

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`

  async function attempt() {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mediaType, data: base64 } },
            { text: prompt },
          ],
        }],
        generationConfig: { maxOutputTokens: 300, temperature: 0.1 },
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error?.message || `Gemini API error ${res.status}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Unexpected response format from Gemini')

    const parsed = JSON.parse(jsonMatch[0])
    if (!parsed.identified) throw new Error('Could not identify food in photo.')
    return {
      name: String(parsed.name).slice(0, 80),
      kcal: Math.max(0, Math.round(Number(parsed.kcal) || 0)),
      note: parsed.note,
    }
  }

  for (let i = 0; i < 3; i++) {
    try {
      return await attempt()
    } catch (err) {
      if (i === 2) throw err
      await new Promise(r => setTimeout(r, 2000 + i * 1500))
    }
  }
}
