'use strict'
const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  id:          { type: String, required: true, unique: true },
  name:        { type: String, required: true },
  loc:         { type: String },
  fullAddress: { type: String },
  tag:         { type: String },
  status:      { type: String },
  available:   { type: Number },
  total:       { type: Number },
  starting:    { type: String },
  upcoming:    { type: Boolean, default: false },
  description: { type: String },
  approvals:   [{ type: String }],
  highlights:  [{ type: String }],
  facings:     { type: mongoose.Schema.Types.Mixed },
  pricing:     { type: mongoose.Schema.Types.Mixed },
  amenities: [{
    tab:          String,
    icon:         String,
    label:        String,
    sortOrder:    Number,
    featured:     Boolean,
    featuredDesc: String,
  }],
  gallery: [{
    label: String,
    icon:  String,
  }],
  videos: [{
    id:       String,
    type:     String,
    title:    String,
    subtitle: String,
  }],
  distances: [{
    icon:     String,
    name:     String,
    subtitle: String,
    distance: String,
  }],
  mapEmbedUrl: { type: String },
  mapOpenUrl:  { type: String },
  contact: {
    phone:           String,
    whatsapp:        String,
    email:           String,
    address:         String,
    website:         String,
    whatsappMessage: String,
  },
}, { timestamps: true })

module.exports = mongoose.models.Project ||
  mongoose.model('Project', projectSchema, 'projects')
