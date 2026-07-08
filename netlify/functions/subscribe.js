'use strict';

// Georesolve Africa — lead capture → Brevo
//
// The static site (lead-capture.js, contact form) POSTs signups here. This
// function forwards each contact into a Brevo list. Secrets are Netlify build
// environment variables (never exposed to the browser):
//   BREVO_API_KEY   — Brevo API key (v3)
//   BREVO_LIST_ID   — numeric ID of the list to add subscribers to
//
// Endpoint is proxied at /api/subscribe (see netlify.toml).

const BREVO_API_URL = 'https://api.brevo.com/v3/contacts';

function parseBody(event) {
  const ct = (event.headers && (event.headers['content-type'] || event.headers['Content-Type'])) || '';
  const raw = event.body || '';
  if (ct.indexOf('application/json') !== -1) {
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }
  // application/x-www-form-urlencoded
  try {
    const params = new URLSearchParams(raw);
    const out = {};
    params.forEach(function (v, k) { out[k] = v; });
    return out;
  } catch (e) {
    return {};
  }
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: { Allow: 'POST' }, body: 'Method Not Allowed' };
  }

  const data = parseBody(event);
  const email = (data.email || '').toString().trim();
  if (!isValidEmail(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: 'invalid_email' })
    };
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);
  if (!apiKey || !Number.isFinite(listId)) {
    console.error('Brevo env missing: need BREVO_API_KEY and a numeric BREVO_LIST_ID');
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: 'config_missing' })
    };
  }

  // WP12-B: source attribution pushed to Brevo contact attributes.
  // SOURCE_TOOL / SOURCE_TRIGGER / SOURCE_PAGE (created in the Brevo list).
  const attributes = {};
  if (data.tool) attributes.SOURCE_TOOL = String(data.tool).slice(0, 60);
  if (data.trigger) attributes.SOURCE_TRIGGER = String(data.trigger).slice(0, 60);
  if (data.page) attributes.SOURCE_PAGE = String(data.page).slice(0, 250);

  const payload = {
    email: email,
    attributes: attributes,
    listIds: [listId],
    updateEnabled: true
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 201 || res.status === 204) {
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    const text = await res.text();
    console.error('Brevo error', res.status, text);
    // A contact that already exists should not surface as an error to the user.
    if (res.status === 400 && /already exist/i.test(text)) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, existed: true }) };
    }
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, error: 'brevo_error', status: res.status })
    };
  } catch (err) {
    console.error('Brevo request failed', err);
    return {
      statusCode: 502,
      body: JSON.stringify({ ok: false, error: 'brevo_request_failed' })
    };
  }
};
