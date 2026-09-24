// Supabase Edge Function (Deno): emails the site owner when a message arrives through the contact form.
// Triggered by a Database Webhook on INSERT into public.contacts (see SETUP.md), sends through Resend.
//
// Secrets (supabase secrets set ...):
//   RESEND_API_KEY   API key from resend.com
//   NOTIFY_EMAIL     where to send the notification
//   WEBHOOK_SECRET   shared secret, also sent by the webhook in the "x-webhook-secret" header
//   RESEND_FROM      optional sender, defaults to Resend's test sender

interface ContactRecord {
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: ContactRecord | null;
}

// Above this many messages in 24 hours, stop emailing (messages still reach the admin inbox).
// Keeps the Resend free quota (100 emails/day) safe even if someone floods the form.
const DAILY_EMAIL_LIMIT = 20;

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Messages received in the last 24 hours (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase). */
async function messagesInLastDay(): Promise<number | null> {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const response = await fetch(`${url}/rest/v1/contacts?select=id&created_at=gte.${encodeURIComponent(since)}`, {
    method: 'HEAD',
    headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact' },
  });
  // Content-Range looks like "*/12".
  const total = Number(response.headers.get('content-range')?.split('/')[1]);
  return Number.isFinite(total) ? total : null;
}

async function sendEmail(body: Record<string, unknown>) {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM') ?? 'Portfolio <onboarding@resend.dev>',
      to: [Deno.env.get('NOTIFY_EMAIL')],
      ...body,
    }),
  });
}

Deno.serve(async (request) => {
  const secret = Deno.env.get('WEBHOOK_SECRET');
  if (!secret || request.headers.get('x-webhook-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const payload = (await request.json()) as WebhookPayload;
  if (payload.type !== 'INSERT' || payload.table !== 'contacts' || !payload.record) {
    return new Response('Ignored', { status: 200 });
  }

  // Daily cap: one warning email when it is crossed, then silence until the count drops.
  const received = await messagesInLastDay();
  if (received !== null && received > DAILY_EMAIL_LIMIT) {
    if (received === DAILY_EMAIL_LIMIT + 1) {
      await sendEmail({
        subject: 'Portfolio : notifications suspendues',
        text: `Plus de ${DAILY_EMAIL_LIMIT} messages reçus en 24 heures : les notifications par email sont suspendues pour protéger ton quota Resend. Les messages continuent d'arriver dans l'admin (Messages). Si ce n'est pas normal, c'est probablement du spam.`,
      });
    }
    return new Response('Daily email limit reached', { status: 200 });
  }

  const message = payload.record;
  const date = new Date(message.created_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; color: #1b1a20;">
      <p style="color: #6b6978; font-size: 13px; margin: 0 0 16px;">Nouveau message depuis le portfolio · ${escapeHtml(date)}</p>
      <h2 style="margin: 0 0 8px; font-size: 18px;">${escapeHtml(message.subject)}</h2>
      <p style="margin: 0 0 20px; font-size: 14px;">
        <strong>${escapeHtml(message.name)}</strong> &lt;${escapeHtml(message.email)}&gt;
      </p>
      <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; padding: 16px; background: #f4f3f8; border-radius: 8px;">${escapeHtml(message.message)}</div>
      <p style="color: #6b6978; font-size: 13px; margin-top: 20px;">Répondre à cet email répond directement à ${escapeHtml(message.name)}.</p>
    </div>`;

  const response = await sendEmail({
    reply_to: message.email,
    subject: `Portfolio : ${message.subject}`,
    html,
    text: `${message.name} <${message.email}>\n${date}\n\n${message.subject}\n\n${message.message}`,
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend error', response.status, detail);
    return new Response('Email not sent', { status: 502 });
  }

  return new Response('Sent', { status: 200 });
});
