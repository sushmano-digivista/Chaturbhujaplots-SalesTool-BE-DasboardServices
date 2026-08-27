'use strict'
/**
 * tests/index.test.js
 * Tests for Express app setup: health endpoints, CORS, 404 handler, route mounting.
 */

const request = require('supertest')

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  model:   jest.fn().mockReturnValue({}),
  Schema:  Object.assign(
    jest.fn().mockImplementation(function () { return this }),
    { Types: { Mixed: {} } }
  ),
  models: {},
  connection: { db: { databaseName: 'anjana_dashboard' } },
}))

jest.mock('../src/routes/auth.routes', () => {
  const r = require('express').Router()
  r.get('/test', (_, res) => res.json({ route: 'auth' }))
  return r
})
jest.mock('../src/routes/lead.routes', () => {
  const r = require('express').Router()
  r.get('/test', (_, res) => res.json({ route: 'lead' }))
  return r
})

jest.mock('../src/routes/projects.routes', () => require('express').Router())
jest.mock('../src/routes/pricing.routes',  () => require('express').Router())
jest.mock('../src/routes/i18n.routes',     () => require('express').Router())
jest.mock('../src/config/projects.seed',   () => ({ seedProjects: jest.fn().mockResolvedValue(undefined) }))

jest.mock('../src/routes/content.routes', () => {
  const r = require('express').Router()
  r.get('/test', (_, res) => res.json({ route: 'content' }))
  return r
})

process.env.NODE_ENV = 'test'

const app = require('../src/index')

describe('Health endpoints', () => {
  it('GET /actuator/health returns UP', async () => {
    const res = await request(app).get('/actuator/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('UP')
  })

  it('GET /health returns UP with service name', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('UP')
    expect(res.body.service).toBe('dashboard-service')
  })
})

describe('404 handler', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown')
    expect(res.status).toBe(404)
    expect(res.body.message).toContain('Not found')
  })
})

describe('Route mounting', () => {
  it('mounts auth routes at /api/v1/auth', async () => {
    const res = await request(app).get('/api/v1/auth/test')
    expect(res.status).toBe(200)
    expect(res.body.route).toBe('auth')
  })

  it('mounts lead routes at /api/v1/leads', async () => {
    const res = await request(app).get('/api/v1/leads/test')
    expect(res.status).toBe(200)
    expect(res.body.route).toBe('lead')
  })

  it('mounts content routes at /api/v1/content', async () => {
    const res = await request(app).get('/api/v1/content/test')
    expect(res.status).toBe(200)
    expect(res.body.route).toBe('content')
  })
})

describe('CORS', () => {
  it('allows requests with no origin', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
  })

  it('blocks disallowed origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://evil-site.com')
    expect(res.status).toBe(500)
  })
})
