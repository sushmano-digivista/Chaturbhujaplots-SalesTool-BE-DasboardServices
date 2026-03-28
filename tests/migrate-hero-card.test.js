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
  },
}))

const mongoose = require('mongoose')
const { defaultContent } = require('../src/config/seed')

describe('migrate-hero-card', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
  })

  afterEach(() => {
    delete process.env.MONGODB_URI
  })

  it('connects to MongoDB and runs migration', async () => {
    const { run } = require('../src/config/migrate-hero-card')
    await run()

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test')
    expect(mockCollection).toHaveBeenCalledWith('project_content')
    expect(mockUpdateOne).toHaveBeenCalledWith(
      { _id: 'CONTENT' },
      {
        $set: {
          director: defaultContent.director,
          urgency:  defaultContent.urgency,
          lcStats:  defaultContent.lcStats,
        },
      }
    )
    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('uses the same data as seed.js (no duplication)', async () => {
    const { run } = require('../src/config/migrate-hero-card')
    await run()

    const setData = mockUpdateOne.mock.calls[0][1].$set

    // Verify director matches seed exactly
    expect(setData.director).toEqual(defaultContent.director)

    // Verify urgency matches seed exactly
    expect(setData.urgency).toEqual(defaultContent.urgency)

    // Verify lcStats matches seed exactly
    expect(setData.lcStats).toEqual(defaultContent.lcStats)
  })
})
