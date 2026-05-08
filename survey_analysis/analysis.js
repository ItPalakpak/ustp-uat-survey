/* ============================================================
   USTP Claveria – Survey Analysis Page
   analysis.js  —  All interactive logic, chart rendering,
                   and data loading
   ============================================================ */

/* ─────────────────────────────────────────────
   Question Text (mirrors survey.js)
───────────────────────────────────────────── */
const SECTION_A = [
  "I usually experience long waiting times when transacting at student service offices.",
  "The queue lines at service offices are often crowded and disorganized.",
  "I am unable to predict how long I will have to wait before being served.",
  "Waiting time significantly affects my productivity during office visits.",
  "Queue congestion is worst during enrollment, clearance, and document request periods."
];
const SECTION_B = [
  "There is no visible display or system that shows the current queue status.",
  "I must physically stay in the waiting area to know when I will be called.",
  "I am not informed of my queue position or estimated waiting time.",
  "The lack of information about queue status causes me stress or frustration.",
  "I have left the queue or given up waiting due to lack of information about my position."
];
const SECTION_C = [
  "The current manual queueing system at USTP Claveria is efficient.",
  "I am satisfied with how queuing is managed at student service offices.",
  "The current system treats all clients fairly and in the correct order.",
  "Service personnel are able to manage queues effectively under the current setup.",
  "The overall queueing experience at USTP Claveria needs improvement."
];
const SECTION_D = [
  "A digital queueing system would significantly reduce waiting time at service offices.",
  "I would use a kiosk to get a queue number instead of falling in line manually.",
  "I would find it useful to monitor my queue status through a mobile application.",
  "A real-time queue display screen in the waiting area would improve my experience.",
  "A digital queue management system is necessary at USTP Claveria."
];
const SECTION_E = [
  "Managing queues manually takes up too much of my time and attention during busy periods.",
  "A digital system would make it easier for me to manage the queue in my office.",
  "A digital system with a management dashboard would help me monitor service flow more effectively.",
  "Role-based access (teller, office head, admin) would improve accountability in queue management.",
  "A centralized multi-office system would reduce coordination problems across offices."
];

/* ─────────────────────────────────────────────
   Chart instances (kept for destroy-on-reload)
───────────────────────────────────────────── */
const CHARTS = {};

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

/**
 * Returns the descriptive equivalence label and CSS class suffix
 * based on the five-point Likert scale defined in the methodology.
 */
function descEquivalence(wm) {
  if (wm >= 4.21) return { label: 'Strongly Agree', cls: 'sa', color: '#16A34A' };
  if (wm >= 3.41) return { label: 'Agree',          cls: 'a',  color: '#2563EB' };
  if (wm >= 2.61) return { label: 'Neutral',         cls: 'n',  color: '#64748B' };
  if (wm >= 1.81) return { label: 'Disagree',        cls: 'd',  color: '#D97706' };
  return              { label: 'Strongly Disagree', cls: 'sd', color: '#DC2626' };
}

/** Returns a fill color for a progress bar keyed to the WM. */
function barColor(wm) {
  return descEquivalence(wm).color;
}

/** Converts a WM (1–5) to a 0–100% bar width. */
function wmPct(wm) {
  return (((wm - 1) / 4) * 100).toFixed(1);
}

/** Builds a frequency bar row element. */
function freqRow(label, count, total) {
  const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
  const maxPct = 100; // relative to the row's track
  const el = document.createElement('div');
  el.className = 'freq-row';
  el.innerHTML = `
    <div class="freq-row-label">${label}</div>
    <div class="freq-bar-track">
      <div class="freq-bar-fill" style="width: ${pct}%"></div>
    </div>
    <div class="freq-count">${count}</div>
    <div class="freq-pct">${pct}%</div>
  `;
  return el;
}

/** Renders frequency bar lists and returns arrays for chart use. */
function renderFreqBars(containerId, rows, total) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  rows.forEach(r => container.appendChild(freqRow(r.label, r.count, total)));
}

/** Destroys an existing Chart.js instance if present, then creates a new one. */
function makeChart(id, config) {
  if (CHARTS[id]) { CHARTS[id].destroy(); }
  const canvas = document.getElementById(id);
  if (!canvas) return;
  CHARTS[id] = new Chart(canvas, config);
}

/* ─────────────────────────────────────────────
   Likert Results Table Builder
───────────────────────────────────────────── */

