/**
 * ownerNotify.service.js
 * Notifies owner via WhatsApp (Twilio) + Email on every new lead.
 *
 * Env vars:
 *   SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT — Gmail SMTP
 *   OWNER_EMAIL  — alert recipient (must be DIFFERENT from SMTP_USER to avoid Gmail self-drop)
 *   OWNER_PHONE  — WhatsApp number e.g. 919739762698 (with country code, no +)
 *   TWILIO_SID, TWILIO_TOKEN — Twilio credentials
 */
const nodemailer = require('nodemailer')
const https      = require('https')

const SOURCE_LABELS = {
  HERO_CTA:             'Hero — Enquire Now',
  CATEGORY_ENQUIRY:     'Plot Category Enquiry',
  CONTACT_FORM:         'Contact Section Form',
  STICKY_BAR:           'Sticky Bottom Bar',
  WHATSAPP:             'WhatsApp Bot',
  FLOATING_BUTTON:      'Floating WhatsApp',
  DIMENSION_ENQUIRY:    'Plot Dimensions Enquiry',
  PROJECT_HOME:         'Project Detail Page',
  SITE_VISIT_SCHEDULED: 'Site Visit Booking',
  UPCOMING_INTEREST:    'Upcoming Project Interest',
  CALLBACK_FORM:        'Callback Request',
}

function formatIST(date) {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
  })
}

