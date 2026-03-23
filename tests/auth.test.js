/**
 * tests/auth.test.js
 * Unit tests for src/middleware/auth.js
 *
 * Verifies:
 *  - CWE-321: server rejects startup without JWT_SECRET in production
 *  - generateToken / verifyToken contract
 *  - 401 on missing / invalid / expired tokens (S1116 fix)
 */
'use strict'

const jwt = require('jsonwebtoken')

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildReq(token) {
  return { headers: { authorization: token ? `Bearer ${token}` : undefined } }
}

function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('auth middleware', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OLD_ENV, NODE_ENV: 'test', JWT_SECRET: 'test-secret-32-chars-minimum!!' }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('generateToken', () => {
    it('returns a verifiable JWT', () => {
      const { generateToken } = require('../src/middleware/auth')
      const token = generateToken({ username: 'admin', roles: ['ROLE_ADMIN'] })
      expect(typeof token).toBe('string')
      const decoded = jwt.verify(token, 'test-secret-32-chars-minimum!!')
      expect(decoded.username).toBe('admin')
    })

    it('token expires in 24 h', () => {
      const { generateToken } = require('../src/middleware/auth')
      const token = generateToken({ username: 'admin' })
      const decoded = jwt.decode(token)
      expect(decoded.exp - decoded.iat).toBe(86400)
    })
  })

  describe('verifyToken middleware', () => {
    it('calls next() for a valid token', () => {
      const { generateToken, verifyToken } = require('../src/middleware/auth')
      const token = generateToken({ username: 'admin' })
      const req  = buildReq(token)
      const res  = buildRes()
      const next = jest.fn()
      verifyToken(req, res, next)
      expect(next).toHaveBeenCalled()
      expect(req.user.username).toBe('admin')
    })

    it('returns 401 when no Authorization header', () => {
      const { verifyToken } = require('../src/middleware/auth')
      const req  = buildReq(null)
      const res  = buildRes()
      verifyToken(req, res, jest.fn())
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'No token provided' }))
    })

    it('returns 401 for a tampered token', () => {
      const { verifyToken } = require('../src/middleware/auth')
      const req  = buildReq('invalid.token.here')
      const res  = buildRes()
      verifyToken(req, res, jest.fn())
      expect(res.status).toHaveBeenCalledWith(401)
    })

    it('returns 401 for an expired token', () => {
      const { verifyToken } = require('../src/middleware/auth')
      const expired = jwt.sign({ username: 'admin' }, 'test-secret-32-chars-minimum!!', { expiresIn: -1 })
      const req  = buildReq(expired)
      const res  = buildRes()
      verifyToken(req, res, jest.fn())
      expect(res.status).toHaveBeenCalledWith(401)
    })
  })

  describe('CWE-321: no hardcoded secret fallback in production', () => {
    it('exits process when JWT_SECRET missing in production', () => {
      delete process.env.JWT_SECRET
      process.env.NODE_ENV = 'production'
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit') })
      expect(() => require('../src/middleware/auth')).toThrow()
      exitSpy.mockRestore()
    })

    it('does NOT exit in non-production when JWT_SECRET missing', () => {
      delete process.env.JWT_SECRET
      process.env.NODE_ENV = 'test'
      const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {})
      expect(() => require('../src/middleware/auth')).not.toThrow()
      expect(exitSpy).not.toHaveBeenCalled()
      exitSpy.mockRestore()
    })
  })
})