/**
 * Builds and inserts a styled Likert results table.
 * @param {string} containerId - ID of the target div
 * @param {Array}  texts       - Statement text array
 * @param {Array}  items       - [{ wm, sd }, ...] aligned to texts
 * @param {number} startQ      - First question number
 */
function renderLikertTable(containerId, texts, items, startQ) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let rows = '';
  let sectionSum = 0;

  texts.forEach((text, i) => {
    const qNum = startQ + i;
    const wm   = items[i].wm;
    const sd   = items[i].sd;
    sectionSum += wm;
    const eq   = descEquivalence(wm);
    const pct  = wmPct(wm);

    rows += `
      <tr>
        <td class="lrt-qnum">Q${qNum}</td>
        <td>${text}</td>
        <td class="lrt-wm">${wm.toFixed(2)}</td>
        <td class="lrt-sd">±${sd.toFixed(2)}</td>
        <td class="lrt-bar-cell">
          <div class="lrt-bar-wrap">
            <div class="lrt-bar-track">
              <div class="lrt-bar-fill" style="width:${pct}%; background:${eq.color}"></div>
            </div>
          </div>
        </td>
        <td><span class="lrt-badge ${eq.cls}">${eq.label}</span></td>
      </tr>`;
  });

  const avg    = sectionSum / texts.length;
  const avgEq  = descEquivalence(avg);
  const avgPct = wmPct(avg);

  rows += `
    <tr class="lrt-avg-row">
      <td colspan="2"><span class="lrt-avg-label">Section average</span></td>
      <td class="lrt-wm">${avg.toFixed(2)}</td>
      <td class="lrt-sd"></td>
      <td class="lrt-bar-cell">
        <div class="lrt-bar-wrap">
          <div class="lrt-bar-track">
            <div class="lrt-bar-fill" style="width:${avgPct}%; background:${avgEq.color}"></div>
          </div>
        </div>
      </td>
      <td><span class="lrt-badge ${avgEq.cls}">${avgEq.label}</span></td>
    </tr>`;

  container.innerHTML = `
    <table class="likert-results-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Statement</th>
          <th class="right">WM</th>
          <th class="right">SD</th>
          <th>Severity</th>
          <th>Descriptive</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

/* ─────────────────────────────────────────────
   Chart Builders
───────────────────────────────────────────── */

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      min: 1, max: 5,
      ticks: { stepSize: 1, font: { size: 11 } },
      grid: { color: 'rgba(100,116,139,0.12)' }
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 11 }, maxRotation: 0 }
    }
  }
};

/** Builds a short label like "Q1", "Q2" for chart x-axis. */
function qLabels(start, count) {
  return Array.from({ length: count }, (_, i) => `Q${start + i}`);
}

/** Builds a horizontal bar chart for section items. */
function buildSectionChart(canvasId, labels, data, colors) {
  makeChart(canvasId, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Weighted Mean',
        data: data.map(v => +v.toFixed(2)),
        backgroundColor: colors,
        borderRadius: 5,
        borderSkipped: false
      }]
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => {
              const wm = ctx.parsed.y;
              return ` WM: ${wm.toFixed(2)} — ${descEquivalence(wm).label}`;
            }
          }
        }
      }
    }
  });
}

/** Overview bar chart across all five sections. */
function buildOverviewChart(secAvgs) {
  const labels = [
    'A – Waiting Time',
    'B – Transparency',
    'C – Satisfaction',
    'D – Perceived Need',
    'E – Personnel Benefits'
  ];
  const data   = secAvgs.map(v => +v.toFixed(2));
  const colors = data.map(v => descEquivalence(v).color);

  makeChart('chart-overview', {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Section WM',
        data,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => {
              const wm = ctx.parsed.y;
              return ` WM: ${wm.toFixed(2)} — ${descEquivalence(wm).label}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 1, max: 5,
          ticks: { stepSize: 1, font: { size: 11 } },
          grid: { color: 'rgba(100,116,139,0.12)' }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10.5 }, maxRotation: 20 }
        }
      }
    }
  });
}

