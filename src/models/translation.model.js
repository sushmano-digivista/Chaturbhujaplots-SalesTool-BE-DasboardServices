const mongoose = require('mongoose')

/**
 * Translation model — one document per language.
 * _id is the ISO language code: "en" | "te"
 * data holds the full nested translation map.
 */
const translationSchema = new mongoose.Schema({
  _id:  { type: String },          // "en" | "te"
  lang: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false, timestamps: true })

module.exports = mongoose.model('Translation', translationSchema, 'translations')