// ── WhatsApp via Twilio ────────────────────────────────────────────────────
async function sendWhatsAppAlert(lead) {
  const sid    = process.env.TWILIO_SID
  const token  = process.env.TWILIO_TOKEN
  const toNum  = process.env.OWNER_PHONE || '919739762698'
  const fromNum = '14155238886'  // Twilio sandbox number

  if (!sid || !token) {
    console.warn('[ownerNotify] Twilio not configured — WhatsApp alert skipped')
    return
  }

  const phone   = (lead.phone || '').replace(/\D/g, '').replace(/^91/, '')
  const project = lead.projectInterest  || 'Not specified'
  const time    = formatIST(lead.createdAt || new Date())
  const source  = SOURCE_LABELS[lead.source] || lead.source || 'Unknown'

  const body = [
    '🔔 *New Enquiry — Chaturbhuja*',
    '',
    `👤 *Name:* ${lead.name}`,
    `📱 *Mobile:* +91 ${phone}`,
    `📧 *Email:* ${lead.email || 'Not provided'}\`,
    `🏘 *Project:* ${project}\`,
    `📍 *Source:* ${source}\`,
    `🕐 *Time:* ${time} IST\`,
    '',
    '⚡ Respond within 30 minutes!',
  ].join('\n')

  const params = new URLSearchParams({
    From: `whatsapp:+${fromNum}`,
    To:   `whatsapp:+${toNum}`,
    Body: body,
  })

  const auth = Buffer.from(`${sid}:${token}`).toString('base64')

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.twilio.com',
      path:     `/2010-04-01/Accounts/${sid}/Messages.json`,
      method:   'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type':  'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString()),
      },
    }, (res) => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log(`[ownerNotify] ✓ WhatsApp alert sent to +${toNum}`)
        } else {
          console.error(`[ownerNotify] ✗ WhatsApp failed: ${res.statusCode} ${data.slice(0,100)}`)
        }
        resolve()
      })
    })
    req.on('error', (e) => { console.error('[ownerNotify] WA error:', e.message); resolve() })
    req.write(params.toString())
    req.end()
  })
}

// ── Email via SMTP ─────────────────────────────────────────────────────────
async function sendEmailAlert(lead) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[ownerNotify] SMTP not configured — email alert skipped')
    return
  }
  // IMPORTANT: OWNER_EMAIL must be DIFFERENT from SMTP_USER
  // Gmail drops self-sent SMTP emails silently
  if (ownerEmail === process.env.SMTP_USER) {
    console.warn('[ownerNotify] OWNER_EMAIL equals SMTP_USER — Gmail will drop self-sent emails. Set OWNER_EMAIL to a different address.')
  }

  const phone    = (lead.phone || '').replace(/\D/g, '').replace(/^91/, '')
  const project  = lead.projectInterest  || 'Not specified'
  const category = lead.categoryInterest || 'Not specified'
  const source   = SOURCE_LABELS[lead.source] || lead.source || 'Unknown'
  const time     = formatIST(lead.createdAt || new Date())
  const telLink  = phone ? `tel:+91${phone}` : null
  const waLink   = phone ? `https://wa.me/91${phone}` : null

  const html = `<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #ddd;border-radius:10px;overflow:hidden;">
  <div style="background:#1E4D2B;padding:22px 28px;">
    <h2 style="color:#C9A84C;margin:0;font-size:20px;">🔔 New Enquiry Received</h2>
    <p style="color:rgba(255,255,255,.65);margin:5px 0 0;font-size:12px;">${time} IST</p>
  </div>
  <div style="padding:24px 28px;background:#fafaf7;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:9px 14px;font-weight:700;color:#555;width:36%;">👤 Name</td><td style="padding:9px 14px;color:#111;"><strong>${lead.name}</strong></td></tr>
      <tr><td style="padding:9px 14px;background:#f0ede4;font-weight:700;color:#555;">📱 Mobile</td><td style="padding:9px 14px;background:#f0ede4;">${telLink?`<a href="${telLink}" style="color:#1E4D2B;font-weight:700;text-decoration:none;">+91 ${phone}</a>`:"Not provided"}</td></tr>
      <tr><td style="padding:9px 14px;font-weight:700;color:#555;">📧 Email</td><td style="padding:9px 14px;color:#111;">${lead.email||'<span style="color:#aaa;">Not provided</span>'}</td></tr>
      <tr><td style="padding:9px 14px;background:#f0ede4;font-weight:700;color:#555;">🏘 Project</td><td style="padding:9px 14px;background:#f0ede4;"><strong style="color:#1E4D2B;">${project}</strong></td></tr>
      <tr><td style="padding:9px 14px;font-weight:700;color:#555;">📐 Plot</td><td style="padding:9px 14px;color:#111;">${category}</td></tr>
      <tr><td style="padding:9px 14px;background:#f0ede4;font-weight:700;color:#555;">📍 Source</td><td style="padding:9px 14px;background:#f0ede4;color:#666;">${source}</td></tr>
    </table>
    <div style="margin-top:20px;">
      ${telLink?`<a href="${telLink}" style="background:#1E4D2B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;margin-right:10px;">📞 Call</a>`:""}
      ${waLink?`<a href="${waLink}" style="background:#25D366;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">💬 WhatsApp</a>`:""}
    </div>
    <p style="margin-top:16px;font-size:12px;color:#999;">⚡ Respond within 30 minutes for best conversion.</p>
  </div>
  <div style="padding:12px 28px;background:#f0ede4;font-size:11px;color:#aaa;text-align:center;">Chaturbhuja Properties &amp; Infra · Automated Lead Alert</div>
</div>`

  try {
    const transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: (process.env.SMTP_PASS || '').replace(/\s/g, ''),
      },
    })
    await transporter.sendMail({
      from:    `"Chaturbhuja Leads 🔔" <${process.env.SMTP_USER}>`,
      to:      ownerEmail,
      subject: `🔔 New Lead: ${lead.name} | +91${phone} | ${project}`,
      html,
    })
    console.log(`[ownerNotify] ✓ Email alert sent → ${ownerEmail}`)
  } catch (err) {
    console.error('[ownerNotify] ✗ Email failed:', err.message)
  }
}

// ── Main export ────────────────────────────────────────────────────────────
async function sendOwnerLeadAlert(lead) {
  // Run both in parallel — WhatsApp for instant mobile, email for records
  await Promise.allSettled([
    sendWhatsAppAlert(lead),
    sendEmailAlert(lead),
  ])
}

module.exports = { sendOwnerLeadAlert }
