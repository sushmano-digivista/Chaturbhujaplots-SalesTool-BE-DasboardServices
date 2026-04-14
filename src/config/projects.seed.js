/**
 * projects.seed.js — Seeds all 4 active projects into MongoDB.
 * Uses getOrSeed() pattern — only inserts missing documents.
 * To update existing data, use MongoDB Compass with $set.
 */

const Project = require('../models/project.model')

const PROJECTS_SEED = [
  {
    id:          'anjana',
    name:        'Anjana Paradise',
    loc:         'Paritala, Near Amaravati',
    fullAddress: 'Paritala Village, Krishna District, Andhra Pradesh 521180',
    tag:         'Featured',
    status:      'APCRDA LP No: 35/2025 | AP RERA P06060125894',
    available:   14,
    total:       242,
    starting:    'Rs.24.8L',
    upcoming:    false,
    description: 'Premium open plots in Paritala — adjacent to NH-16, just 8 km from Amaravati, the new capital of Andhra Pradesh. CRDA Proposed Layout with 100% clear title, avenue-lined roads, 24/7 water pipeline and overhead electricity on every plot. Ready for immediate construction.',
    approvals:   ['CRDA Proposed Layout', 'AP RERA Registered', '100% Clear Title', '100% Vaastu'],
    highlights: [
      'Adjacent to National Highway (NH-16)',
      '8 km from Amaravati — New State Capital',
      'Govt. Proposed Railway Connectivity to Paritala',
      'Proposed Logistic Hub in Paritala',
      'Near Engineering Colleges (Amrita Sai, MVR, MIC)',
      'Close to Nimra Medical College',
      'Near Mulapadu International Cricket Stadium',
      'Proposed Cine Studio near Nandigama',
    ],
    facings: { east: 113, eastNorth: 1, eastWest: 2, west: 122, westNorth: 1, southEast: 1, southWest: 2 },
    pricing: {
      east:    { base: 13000, dev: 1000, label: 'Rs.13,000 + Rs.1,000 Dev. Charges' },
      west:    { base: 12500, dev: 1000, label: 'Rs.12,500 + Rs.1,000 Dev. Charges' },
      corners: [
        { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
        { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
      ],
      note: 'All prices per sq. yard. Corner charges additional.',
    },
    amenities: [
      { tab: 'INFRA',     icon: '🏛', label: 'Architecturally Imposing Grand Entrance Arch', sortOrder: 1  },
      { tab: 'INFRA',     icon: '🛣', label: 'Avenue Plantation on Both Sides of Roads',     sortOrder: 2  },
      { tab: 'INFRA',     icon: '💧', label: 'Overhead Tank — Pipeline to Every Plot',       sortOrder: 3  },
      { tab: 'INFRA',     icon: '💡', label: 'Overhead Electricity Lines',                   sortOrder: 4  },
      { tab: 'INFRA',     icon: '🔒', label: 'Security Arch with CCTV Surveillance',         sortOrder: 5  },
      { tab: 'INFRA',     icon: '📋', label: 'Name & Number Display Board per Plot',         sortOrder: 6  },
      { tab: 'LIFESTYLE', icon: '🏃', label: 'Jogging Track Around Central Garden',          sortOrder: 7  },
      { tab: 'LIFESTYLE', icon: '🌳', label: "Children's Tot Lot & Green Equipped Parks",    sortOrder: 8  },
      { tab: 'LIFESTYLE', icon: '✅', label: '100% Vaastu Compliant Layout',                 sortOrder: 9  },
      { tab: 'LIFESTYLE', icon: '🏦', label: 'Housing Loans Available Through Banks',        sortOrder: 10 },
      { tab: 'INFRA',     icon: '📐', label: 'CRDA Proposed Layout — Ready for Construction', sortOrder: 11 },
      { tab: 'UTILITIES', icon: '🚰', label: 'Ample Water Availability Round the Clock',     sortOrder: 12 },
      { tab: 'UTILITIES', icon: '⚡', label: 'Designed LED Street Lights',                   sortOrder: 13 },
      { tab: 'UTILITIES', icon: '🏊', label: 'Drainage System',                              sortOrder: 14 },
      { tab: 'LIFESTYLE', icon: '🙏', label: 'Hanuman Temple — Just Minutes Away',           sortOrder: 15 },
    ],
    gallery: [
      { label: 'Grand Entrance Arch',     icon: '🏛' },
      { label: 'Avenue Lined Roads',       icon: '🛣' },
      { label: "Children's Park",          icon: '🌳' },
      { label: 'Jogging Track',            icon: '🏃' },
      { label: 'Plot Layout Overview',     icon: '🏞' },
      { label: 'Overhead Tank & Pipeline', icon: '💧' },
    ],
    videos: [
      { id: '55zBpY_j-lo', type: 'youtube', title: 'Anjana Paradise — Project Overview', subtitle: 'Full property walkthrough & amenities' },
    ],
    distances: [
      { icon: '🏛', name: 'Amaravati Capital',      subtitle: 'New AP State Capital',         distance: '8 km'  },
      { icon: '🛣', name: 'NH-16 National Highway', subtitle: 'Adjacent — direct access',     distance: '0 km'  },
      { icon: '🎓', name: 'Engineering Colleges',   subtitle: 'Amrita Sai, MVR, MIC College', distance: '5 km'  },
      { icon: '🏥', name: 'Nimra Medical College',  subtitle: 'Healthcare hub',               distance: '7 km'  },
      { icon: '🏏', name: 'Mulapadu Stadium',       subtitle: 'International Cricket',        distance: '6 km'  },
      { icon: '✈', name: 'Vijayawada Airport',      subtitle: 'Air connectivity',             distance: '22 km' },
      { icon: '🙏', name: 'Hanuman Temple',         subtitle: 'Shri Paritala Hanuman Temple', distance: '1 km'  },
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Paritala,Andhra+Pradesh,India&t=k&z=14&ie=UTF8&iwloc=&output=embed',
    mapOpenUrl:  'https://maps.google.com/?q=Paritala,Krishna+District,Andhra+Pradesh',
    contact: {
      phone:    '+91 99487 09041',
      whatsapp: '919948709041',
      email:    'chaturbhujaplots@gmail.com',
      address:  'Paritala, Krishna District, AP 521180',
      website:  'www.chaturbhujaplots.in',
    },
  },

  {
    id:          'aparna',
    name:        'Aparna Legacy',
    loc:         'Chevitikallu, Gateway of Amaravati Capital Region',
    fullAddress: 'Chevitikallu Village, Gateway of Amaravati Capital Region, Kanchikacherla Mandal, NTR District, AP',
    tag:         'Limited',
    status:      'APCRDA Proposed Layout',
    available:   16,
    total:       273,
    starting:    'Rs.26L',
    upcoming:    false,
    description: 'Premium APCRDA proposed layout plots at Chevitikallu, NTR District — located near the Outer Ring Road with outstanding connectivity to Amaravati. Vastu-compliant plots available. Phase II now open for booking.',
    approvals:   ['APCRDA Proposed Layout', '100% Vastu Compliant', 'Clear Title', 'RERA Registered'],
    highlights: [
      'Near ORR — excellent AP Capital connectivity',
      '12 km from Amaravati Capital City',
      'Govt. Proposed Railway Connectivity from Amaravati',
      'Near Amrita Sai, MVR & MIC Engineering Colleges',
      'Close to Nimra Medical College',
      'Near Mulapadu International Cricket Stadium',
      'Proposed Logistic Hub at Paritala',
      'Govt. Proposed Cine Studio near Nandigama',
    ],
    facings: { east: 119, west: 138, north: 16 },
    pricing: {
      east:    { base: 12000, dev: 1000, label: 'Rs.12,000 + Rs.1,000 Dev. Charges' },
      west:    { base: 11500, dev: 1000, label: 'Rs.11,500 + Rs.1,000 Dev. Charges' },
      corners: [
        { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
        { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
      ],
      note: 'All prices per sq. yard. Corner charges additional.',
    },
    amenities: [
      { tab: 'INFRA',     icon: '🏛', label: 'Security Arch — Grand Entrance',       sortOrder: 1  },
      { tab: 'INFRA',     icon: '🛣', label: 'BT Roads Throughout Layout',           sortOrder: 2  },
      { tab: 'INFRA',     icon: '💧', label: 'Water Tank & Pipeline Connection',      sortOrder: 3  },
      { tab: 'INFRA',     icon: '📋', label: 'Name & Number Display Board per Plot', sortOrder: 4  },
      { tab: 'INFRA',     icon: '🔧', label: 'Drainage System',                      sortOrder: 5  },
      { tab: 'INFRA',     icon: '🧱', label: 'Compound Wall',                        sortOrder: 6  },
      { tab: 'LIFESTYLE', icon: '🌳', label: 'Avenue Plantation',                    sortOrder: 7  },
      { tab: 'LIFESTYLE', icon: '🏃', label: 'Walking Track',                        sortOrder: 8  },
      { tab: 'LIFESTYLE', icon: '✅', label: '100% Vastu Compliance',                sortOrder: 9  },
      { tab: 'LIFESTYLE', icon: '🎡', label: "Children's Play Area",                 sortOrder: 10 },
      { tab: 'LIFESTYLE', icon: '🏞', label: 'Modern Park',                          sortOrder: 11 },
      { tab: 'UTILITIES', icon: '💡', label: 'Electricity Connection',               sortOrder: 12 },
      { tab: 'UTILITIES', icon: '🚰', label: 'Pure Drinking Water',                  sortOrder: 13 },
      { tab: 'UTILITIES', icon: '⚡', label: 'Designed LED Street Lights',           sortOrder: 14 },
    ],
    gallery: [
      { label: 'Grand Entrance Arch',    icon: '🏛' },
      { label: 'BT Road Layout',         icon: '🛣' },
      { label: 'Avenue Plantation',      icon: '🌳' },
      { label: "Children's Play Area",   icon: '🎡' },
      { label: 'Plot Layout — Phase II', icon: '🏞' },
      { label: 'Modern Park',            icon: '🌸' },
    ],
    videos: [
      { id: 'ccUqV-C1rZQ', type: 'youtube', title: 'Aparna Legacy — Project Overview', subtitle: 'Chevitikallu layout walkthrough' },
    ],
    distances: [
      { icon: '🏛', name: 'Amaravati Capital',    subtitle: 'New AP State Capital',       distance: '12 km'    },
      { icon: '🛣', name: 'Outer Ring Road (ORR)', subtitle: 'Proposed — excellent access', distance: 'Adjacent' },
      { icon: '🎓', name: 'Engineering Colleges', subtitle: 'Amrita Sai, MVR, MIC',       distance: '5 km'     },
      { icon: '🏥', name: 'Nimra Medical College', subtitle: 'Healthcare hub',             distance: '8 km'     },
      { icon: '🏏', name: 'Mulapadu Stadium',     subtitle: 'International Cricket',      distance: '7 km'     },
      { icon: '✈', name: 'Vijayawada Airport',    subtitle: 'Air connectivity',           distance: '18 km'    },
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Chevitikallu,NTR+District,Andhra+Pradesh,India&t=k&z=14&ie=UTF8&iwloc=&output=embed',
    mapOpenUrl:  'https://maps.google.com/?q=Chevitikallu,Kanchikacherla,Andhra+Pradesh',
    contact: {
      phone:    '+91 99487 09041',
      whatsapp: '919948709041',
      email:    'chaturbhujaplots@gmail.com',
      address:  'Chevitikallu Village, Kanchikacherla Mandal, NTR District, AP',
      website:  'www.chaturbhujaplots.in',
    },
  },

  {
    id:          'varaha',
    name:        'Varaha Virtue',
    loc:         'Pamarru, Krishna District',
    fullAddress: 'Pamarru Village & Mandal, Krishna District, AP (on NH-16)',
    tag:         'Hot',
    status:      'APCRDA Proposed Layout | NH-16 Frontage',
    available:   20,
    total:       132,
    starting:    'Rs.25L',
    upcoming:    false,
    description: 'Strategic investment opportunity on the NH-16 corridor at Pamarru, Krishna District. APCRDA proposed layout with 132 meticulously planned plots — prime NH-16 frontage, near Bandar Port, BEL defence complex and upcoming 6-lane highway. Exceptional appreciation potential.',
    approvals:   ['APCRDA Proposed Layout', 'NH-16 Frontage', '100% Clear Title', 'Vastu Compliant'],
    highlights: [
      'Directly Adjacent to NH-16 National Highway',
      '15 km from Kathipudi-Ongole Highway',
      '5 km to BEL Company (Defence PSU)',
      '20 km to Bandar Port',
      'Adjacent to Proposed 6-Lane Vijayawada-Machilipatnam Road',
      'Near World-Renowned Bharatanatyam Institution (6 km)',
      'Near Prestigious Engineering Colleges',
      'Ready-to-Build Housing Project',
    ],
    facings: { east: 79, west: 53 },
    pricing: {
      east:    { base: 15000, dev: 1000, label: 'Rs.15,000 + Rs.1,000 Dev. Charges' },
      west:    { base: 14500, dev: 1000, label: 'Rs.14,500 + Rs.1,000 Dev. Charges' },
      corners: [
        { type: 'North-East Corner', extra: 1000, label: 'Rs.1,000/sq.yd extra' },
        { type: 'Other Corners',     extra: 500,  label: 'Rs.500/sq.yd extra'   },
      ],
      corpus: { amount: 100, label: 'Rs.100/sq.yd Corpus Fund' },
      note: 'All prices per sq. yard. Corner charges additional.',
    },
    amenities: [
      { tab: 'INFRA',     icon: '🏛', label: 'Security Arch — Grand Entrance',       sortOrder: 1  },
      { tab: 'INFRA',     icon: '🛣', label: 'CC Roads Throughout Layout',           sortOrder: 2  },
      { tab: 'INFRA',     icon: '💧', label: 'Water Tank & Pipeline Connection',      sortOrder: 3  },
      { tab: 'INFRA',     icon: '📋', label: 'Name & Number Display Board',          sortOrder: 4  },
      { tab: 'INFRA',     icon: '🔧', label: 'Drainage System',                      sortOrder: 5  },
      { tab: 'INFRA',     icon: '🧱', label: 'Compound Wall',                        sortOrder: 6  },
      { tab: 'LIFESTYLE', icon: '🌳', label: 'Avenue Plantation on All Road Sides',  sortOrder: 7  },
      { tab: 'LIFESTYLE', icon: '🏃', label: 'Walking Track',                        sortOrder: 8  },
      { tab: 'LIFESTYLE', icon: '✅', label: '100% Vastu Compliance',                sortOrder: 9  },
      { tab: 'LIFESTYLE', icon: '🎡', label: "Children's Play Area",                 sortOrder: 10 },
      { tab: 'LIFESTYLE', icon: '🏞', label: 'Modern Park — Open Space (0.45 Ac)',   sortOrder: 11 },
      { tab: 'UTILITIES', icon: '💡', label: 'Electricity Connection',               sortOrder: 12 },
      { tab: 'UTILITIES', icon: '🚰', label: 'Pure Drinking Water',                  sortOrder: 13 },
      { tab: 'UTILITIES', icon: '⚡', label: 'Designed LED Street Lights',           sortOrder: 14 },
    ],
    gallery: [
      { label: 'NH-16 Frontage',            icon: '🛣' },
      { label: 'Grand Entrance & Security', icon: '🏛' },
      { label: 'Avenue Plantation',         icon: '🌳' },
      { label: "Children's Play Area",      icon: '🎡' },
      { label: 'Plot Layout Overview',      icon: '🏞' },
      { label: 'Walking Track',             icon: '🏃' },
    ],
    videos: [
      { id: 'TSUf2Pd5LGw', type: 'youtube', title: 'Varaha Virtue — Project Overview', subtitle: 'NH-16 corridor investment opportunity' },
    ],
    distances: [
      { icon: '🛣', name: 'NH-16 National Highway',    subtitle: 'Directly Adjacent',                 distance: '0 km'  },
      { icon: '🏭', name: 'BEL Company (Defence PSU)', subtitle: 'Bharat Electronics Limited',        distance: '5 km'  },
      { icon: '🚢', name: 'Bandar Port',               subtitle: 'Major commercial seaport',          distance: '20 km' },
      { icon: '🎭', name: 'Bharatanatyam Institution', subtitle: 'World-renowned arts centre',        distance: '6 km'  },
      { icon: '🎓', name: 'Engineering Colleges',      subtitle: 'Multiple prestigious institutions', distance: '8 km'  },
      { icon: '🏙', name: 'Vijayawada',                subtitle: 'Commercial capital of AP',          distance: '25 km' },
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Pamarru,Krishna+District,Andhra+Pradesh,India&t=k&z=14&ie=UTF8&iwloc=&output=embed',
    mapOpenUrl:  'https://maps.google.com/?q=Pamarru,Andhra+Pradesh',
    contact: {
      phone:    '+91 99487 09041',
      whatsapp: '919948709041',
      email:    'chaturbhujaplots@gmail.com',
      address:  'Pamarru Village & Mandal, Krishna District, AP',
      website:  'www.chaturbhujaplots.in',
    },
  },

  {
    id:          'trimbak',
    name:        'Trimbak Oaks',
    loc:         'Penamaluru, Near Vijayawada',
    fullAddress: 'Penamaluru, Krishna District, Andhra Pradesh',
    tag:         'Upcoming',
    status:      'Details Coming Soon',
    available:   0,
    total:       48,
    starting:    'Coming Soon',
    upcoming:    true,
    description: 'Gated community plots offering excellent connectivity to Vijayawada city via NH-16. CRDA approved with all modern infrastructure — water, electricity, drainage and security — ready for immediate construction.',
    approvals:   ['CRDA Approved', 'RERA Registered', '100% Clear Title'],
    highlights: [
      '5 km from Vijayawada City Centre',
      'NH-16 Direct Access',
      'Gated Community with 24/7 Security',
      'Water & Electricity on every plot',
      'Ready for immediate construction',
      'Housing loans available',
    ],
    facings: {},
    pricing: {},
    amenities: [
      { tab: 'INFRA',     icon: '🏛', label: 'Gated Entrance with Security Arch', sortOrder: 1 },
      { tab: 'INFRA',     icon: '🛣', label: '40ft Internal CC Roads',            sortOrder: 2 },
      { tab: 'INFRA',     icon: '💡', label: 'Overhead Electricity Connection',   sortOrder: 3 },
      { tab: 'INFRA',     icon: '💧', label: 'Borewell & Pipeline Water Supply',  sortOrder: 4 },
      { tab: 'INFRA',     icon: '🔒', label: 'Gated Security 24/7',              sortOrder: 5 },
      { tab: 'LIFESTYLE', icon: '🌳', label: 'Tree-Lined Avenues',               sortOrder: 6 },
      { tab: 'LIFESTYLE', icon: '✅', label: '100% Vaastu Compliant',            sortOrder: 7 },
      { tab: 'UTILITIES', icon: '📡', label: 'CCTV Surveillance',                sortOrder: 8 },
      { tab: 'UTILITIES', icon: '⚡', label: 'LED Street Lights',                sortOrder: 9 },
    ],
    gallery: [
      { label: 'Main Entrance Gate', icon: '🏛' },
      { label: 'Internal Roads',     icon: '🛣' },
      { label: 'Plot Overview',      icon: '🏞' },
    ],
    videos: [
      { id: '', type: 'youtube', title: 'Trimbak Oaks — Project Overview', subtitle: 'Coming Soon' },
    ],
    distances: [
      { icon: '🏙', name: 'Vijayawada City',   subtitle: 'Business & commercial hub', distance: '5 km'  },
      { icon: '🛣', name: 'NH-16 Highway',     subtitle: 'Direct access',             distance: '2 km'  },
      { icon: '✈', name: 'Vijayawada Airport', subtitle: 'Air connectivity',          distance: '12 km' },
    ],
    mapEmbedUrl: 'https://maps.google.com/maps?q=Penamaluru,Andhra+Pradesh,India&t=k&z=14&ie=UTF8&iwloc=&output=embed',
    mapOpenUrl:  'https://maps.google.com/?q=Penamaluru,Andhra+Pradesh',
    contact: {
      phone:    '+91 99487 09041',
      whatsapp: '919948709041',
      email:    'chaturbhujaplots@gmail.com',
      address:  'Penamaluru, Krishna District, AP',
      website:  'www.chaturbhujaplots.in',
    },
  },
]

/**
 * seedProjects — inserts only missing project documents.
 * Existing documents are NOT overwritten (use Compass $set to update).
 */
async function seedProjects() {
  try {
    for (const project of PROJECTS_SEED) {
      const exists = await Project.findOne({ id: project.id })
      if (!exists) {
        await Project.create(project)
        console.log('[projects.seed] Seeded:', project.id)
      } else {
        console.log('[projects.seed] Already exists, skipping:', project.id)
      }
    }
    console.log('[projects.seed] Done')
  } catch (err) {
    console.error('[projects.seed] Error:', err.message)
  }
}

module.exports = { seedProjects }
