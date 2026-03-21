const router   = require('express').Router()
const bcrypt   = require('bcryptjs')
const { generateToken, verifyToken } = require('../middleware/auth')

// Hard-coded admin — replace with DB user in production
const ADMIN = {
  username: 'admin',
  // bcrypt of "Dashboard@123"
  password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHGS',
  roles:    ['ROLE_ADMIN'],
}

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' })

    if (username !== ADMIN.username)
      return res.status(401).json({ message: 'Invalid credentials' })

    const valid = await bcrypt.compare(password, ADMIN.password)
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' })

    const token = generateToken({ username, roles: ADMIN.roles })
    res.json({ token, username, roles: ADMIN.roles, expiresIn: 86400 })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/auth/me
router.get('/me', verifyToken, (req, res) => {
  res.json({ username: req.user.username, roles: req.user.roles })
})

module.exports = router
