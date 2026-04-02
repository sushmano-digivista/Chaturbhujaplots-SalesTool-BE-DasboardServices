const mongoose = require('mongoose')

// ── Lead Model ────────────────────────────────────────────────────────────────
const leadSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  phone:            { type: String, required: true, match: /^[6-9]\d{9}$/ },
  email:            { type: String, trim: true },
  source: {
    type:    String,
    // Expanded enum covers all sources emitted by the customer frontend
    enum:    [
      'HERO_CTA', 'CATEGORY_ENQUIRY', 'CONTACT_FORM', 'STICKY_BAR',
      'WHATSAPP', 'FLOATING_BUTTON', 'DIMENSION_ENQUIRY', 'PROJECT_HOME',
      'SITE_VISIT_SCHEDULED', 'UPCOMING_INTEREST', 'CALLBACK_FORM',
    ],
    default: 'CONTACT_FORM',
  },
  categoryInterest: { type: String },
  projectInterest:  { type: String },
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
    website:     String,
    mapEmbedUrl: String,
    mapOpenUrl:  String,
  },
  // ── Director contact card shown on Hero ───────────────────────────────────
  director: {
    title:  String,   // e.g. "Marketing Director"
    name:   String,   // e.g. "M Siva Nageswara Rao"
    phone:  String,   // e.g. "+91 99487 09041"
    avatar: String,   // initials or emoji, e.g. "M"
  },
  // ── Urgency / Limited-Time card data ─────────────────────────────────────
  urgency: {
    tagline:            String,   // "Limited Time Offer"
    headline:           String,   // "Plots Closing Fast!"
    subheadline:        String,   // "Lock In Current Rates"
    description:        String,   // "Prices are set to rise…"
    openProjects:       Number,
    openProjectsLabel:  String,   // "Projects Open"
    openProjectsSub:    String,   // "For Booking"
    completedProjects:  Number,
    completedLabel:     String,   // "Projects"
    completedSub:       String,   // "Completed"
    happyFamilies:      String,   // "1200+"
    familiesLabel:      String,   // "Happy"
    familiesSub:        String,   // "Families"
    barOpenLabel:       String,   // "Open for Booking"
    barClosedLabel:     String,   // "Completed & Sold"
    ctaButton:          String,   // "Explore All Projects →"
  },
  // ── Trust stats (bottom 3 boxes on the card) ─────────────────────────────
  lcStats: [{ num: String, label: String }],
  // ── Animated stats bar on the Hero left panel ─────────────────────────────
  heroStats: [{ end: Number, suffix: String, label: String }],
  // ── Per-project brochure availability notes ───────────────────────────────
  brochureNotes: [{
    projectName: String,   // must match ACTIVE_PROJECTS name exactly
    available:   Boolean,  // false = no brochure yet
    note:        String,   // shown in modal when project selected & no brochure
  }],
}, { _id: false, timestamps: true })

const Lead           = mongoose.model('Lead',           leadSchema)
const ProjectContent = mongoose.model('ProjectContent', projectContentSchema, 'project_content')

module.exports = { Lead, ProjectContent }
