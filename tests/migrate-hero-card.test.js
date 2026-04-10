'use strict'
/**
 * tests/migrate-hero-card.test.js
 * Tests for the hero-card migration script.
 * Verifies it uses seed data (no duplication) and calls MongoDB correctly.
 */

const mockUpdateOne   = jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 })
const mockDisconnect  = jest.fn().mockResolvedValue()
const mockCollection  = jest.fn().mockReturnValue({ updateOne: mockUpdateOne })

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  disconnect: mockDisconnect,
  connection: {
    collection: mockCollection,
    db: { databaseName: 'anjana_dashboard' },
  },
}))

const mongoose = require('mongoose')
const { defaultContent } = require('../src/config/seed')

describe('migrate-hero-card', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/anjana_dashboard'
  })

  afterEach(() => {
    delete process.env.MONGODB_URI
  })

  it('connects to MongoDB and runs migration', async () => {
    const { run } = require('../src/config/migrate-hero-card')
    await run()

    expect(mongoose.connect).toHaveBeenCalled()
    expect(mockCollection).toHaveBeenCalledWith('project_content')
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: 'CONTENT' },
      {
        $set: {
          'hero.approvalBadges': defaultContent.hero.approvalBadges,
          director:              defaultContent.director,
          urgency:               defaultContent.urgency,
          lcStats:               defaultContent.lcStats,
          heroStats:             defaultContent.heroStats,
          brochureNotes:         defaultContent.brochureNotes,
        },
      }
    )
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('uses the same data as seed.js (no duplication)', async () => {
    const { run } = require('../src/config/migrate-hero-card')
    await run()

    const setData = mockUpdateOne.mock.calls[0][1].$set

    expect(setData['hero.approvalBadges']).toEqual(defaultContent.hero.approvalBadges)
    expect(setData.director).toEqual(defaultContent.director)
    expect(setData.urgency).toEqual(defaultContent.urgency)
    expect(setData.lcStats).toEqual(defaultContent.lcStats)
    expect(setData.heroStats).toEqual(defaultContent.heroStats)
    expect(setData.brochureNotes).toEqual(defaultContent.brochureNotes)
  })

  it('injects anjana_dashboard into URI without query string', () => {
    jest.resetModules()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/'
    jest.mock('mongoose', () => ({
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue(),
      connection: {
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 0 }),
        }),
        db: { databaseName: 'anjana_dashboard' },
      },
    }))
    const mod = require('../src/config/migrate-hero-card')
    const mg = require('mongoose')
    return mod.run().then(() => {
      expect(mg.connect).toHaveBeenCalledWith(
        expect.stringContaining('anjana_dashboard')
      )
    })
  })

  it('injects anjana_dashboard into URI with query string', () => {
    jest.resetModules()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/?retryWrites=true'
    jest.mock('mongoose', () => ({
      connect: jest.fn().mockResolvedValue({}),
      disconnect: jest.fn().mockResolvedValue(),
      connection: {
        collection: jest.fn().mockReturnValue({
          updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 0 }),
        }),
        db: { databaseName: 'anjana_dashboard' },
      },
    }))
    const mod = require('../src/config/migrate-hero-card')
    const mg = require('mongoose')
    return mod.run().then(() => {
      expect(mg.connect).toHaveBeenCalledWith(
        expect.stringContaining('anjana_dashboard?')
      )
    })
  })
})
