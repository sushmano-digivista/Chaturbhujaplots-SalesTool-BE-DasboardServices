require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const authRoutes     = require('./routes/auth.routes')
const leadRoutes     = require('./routes/lead.routes')
const contentRoutes  = require('./routes/content.routes')
const pricingRoutes  = require('./routes/pricing.routes')
const projectsRoutes = require('./routes/projects.routes')
const i18nRoutes     = require('./routes/i18n.routes')

const app  = express()
const PORT = process.env.PORT || 8082

// Disable ETag -- prevents 304 Not Modified serving stale DB data
app.set('etag', false)

// -- CORS ---------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000').split(',').map(o => o.trim())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('chaturbhuja')
    ) return cb(null, true)
    cb(new Error('CORS: ' + origin + ' not allowed'))
  },
  credentials: false,
}))
app.use(express.json())

// -- Health -------------------------------------------------------------
app.get('/actuator/health', (_, res) => res.json({ status: 'UP' }))
app.get('/health',          (_, res) => res.json({ status: 'UP', service: 'dashboard-service' }))

// -- Routes -------------------------------------------------------------
app.use('/api/v1/auth',     authRoutes)
app.use('/api/v1/leads',    leadRoutes)
app.use('/api/v1/content',  contentRoutes)
app.use('/api/v1/pricing',  pricingRoutes)
app.use('/api/v1/projects', projectsRoutes)
app.use('/api/v1/i18n',     i18nRoutes)

// -- Handlers -----------------------------------------------------------
app.use((req, res) => res.status(404).json({ message: 'Not found: ' + req.method + ' ' + req.path }))
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Internal server error' })
})

// -- Start --------------------------------------------------------------
async function start() {
  try {
    let mongoUri = process.env.MONGODB_URI
    if (mongoUri && !mongoUri.includes('anjana_dashboard')) {
      mongoUri = mongoUri.includes('?')
        ? mongoUri.replace('?', 'anjana_dashboard?')
        : mongoUri + 'anjana_dashboard'
    }
    await mongoose.connect(mongoUri)
    console.log('Connected to DB: ' + mongoose.connection.db.databaseName)

    const server = app.listen(PORT, () =>
      console.log('dashboard-service running on port ' + PORT)
    )

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error('Port ' + PORT + ' is already in use.')
        process.exit(1)
      } else {
        console.error('Server error:', err)
        process.exit(1)
      }
    })
  } catch (err) {
    console.error('Failed to start:', err)
    process.exit(1)
  }
}

if (process.env.NODE_ENV !== 'test') {
  start()
}

module.exports = app
