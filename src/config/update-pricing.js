/**
 * update-pricing.js
 *
 * Update a project's pricing directly in MongoDB — no code change,
 * no git commit, no redeploy needed. The live site picks up the new
 * price on next page load (frontend fetches fresh, no-cache).
 *
 * Usage:
 *   node src/config/update-pricing.js <projectId> <field> <value> [<field> <value> ...]
 *
 * Valid projectId: anjana | aparna | varaha | trimbak
 * Valid fields:
 *   east          — East base price per sq.yd            (e.g. 11999)
 *   west          — West base price per sq.yd             (e.g. 11499)
 *   eastDev       — East development charge per sq.yd      (e.g. 1000)
 *   westDev       — West development charge per sq.yd      (e.g. 1000)
 *   corner1       — North-East corner extra per sq.yd      (e.g. 999)
 *   corner2       — Other corners extra per sq.yd          (e.g. 499)
 *   corpus        — Corpus fund amount per sq.yd           (e.g. 100)
 *
 * Examples:
 *   # Update Aparna Legacy: East ₹11,999, West ₹11,499
 *   node src/config/update-pricing.js aparna east 11999 west 11499
 *
 *   # Update just Varaha's West price
 *   node src/config/update-pricing.js varaha west 14999
 *
 *   # Update Trimbak corner charges
 *   node src/config/update-pricing.js trimbak corner1 1500 corner2 1000
 *
 * Requires .env with MONGODB_URI set (same DB the live site reads from).
 */
require('dotenv').config()
const mongoose = require('mongoose')
const Pricing  = require('../models/pricing.model')

const VALID_PROJECTS = ['anjana', 'aparna', 'varaha', 'trimbak']
const VALID_FIELDS   = ['east', 'west', 'eastDev', 'westDev', 'corner1', 'corner2', 'corpus']

function fmtRs(n) {
  return 'Rs.' + Number(n).toLocaleString('en-IN')
}

async function run(argv) {
  const [projectId, ...rest] = argv

  if (!projectId || !VALID_PROJECTS.includes(projectId)) {
    console.error(`✗ First argument must be one of: ${VALID_PROJECTS.join(', ')}`)
    process.exit(1)
  }
  if (rest.length === 0 || rest.length % 2 !== 0) {
    console.error('✗ Provide field/value pairs, e.g.: east 11999 west 11499')
    process.exit(1)
  }

  const updates = {}
  for (let i = 0; i < rest.length; i += 2) {
    const field = rest[i]
    const value = Number(rest[i + 1])
    if (!VALID_FIELDS.includes(field)) {
      console.error(`✗ Unknown field "${field}". Valid fields: ${VALID_FIELDS.join(', ')}`)
      process.exit(1)
    }
    if (Number.isNaN(value)) {
      console.error(`✗ Value for "${field}" must be a number, got "${rest[i + 1]}"`)
      process.exit(1)
    }
    updates[field] = value
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('MongoDB connected')

  const doc = await Pricing.findById(projectId)
  if (!doc) {
    console.error(`✗ No pricing document found for "${projectId}". Run the server once to seed defaults first.`)
    await mongoose.disconnect()
    process.exit(1)
  }

  const $set = {}
  if (updates.east    !== undefined) { $set['east.base']  = updates.east;    $set['east.label'] = `${fmtRs(updates.east)} + ${fmtRs(doc.east?.dev ?? 1000)} Dev. Charges` }
  if (updates.west    !== undefined) { $set['west.base']  = updates.west;    $set['west.label'] = `${fmtRs(updates.west)} + ${fmtRs(doc.west?.dev ?? 1000)} Dev. Charges` }
  if (updates.eastDev !== undefined) { $set['east.dev']   = updates.eastDev }
  if (updates.westDev !== undefined) { $set['west.dev']   = updates.westDev }
  if (updates.corpus  !== undefined) { $set['corpus.amount'] = updates.corpus; $set['corpus.label'] = `${fmtRs(updates.corpus)}/sq.yd Corpus Fund` }

  // Corner charges live in an array — rebuild it if either corner value changes
  if (updates.corner1 !== undefined || updates.corner2 !== undefined) {
    const corners = (doc.corners || []).map(c => ({ ...c.toObject?.() ?? c }))
    const c1 = corners.find(c => c.type === 'North-East Corner') || { type: 'North-East Corner' }
    const c2 = corners.find(c => c.type === 'Other Corners')     || { type: 'Other Corners' }
    if (updates.corner1 !== undefined) { c1.extra = updates.corner1; c1.label = `${fmtRs(updates.corner1)}/sq.yd extra` }
    if (updates.corner2 !== undefined) { c2.extra = updates.corner2; c2.label = `${fmtRs(updates.corner2)}/sq.yd extra` }
    $set.corners = [c1, c2]
  }

  const updated = await Pricing.findOneAndUpdate(
    { _id: projectId },
    { $set },
    { new: true }
  )

  console.log(`✓ Updated pricing for ${updated.projectName} (${projectId}):`)
  console.log(`  East: ${fmtRs(updated.east.base)}  (dev ${fmtRs(updated.east.dev)})`)
  console.log(`  West: ${fmtRs(updated.west.base)}  (dev ${fmtRs(updated.west.dev)})`)
  if (updated.corners?.length) {
    updated.corners.forEach(c => console.log(`  ${c.type}: +${fmtRs(c.extra)}`))
  }
  if (updated.corpus?.amount) {
    console.log(`  Corpus: ${fmtRs(updated.corpus.amount)}`)
  }

  await mongoose.disconnect()
  console.log('Done — live site will show this on next page load (no redeploy needed).')
}

module.exports = { run }

// Run directly when invoked as a script
if (require.main === module) {
  run(process.argv.slice(2)).catch(err => { console.error(err.message); process.exit(1) })
}
