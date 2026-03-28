'use strict'
/**
 * tests/content.routes.extra.test.js
 * Additional tests for content.routes.js — covers getOrCreate seed path,
 * error paths, and all PATCH section endpoints.
 */

const request = require('supertest')
const express = require('express')

const mockContent = { _id: 'CONTENT', hero: { headline: 'Test' }, contact: { phone: '9876543210' } }

const mockFindById         = jest.fn().mockResolvedValue(mockContent)
const mockCreate           = jest.fn().mockResolvedValue(mockContent)
const mockFindOneAndUpdate = jest.fn().mockResolvedValue(mockContent)

jest.mock('../src/models/index', () => ({
  Lead: {},
  ProjectContent: {
    findById:         mockFindById,
    create:           mockCreate,
    findOneAndUpdate: mockFindOneAndUpdate,
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

describe('GET /api/v1/content — getOrCreate seed path', () => {
  it('creates default content when none exists', async () => {
    mockFindById.mockResolvedValueOnce(null)
    const res = await request(app).get('/api/v1/content')
    expect(res.status).toBe(200)
    expect(mockCreate).toHaveBeenCalled()
  })

  it('returns 500 when findById throws', async () => {
    mockFindById.mockRejectedValueOnce(new Error('DB error'))
    const res = await request(app).get('/api/v1/content')
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('DB error')
  })
})

describe('PUT /api/v1/content — error path', () => {
  it('returns 500 when findOneAndUpdate throws', async () => {
    mockFindOneAndUpdate.mockRejectedValueOnce(new Error('Write error'))
    const res = await request(app)
      .put('/api/v1/content')
      .set(authHeaders)
      .send({ hero: {} })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Write error')
  })
})

describe('PATCH section endpoints — all sections', () => {
  const sections = ['hero', 'highlights', 'amenities', 'distances', 'quote', 'contact']

  for (const section of sections) {
    it(`PATCH /api/v1/content/${section} returns 200 with valid token`, async () => {
      mockFindOneAndUpdate.mockResolvedValueOnce(mockContent)
      const res = await request(app)
        .patch(`/api/v1/content/${section}`)
        .set(authHeaders)
        .send({ test: 'data' })
      expect(res.status).toBe(200)
    })

    it(`PATCH /api/v1/content/${section} returns 401 without token`, async () => {
      const res = await request(app)
        .patch(`/api/v1/content/${section}`)
        .send({ test: 'data' })
      expect(res.status).toBe(401)
    })
  }

  it('PATCH section returns 500 on error', async () => {
    mockFindOneAndUpdate.mockRejectedValueOnce(new Error('Patch error'))
    const res = await request(app)
      .patch('/api/v1/content/hero')
      .set(authHeaders)
      .send({ headline: 'test' })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('Patch error')
  })
})
