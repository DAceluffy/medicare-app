import { MEDICINES } from '../data/medicines.js'

// Levenshtein distance for fuzzy matching OCR noise (e.g. "Azithrai" -> "azithral").
function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
    }
  }
  return dp[a.length][b.length]
}

/**
 * Match OCR text against the medicine catalog.
 * Returns [{ medicine, matchedWord, confidence }] sorted by confidence.
 */
export function matchMedicines(text) {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3)

  const results = []
  for (const med of MEDICINES) {
    let best = null
    for (const kw of med.keywords) {
      for (const w of words) {
        if (w === kw) {
          best = { matchedWord: w, confidence: 1 }
          break
        }
        // Short keywords (e.g. "pan") must match exactly to avoid false positives.
        if (kw.length < 5) continue
        const d = distance(w, kw)
        const conf = 1 - d / kw.length
        if (d <= 2 && conf >= 0.7 && (!best || conf > best.confidence)) {
          best = { matchedWord: w, confidence: conf }
        }
      }
      if (best?.confidence === 1) break
    }
    if (best) results.push({ medicine: med, ...best })
  }

  // Keep one match per brand family, highest confidence first.
  return results.sort((a, b) => b.confidence - a.confidence)
}

/** Draws a sample typed prescription on a canvas so users can demo the scanner. */
export function generateSamplePrescription() {
  const c = document.createElement('canvas')
  c.width = 900
  c.height = 1100
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, c.width, c.height)

  ctx.fillStyle = '#0f766e'
  ctx.fillRect(0, 0, c.width, 150)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 44px Arial'
  ctx.fillText('Dr. Anil Sharma, MBBS MD', 40, 70)
  ctx.font = '26px Arial'
  ctx.fillText('City Care Clinic, New Delhi  |  Reg No. 45821', 40, 115)

  ctx.fillStyle = '#111111'
  ctx.font = '28px Arial'
  ctx.fillText('Patient: Rahul Verma     Age: 34     Date: ' + new Date().toLocaleDateString('en-IN'), 40, 220)
  ctx.font = 'bold 64px Georgia'
  ctx.fillText('Rx', 40, 320)

  const lines = [
    '1. Azithral 500 - 1 tablet once daily x 3 days',
    '2. Dolo 650 - 1 tablet SOS for fever',
    '3. Pan 40 - 1 tablet before breakfast',
    '4. Montair LC - 1 tablet at night x 5 days',
    '5. Becosules Z - 1 capsule daily',
  ]
  ctx.font = '34px Arial'
  lines.forEach((l, i) => ctx.fillText(l, 60, 410 + i * 80))

  ctx.font = '26px Arial'
  ctx.fillStyle = '#444'
  ctx.fillText('Advice: Drink plenty of water. Review after 5 days.', 40, 880)
  ctx.font = 'italic 34px Georgia'
  ctx.fillStyle = '#111'
  ctx.fillText('Signature', 640, 1020)
  return c.toDataURL('image/png')
}

/** Shrinks big camera photos so they fit in localStorage. */
export function compressImage(dataUrl, maxSize = 900) {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = img.width * scale
      c.height = img.height * scale
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      resolve(c.toDataURL('image/jpeg', 0.7))
    }
    img.src = dataUrl
  })
}
