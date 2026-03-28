'use strict'
/**
 * tests/migrate-contact-phone.test.js
 * Tests for the contact phone migration script.
 */

const mockUpdateMany  = jest.fn().mockResolvedValue({ modifiedCount: 2 })
const mockDisconnect  = jest.fn().mockResolvedValue()
const mockCollection  = jest.fn().mockReturnValue({ updateMany: mockUpdateMany })

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  disconnect: mockDisconnect,
  connection: {
    db: {
      collection: mockCollection,
    },
  },
}))

const mongoose = require('mongoose')

describe('migrate-contact-phone', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
  })

  afterEach(() => {
    delete process.env.MONGODB_URI
  })

  it('connects to MongoDB and updates contact phone fields', async () => {
    const { run } = require('../src/config/migrate-contact-phone')
    await run()

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test')
    expect(mockCollection).toHaveBeenCalledWith('content')
    expect(mockUpdateMany).toHaveBeenCalledWith(
      {},
      {
        $set: {
          'contact.whatsapp': '919739762698',
          'contact.phone':    '+91 97397 62698',
        },
      }
    )
    expect(mockDisconnect).toHaveBeenCalled()
  })
})