/** Donut chart for profile distributions. */
function buildDonutChart(canvasId, labels, data, ariaLabel) {
  const PALETTE = [
    '#1A4DB5', '#3B72D9', '#60A5FA', '#93C5FD',
    '#BFDBFE', '#0A2A6E', '#2563EB'
  ];
  makeChart(canvasId, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: PALETTE.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { font: { size: 11 }, padding: 12, boxWidth: 12 }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct   = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

/* ─────────────────────────────────────────────
   Open-Ended Theme Renderer
───────────────────────────────────────────── */

function renderOEThemes(themesContainerId, summaryContainerId, themes, summary) {
  const tc = document.getElementById(themesContainerId);
  const sc = document.getElementById(summaryContainerId);

  if (tc && themes && themes.length) {
    tc.innerHTML = themes.map(t =>
      `<span class="oe-theme-pill">
        ${t.label}
        <span class="oe-theme-count">${t.count}</span>
      </span>`
    ).join('');
  }

  if (sc) sc.textContent = summary || 'No summary available.';
}

/* ─────────────────────────────────────────────
   Section Average Utility
───────────────────────────────────────────── */
function sectionAvg(items) {
  return items.reduce((s, i) => s + i.wm, 0) / items.length;
}

/* ─────────────────────────────────────────────
   Tab Navigation
───────────────────────────────────────────── */

function switchTab(tabName) {
  document.querySelectorAll('.atab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.atab-btn').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`tab-${tabName}`);
  if (panel) panel.classList.add('active');

  // Find the matching button by its onclick attribute
  document.querySelectorAll('.atab-btn').forEach(btn => {
    if (btn.getAttribute('onclick') === `switchTab('${tabName}')`) {
      btn.classList.add('active');
    }
  });
}

function switchSubTab(part, sub) {
  // Deactivate all sub-panels and stabs within the parent tab
  const parentTab = document.getElementById(`tab-${part}`);
  if (!parentTab) return;

  parentTab.querySelectorAll('.stab-panel').forEach(p => p.classList.remove('active'));
  parentTab.querySelectorAll('.stab').forEach(b => b.classList.remove('active'));

  const panel = document.getElementById(`${part}-sub-${sub}`);
  if (panel) panel.classList.add('active');

  parentTab.querySelectorAll('.stab').forEach(btn => {
    if (btn.getAttribute('onclick') === `switchSubTab('${part}','${sub}')`) {
      btn.classList.add('active');
    }
  });
}

/* ─────────────────────────────────────────────
   Main Data Loader
   Call this with a data object from your API
   or use loadSampleData() for a demo.
───────────────────────────────────────────── */

/**
 * Loads and renders all analysis from a data object.
 *
 * Expected data shape:
 * {
 *   total: number,
 *   personnelCount: number,
 *   roles:       [{ label, count }, ...],
 *   frequencies: [{ label, count }, ...],
 *   offices:     [{ label, count }, ...],
 *   sectionA: [{ wm, sd }, ...],  // 5 items (Q1–5)
 *   sectionB: [{ wm, sd }, ...],  // 5 items (Q6–10)
 *   sectionC: [{ wm, sd }, ...],  // 5 items (Q11–15)
 *   sectionD: [{ wm, sd }, ...],  // 5 items (Q16–20)
 *   sectionE: [{ wm, sd }, ...],  // 5 items (Q21–25)
 *   openEnded: {
 *     q26: { summary: string, themes: [{ label, count }, ...] },
 *     q27: { summary: string, themes: [{ label, count }, ...] },
 *     q28: { summary: string, themes: [{ label, count }, ...] }
 *   }
 * }
 */
function loadAnalysisData(data) {
  // Hide load notice
  const notice = document.getElementById('load-notice');
  if (notice) notice.style.display = 'none';

  /* ── Overview Metrics ── */
  const p2Overall = (sectionAvg(data.sectionA) + sectionAvg(data.sectionB) + sectionAvg(data.sectionC)) / 3;
  const p3Overall = sectionAvg(data.sectionD);  // E is optional, exclude from overall

  setText('m-total',    data.total);
  setText('m-part2wm',  p2Overall.toFixed(2));
  setText('m-part2desc', descEquivalence(p2Overall).label);
  setText('m-part3wm',  p3Overall.toFixed(2));
  setText('m-part3desc', descEquivalence(p3Overall).label);
  setText('m-personnel', data.personnelCount);

  /* ── Overview Chart ── */
  buildOverviewChart([
    sectionAvg(data.sectionA),
    sectionAvg(data.sectionB),
    sectionAvg(data.sectionC),
    sectionAvg(data.sectionD),
    sectionAvg(data.sectionE)
  ]);

  /* ── Profile: Roles ── */
  const roleTotal = data.roles.reduce((s, r) => s + r.count, 0);
  renderFreqBars('role-bars', data.roles, roleTotal);
  buildDonutChart(
    'chart-roles',
    data.roles.map(r => r.label),
    data.roles.map(r => r.count),
    'Donut chart of respondent roles'
  );

  /* ── Profile: Visit Frequency ── */
  const freqTotal = data.frequencies.reduce((s, r) => s + r.count, 0);
  renderFreqBars('freq-bars', data.frequencies, freqTotal);
  buildDonutChart(
    'chart-freq',
    data.frequencies.map(r => r.label),
    data.frequencies.map(r => r.count),
    'Donut chart of visit frequencies'
  );

  /* ── Profile: Offices ── */
  const officeTotal = data.offices.reduce((s, r) => s + r.count, 0);
  renderFreqBars('office-bars', data.offices, officeTotal);

  /* ── Section A (Q1–5) ── */
  renderLikertTable('tbl-a', SECTION_A, data.sectionA, 1);
  buildSectionChart(
    'chart-a',
    qLabels(1, 5),
    data.sectionA.map(i => i.wm),
    data.sectionA.map(i => descEquivalence(i.wm).color)
  );

  /* ── Section B (Q6–10) ── */
  renderLikertTable('tbl-b', SECTION_B, data.sectionB, 6);
  buildSectionChart(
    'chart-b',
    qLabels(6, 5),
    data.sectionB.map(i => i.wm),
    data.sectionB.map(i => descEquivalence(i.wm).color)
  );

  /* ── Section C (Q11–15) ── */
  renderLikertTable('tbl-c', SECTION_C, data.sectionC, 11);
  buildSectionChart(
    'chart-c',
    qLabels(11, 5),
    data.sectionC.map(i => i.wm),
    data.sectionC.map(i => descEquivalence(i.wm).color)
  );

  /* ── Section D (Q16–20) ── */
  renderLikertTable('tbl-d', SECTION_D, data.sectionD, 16);
  buildSectionChart(
    'chart-d',
    qLabels(16, 5),
    data.sectionD.map(i => i.wm),
    data.sectionD.map(i => descEquivalence(i.wm).color)
  );

  /* ── Section E (Q21–25) ── */
  renderLikertTable('tbl-e', SECTION_E, data.sectionE, 21);
  buildSectionChart(
    'chart-e',
    qLabels(21, 5),
    data.sectionE.map(i => i.wm),
    data.sectionE.map(i => descEquivalence(i.wm).color)
  );

  /* ── Open-Ended ── */
  renderOEThemes('oe-q26-themes', 'oe-q26', data.openEnded.q26.themes, data.openEnded.q26.summary);
  renderOEThemes('oe-q27-themes', 'oe-q27', data.openEnded.q27.themes, data.openEnded.q27.summary);
  renderOEThemes('oe-q28-themes', 'oe-q28', data.openEnded.q28.themes, data.openEnded.q28.summary);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ─────────────────────────────────────────────
   Sample Data (mirrors realistic survey output)
   Replace this with your API fetch in production.
───────────────────────────────────────────── */
function loadSampleData() {
  const mk = (wm, sd) => ({ wm, sd });

  loadAnalysisData({
    total: 120,
    personnelCount: 18,

    roles: [
      { label: 'Student',           count: 85 },
      { label: 'Service Personnel', count: 18 },
      { label: 'Faculty Member',    count: 10 },
      { label: 'Administrative Staff', count: 5 },
      { label: 'Alumni / Other',    count: 2  }
    ],

    frequencies: [
      { label: 'Once or twice',   count: 22 },
      { label: '3–5 times',       count: 41 },
      { label: '6–10 times',      count: 35 },
      { label: 'More than 10×',   count: 22 }
    ],

    offices: [
      { label: 'Office of the Registrar', count: 88 },
      { label: 'Cashier Office',          count: 74 },
      { label: 'Office of Student Affairs (OSA)', count: 43 },
      { label: 'Library',                 count: 31 }
    ],

    // Part II-A: Waiting Time & Queue Length (Q1–5)
    sectionA: [
      mk(4.12, 0.71),
      mk(4.08, 0.77),
      mk(3.97, 0.84),
      mk(4.21, 0.62),
      mk(4.38, 0.55)
    ],

    // Part II-B: Transparency & Information Access (Q6–10)
    sectionB: [
      mk(4.29, 0.58),
      mk(4.44, 0.51),
      mk(4.33, 0.60),
      mk(3.95, 0.88),
      mk(3.62, 1.02)
    ],

    // Part II-C: Overall Satisfaction (Q11–15)
    sectionC: [
      mk(2.41, 0.91),
      mk(2.55, 0.87),
      mk(2.73, 0.93),
      mk(2.88, 0.89),
      mk(4.47, 0.53)
    ],

    // Part III-D: Perceived Need (Q16–20)
    sectionD: [
      mk(4.39, 0.58),
      mk(4.17, 0.71),
      mk(4.32, 0.62),
      mk(4.44, 0.55),
      mk(4.51, 0.52)
    ],

    // Part III-E: Personnel Benefits (Q21–25)
    sectionE: [
      mk(4.22, 0.65),
      mk(4.39, 0.58),
      mk(4.44, 0.51),
      mk(4.33, 0.59),
      mk(4.50, 0.51)
    ],

    openEnded: {
      q26: {
        summary: 'The most frequently reported frustration is being made to wait with no information about queue status or estimated service time — respondents described long periods of idle waiting, uncertainty about their place in line, and inconsistent queue management especially during enrollment and clearance seasons. A notable proportion reported having left the queue due to uncertainty, resulting in a failed transaction.',
        themes: [
          { label: 'Long wait with no updates', count: 52 },
          { label: 'Crowding near doorways',    count: 38 },
          { label: 'Inconsistent ordering',     count: 31 },
          { label: 'Left queue mid-wait',        count: 24 },
          { label: 'No estimated wait time',     count: 19 }
        ]
      },
      q27: {
        summary: 'Respondents most frequently requested a visible queue number display in the waiting area, followed by a way to monitor their queue position without needing to stay physically present. Requests for a more organized physical queue setup and faster peak-period service windows were also common. Several respondents specifically mentioned wanting real-time notifications when they are about to be called.',
        themes: [
          { label: 'Visible queue display',           count: 61 },
          { label: 'Remote queue monitoring',         count: 48 },
          { label: 'Better physical queue layout',    count: 34 },
          { label: 'Faster peak-period windows',      count: 29 },
          { label: 'Real-time call notifications',    count: 22 }
        ]
      },
      q28: {
        summary: 'Real-time queue status on a screen or mobile phone was cited as the top priority feature by a clear majority. Automated number issuance via a kiosk was the second most requested feature. A significant portion of respondents also prioritized SMS or in-app notifications when near the front of the queue, and multi-office integration so a single system covers all student service offices.',
        themes: [
          { label: 'Real-time queue display / app',  count: 67 },
          { label: 'Kiosk number issuance',          count: 55 },
          { label: 'SMS / notification when near front', count: 43 },
          { label: 'Multi-office integration',       count: 31 },
          { label: 'Queue history / analytics',      count: 14 }
        ]
      }
    }
  });
}

/* ─────────────────────────────────────────────
   API Integration Helper
   Replace this with your actual Netlify function
   endpoint or Neon DB API to load real data.
───────────────────────────────────────────── */

/**
 * Fetches aggregated survey results from the backend API
 * and passes them to loadAnalysisData().
 *
 * Usage: call fetchAndRender() from a "Refresh" button
 * or on DOMContentLoaded for production use.
 *
 * The backend should return a pre-aggregated JSON object
 * matching the shape expected by loadAnalysisData().
 * You can build this from the Neon PostgreSQL views
 * already defined in schema.sql (waiting_time_averages,
 * transparency_averages, satisfaction_averages, etc.)
 */
async function fetchAndRender() {
  try {
    const res  = await fetch('/api/analysis');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    loadAnalysisData(data);
  } catch (err) {
    console.error('Failed to load analysis data:', err.message);
    const notice = document.getElementById('load-notice');
    if (notice) {
      notice.style.display = '';
      const p = notice.querySelector('p');
      if (p) p.textContent = 'Failed to load live data. Make sure server.js is running (node server.js) and .env has your DATABASE_URL. You can load sample data below.';
    }
  }
}

/* ─────────────────────────────────────────────
   Init
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  fetchAndRender();
});