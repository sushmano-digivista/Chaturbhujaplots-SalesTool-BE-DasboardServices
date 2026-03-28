/**
 * migrate-hero-card.js
 * Adds director, urgency, and lcStats fields to the existing CONTENT document.
 * Safe to re-run — uses $set to write/overwrite the three new sections.
 *
 * Run: MONGODB_URI=<uri> node src/config/migrate-hero-card.js
 */

require('dotenv').config()
const mongoose = require('mongoose')
const { defaultContent } = require('./seed')

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI
if (!MONGO_URI) { console.error('MONGODB_URI not set'); process.exit(1) }

async function run() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  const col = mongoose.connection.collection('project_content')

  const result = await col.updateOne(
    { _id: 'CONTENT' },
    {
      $set: {
        director: defaultContent.director,
        urgency:  defaultContent.urgency,
        lcStats:  defaultContent.lcStats,
      },
    }
  )

  console.log(`Migration complete — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

module.exports = { run }

// Run directly when invoked as a script
if (require.main === module) {
  run().catch(err => { console.error('Migration failed:', err); process.exit(1) })
}
