require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const authRoutes    = require('./routes/auth.routes')
const leadRoutes    = require('./routes/lead.routes')
const contentRoutes = require('./routes/content.routes')

const app  = express()
const PORT = process.env.PORT || 8082

// Disable ETag — prevents 304 Not Modified serving stale DB data
app.set('etag', false)

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) cb(null, true)
    else cb(new Error(`CORS: ${origin} not allowed`))
  },
  credentials: false,
}))
app.use(express.json())

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/actuator/health', (_, res) => res.json({ status: 'UP' }))
app.get('/health',          (_, res) => res.json({ status: 'UP', service: 'dashboard-service' }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',    authRoutes)
app.use('/api/v1/leads',   leadRoutes)
app.use('/api/v1/content', contentRoutes)

// ── Handlers ──────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Not found: ${req.method} ${req.path}` }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
async function start() {
  try {
    // Always target anjana_dashboard — inject into URI if not already present
    let mongoUri = process.env.MONGODB_URI
    if (mongoUri && !mongoUri.includes('anjana_dashboard')) {
      mongoUri = mongoUri.includes('?')
        ? mongoUri.replace('?', 'anjana_dashboard?')
        : mongoUri + 'anjana_dashboard'
    }
    await mongoose.connect(mongoUri)
    console.log(`✓ MongoDB connected — db: ${mongoose.connection.db.databaseName}`)
    app.listen(PORT, () => console.log(`✓ dashboard-service running on port ${PORT}`))
  } catch (err) {
    console.error('✗ Failed to start:', err)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

module.exports = app
