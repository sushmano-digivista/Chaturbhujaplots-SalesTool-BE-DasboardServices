require('dotenv').config()
const express  = require('express')
const cors     = require('cors')
const mongoose = require('mongoose')

const authRoutes    = require('./routes/auth.routes')
const leadRoutes    = require('./routes/lead.routes')
const contentRoutes = require('./routes/content.routes')

const app  = express()
const PORT = process.env.PORT || 8082

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
app.get('/health',          (_, res) => res.json({ status: 'UP', service: 'dashboard-service', version: 'v-ownerNotify-20260331-0912' }))

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
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ MongoDB connected')
    const server = app.listen(PORT, () =>
      console.log(`✓ dashboard-service running on port ${PORT}`)
    )

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`
✗ Port ${PORT} is already in use.
`)
        console.error('  Another instance of dashboard-service may still be running.
')
        console.error('  To fix — run ONE of the following:
')
        console.error('  Windows (find & kill the process):')
        console.error(`    netstat -ano | findstr :${PORT}`)
        console.error('    taskkill //PID <PID> //F   (Git Bash) or: taskkill /PID <PID> /F   (CMD/PowerShell)
')
        console.error('  Mac/Linux:')
        console.error(`    lsof -ti :${PORT} | xargs kill -9
`)
        console.error('  Or use a different port:')
        console.error(`    PORT=8083 npm run dev
`)
        process.exit(1)
      } else {
        console.error('✗ Server error:', err)
        process.exit(1)
      }
    })
  } catch (err) {
    console.error('✗ Failed to start:', err)
    process.exit(1)
  }
}

start()
