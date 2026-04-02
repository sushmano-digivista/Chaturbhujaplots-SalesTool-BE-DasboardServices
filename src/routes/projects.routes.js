'use strict'
const express = require('express')
const Project = require('../models/project.model')

const router = express.Router()

// GET /api/v1/projects -- all projects ordered by creation
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const projects = await Project.find({}).sort({ createdAt: 1 })
    res.json(projects)
  } catch (err) {
    console.error('[projects] fetch failed:', err.message)
    res.status(500).json({ message: err.message })
  }
})

// GET /api/v1/projects/:id -- single project by id field
router.get('/:id', async (req, res) => {
  res.set('Cache-Control', 'no-store')
  try {
    const project = await Project.findOne({ id: req.params.id })
    if (!project) return res.status(404).json({ message: 'Project not found' })
    res.json(project)
  } catch (err) {
    console.error('[projects] fetch failed:', err.message)
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
