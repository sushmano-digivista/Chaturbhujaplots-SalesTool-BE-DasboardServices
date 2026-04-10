/**
 * tests/content.routes.test.js
 * Integration tests for GET /api/v1/content (public) and
 * protected PUT / PATCH admin endpoints.
 */
'use strict'

const request = require('supertest')
const express = require('express')

const MOCK_CONTENT = { _id: 'CONTENT', hero: { headline: 'Test' }, contact: { phone: '9876543210' } }

jest.mock('../src/models/index', () => ({
  Lead: {},
  ProjectContent: {
    findById:          jest.fn().mockResolvedValue(MOCK_CONTENT),
    create:            jest.fn().mockResolvedValue(MOCK_CONTENT),
    findOneAndUpdate:  jest.fn().mockResolvedValue(MOCK_CONTENT),
  },
}))

jest.mock('../src/config/seed', () => ({
  defaultContent: { hero: { headline: 'Default' } },
}))

process.env.JWT_SECRET = 'test-secret-32-chars-minimum!!'
process.env.NODE_ENV   = 'test'

const contentRoutes = require('../src/routes/content.routes')
const { generateToken } = require('../src/middleware/auth')

const app = express()
app.use(express.json())
app.use('/api/v1/content', contentRoutes)

const validToken  = generateToken({ username: 'admin', roles: ['ROLE_ADMIN'] })
const authHeaders = { Authorization: `Bearer ${validToken}` }

describe('GET /api/v1/content (public)', () => {
  it('returns 200 with content', async () => {
    const res = await request(app).get('/api/v1/content')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('hero')
  })

  it('sets no-store Cache-Control header', async () => {
    const res = await request(app).get('/api/v1/content')
    expect(res.headers['cache-control']).toMatch(/no-store/)
  })
})

describe('PUT /api/v1/content (admin-protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).put('/api/v1/content').send({ hero: {} })
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid admin token', async () => {
    const res = await request(app)
      .put('/api/v1/content')
      .set(authHeaders)
      .send({ hero: { headline: 'Updated' } })
    expect(res.status).toBe(200)
  })
})

describe('PATCH /api/v1/content/hero (admin-protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).patch('/api/v1/content/hero').send({})
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid token', async () => {
    const res = await request(app)
      .patch('/api/v1/content/hero')
      .set(authHeaders)
      .send({ headline: 'New Headline' })
    expect(res.status).toBe(200)
  })
})
