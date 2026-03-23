const router = require('express').Router()
const { Lead } = require('../models/index')
const { verifyToken } = require('../middleware/auth')

// ── PUBLIC — customer frontend ────────────────────────────────────────────────

// POST /api/v1/leads — submit enquiry
router.post('/', async (req, res) => {
  try {
    // Whitelist only expected fields (Checkmarx CWE-20 / Sonar S4823)
    const { name, phone, email, source, categoryInterest, projectInterest } = req.body
    const lead = new Lead({ name, phone, email, source, categoryInterest, projectInterest, status: 'NEW' })
    const saved = await lead.save()
    console.log(`New lead: ${saved.name} | ${saved.phone} | ${saved.source}`)
    res.status(201).json(saved)
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message)
      return res.status(400).json({ message: messages.join(', ') })
    }
    res.status(500).json({ message: err.message })
  }
})

// ── ADMIN ─────────────────────────────────────────────────────────────────────

// GET /api/v1/leads
router.get('/', verifyToken, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean()
    res.json(leads)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/leads/stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const [total, todayCount, newCount, contacted, converted] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ status: 'NEW' }),
      Lead.countDocuments({ status: 'CONTACTED' }),
      Lead.countDocuments({ status: 'CONVERTED' }),
    ])
    res.json({ total, today: todayCount, new: newCount, contacted, converted })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/leads/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).lean()
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/v1/leads/:id
router.patch('/:id', verifyToken, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    )
    if (!lead) return res.status(404).json({ message: 'Lead not found' })
    res.json(lead)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/v1/leads/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id)
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
