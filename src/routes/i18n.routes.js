const router       = require('express').Router()
const Translation  = require('../models/translation.model')
const { verifyToken } = require('../middleware/auth')
const { TRANSLATIONS } = require('../config/i18n.seed')

const SUPPORTED_LANGS = ['en', 'te']

// Auto-seed a language doc if it doesn't exist yet
async function getOrSeed(lang) {
  let doc = await Translation.findById(lang)
  if (!doc) {
    const seed = TRANSLATIONS[lang]
    if (!seed) return null
    doc = await Translation.create({ _id: lang, lang, data: seed })
    console.log('i18n: seeded language', lang)
  }
  return doc
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/v1/i18n — returns { en: {...}, te: {...} } for client preload
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const docs = await Promise.all(SUPPORTED_LANGS.map(getOrSeed))
    const result = {}
    docs.forEach((doc, i) => {
      if (doc) result[SUPPORTED_LANGS[i]] = doc.data
    })
    res.json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/i18n/:lang — returns single-language translation map
router.get('/:lang', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  const { lang } = req.params
  if (!SUPPORTED_LANGS.includes(lang)) {
    return res.status(400).json({ message: 'Unsupported language: ' + lang })
  }
  try {
    const doc = await getOrSeed(lang)
    res.json(doc ? doc.data : {})
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// PUT /api/v1/i18n/:lang — replace full translation for a language
router.put('/:lang', verifyToken, async (req, res) => {
  const { lang } = req.params
  if (!SUPPORTED_LANGS.includes(lang)) {
    return res.status(400).json({ message: 'Unsupported language: ' + lang })
  }
  try {
    const doc = await Translation.findOneAndUpdate(
      { _id: lang },
      { _id: lang, lang, data: req.body },
      { upsert: true, new: true }
    )
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/v1/i18n/:lang/:namespace — update one namespace (e.g. "nav", "hero")
router.patch('/:lang/:namespace', verifyToken, async (req, res) => {
  const { lang, namespace } = req.params
  if (!SUPPORTED_LANGS.includes(lang)) {
    return res.status(400).json({ message: 'Unsupported language: ' + lang })
  }
  try {
    const doc = await Translation.findOneAndUpdate(
      { _id: lang },
      { $set: { ['data.' + namespace]: req.body } },
      { upsert: true, new: true }
    )
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
