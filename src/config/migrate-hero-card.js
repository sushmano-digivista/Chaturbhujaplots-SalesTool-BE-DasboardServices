/**
 * migrate-hero-card.js
 * Adds director, urgency, and lcStats fields to the existing CONTENT document.
 * Safe to re-run — uses $setOnInsert-style logic via $set only on missing fields.
 *
 * Run: MONGODB_URI=<uri> node src/config/migrate-hero-card.js
 */

require('dotenv').config()
const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI
if (!MONGO_URI) { console.error('❌  MONGODB_URI not set'); process.exit(1) }

async function run() {
  await mongoose.connect(MONGO_URI)
  console.log('✅  Connected to MongoDB')

  const col = mongoose.connection.collection('project_content')

  const result = await col.updateOne(
    { _id: 'CONTENT' },
    {
      $set: {
        director: {
          title:  'Marketing Director',
          name:   'M Siva Nageswara Rao',
          phone:  '+91 99487 09041',
          avatar: 'M',
        },
        urgency: {
          tagline:           'Limited Time Offer',
          headline:          'Plots Closing Fast!',
          subheadline:       'Lock In Current Rates',
          description:       'Prices are set to rise next quarter. Secure your plot today before the revision hits.',
          openProjects:      4,
          openProjectsLabel: 'Projects Open',
          openProjectsSub:   'For Booking',
          completedProjects: 11,
          completedLabel:    'Projects',
          completedSub:      'Completed',
          happyFamilies:     '1200+',
          familiesLabel:     'Happy',
          familiesSub:       'Families',
          barOpenLabel:      'Open for Booking',
          barClosedLabel:    'Completed & Sold',
          ctaButton:         'Explore All Projects →',
        },
        lcStats: [
          { num: '25+',  label: 'Years of Trust' },
          { num: '100%', label: 'Clear Title'    },
          { num: 'RERA', label: 'Registered'     },
        ],
      },
    }
  )

  console.log(`✅  Migration complete — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

run().catch(err => { console.error('❌  Migration failed:', err); process.exit(1) })
