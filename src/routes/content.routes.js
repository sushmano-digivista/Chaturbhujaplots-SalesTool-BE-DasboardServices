const router = require('express').Router()
const { ProjectContent } = require('../models/index')
const { verifyToken }    = require('../middleware/auth')
const { defaultContent } = require('../config/seed')

async function getOrCreate() {
  let content = await ProjectContent.findById('CONTENT')
  if (!content) {
    content = await ProjectContent.create(defaultContent)
    console.log('✓ Default content seeded')
  }
  return content
}

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/v1/content — full content for customer frontend
router.get('/', async (req, res) => {
  try {
    const content = await getOrCreate()
    res.json(content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// PUT /api/v1/content — replace all
router.put('/', verifyToken, async (req, res) => {
  try {
    const content = await ProjectContent.findOneAndUpdate(
      { _id: 'CONTENT' },
      { ...req.body, _id: 'CONTENT' },
      { upsert: true, new: true }
    )
    res.json(content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH helper
async function patchSection(section, data, res) {
  try {
    const content = await ProjectContent.findOneAndUpdate(
      { _id: 'CONTENT' },
      { $set: { [section]: data } },
      { upsert: true, new: true }
    )
    res.json(content)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

router.patch('/hero',       verifyToken, (req, res) => patchSection('hero',       req.body, res))
router.patch('/highlights', verifyToken, (req, res) => patchSection('highlights', req.body, res))
router.patch('/amenities',  verifyToken, (req, res) => patchSection('amenities',  req.body, res))
router.patch('/distances',  verifyToken, (req, res) => patchSection('distances',  req.body, res))
router.patch('/quote',      verifyToken, (req, res) => patchSection('quote',      req.body, res))
router.patch('/contact',    verifyToken, (req, res) => patchSection('contact',    req.body, res))

module.exports = router
