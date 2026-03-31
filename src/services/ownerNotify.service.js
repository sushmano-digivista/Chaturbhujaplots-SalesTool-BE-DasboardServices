/**
 * ownerNotify.service.js
 * Sends instant email alert to owner/director on every new lead.
 *
 * Env vars required:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS  — same Gmail creds as brochure service
 *   OWNER_EMAIL  — who receives the alert (defaults to SMTP_USER if not set)
 */
const nodemailer = require('nodemailer')

const SOURCE_LABELS = {
  HERO_CTA:             'Hero — Enquire Now button',
  CATEGORY_ENQUIRY:     'Plot Category Enquiry',
  CONTACT_FORM:         'Contact Section Form',
  STICKY_BAR:           'Sticky Bottom Bar',
  WHATSAPP:             'WhatsApp Bot',
  FLOATING_BUTTON:      'Floating WhatsApp Button',
  DIMENSION_ENQUIRY:    'Plot Dimensions Enquiry',
  PROJECT_HOME:         'Project Detail Page',
  SITE_VISIT_SCHEDULED: 'Site Visit Booking',
  UPCOMING_INTEREST:    'Upcoming Project Interest',
  CALLBACK_FORM:        'Callback Request',
}

function createTransport() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    // Remove spaces — Gmail App Passwords display with spaces but work without
    auth: { user: process.env.SMTP_USER, pass: (process.env.SMTP_PASS || '').replace(/\s/g, '') },
  })
}

function formatIST(date) {
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short',
  })
}

function row(label, value, shade) {
  const bg = shade ? 'background:#f0ede4;' : ''
  return `
    <tr>
      <td style="padding:9px 14px;${bg}font-weight:700;color:#555;width:36%;">${label}</td>
      <td style="padding:9px 14px;${bg}color:#111;">${value}</td>
    </tr>`
}

async function sendOwnerLeadAlert(lead) {
  const ownerEmail = process.env.OWNER_EMAIL || process.env.SMTP_USER
  if (!ownerEmail || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('[ownerNotify] SMTP not configured — owner alert skipped')
    return
  }

  const phone    = (lead.phone || '').replace(/\D/g, '').replace(/^91/, '')
  const project  = lead.projectInterest  || 'Not specified'
  const category = lead.categoryInterest || 'Not specified'
  const source   = SOURCE_LABELS[lead.source] || lead.source || 'Unknown'
  const time     = formatIST(lead.createdAt || new Date())
  const waHref   = phone ? `https://wa.me/91${phone}` : null
  const telHref  = phone ? `tel:+91${phone}` : null

  const html = `
<div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;
  border:1px solid #ddd;border-radius:10px;overflow:hidden;">

  <div style="background:#1E4D2B;padding:22px 28px;">
    <h2 style="color:#C9A84C;margin:0;font-size:20px;">🔔 New Enquiry Received</h2>
    <p style="color:rgba(255,255,255,.65);margin:5px 0 0;font-size:12px;">${time} IST · Chaturbhuja Sales Tool</p>
  </div>

  <div style="padding:24px 28px;background:#fafaf7;">
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-radius:6px;overflow:hidden;">
      ${row('👤 Name',           `<strong>${lead.name}</strong>`,          false)}
      ${row('📱 Mobile',         telHref ? `<a href="${telHref}" style="color:#1E4D2B;font-weight:700;text-decoration:none;">+91 ${phone}</a>` : 'Not provided', true)}
      ${row('📧 Email',          lead.email || '<span style="color:#aaa;">Not provided</span>', false)}
      ${row('🏘 Project',        `<strong style="color:#1E4D2B;">${project}</strong>`,  true)}
      ${row('📐 Plot Interest',  category,  false)}
      ${row('📍 Enquiry From',   source,    true)}
    </table>

    <div style="margin-top:22px;">
      ${telHref ? `<a href="${telHref}" style="background:#1E4D2B;color:#fff;padding:12px 26px;
        border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;
        display:inline-block;margin-right:10px;">📞 Call Now</a>` : ''}
      ${waHref  ? `<a href="${waHref}"  style="background:#25D366;color:#fff;padding:12px 26px;
        border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;
        display:inline-block;">💬 WhatsApp</a>` : ''}
    </div>

    <p style="margin-top:18px;font-size:12px;color:#999;">
      ⚡ Best practice: Respond within <strong>30 minutes</strong> for highest conversion rate.
    </p>
  </div>

  <div style="padding:12px 28px;background:#f0ede4;font-size:11px;color:#aaa;text-align:center;">
    Chaturbhuja Properties &amp; Infra · Automated Lead Alert · Do not reply to this email
  </div>
</div>`

  try {
    await createTransport().sendMail({
      from:    `"Chaturbhuja Leads 🔔" <${process.env.SMTP_USER}>`,
      to:      ownerEmail,
      subject: `🔔 New Lead: ${lead.name} | ${phone} | ${project}`,
      html,
    })
    console.log(`[ownerNotify] ✓ Alert sent → ${ownerEmail}`)
  } catch (err) {
    console.error('[ownerNotify] ✗ Alert failed:', err.message)
    // Non-fatal — lead is already saved, just log and continue
  }
}

module.exports = { sendOwnerLeadAlert }
