/**
 * tests/lead.routes.test.js
 * Integration tests for POST /api/v1/leads (public) and
 * protected admin endpoints.
 *
 * Uses supertest with an in-memory Express app — no real MongoDB needed.
 * Mongoose calls are mocked so tests run offline in CI.
 */
'use strict'

const request = require('supertest')
const express = require('express')

// ── Mock mongoose models ───────────────────────────────────────────────────────
jest.mock('../src/models/index', () => {
  const saveMock   = jest.fn()
  const LeadMock   = jest.fn().mockImplementation((data) => ({ ...data, _id: 'mock-id', save: saveMock }))
  LeadMock.find    = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) })
  LeadMock.findById             = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
  LeadMock.findByIdAndUpdate    = jest.fn().mockResolvedValue(null)
  LeadMock.findByIdAndDelete    = jest.fn().mockResolvedValue(null)
  LeadMock.countDocuments       = jest.fn().mockResolvedValue(0)
  return { Lead: LeadMock, ProjectContent: {} }
})

// ── Build minimal app ─────────────────────────────────────────────────────────
process.env.JWT_SECRET = 'test-secret-32-chars-minimum!!'
process.env.NODE_ENV   = 'test'

const leadRoutes = require('../src/routes/lead.routes')
const { generateToken } = require('../src/middleware/auth')

const app = express()
app.use(express.json())
app.use('/api/v1/leads', leadRoutes)

const validToken  = generateToken({ username: 'admin', roles: ['ROLE_ADMIN'] })
const authHeaders = { Authorization: `Bearer ${validToken}` }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('POST /api/v1/leads (public)', () => {
  const { Lead } = require('../src/models/index')

  beforeEach(() => {
    Lead.mockClear()
    Lead.prototype = {}
  })

  it('returns 201 when lead saves successfully', async () => {
    Lead.mockImplementation((data) => ({
      ...data,
      _id: 'abc123',
      name: data.name,
      phone: data.phone,
      source: data.source || 'CONTACT_FORM',
      save: jest.fn().mockResolvedValue({ _id: 'abc123', name: data.name, phone: data.phone }),
    }))

    const res = await request(app)
      .post('/api/v1/leads')
      .send({ name: 'Test User', phone: '9876543210', source: 'CONTACT_FORM' })

    expect(res.status).toBe(201)
  })

  it('only persists whitelisted fields (CWE-20 input whitelist check)', async () => {
    let captured = null
    Lead.mockImplementation((data) => {
      captured = data
      return { ...data, save: jest.fn().mockResolvedValue(data) }
    })

    await request(app)
      .post('/api/v1/leads')
      .send({
        name: 'Test User',
        phone: '9876543210',
        source: 'CONTACT_FORM',
        __proto__: { injected: true },   // prototype pollution attempt
        $where: 'malicious',             // NoSQL injection attempt
        isAdmin: true,                   // privilege escalation attempt
      })

    expect(captured).toBeDefined()
    expect(captured.isAdmin).toBeUndefined()
    expect(captured['$where']).toBeUndefined()
  })

  it('returns 400 on mongoose ValidationError', async () => {
    const err = Object.assign(new Error('Validation failed'), {
      name:   'ValidationError',
      errors: { phone: { message: 'Invalid phone' } },
    })
    Lead.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(err) }))

    const res = await request(app)
      .post('/api/v1/leads')
      .send({ name: 'Test', phone: '12345' })

    expect(res.status).toBe(400)
    expect(res.body.message).toContain('Invalid phone')
  })
})

describe('GET /api/v1/leads (admin-protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/leads')
    expect(res.status).toBe(401)
  })

  it('returns 200 with valid token', async () => {
    const res = await request(app)
      .get('/api/v1/leads')
      .set(authHeaders)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/v1/leads/stats (admin-protected)', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/leads/stats')
    expect(res.status).toBe(401)
  })
})
