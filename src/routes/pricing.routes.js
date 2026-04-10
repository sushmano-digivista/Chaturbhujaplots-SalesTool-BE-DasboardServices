/**
 * pricing.routes.js
 *
 * PUBLIC
 *   GET  /api/v1/pricing          — all project pricing (for frontend)
 *   GET  /api/v1/pricing/:id      — single project pricing
 *
 * ADMIN (token required)
 *   PUT  /api/v1/pricing/:id      — upsert pricing for a project
 *   DELETE /api/v1/pricing/:id    — remove pricing (reverts to "contact us")
 */
const router  = require('express').Router()
const Pricing = require('../models/pricing.model')
const { verifyToken } = require('../middleware/auth')

const DEFAULT_PRICING = [
  {
    _id: 'anjana', projectName: 'Anjana Paradise',
    east:    { base: 13000, dev: 1000, label: 'Rs.13,000 + Rs.1,000 Dev. Charges' },
    west:    { base: 12500, dev: 1000, label: 'Rs.12,500 + Rs.1,000 Dev. Charges' },
    corners: [
      { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
      { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
    ],
    note: 'All prices per sq. yard. Corner charges additional.', active: true,
  },
  {
    _id: 'aparna', projectName: 'Aparna Legacy',
    east:    { base: 12000, dev: 1000, label: 'Rs.12,000 + Rs.1,000 Dev. Charges' },
    west:    { base: 11500, dev: 1000, label: 'Rs.11,500 + Rs.1,000 Dev. Charges' },
    corners: [
      { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
      { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
    ],
    note: 'All prices per sq. yard. Corner charges additional.', active: true,
  },
  {
    _id: 'varaha', projectName: 'Varaha Virtue',
    east:    { base: 15000, dev: 1000, label: 'Rs.15,000 + Rs.1,000 Dev. Charges' },
    west:    { base: 14500, dev: 1000, label: 'Rs.14,500 + Rs.1,000 Dev. Charges' },
    corners: [
      { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
      { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
    ],
    corpus: { amount: 100, label: 'Rs.100/sq.yd Corpus Fund' },
    note: 'All prices per sq. yard. Corner charges and corpus fund additional.', active: true,
  },
]

async function seedIfEmpty() {
  const count = await Pricing.countDocuments()
  if (count === 0) {
    await Pricing.insertMany(DEFAULT_PRICING)
    console.log('✓ Default pricing seeded')
  }
}

// ── GET /api/v1/pricing ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    await seedIfEmpty()
    const all = await Pricing.find({ active: true })
    // Return as map: { anjana: {...}, aparna: {...}, ... }
    const map = {}
    all.forEach(p => { map[p._id] = p.toObject() })
    res.json(map)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/v1/pricing/:id ───────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const doc = await Pricing.findById(req.params.id)
    if (!doc) return res.status(404).json({ message: 'Pricing not found' })
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PUT /api/v1/pricing/:id  (admin) ─────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const doc = await Pricing.findOneAndUpdate(
      { _id: req.params.id },
      { ...req.body, _id: req.params.id },
      { upsert: true, new: true }
    )
    res.json(doc)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/v1/pricing/:id  (admin) ──────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Pricing.findByIdAndUpdate(req.params.id, { active: false })
    res.json({ success: true, message: `Pricing for ${req.params.id} deactivated` })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
