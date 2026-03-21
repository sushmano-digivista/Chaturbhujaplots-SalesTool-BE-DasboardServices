# Dashboard Service — Node.js

CMS content management + customer lead capture for Anjana Paradise platform.

## Tech Stack
- Node.js 18+ · Express · Mongoose · JWT · bcryptjs

## Port
`8082`

## Setup
```bash
npm install
cp .env.example .env   # fill in your MongoDB URI and JWT_SECRET
npm run dev
npm start
```

## API Endpoints

### Public (no auth)
```
GET  /api/v1/content        Full project content
POST /api/v1/leads          Submit customer enquiry
POST /api/v1/auth/login     Admin login → JWT token
GET  /health                Health check
```

### Admin (Bearer token required)
```
PUT   /api/v1/content             Replace all content
PATCH /api/v1/content/hero        Update hero section
PATCH /api/v1/content/highlights  Update highlights
PATCH /api/v1/content/amenities   Update amenities
PATCH /api/v1/content/distances   Update distances
PATCH /api/v1/content/quote       Update quote
PATCH /api/v1/content/contact     Update contact info
GET   /api/v1/leads               List all leads
GET   /api/v1/leads/stats         Lead pipeline stats
PATCH /api/v1/leads/:id           Update lead status
DELETE /api/v1/leads/:id          Delete lead
```

## Default Admin
```
username: admin
password: Dashboard@123
```

## Deploy on Vercel
1. Push to GitHub
2. Import on vercel.com
3. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGINS`
