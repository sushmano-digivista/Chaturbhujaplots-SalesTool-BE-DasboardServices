'use strict'
/**
 * tests/index.start.test.js
 * Tests for the start() function and URI injection logic in index.js.
 * Separated from index.test.js because start() requires different mock setup.
 */

const mockListen  = jest.fn((port, cb) => { cb && cb(); return { on: jest.fn() } })
const mockConnect = jest.fn().mockResolvedValue({})

// ── Mongoose mock with all required properties ────────────────────────────────
const SchemaMock = function () { return this }
SchemaMock.Types = { Mixed: {} }

jest.mock('mongoose', () => ({
  connect:    mockConnect,
  model:      jest.fn().mockReturnValue({}),
  Schema:     SchemaMock,
  models:     {},
  connection: { db: { databaseName: 'anjana_dashboard' } },
}))

// ── Route & seed mocks ────────────────────────────────────────────────────────
jest.mock('../src/config/projects.seed',   () => ({ seedProjects: jest.fn().mockResolvedValue(undefined) }))
jest.mock('../src/routes/auth.routes',     () => require('express').Router())
jest.mock('../src/routes/lead.routes',     () => require('express').Router())
jest.mock('../src/routes/content.routes',  () => require('express').Router())
jest.mock('../src/routes/projects.routes', () => require('express').Router())
jest.mock('../src/routes/pricing.routes',  () => require('express').Router())
jest.mock('../src/routes/i18n.routes',     () => require('express').Router())

describe('start() URI injection', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...OLD_ENV, NODE_ENV: 'development' }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('injects anjana_dashboard into URI without query string', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/'

    const express = require('express')
    const origListen = express.application.listen
    express.application.listen = mockListen

    require('../src/index')
    await new Promise(r => setTimeout(r, 50))

    expect(mockConnect).toHaveBeenCalledWith(
      expect.stringContaining('anjana_dashboard')
    )

    express.application.listen = origListen
  })

  it('injects anjana_dashboard into URI with query string', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/?retryWrites=true'

    const express = require('express')
    const origListen = express.application.listen
    express.application.listen = mockListen

    require('../src/index')
    await new Promise(r => setTimeout(r, 50))

    expect(mockConnect).toHaveBeenCalledWith(
      expect.stringContaining('anjana_dashboard?')
    )

    express.application.listen = origListen
  })

  it('does not double-inject anjana_dashboard', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017/anjana_dashboard'

    const express = require('express')
    const origListen = express.application.listen
    express.application.listen = mockListen

    require('../src/index')
    await new Promise(r => setTimeout(r, 50))

    const uri = mockConnect.mock.calls[0][0]
    expect(uri.match(/anjana_dashboard/g).length).toBe(1)

    express.application.listen = origListen
  })
})
