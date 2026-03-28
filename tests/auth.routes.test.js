'use strict'
/**
 * tests/auth.routes.test.js
 * Integration tests for POST /api/v1/auth/login and GET /api/v1/auth/me
 */

const request = require('supertest')
const express = require('express')

// Mock bcrypt so we control password comparison
jest.mock('bcryptjs', () => ({
  compare: jest.fn().mockResolvedValue(true),
}))

const mockBcrypt = require('bcryptjs')

process.env.JWT_SECRET = 'test-secret-32-chars-minimum!!'
process.env.NODE_ENV   = 'test'

const authRoutes = require('../src/routes/auth.routes')
const { generateToken } = require('../src/middleware/auth')

const app = express()
app.use(express.json())
app.use('/api/v1/auth', authRoutes)

describe('POST /api/v1/auth/login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns token for valid admin credentials', async () => {
    mockBcrypt.compare.mockResolvedValueOnce(true)
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'Dashboard@123' })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    expect(res.body.username).toBe('admin')
    expect(res.body.roles).toContain('ROLE_ADMIN')
    expect(res.body.expiresIn).toBe(86400)
  })

  it('returns 400 when username is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: 'test' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Username and password required/)
  })

  it('returns 400 when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/Username and password required/)
  })

  it('returns 401 for wrong username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'hacker', password: 'Dashboard@123' })
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/Invalid credentials/)
  })

  it('returns 401 for wrong password', async () => {
    mockBcrypt.compare.mockResolvedValueOnce(false)
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'wrong-password' })
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/Invalid credentials/)
  })

  it('returns 500 when bcrypt throws', async () => {
    mockBcrypt.compare.mockRejectedValueOnce(new Error('bcrypt error'))
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'admin', password: 'test' })
    expect(res.status).toBe(500)
  })
})

describe('GET /api/v1/auth/me', () => {
  it('returns user info with valid token', async () => {
    const token = generateToken({ username: 'admin', roles: ['ROLE_ADMIN'] })
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.username).toBe('admin')
    expect(res.body.roles).toContain('ROLE_ADMIN')
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
    expect(res.status).toBe(401)
  })

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.here')
    expect(res.status).toBe(401)
  })
})
