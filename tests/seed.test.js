'use strict'
/**
 * tests/seed.test.js
 * Tests for the seed data — ensures required sections exist and have correct structure.
 */

const { defaultContent } = require('../src/config/seed')

describe('defaultContent seed data', () => {
  it('has _id of CONTENT', () => {
    expect(defaultContent._id).toBe('CONTENT')
  })

  it('has hero section with required fields', () => {
    expect(defaultContent.hero).toBeDefined()
    expect(defaultContent.hero.headline).toBeTruthy()
    expect(defaultContent.hero.subheadline).toBeTruthy()
    expect(defaultContent.hero.description).toBeTruthy()
    expect(Array.isArray(defaultContent.hero.approvalBadges)).toBe(true)
  })

  it('has highlights array', () => {
    expect(Array.isArray(defaultContent.highlights)).toBe(true)
    expect(defaultContent.highlights.length).toBeGreaterThan(0)
    for (const h of defaultContent.highlights) {
      expect(h).toHaveProperty('icon')
      expect(h).toHaveProperty('title')
      expect(h).toHaveProperty('sortOrder')
    }
  })

  it('has amenities array with tabs', () => {
    expect(Array.isArray(defaultContent.amenities)).toBe(true)
    const tabs = [...new Set(defaultContent.amenities.map(a => a.tab))]
    expect(tabs).toContain('INFRA')
    expect(tabs).toContain('LIFESTYLE')
    expect(tabs).toContain('UTILITIES')
  })

  it('has distances array', () => {
    expect(Array.isArray(defaultContent.distances)).toBe(true)
    expect(defaultContent.distances.length).toBeGreaterThan(0)
  })

  it('has quote section with stats', () => {
    expect(defaultContent.quote).toBeDefined()
    expect(defaultContent.quote.quote).toBeTruthy()
    expect(Array.isArray(defaultContent.quote.stats)).toBe(true)
  })

  it('has stats array', () => {
    expect(Array.isArray(defaultContent.stats)).toBe(true)
  })

  it('has contact section with required fields', () => {
    expect(defaultContent.contact).toBeDefined()
    expect(defaultContent.contact.phone).toBeTruthy()
    expect(defaultContent.contact.email).toBeTruthy()
    expect(defaultContent.contact.address).toBeTruthy()
  })

  it('has director section', () => {
    expect(defaultContent.director).toBeDefined()
    expect(defaultContent.director.title).toBeTruthy()
    expect(defaultContent.director.name).toBeTruthy()
    expect(defaultContent.director.phone).toBeTruthy()
    expect(defaultContent.director.avatar).toBeTruthy()
  })

  it('has urgency section with all fields', () => {
    expect(defaultContent.urgency).toBeDefined()
    expect(defaultContent.urgency.tagline).toBeTruthy()
    expect(defaultContent.urgency.headline).toBeTruthy()
    expect(defaultContent.urgency.subheadline).toBeTruthy()
    expect(defaultContent.urgency.description).toBeTruthy()
    expect(typeof defaultContent.urgency.openProjects).toBe('number')
    expect(typeof defaultContent.urgency.completedProjects).toBe('number')
    expect(defaultContent.urgency.ctaButton).toBeTruthy()
  })

  it('has lcStats array with 3 entries', () => {
    expect(Array.isArray(defaultContent.lcStats)).toBe(true)
    expect(defaultContent.lcStats.length).toBe(3)
    for (const stat of defaultContent.lcStats) {
      expect(stat).toHaveProperty('num')
      expect(stat).toHaveProperty('label')
    }
  })
})
