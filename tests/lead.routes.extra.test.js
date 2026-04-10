'use strict'
/**
 * tests/lead.routes.extra.test.js
 * Additional tests for lead.routes.js — covers stats, get by id, patch, delete,
 * error paths, and 500 server errors.
 */

const request = require('supertest')
const express = require('express')

const mockLead = {
  _id: 'lead-123',
  name: 'Test User',
  phone: '9876543210',
  source: 'CONTACT_FORM',
  status: 'NEW',
}

const mockSave             = jest.fn().mockResolvedValue(mockLead)
const mockLeadConstructor  = jest.fn().mockImplementation((data) => ({
  ...data, _id: 'lead-123', save: mockSave,
}))
const mockFind             = jest.fn().mockReturnValue({
  sort: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([mockLead]),
  }),
})
const mockFindById          = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockLead) })
const mockFindByIdAndUpdate = jest.fn().mockResolvedValue(mockLead)
const mockFindByIdAndDelete = jest.fn().mockResolvedValue(mockLead)
const mockCountDocuments    = jest.fn().mockResolvedValue(5)

jest.mock('../src/models/index', () => {
  const ctor = mockLeadConstructor
  ctor.find              = mockFind
  ctor.findById          = mockFindById
  ctor.findByIdAndUpdate = mockFindByIdAndUpdate
  ctor.findByIdAndDelete = mockFindByIdAndDelete
  ctor.countDocuments    = mockCountDocuments
  return { Lead: ctor, ProjectContent: {} }
})

process.env.JWT_SECRET = 'test-secret-32-chars-minimum!!'
process.env.NODE_ENV   = 'test'

const leadRoutes = require('../src/routes/lead.routes')
const { generateToken } = require('../src/middleware/auth')

const app = express()
app.use(express.json())
app.use('/api/v1/leads', leadRoutes)

const validToken  = generateToken({ username: 'admin', roles: ['ROLE_ADMIN'] })
const authHeaders = { Authorization: `Bearer ${validToken}` }

describe('POST /api/v1/leads — 500 error', () => {
  it('returns 500 for non-validation errors', async () => {
    mockLeadConstructor.mockImplementationOnce(() => ({
      save: jest.fn().mockRejectedValue(new Error('DB connection lost')),
    }))
    const res = await request(app)
      .post('/api/v1/leads')
      .send({ name: 'Test', phone: '9876543210' })
    expect(res.status).toBe(500)
    expect(res.body.message).toBe('DB connection lost')
  })
})

describe('GET /api/v1/leads (admin)', () => {
  it('returns list of leads with valid token', async () => {
    const res = await request(app).get('/api/v1/leads').set(authHeaders)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('returns 500 when find throws', async () => {
    mockFind.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(new Error('DB error')),
      }),
    })
    const res = await request(app).get('/api/v1/leads').set(authHeaders)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/v1/leads/stats', () => {
  it('returns stats with valid token', async () => {
    const res = await request(app).get('/api/v1/leads/stats').set(authHeaders)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('today')
    expect(res.body).toHaveProperty('new')
    expect(res.body).toHaveProperty('contacted')
    expect(res.body).toHaveProperty('converted')
  })

  it('returns 500 when countDocuments throws', async () => {
    mockCountDocuments.mockRejectedValueOnce(new Error('Count error'))
    const res = await request(app).get('/api/v1/leads/stats').set(authHeaders)
    expect(res.status).toBe(500)
  })
})

describe('GET /api/v1/leads/:id', () => {
  it('returns lead by id', async () => {
    const res = await request(app).get('/api/v1/leads/lead-123').set(authHeaders)
    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Test User')
  })

  it('returns 404 when lead not found', async () => {
    mockFindById.mockReturnValueOnce({
      lean: jest.fn().mockResolvedValue(null),
    })
    const res = await request(app).get('/api/v1/leads/nonexistent').set(authHeaders)
    expect(res.status).toBe(404)
  })

  it('returns 500 when findById throws', async () => {
    mockFindById.mockReturnValueOnce({
      lean: jest.fn().mockRejectedValue(new Error('DB error')),
    })
    const res = await request(app).get('/api/v1/leads/bad-id').set(authHeaders)
    expect(res.status).toBe(500)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/leads/lead-123')
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/v1/leads/:id', () => {
  it('updates lead successfully', async () => {
    const res = await request(app)
      .patch('/api/v1/leads/lead-123')
      .set(authHeaders)
      .send({ status: 'CONTACTED' })
    expect(res.status).toBe(200)
  })

  it('returns 404 when lead not found', async () => {
    mockFindByIdAndUpdate.mockResolvedValueOnce(null)
    const res = await request(app)
      .patch('/api/v1/leads/nonexistent')
      .set(authHeaders)
      .send({ status: 'CONTACTED' })
    expect(res.status).toBe(404)
  })

  it('returns 500 when update throws', async () => {
    mockFindByIdAndUpdate.mockRejectedValueOnce(new Error('Update error'))
    const res = await request(app)
      .patch('/api/v1/leads/bad-id')
      .set(authHeaders)
      .send({ status: 'CONTACTED' })
    expect(res.status).toBe(500)
  })

  it('returns 401 without token', async () => {
    const res = await request(app)
      .patch('/api/v1/leads/lead-123')
      .send({ status: 'CONTACTED' })
    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/v1/leads/:id', () => {
  it('deletes lead and returns 204', async () => {
    const res = await request(app)
      .delete('/api/v1/leads/lead-123')
      .set(authHeaders)
    expect(res.status).toBe(204)
  })

  it('returns 500 when delete throws', async () => {
    mockFindByIdAndDelete.mockRejectedValueOnce(new Error('Delete error'))
    const res = await request(app)
      .delete('/api/v1/leads/bad-id')
      .set(authHeaders)
    expect(res.status).toBe(500)
  })

  it('returns 401 without token', async () => {
    const res = await request(app).delete('/api/v1/leads/lead-123')
    expect(res.status).toBe(401)
  })
})
