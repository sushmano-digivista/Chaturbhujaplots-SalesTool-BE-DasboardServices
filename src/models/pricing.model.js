/**
 * pricing.model.js
 * Collection: project_pricing
 * One document per project. Admin-editable via PUT /api/v1/pricing/:projectId
 */
const mongoose = require('mongoose')

const cornerSchema = new mongoose.Schema({
  type:  { type: String, required: true },  // e.g. 'North-East Corner'
  extra: { type: Number, required: true },  // extra per sq.yd
  label: { type: String },
}, { _id: false })

const pricingSchema = new mongoose.Schema({
  _id:       { type: String },             // projectId: 'anjana' | 'aparna' | 'varaha' | 'trimbak'
  projectName: { type: String },           // Display name
  east: {
    base:  { type: Number },               // base rate per sq.yd
    dev:   { type: Number, default: 1000 },// development charges per sq.yd
    label: { type: String },
  },
  west: {
    base:  { type: Number },
    dev:   { type: Number, default: 1000 },
    label: { type: String },
  },
  corners:   [cornerSchema],
  corpus:    {
    amount: { type: Number },
    label:  { type: String },
  },
  note:      { type: String },
  active:    { type: Boolean, default: true },
}, { _id: false, timestamps: true })

module.exports = mongoose.model('Pricing', pricingSchema, 'project_pricing')
