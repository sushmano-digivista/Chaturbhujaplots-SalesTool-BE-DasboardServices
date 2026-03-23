/**
 * One-time migration: update contact.whatsapp and contact.phone in MongoDB
 * Run: node src/config/migrate-contact-phone.js
 */
require('dotenv').config()
const mongoose = require('mongoose')

async function run() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('✓ MongoDB connected')

  const db = mongoose.connection.db
  const result = await db.collection('content').updateMany(
    {},
    { $set: { 
      'contact.whatsapp': '919739762698',
      'contact.phone':    '+91 97397 62698'
    }}
  )
  console.log(`✓ Updated ${result.modifiedCount} document(s)`)
  await mongoose.disconnect()
  console.log('✓ Done')
}

run().catch(err => { console.error('✗', err.message); process.exit(1) })
