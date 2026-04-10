/**
 * migrate-hero-card.js
 * Adds director, urgency, lcStats, heroStats, brochureNotes and
 * updated approvalBadges to the existing CONTENT document.
 * Safe to re-run — uses $set so existing fields are overwritten cleanly.
 *
 * Run: MONGODB_URI=<uri> node src/config/migrate-hero-card.js
 * The script auto-injects /anjana_dashboard into the URI if not present.
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { defaultContent } = require('./seed')

let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI
if (!MONGO_URI) { console.error('MONGODB_URI not set'); process.exit(1) }

// Always target anjana_dashboard — inject into URI if missing
if (!MONGO_URI.includes('anjana_dashboard')) {
  MONGO_URI = MONGO_URI.includes('?')
    ? MONGO_URI.replace('?', 'anjana_dashboard?')
    : MONGO_URI + 'anjana_dashboard'
}

async function run() {
  await mongoose.connect(MONGO_URI)
  console.log(`Connected — db: ${mongoose.connection.db.databaseName}`)

  const col = mongoose.connection.collection('project_content')

  const result = await col.updateOne(
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

  console.log(`Migration complete — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

module.exports = { run }

if (require.main === module) {
  run().catch(err => { console.error('Migration failed:', err); process.exit(1) })
}
