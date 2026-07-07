// Georesolve Africa — Method Selector wizard
// Strict, independent ES module. Reads method data embedded by build.js,
// renders the 4-step wizard UI, scores methods against user inputs, and
// outputs a ranked recommendation card with a CTA to contact.html.
'use strict';

const DATA_SELECTOR = '#methods-data';
const OBJECTIVES_CONTAINER_ID = 'wizard-objectives';
const CONDITIONS_CONTAINER_ID = 'wizard-conditions';
const DEPTH_SLIDER_ID = 'wizard-depth';
const DEPTH_VALUE_ID = 'wizard-depth-value';
const RUN_BUTTON_ID = 'wizard-run';
const OUTPUT_ID = 'wizard-output';

/**
 * Load the embedded method data. Returns null if the block is the build-time
 * placeholder (empty object) so the wizard degrades gracefully.
 */
function loadData() {
  const node = document.querySelector(DATA_SELECTOR);
  if (!node) return null;
  try {
    const data = JSON.parse(node.textContent);
    if (!data || !Array.isArray(data.methods) || data.methods.length === 0) return null;
    return data;
  } catch (err) {
    return null;
  }
}

/**
 * Render the objective options as a single-select radio group.
 */
function renderObjectives(data) {
  const root = document.getElementById(OBJECTIVES_CONTAINER_ID);
  if (!root) return;
  root.innerHTML = '';
  data.objectives.forEach((obj, idx) => {
    const label = document.createElement('label');
    label.className = 'wizard-option';
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'wizard-objective';
    input.value = obj.id;
    if (idx === 0) input.checked = true;
    const span = document.createElement('span');
    span.innerHTML = `<strong>${escapeHtml(obj.label)}</strong><br><span style="font-size:0.8rem;color:#777">${escapeHtml(obj.description)}</span>`;
    label.appendChild(input);
    label.appendChild(span);
    root.appendChild(label);
  });
}

/**
 * Render the site-condition options as a multi-select checkbox group.
 */
function renderConditions(data) {
  const root = document.getElementById(CONDITIONS_CONTAINER_ID);
  if (!root) return;
  root.innerHTML = '';
  data.siteConditions.forEach((cond) => {
    const label = document.createElement('label');
    label.className = 'wizard-option';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'wizard-condition';
    input.value = cond.id;
    const span = document.createElement('span');
    span.innerHTML = `<strong>${escapeHtml(cond.label)}</strong><br><span style="font-size:0.8rem;color:#777">${escapeHtml(cond.description)}</span>`;
    label.appendChild(input);
    label.appendChild(span);
    root.appendChild(label);
  });
}

/**
 * Wire up the depth slider live value.
 */
function initDepthSlider() {
  const slider = document.getElementById(DEPTH_SLIDER_ID);
  const valueEl = document.getElementById(DEPTH_VALUE_ID);
  if (!slider || !valueEl) return;
  const update = () => {
    valueEl.textContent = `${slider.value} m`;
  };
  slider.addEventListener('input', update);
  update();
}

/**
 * Read the current wizard inputs into a plain object.
 */
function readInputs(data) {
  const objectiveInput = document.querySelector('input[name="wizard-objective"]:checked');
  const objective = objectiveInput ? objectiveInput.value : null;
  const depth = parseInt(document.getElementById(DEPTH_SLIDER_ID).value, 10);
  const conditions = Array.from(document.querySelectorAll('input[name="wizard-condition"]:checked'))
    .map(cb => cb.value);
  const priorityInput = document.querySelector('input[name="wizard-priority"]:checked');
  const priority = priorityInput ? priorityInput.value : 'cost';
  return { objective, depth, conditions, priority };
}

/**
 * Score every method against the inputs and return a ranked list.
 *
 * Scoring:
 *  1. Eligibility filter: method.objectives must include the chosen objective.
 *  2. Depth window: method.depthRange_m must bracket (or at least reach) the
 *     target depth. Methods that fall short are filtered out. Methods that
 *     reach but don't fully bracket get a small penalty.
 *  3. Limitation penalties: each triggered site condition adds a penalty
 *     weighted by the method's limitationTriggers value.
 *  4. Priority weighting: normalise resolution/relCost/speed to 0-1 and
 *     combine so that the chosen priority dominates the final score.
 */
