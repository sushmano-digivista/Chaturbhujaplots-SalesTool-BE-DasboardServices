'use strict'
/**
 * tests/models.test.js
 * Tests for Mongoose model schemas defined in src/models/index.js
 */

describe('Models schema definitions', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  it('exports Lead and ProjectContent models', () => {
    jest.mock('mongoose', () => {
      const actualMongoose = jest.requireActual('mongoose')
      return {
        ...actualMongoose,
        Schema: actualMongoose.Schema,
        model: jest.fn().mockImplementation((name) => ({ modelName: name })),
      }
    })
    const models = require('../src/models/index')
    expect(models.Lead).toBeDefined()
    expect(models.ProjectContent).toBeDefined()
  })

  it('Lead model is created with correct name', () => {
    jest.mock('mongoose', () => {
      const actualMongoose = jest.requireActual('mongoose')
      return {
        ...actualMongoose,
        Schema: actualMongoose.Schema,
        model: jest.fn().mockImplementation((name) => ({ modelName: name })),
      }
    })
    const mongoose = require('mongoose')
    require('../src/models/index')
    expect(mongoose.model).toHaveBeenCalledWith('Lead', expect.any(Object))
  })

  it('ProjectContent model uses project_content collection', () => {
    jest.mock('mongoose', () => {
      const actualMongoose = jest.requireActual('mongoose')
      return {
        ...actualMongoose,
        Schema: actualMongoose.Schema,
        model: jest.fn().mockImplementation((name) => ({ modelName: name })),
      }
    })
    const mongoose = require('mongoose')
    require('../src/models/index')
    expect(mongoose.model).toHaveBeenCalledWith('ProjectContent', expect.any(Object), 'project_content')
  })

  it('Lead schema has required fields', () => {
    jest.mock('mongoose', () => {
      const actualMongoose = jest.requireActual('mongoose')
      let capturedLeadSchema = null
      return {
        ...actualMongoose,
        Schema: class extends actualMongoose.Schema {
          constructor(def, opts) {
            super(def, opts)
            if (def.phone && def.phone.match) capturedLeadSchema = def
          }
        },
        model: jest.fn().mockReturnValue({}),
        _getLeadSchema: () => capturedLeadSchema,
      }
    })
    require('../src/models/index')
    const mongoose = require('mongoose')
    const schema = mongoose._getLeadSchema()
    expect(schema.name.required).toBe(true)
    expect(schema.phone.required).toBe(true)
  })

  it('ProjectContent schema includes director, urgency, lcStats fields', () => {
    jest.mock('mongoose', () => {
      const actualMongoose = jest.requireActual('mongoose')
      let capturedContentSchema = null
      return {
        ...actualMongoose,
        Schema: class extends actualMongoose.Schema {
          constructor(def, opts) {
            super(def, opts)
            if (def.director) capturedContentSchema = def
          }
        },
        model: jest.fn().mockReturnValue({}),
        _getContentSchema: () => capturedContentSchema,
      }
    })
    require('../src/models/index')
    const mongoose = require('mongoose')
    const schema = mongoose._getContentSchema()
    expect(schema).toBeDefined()
    expect(schema.director).toBeDefined()
    expect(schema.director.title).toBe(String)
    expect(schema.director.name).toBe(String)
    expect(schema.director.phone).toBe(String)
    expect(schema.director.avatar).toBe(String)
    expect(schema.urgency).toBeDefined()
    expect(schema.urgency.tagline).toBe(String)
    expect(schema.urgency.headline).toBe(String)
    expect(schema.urgency.openProjects).toBe(Number)
    expect(schema.lcStats).toBeDefined()
    expect(schema.heroStats).toBeDefined()
    expect(schema.brochureNotes).toBeDefined()
  })
})
