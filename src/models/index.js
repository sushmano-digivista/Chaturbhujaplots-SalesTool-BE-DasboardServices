const mongoose = require('mongoose')

// ── Lead Model ────────────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  phone:            { type: String, required: true, match: /^[6-9]\d{9}$/ },
  email:            { type: String, trim: true },
  source:           { type: String, enum: ['HERO_CTA','CATEGORY_ENQUIRY','CONTACT_FORM','STICKY_BAR','WHATSAPP','FLOATING_BUTTON'], default: 'CONTACT_FORM' },
  categoryInterest: { type: String },
  status:           { type: String, enum: ['NEW','CONTACTED','SITE_VISIT_SCHEDULED','CONVERTED','CLOSED'], default: 'NEW' },
  notes:            { type: String },
  followUpAt:       { type: Date },
}, { timestamps: true })

// ── ProjectContent Model (singleton) ─────────────────────────────────────────
const projectContentSchema = new mongoose.Schema({
  _id: { type: String, default: 'CONTENT' },
  hero: {
    headline:        String,
    subheadline:     String,
    description:     String,
    backgroundImageId: String,
    approvalBadges:  [String],
  },
  highlights: [{
    icon:        String,
    title:       String,
    description: String,
    sortOrder:   Number,
  }],
  amenities: [{
    tab:         String,
    icon:        String,
    label:       String,
    sortOrder:   Number,
    featured:    Boolean,
    featuredDesc:String,
    imageId:     String,
  }],
  distances: [{
    icon:      String,
    name:      String,
    subtitle:  String,
    distance:  String,
    sortOrder: Number,
  }],
  quote: {
    investLine1: String,
    investLine2: String,
    quote:       String,
    stats:       [{ value: String, label: String }],
  },
  stats: [{ value: String, label: String }],
  contact: {
    phone:       String,
    whatsapp:    String,
    email:       String,
    address:     String,
    mapEmbedUrl: String,
    mapOpenUrl:  String,
  },
}, { _id: false, timestamps: true })

const Lead           = mongoose.model('Lead',           leadSchema)
const ProjectContent = mongoose.model('ProjectContent', projectContentSchema, 'project_content')

module.exports = { Lead, ProjectContent }
