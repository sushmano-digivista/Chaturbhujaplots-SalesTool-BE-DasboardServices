/**
 * ownerNotify.service.js
 * Notifies owner via WhatsApp (Twilio) + Email on every new lead.
 *
 * Env vars:
 *   SMTP_USER, SMTP_PASS, SMTP_HOST, SMTP_PORT  — Gmail SMTP
 *   OWNER_EMAIL  — alert recipient (must differ from SMTP_USER)
 *   OWNER_PHONE  — owner WhatsApp e.g. 919739762698
 *   TWILIO_SID, TWILIO_TOKEN  — Twilio credentials
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

// ── WhatsApp via Twilio Sandbox ─────────────────────────────────────────────
async function sendWhatsAppAlert(lead) {
  const sid    = process.env.TWILIO_SID
  const token  = process.env.TWILIO_TOKEN
  const toNum  = process.env.OWNER_PHONE || '919739762698'
  const fromNum = '14155238886'

  if (!sid || !token) {
    console.warn('[ownerNotify] Twilio not configured — WhatsApp alert skipped')
    return
  }

  const phone   = (lead.phone || '').replace(/\D/g, '').replace(/^91/, '')
  const project = lead.projectInterest  || 'Not specified'
  const source  = SOURCE_LABELS[lead.source] || lead.source || 'Unknown'
  const time    = formatIST(lead.createdAt || new Date())

  const lines = [
    '🔔 *New Enquiry — Chaturbhuja*',
    '',
    '*Name:* ' + lead.name,
    '*Mobile:* +91 ' + phone,
    '*Email:* ' + (lead.email || 'Not provided'),
    '*Project:* ' + project,
    '*Source:* ' + source,
    '*Time:* ' + time + ' IST',
    '',
    '⚡ Respond within 30 minutes!',
  ]

  const params = new URLSearchParams({
    From: 'whatsapp:+' + fromNum,
    To:   'whatsapp:+' + toNum,
    Body: lines.join('\n'),
  })

  const auth = Buffer.from(sid + ':' + token).toString('base64')

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.twilio.com',
      path:     '/2010-04-01/Accounts/' + sid + '/Messages.json',
      method:   'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type':  'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString()),
      },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('[ownerNotify] ✓ WhatsApp alert sent to +' + toNum)
        } else {
          console.error('[ownerNotify] ✗ WhatsApp failed: ' + res.statusCode)
        }
        resolve()
      })
    })
    req.on('error', (e) => { console.error('[ownerNotify] WA error:', e.message); resolve() })
    req.write(params.toString())
    req.end()
  })
}

// ── Email via SMTP ──────────────────────────────────────────────────────────
async function sendEmailAlert(lead) {
  const ownerEmail = process.env.OWNER_EMAIL
  if (!ownerEmail || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[ownerNotify] SMTP not configured — email alert skipped')
    return
  }

  if (ownerEmail === process.env.SMTP_USER) {
    console.warn('[ownerNotify] OWNER_EMAIL equals SMTP_USER — Gmail drops self-sent emails. Set OWNER_EMAIL to a different address.')
    return
  }

  const phone    = (lead.phone || '').replace(/\D/g, '').replace(/^91/, '')
  const project  = lead.projectInterest  || 'Not specified'
  const category = lead.categoryInterest || 'Not specified'
  const source   = SOURCE_LABELS[lead.source] || lead.source || 'Unknown'
  const time     = formatIST(lead.createdAt || new Date())

  const html = '<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;">'
    + '<div style="background:#1E4D2B;padding:20px;">'
    + '<h2 style="color:#C9A84C;margin:0;">New Enquiry — Chaturbhuja</h2>'
    + '<p style="color:rgba(255,255,255,.6);margin:4px 0 0;font-size:12px;">' + time + ' IST</p>'
    + '</div>'
    + '<div style="padding:20px;background:#fafaf7;">'
    + '<p><strong>Name:</strong> ' + lead.name + '</p>'
    + '<p><strong>Mobile:</strong> +91 ' + phone + '</p>'
    + '<p><strong>Email:</strong> ' + (lead.email || 'Not provided') + '</p>'
    + '<p><strong>Project:</strong> ' + project + '</p>'
    + '<p><strong>Plot Interest:</strong> ' + category + '</p>'
    + '<p><strong>Source:</strong> ' + source + '</p>'
    + '</div></div>'

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
      from:    '"Chaturbhuja Leads" <' + process.env.SMTP_USER + '>',
      to:      ownerEmail,
      subject: 'New Lead: ' + lead.name + ' | +91' + phone + ' | ' + project,
      html,
    })
    console.log('[ownerNotify] ✓ Email alert sent to ' + ownerEmail)
  } catch (err) {
    console.error('[ownerNotify] ✗ Email failed:', err.message)
  }
}

async function sendOwnerLeadAlert(lead) {
  await Promise.allSettled([
    sendWhatsAppAlert(lead),
    sendEmailAlert(lead),
  ])
}

// ── Customer thank-you via WhatsApp ─────────────────────────────────────────
// Sent to the LEAD (the visitor who submitted the form). Confirms we got
// their details and sets expectation that a callback is coming. Uses the
// same Twilio account as the owner alert.
//
// NOTE ON DELIVERABILITY:
//   - Twilio SANDBOX (default): the lead must have joined the sandbox by
//     messaging the sandbox keyword first. For a cold lead this fails
//     silently — that's OK, we just log and move on.
//   - Twilio PRODUCTION / Meta Cloud API: when properly approved, this
//     reaches any number. Requires a Business Account + template approval.
//   - We never want a customer-confirm failure to fail the lead submission,
//     so errors are caught and logged but never thrown.
async function sendCustomerConfirmation(lead) {
  const sid    = process.env.TWILIO_SID
  const token  = process.env.TWILIO_TOKEN
  const fromNum = '14155238886'

  if (!sid || !token) {
    console.warn('[customerConfirm] Twilio not configured — customer message skipped')
    return
  }

  // Normalise the lead phone: strip non-digits, ensure 91 country code
  const digits = String(lead.phone || '').replace(/\D/g, '')
  if (!/^\d{10,13}$/.test(digits)) {
    console.warn('[customerConfirm] Invalid phone format, skipping:', lead.phone)
    return
  }
  const e164 = digits.startsWith('91') ? digits : '91' + digits

  const firstName = (lead.name || '').trim().split(/\s+/)[0] || 'there'
  const ownerDisplayPhone = '+91 99487 09041'

  const lines = [
    'Hi ' + firstName + ',',
    '',
    'Thank you for your interest in *Chaturbhuja Properties & Infra* 🙏',
    '',
    'Our team will call you shortly with:',
    '✅ Latest on-the-spot price list',
    '✅ Available plot details',
    '✅ Site visit booking options',
    '',
    'For urgent queries, reach us directly:',
    '📞 ' + ownerDisplayPhone,
    '🌐 www.chaturbhujaplots.in',
    '',
    '— Team Chaturbhuja',
  ]

  const params = new URLSearchParams({
    From: 'whatsapp:+' + fromNum,
    To:   'whatsapp:+' + e164,
    Body: lines.join('\n'),
  })

  const auth = Buffer.from(sid + ':' + token).toString('base64')

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.twilio.com',
      path:     '/2010-04-01/Accounts/' + sid + '/Messages.json',
      method:   'POST',
      headers: {
        'Authorization':  'Basic ' + auth,
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(params.toString()),
      },
    }, (res) => {
      let data = ''
      res.on('data', c => { data += c })
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('[customerConfirm] ✓ WhatsApp confirmation sent to +' + e164)
        } else {
          // Most common failure on sandbox: "21608 — not a valid phone" or
          // "63016 — not in sandbox". Log and move on, never throw.
          console.warn('[customerConfirm] ✗ Customer WA failed (' + res.statusCode + '): ' + data.substring(0, 200))
        }
        resolve()
      })
    })
    req.on('error', (e) => { console.error('[customerConfirm] error:', e.message); resolve() })
    req.write(params.toString())
    req.end()
  })
}

// Kick off both owner + customer notifications in parallel.
// Customer confirmation is best-effort — we don't await it blocking-ly
// but we do still return from the combined function after both settle.
async function sendLeadNotifications(lead) {
  await Promise.allSettled([
    sendWhatsAppAlert(lead),
    sendEmailAlert(lead),
    sendCustomerConfirmation(lead),
  ])
}

module.exports = { sendOwnerLeadAlert, sendLeadNotifications, sendCustomerConfirmation }
