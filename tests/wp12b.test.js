'use strict';

// WP12-B local mock test — no real network / no real Brevo API calls.
// Covers:
//   1. Client submit() -> Brevo function success (no fallback).
//   2. Client submit() -> function absent/missing -> Netlify Forms fallback.
//   3. Client submit() -> function AND fallback fail -> error shown.
//   4. Client submit() -> invalid email -> no network.
//   5. Function posts correct attributes + listIds to Brevo (mocked).
//   6. Function treats "already exist" as 200.
//   7. Function rejects invalid email with 400.
//   8. Function rejects non-POST with 405.
//   9. Function returns 500 when env vars are missing.

const assert = require('assert');
const path = require('path');

// --- Load client module (IIFE sets globalThis.GeoresolveLeadCapture) ---
require(path.join(__dirname, '..', 'js', 'lead-capture.js'));
const CMS = globalThis.GeoresolveLeadCapture;
assert(CMS && typeof CMS.create === 'function', 'lead-capture module should load');

function makeOpts(email) {
  return {
    email: email,
    trigger: 'export',
    card: null,
    emailInput: { focus() {} },
    button: { disabled: false, textContent: '' },
    status: { textContent: '' }
  };
}

// Install a fetch mock. `primary` runs for the Brevo function URL, `fallback`
// runs for the Netlify Forms backup URL. Each is a thunk (may throw).
function installFetch(primary, fallback) {
  const calls = [];
  global.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).includes('/.netlify/functions/subscribe')) {
      return primary();
    }
    return fallback();
  };
  return calls;
}

let passed = 0;
function ok(name) { passed++; console.log('  ✓ ' + name); }

