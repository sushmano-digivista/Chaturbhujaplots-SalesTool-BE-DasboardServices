/**
 * migrate-hero-card.js
 * Adds director, urgency, lcStats and heroStats to the CONTENT document.
 * Safe to re-run — uses $set so existing fields are overwritten cleanly.
 *
 * Run: MONGODB_URI=<uri> node src/config/migrate-hero-card.js
 * The script auto-injects /anjana_dashboard into the URI if not present.
 */

require('dotenv').config()
const mongoose = require('mongoose')

let MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI
if (!MONGO_URI) { console.error('❌  MONGODB_URI not set'); process.exit(1) }

// Always target anjana_dashboard — inject into URI if missing
if (!MONGO_URI.includes('anjana_dashboard')) {
  MONGO_URI = MONGO_URI.includes('?')
    ? MONGO_URI.replace('?', 'anjana_dashboard?')
    : MONGO_URI + 'anjana_dashboard'
}

async function run() {
  await mongoose.connect(MONGO_URI)
  console.log(`✅  Connected — db: ${mongoose.connection.db.databaseName}`)

  const col = mongoose.connection.collection('project_content')

  const result = await col.updateOne(
    { _id: 'CONTENT' },
    {
      $set: {
        'hero.approvalBadges': [
          'APCRDA Proposed Layout · LP No: 35/2025',
          'AP RERA · P06060125894',
          '25 Years · 15+ Projects · 1200+ Families',
        ],
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
        heroStats: [
          { end: 25,   suffix: '+', label: 'Years in Industry'  },
          { end: 15,   suffix: '+', label: 'Projects Delivered' },
          { end: 1200, suffix: '+', label: 'Happy Customers'    },
        ],
        brochureNotes: [
          {
            projectName: 'Trimbak Oaks',
            available:   false,
            note:        "Brochure for Trimbak Oaks is not yet available. You can still connect with our team via WhatsApp or request a callback — we'll share all project details personally.",
          },
        ],
      },
    }
  )

  console.log(`✅  Migration complete — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`)
  await mongoose.disconnect()
}

module.exports = { run }

if (require.main === module) {
  run().catch(err => { console.error('❌  Migration failed:', err); process.exit(1) })
}