function scoreMethods(data, inputs) {
  const { objective, depth, conditions, priority } = inputs;
  const candidates = [];

  for (const method of data.methods) {
    // 0. Calibration methods (e.g. geotechnical drilling) are ground-truth,
    //    not primary screening methods — they are always offered as a
    //    follow-on in the scope line, never ranked as a top recommendation.
    if (method.role === 'calibration') continue;

    // 1. Objective filter
    if (!method.objectives || !method.objectives.includes(objective)) continue;

    // 2. Depth window
    const [minDepth, maxDepth] = method.depthRange_m;
    if (depth > maxDepth) continue; // method cannot reach the target
    // Methods that can bracket the target are ideal; others (minDepth > target)
    // get a mild penalty for overshoot.
    let depthScore = 1.0;
    if (depth < minDepth) {
      depthScore = 0.6; // target is above the method's sweet spot
    }

    // 3. Limitation penalties
    const triggers = method.limitationTriggers || {};
    let penalty = 0;
    for (const cond of conditions) {
      penalty += (triggers[cond] || 0);
    }
    // Normalise penalty to 0-1 (max possible is sum of 4 conditions * 5 = 20)
    const penaltyScore = Math.min(penalty / 12, 1);

    // 4. Priority weighting
    // Normalised metrics (higher = better for the user)
    const resolutionNorm = (method.resolution - 1) / 4;          // 1-5 → 0-1
    const costNorm = 1 - (method.relCost - 1) / 4;               // low relCost = high costNorm
    const speedNorm = Math.min(method.speed_km_per_day / 10, 1); // 0-10 km/day → 0-1

    // Base quality: blend of all three (equal prior)
    let baseQuality = (resolutionNorm + costNorm + speedNorm) / 3;

    // Priority boost: emphasise the chosen dimension
    const priorityWeight = 0.5;
    let priorityBoost = 0;
    if (priority === 'resolution') priorityBoost = resolutionNorm * priorityWeight;
    else if (priority === 'cost') priorityBoost = costNorm * priorityWeight;
    else if (priority === 'speed') priorityBoost = speedNorm * priorityWeight;

    const finalScore = (baseQuality + priorityBoost) * depthScore * (1 - penaltyScore);

    candidates.push({
      method,
      score: finalScore,
      penaltyScore,
      depthScore,
      triggered: conditions.filter(c => (triggers[c] || 0) > 0)
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

/**
 * Build the rationale paragraph (3 sentences referencing the inputs).
 */
function buildRationale(top, inputs, data) {
  const objectiveMeta = data.objectives.find(o => o.id === inputs.objective);
  const objectiveLabel = objectiveMeta ? objectiveMeta.label.toLowerCase() : inputs.objective;
  const depthStr = `${inputs.depth} m`;
  const condStr = inputs.conditions.length === 0
    ? 'an accessible site with no significant access constraints'
    : inputs.conditions.map(c => {
        const meta = data.siteConditions.find(s => s.id === c);
        return meta ? meta.label.toLowerCase() : c;
      }).join(', ');

  const m1 = top[0].method;
  const m2 = top[1] ? top[1].method : null;

  // Sentence 1: objective + depth + primary method
  let s1 = `For ${objectiveLabel} at a target depth of ${depthStr}, ${m1.name} is the strongest match because it directly images the relevant physical property to ${m1.depthRange_m[1]} m.`;

  // Sentence 2: site conditions + penalties + secondary method
  let s2;
  if (m2) {
    s2 = m2
      ? `Given ${condStr}, pairing it with ${m2.name} adds independent confirmation${top[1].triggered.length > 0 ? ` despite ${m2.name}'s sensitivity to ${top[1].triggered.join(', ')}` : ''}.`
      : `Given ${condStr}, a single-method approach is the most defensible.`;
  } else {
    s2 = `Given ${condStr}, ${m1.name} remains the most defensible single-method approach.`;
  }

  // Sentence 3: priority
  let s3;
  if (inputs.priority === 'cost') {
    s3 = `Cost is your stated priority, so we recommend the minimum line-kilometres that still produce a defensible model, with geotechnical drilling only at calibration points.`;
  } else if (inputs.priority === 'resolution') {
    s3 = `Resolution is your stated priority, so we recommend denser station spacing and, where budget allows, 3D acquisition to maximise lateral and vertical detail.`;
  } else {
    s3 = `Speed is your stated priority, so we recommend the fastest-acquiring layout that still meets the investigation depth, accepting some loss of fine detail.`;
  }

  return `${s1} ${s2} ${s3}`;
}

/**
 * Build the "Typical scope by Georesolve" line.
 */
function buildScope(top, inputs) {
  const parts = [];
  for (const candidate of top) {
    const m = candidate.method;
    const deliverables = m.deliverables.slice(0, 2).join('; ');
    parts.push(`${m.name}: ${m.deliverables.length}+ profile(s) delivering ${deliverables.toLowerCase()}.`);
  }
  if (inputs.objective !== 'utilities' && top.some(c => c.method.id !== 'geotechnical-drilling')) {
    parts.push('Geotechnical drilling at 2-3 calibration points for ground-truth correlation.');
  }
  return parts.join(' ');
}

/**
 * Render the result card into the output container.
 */
function renderOutput(top, inputs, data) {
  const out = document.getElementById(OUTPUT_ID);
  if (!out) return;

  if (top.length === 0) {
    out.classList.add('is-visible');
    out.innerHTML = `
      <p class="wizard-no-result">No single method in our toolkit cleanly covers that objective at the requested depth under those conditions. We would normally design a combined programme — please <a href="contact.html?service=geophysics&method=custom">contact our team</a> for a tailored proposal.</p>
    `;
    return;
  }

  const primary = top[0].method;
  const secondary = top[1] ? top[1].method : null;
  const methodNames = secondary
    ? `${escapeHtml(primary.name)} + ${escapeHtml(secondary.name)}`
    : escapeHtml(primary.name);
  const methodIds = secondary ? `${primary.id}+${secondary.id}` : primary.id;
  const ctaHref = `contact.html?service=geophysics&method=${encodeURIComponent(methodIds)}`;
  const rationale = buildRationale(top, inputs, data);
  const scope = buildScope(top, inputs);

  // Triggered limitations (honest)
  const triggeredNotes = top
    .filter(c => c.triggered.length > 0)
    .map(c => `<li><strong>${escapeHtml(c.method.name)}:</strong> sensitive to ${escapeHtml(c.triggered.join(', '))} — we mitigate with ${mitigationFor(c.triggered)}.</li>`)
    .join('');

  out.classList.add('is-visible');
  out.innerHTML = `
    <div class="wizard-output-label">Recommended method combination</div>
    <div class="wizard-output-methods">${methodNames}</div>
    <p class="wizard-output-rationale">${escapeHtml(rationale)}</p>
    <div class="wizard-output-scope"><strong>Typical scope by Georesolve:</strong> ${escapeHtml(scope)}</div>
    ${triggeredNotes ? `<ul style="margin:0 0 1.25rem 1.2rem;color:#555;font-size:0.9rem;line-height:1.6">${triggeredNotes}</ul>` : ''}
    <a href="${ctaHref}" class="wizard-output-cta">Request a proposal &rarr;</a>
    <button type="button" class="wizard-reset" id="wizard-reset">Reset and try another scenario</button>
  `;

  const reset = document.getElementById('wizard-reset');
  if (reset) {
    reset.addEventListener('click', () => {
      out.classList.remove('is-visible');
      out.innerHTML = '';
      const card = document.getElementById('wizard-card');
      if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

/**
 * Map triggered conditions to a brief mitigation note.
 */
function mitigationFor(triggered) {
  const map = {
    'urban-noise': 'night-time acquisition and notch filtering',
    'limited-access': 'shorter layouts and man-portable equipment',
    'conductive-clay': 'lower-frequency antennas / long-offset arrays',
    'water-covered': 'floating electrode cables or marine streamers'
  };
  return triggered.map(t => map[t] || 'careful survey design').join('; ');
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Initialise the wizard.
 */
function init() {
  const data = loadData();
  if (!data) return; // build step will populate later; stay silent

  renderObjectives(data);
  renderConditions(data);
  initDepthSlider();

  const runBtn = document.getElementById(RUN_BUTTON_ID);
  if (!runBtn) return;
  runBtn.addEventListener('click', () => {
    const inputs = readInputs(data);
    const ranked = scoreMethods(data, inputs);
    renderOutput(ranked.slice(0, 2), inputs, data);
    const out = document.getElementById(OUTPUT_ID);
    if (out) out.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export { scoreMethods, buildRationale };