(async function run() {
  // 1. Function success -> no fallback.
  {
    const calls = installFetch(
      () => ({ ok: true, status: 200 }),
      () => ({ ok: true, status: 200 })
    );
    const opts = makeOpts('lead@example.com');
    await CMS.create({ tool: 'g-resolog', trigger: 'export' }).submit(opts);
    assert.strictEqual(calls.length, 1, 'only the function is called on success');
    assert.ok(calls[0].url.includes('/.netlify/functions/subscribe'), 'primary is the function');
    assert.strictEqual(opts.status.textContent, '', 'no error message on success');
    ok('function success: single call, no fallback');
  }

  // 2. Function absent -> Netlify Forms fallback succeeds.
  {
    const calls = installFetch(
      () => { throw new Error('network failure (function absent)'); },
      () => ({ ok: true, status: 200 })
    );
    const opts = makeOpts('lead@example.com');
    await CMS.create({ tool: 'g-resolog', trigger: 'export' }).submit(opts);
    assert.strictEqual(calls.length, 2, 'fallback is called when function fails');
    assert.ok(calls[0].url.includes('/.netlify/functions/subscribe'), 'first call targets the function');
    assert.strictEqual(calls[1].url, '/', 'fallback posts to the current page path');
    assert.ok(calls[1].init.body.includes('form-name=tool-leads'), 'fallback submits the tool-leads form');
    assert.ok(calls[1].init.body.includes('email=lead%40example.com'), 'fallback carries the email');
    assert.strictEqual(opts.status.textContent, '', 'no error when fallback succeeds');
    ok('function absent: fallback to Netlify Forms works');
  }

  // 3. Function AND fallback fail -> error shown, button restored.
  {
    const calls = installFetch(
      () => { throw new Error('network failure'); },
      () => ({ ok: false, status: 404, redirected: false })
    );
    const opts = makeOpts('lead@example.com');
    await CMS.create({ tool: 'g-resolog', trigger: 'export' }).submit(opts);
    assert.strictEqual(calls.length, 2, 'both calls attempted');
    assert.strictEqual(opts.status.textContent, 'Could not join just now - please try again.', 'error message shown when both fail');
    assert.strictEqual(opts.button.disabled, false, 'button re-enabled on total failure');
    assert.strictEqual(opts.button.textContent, 'Join the list', 'button label restored');
    ok('both fail: error shown, no lead silently dropped');
  }

  // 4. Invalid email -> no network at all.
  {
    const calls = installFetch(
      () => ({ ok: true, status: 200 }),
      () => ({ ok: true, status: 200 })
    );
    const opts = makeOpts('not-an-email');
    await CMS.create({ tool: 'g-resolog', trigger: 'export' }).submit(opts);
    assert.strictEqual(calls.length, 0, 'no network request for invalid email');
    assert.strictEqual(opts.status.textContent, 'Please enter a valid email address.', 'invalid email message shown');
    ok('invalid email: no network, inline message');
  }

  // --- Function (subscribe.js) tests with a mocked Brevo API ---
  process.env.BREVO_API_KEY = 'test-brevo-key';
  process.env.BREVO_LIST_ID = '7';
  const subscribe = require(path.join(__dirname, '..', 'netlify', 'functions', 'subscribe.js'));
  assert(subscribe && typeof subscribe.handler === 'function', 'subscribe function should load');

  function makeEvent(bodyObj) {
    return {
      httpMethod: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(bodyObj)
    };
  }

  // 5. Function posts correct attributes + listIds to Brevo.
  {
    let captured = null;
    global.fetch = async (url, init) => {
      if (String(url) === 'https://api.brevo.com/v3/contacts') {
        captured = { url: String(url), init };
        return { status: 201, text: async () => '' };
      }
      return { status: 200, text: async () => '' };
    };
    const res = await subscribe.handler(makeEvent({
      email: 'lead@example.com',
      tool: 'g-resolog',
      trigger: 'export',
      page: 'https://georesolveafrica.com/g-resolog.html'
    }), {});
    assert.strictEqual(res.statusCode, 200, 'Brevo 201 -> 200');
    assert.ok(captured, 'Brevo API should be called');
    assert.strictEqual(captured.init.headers['api-key'], 'test-brevo-key', 'api key sent as header, never to client');
    const body = JSON.parse(captured.init.body);
    assert.strictEqual(body.email, 'lead@example.com', 'email forwarded');
    assert.deepStrictEqual(body.listIds, [7], 'listIds = [Number(BREVO_LIST_ID)]');
    assert.strictEqual(body.updateEnabled, true, 'updateEnabled true');
    assert.strictEqual(body.attributes.SOURCE_TOOL, 'g-resolog', 'SOURCE_TOOL attribute');
    assert.strictEqual(body.attributes.SOURCE_TRIGGER, 'export', 'SOURCE_TRIGGER attribute');
    assert.strictEqual(body.attributes.SOURCE_PAGE, 'https://georesolveafrica.com/g-resolog.html', 'SOURCE_PAGE attribute');
    ok('function: correct Brevo payload + attributes');
  }

  // 6. Duplicate contact -> 200.
  {
    global.fetch = async (url) => {
      if (String(url) === 'https://api.brevo.com/v3/contacts') {
        return { status: 400, text: async () => 'Contact already exist' };
      }
      return { status: 200, text: async () => '' };
    };
    const res = await subscribe.handler(makeEvent({
      email: 'dup@example.com', tool: 'g-resolog', trigger: 'export', page: 'x'
    }), {});
    assert.strictEqual(res.statusCode, 200, 'already-exist duplicate -> 200');
    ok('function: duplicate contact treated as success');
  }

  // 7. Invalid email -> 400.
  {
    global.fetch = async () => ({ status: 200, text: async () => '' });
    const res = await subscribe.handler(makeEvent({
      email: 'bad', tool: 't', trigger: 'r', page: 'p'
    }), {});
    assert.strictEqual(res.statusCode, 400, 'invalid email -> 400');
    ok('function: server-side email validation');
  }

  // 8. Non-POST -> 405.
  {
    const res = await subscribe.handler({ httpMethod: 'GET', headers: {}, body: '' }, {});
    assert.strictEqual(res.statusCode, 405, 'GET -> 405');
    ok('function: rejects non-POST');
  }

  // 9. Missing env -> 500.
  {
    delete process.env.BREVO_API_KEY;
    global.fetch = async () => ({ status: 200, text: async () => '' });
    const res = await subscribe.handler(makeEvent({
      email: 'a@b.com', tool: 't', trigger: 'r', page: 'p'
    }), {});
    assert.strictEqual(res.statusCode, 500, 'missing env -> 500');
    process.env.BREVO_API_KEY = 'test-brevo-key';
    ok('function: missing env -> safe 500');
  }

  console.log('\nAll ' + passed + ' WP12-B checks passed.');
})().catch((err) => {
  console.error('\nWP12-B test FAILED:');
  console.error(err);
  process.exit(1);
});
