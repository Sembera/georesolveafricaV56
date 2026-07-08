(function (global) {
  'use strict';

  const STORAGE_KEY = 'grs-leads';
  const VALID_TOOLS = ['g-resolog', 'g-resconvt', 'g-geopylanner', 'g-flightplanner'];
  const VALID_TRIGGERS = ['export', 'inline', 'contact'];
  const DEFAULT_STATE = { subscribed: false, dismissCount: 0, lastShown: 0 };
  const THANKS_TEXT = 'Thanks - you\'re on the list. We only email about tools and guides; unsubscribe anytime.';
  const PRIVACY_TEXT = 'No spam - tools and geoscience guides only. Unsubscribe anytime.';

  let memoryState = { ...DEFAULT_STATE };
  let shownThisSession = false;
  let escapeHandler = null;

  function normalizeConfig(config) {
    const next = { ...(config || {}) };
    if (!VALID_TOOLS.includes(next.tool)) next.tool = 'g-resolog';
    if (!VALID_TRIGGERS.includes(next.trigger)) next.trigger = 'inline';
    return next;
  }

  function readState() {
    try {
      const raw = global.localStorage && global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...memoryState };
      const parsed = JSON.parse(raw);
      return {
        subscribed: Boolean(parsed.subscribed),
        dismissCount: Number(parsed.dismissCount) || 0,
        lastShown: Number(parsed.lastShown) || 0
      };
    } catch (err) {
      return { ...memoryState };
    }
  }

  function writeState(patch) {
    const next = { ...readState(), ...(patch || {}) };
    memoryState = next;
    try {
      if (global.localStorage) {
        global.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch (err) {
      // Storage may be blocked; the in-memory state still prevents repeat prompts
      // during the current page session.
    }
    return next;
  }

  function injectStyles() {
    if (document.getElementById('grs-lead-capture-styles')) return;
    const style = document.createElement('style');
    style.id = 'grs-lead-capture-styles';
    style.textContent = `
      .grs-lead-card {
        background: #fff;
        border: 1px solid var(--border-color, #e1e8ed);
        border-radius: 8px;
        box-shadow: var(--shadow-medium, 0 8px 30px rgba(52, 83, 99, 0.15));
        color: var(--text-dark, #1a1a1a);
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        max-width: 420px;
        padding: 18px;
      }
      .grs-lead-card--toast {
        bottom: 18px;
        opacity: 0;
        position: fixed;
        right: 18px;
        transform: translateY(16px);
        transition: opacity .22s ease, transform .22s ease;
        width: calc(100vw - 36px);
        z-index: 1200;
      }
      .grs-lead-card--toast.is-visible {
        opacity: 1;
        transform: translateY(0);
      }
      .grs-lead-card--inline {
        margin: 18px auto;
        max-width: 720px;
      }
      .grs-lead-title {
        color: var(--primary-color, #345363);
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 1.18rem;
        font-weight: 700;
        line-height: 1.25;
        margin: 0 0 8px;
      }
      .grs-lead-copy {
        color: #555;
        font-size: .94rem;
        line-height: 1.5;
        margin: 0 0 14px;
      }
      .grs-lead-form {
        align-items: stretch;
        display: flex;
        gap: 8px;
      }
      .grs-lead-input {
        border: 2px solid var(--border-color, #e1e8ed);
        border-radius: 6px;
        flex: 1;
        font: inherit;
        min-width: 0;
        padding: 10px 12px;
      }
      .grs-lead-input:focus {
        border-color: var(--accent-color, #4DA34D);
        box-shadow: 0 0 0 3px rgba(77, 163, 77, .12);
        outline: none;
      }
      .grs-lead-button {
        background: var(--accent-color, #4DA34D);
        border: 0;
        border-radius: 6px;
        color: #fff;
        cursor: pointer;
        font: inherit;
        font-weight: 700;
        padding: 10px 14px;
        white-space: nowrap;
      }
      .grs-lead-button:disabled {
        cursor: wait;
        opacity: .72;
      }
      .grs-lead-dismiss {
        background: transparent;
        border: 0;
        color: var(--primary-color, #345363);
        cursor: pointer;
        display: inline-block;
        font: inherit;
        font-size: .9rem;
        margin-top: 10px;
        padding: 0;
        text-decoration: underline;
      }
      .grs-lead-privacy,
      .grs-lead-status {
        color: #666;
        font-size: .82rem;
        line-height: 1.4;
        margin: 10px 0 0;
      }
      .grs-lead-status {
        color: var(--primary-color, #345363);
        min-height: 1.2em;
      }
      @media (max-width: 560px) {
        .grs-lead-card--toast {
          bottom: 12px;
          right: 12px;
          width: calc(100vw - 24px);
        }
        .grs-lead-form {
          flex-direction: column;
        }
        .grs-lead-button {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function createElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text != null) el.textContent = text;
    return el;
  }

  function setConfirmation(card) {
    card.innerHTML = '';
    const title = createElement('h3', 'grs-lead-title', THANKS_TEXT);
    title.setAttribute('aria-live', 'polite');
    card.appendChild(title);
    card.appendChild(createElement('p', 'grs-lead-privacy', PRIVACY_TEXT));
  }

  function dismissToast(card, shouldCount) {
    if (shouldCount) {
      const state = readState();
      writeState({ dismissCount: state.dismissCount + 1 });
    }
    if (escapeHandler) {
      document.removeEventListener('keydown', escapeHandler);
      escapeHandler = null;
    }
    card.classList.remove('is-visible');
    setTimeout(() => {
      if (card.parentNode) card.parentNode.removeChild(card);
    }, 240);
  }

  function buildCard(instance, options) {
    const isToast = options.kind === 'toast';
    const trigger = options.trigger || instance.config.trigger;
    const card = createElement('section', `grs-lead-card grs-lead-card--${isToast ? 'toast' : 'inline'}`);
    const titleId = `grs-lead-title-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    card.setAttribute('aria-labelledby', titleId);
    card.setAttribute('data-tool', instance.config.tool);
    card.setAttribute('data-trigger', trigger);

    const headline = isToast
      ? 'File ready ✓ - want more?'
      : 'Free tools by Georesolve - get updates & field templates';
    const copy = isToast
      ? 'Get field templates and be first to know when we launch new tools (map-based survey planner & drone flight planner are coming).'
      : 'Get field templates and be first to know when we launch new tools.';

    const title = createElement('h3', 'grs-lead-title', headline);
    title.id = titleId;
    const body = createElement('p', 'grs-lead-copy', copy);
    const form = createElement('form', 'grs-lead-form');
    form.noValidate = true;
    const email = createElement('input', 'grs-lead-input');
    email.type = 'email';
    email.name = 'email';
    email.autocomplete = 'email';
    email.placeholder = 'Email address';
    email.required = true;
    email.setAttribute('aria-label', 'Email address');
    const button = createElement('button', 'grs-lead-button', 'Join the list');
    button.type = 'submit';
    const status = createElement('p', 'grs-lead-status', '');
    status.setAttribute('aria-live', 'polite');
    const privacy = createElement('p', 'grs-lead-privacy', PRIVACY_TEXT);

    form.appendChild(email);
    form.appendChild(button);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      instance.submit({
        email: email.value,
        trigger,
        card,
        emailInput: email,
        button,
        status
      });
    });

    card.appendChild(title);
    card.appendChild(body);
    card.appendChild(form);
    if (isToast) {
      const dismiss = createElement('button', 'grs-lead-dismiss', 'No thanks');
      dismiss.type = 'button';
      dismiss.addEventListener('click', () => dismissToast(card, true));
      card.appendChild(dismiss);
    }
    card.appendChild(status);
    card.appendChild(privacy);

    return { card, email };
  }

  function LeadCapture(config) {
    this.config = normalizeConfig(config);
  }

  LeadCapture.prototype.showAfterExport = function () {
    const state = readState();
    if (state.subscribed || state.dismissCount >= 2 || shownThisSession) return;

    shownThisSession = true;
    writeState({ lastShown: Date.now() });
    injectStyles();

    const existing = document.querySelector('.grs-lead-card--toast');
    if (existing) existing.remove();

    const previousFocus = document.activeElement;
    const built = buildCard(this, { kind: 'toast', trigger: 'export' });
    document.body.appendChild(built.card);
    requestAnimationFrame(() => built.card.classList.add('is-visible'));

    escapeHandler = (event) => {
      if (event.key === 'Escape') {
        dismissToast(built.card, true);
        if (previousFocus && typeof previousFocus.focus === 'function') {
          previousFocus.focus({ preventScroll: true });
        }
      }
    };
    document.addEventListener('keydown', escapeHandler);

    setTimeout(() => {
      try {
        built.email.focus({ preventScroll: true });
      } catch (err) {
        built.email.focus();
      }
    }, 80);
  };

  LeadCapture.prototype.renderInlineCard = function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    injectStyles();
    container.innerHTML = '';
    const built = buildCard(this, { kind: 'inline', trigger: 'inline' });
    container.appendChild(built.card);
  };

  LeadCapture.prototype.submit = async function (options) {
    const opts = options || {};
    const email = String(opts.email || '').trim();
    const status = opts.status;
    const button = opts.button;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (status) status.textContent = 'Please enter a valid email address.';
      if (opts.emailInput) opts.emailInput.focus();
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = 'Joining...';
    }
    if (status) status.textContent = '';

    // WP12-B: forward signup to the Brevo function (proxied at /api/subscribe).
    // The function adds the contact to the Brevo list; the site never sees the
    // API key. Netlify Forms (tool-leads) is no longer used for the mailing list.
    const payload = {
      email: email,
      tool: this.config.tool,
      trigger: opts.trigger || this.config.trigger,
      pageUrl: global.location ? global.location.href : '',
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Lead form submission failed');
      writeState({ subscribed: true });
      if (opts.card) setConfirmation(opts.card);
    } catch (err) {
      if (status) status.textContent = 'Could not join just now - please try again.';
      if (button) {
        button.disabled = false;
        button.textContent = 'Join the list';
      }
    }
  };

  function createLeadCapture(config) {
    return new LeadCapture(config);
  }

  global.GeoresolveLeadCapture = {
    create: createLeadCapture,
    createLeadCapture: createLeadCapture,
    LeadCapture: LeadCapture,
    readState: readState
  };
})(globalThis);
