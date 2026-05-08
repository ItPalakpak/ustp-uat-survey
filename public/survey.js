/* ============================================================
   USTP Claveria – Needs Assessment Survey
   survey.js  —  All interactive logic
   ============================================================ */

/* ── Survey Question Data ── */

/* PART II-A: Waiting Time and Queue Length (Q1–5) */
const WAIT_TIME_ITEMS = [
  "I usually experience long waiting times when transacting at student service offices.",
  "The queue lines at service offices are often crowded and disorganized.",
  "I am unable to predict how long I will have to wait before being served.",
  "Waiting time significantly affects my productivity during office visits.",
  "Queue congestion is worst during enrollment, clearance, and document request periods."
];

/* PART II-B: Queue Transparency and Information Access (Q6–10) */
const TRANSPARENCY_ITEMS = [
  "There is no visible display or system that shows the current queue status.",
  "I must physically stay in the waiting area to know when I will be called.",
  "I am not informed of my queue position or estimated waiting time.",
  "The lack of information about queue status causes me stress or frustration.",
  "I have left the queue or given up waiting due to lack of information about my position."
];

/* PART II-C: Overall Satisfaction with Current Queueing System (Q11–15) */
const SATISFACTION_ITEMS = [
  "The current manual queueing system at USTP Claveria is efficient.",
  "I am satisfied with how queuing is managed at student service offices.",
  "The current system treats all clients fairly and in the correct order.",
  "Service personnel are able to manage queues effectively under the current setup.",
  "The overall queueing experience at USTP Claveria needs improvement."
];

/* PART III-D: Perceived Need and Openness to a Digital Solution (Q16–20) */
const DIGITAL_NEED_ITEMS = [
  "A digital queueing system would significantly reduce waiting time at service offices.",
  "I would use a kiosk to get a queue number instead of falling in line manually.",
  "I would find it useful to monitor my queue status through a mobile application.",
  "A real-time queue display screen in the waiting area would improve my experience.",
  "A digital queue management system is necessary at USTP Claveria."
];

/* PART III-E: Expected Benefits — Service Personnel Only (Q21–25) */
const PERSONNEL_ITEMS = [
  "Managing queues manually takes up too much of my time and attention during busy periods.",
  "A digital system would make it easier for me to manage the queue in my office.",
  "A digital system with a management dashboard would help me monitor service flow more effectively.",
  "Role-based access (teller, office head, admin) would improve accountability in queue management.",
  "A centralized multi-office system would reduce coordination problems across offices."
];

/* ── Helpers ── */

function buildLikertSubsection(items, container, prefix, startNum, subsectionLabel) {
  // Sub-section header label
  const label = document.createElement('div');
  label.className = 'subsection-label';
  label.textContent = subsectionLabel;
  container.appendChild(label);

  // Scale header
  const header = document.createElement('div');
  header.className = 'likert-scale-header';
  header.innerHTML = `
    <div class="lh-blank"></div>
    <div class="lh-label">5<br>Str. Agree</div>
    <div class="lh-label">4<br>Agree</div>
    <div class="lh-label">3<br>Neutral</div>
    <div class="lh-label">2<br>Disagree</div>
    <div class="lh-label">1<br>Str. Dis.</div>
  `;
  container.appendChild(header);

  items.forEach((text, i) => {
    const qNum = startNum + i;
    const row = document.createElement('div');
    row.className = 'likert-row';
    let cells = `<div class="likert-statement"><strong>${qNum}.</strong> ${text}</div>`;
    for (let v = 5; v >= 1; v--) {
      cells += `<div class="likert-cell"><input type="radio" name="${prefix}_q${qNum}" value="${v}" /></div>`;
    }
    row.innerHTML = cells;
    container.appendChild(row);
  });

  // Spacer between sub-sections
  const spacer = document.createElement('div');
  spacer.style.height = '20px';
  container.appendChild(spacer);
}

function buildAllLikert() {
  const part2 = document.getElementById('part2-items');
  const part3 = document.getElementById('part3-items');

  buildLikertSubsection(WAIT_TIME_ITEMS,    part2, 'cur', 1,  'A. Waiting Time and Queue Length');
  buildLikertSubsection(TRANSPARENCY_ITEMS, part2, 'cur', 6,  'B. Queue Transparency and Information Access');
  buildLikertSubsection(SATISFACTION_ITEMS, part2, 'cur', 11, 'C. Overall Satisfaction with Current Queueing System');

  buildLikertSubsection(DIGITAL_NEED_ITEMS, part3, 'dgt', 16, 'D. Perceived Need and Openness to a Digital Solution');
  buildLikertSubsection(PERSONNEL_ITEMS,    part3, 'dgt', 21, 'E. Expected Benefits (For Service Personnel Only)');

  // Add note for section E
  const note = document.createElement('p');
  note.className = 'required-note';
  note.style.marginTop = '-12px';
  note.textContent = '* Items 21–25 are intended for Service Personnel / Teller / Office Staff only. Other respondents may skip these.';
  part3.appendChild(note);
}

/* ── Navigation ── */

let currentStep = 0;

function goTo(step) {
  document.getElementById(`section-${currentStep}`).classList.remove('active');
  document.querySelectorAll('.step-btn').forEach((btn, i) => {
    btn.classList.remove('active', 'done');
    if (i < step) btn.classList.add('done');
    if (i === step) btn.classList.add('active');
  });
  currentStep = step;
  document.getElementById(`section-${step}`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAndGoTo(fromStep, toStep) {
  const err = document.getElementById(`err-${fromStep}`);
  err.classList.remove('show');

  if (fromStep === 1) {
    const offices = document.querySelectorAll('input[name="office"]:checked');
    const role    = document.querySelector('input[name="role"]:checked');
    const freq    = document.querySelector('input[name="frequency"]:checked');
    if (!offices.length || !role || !freq) { err.classList.add('show'); return; }
  }

  if (fromStep === 2) {
    // Require Q1–15 (current queueing experience)
    for (let q = 1; q <= 15; q++) {
      if (!document.querySelector(`input[name="cur_q${q}"]:checked`)) {
        err.classList.add('show');
        return;
      }
    }
  }

  if (fromStep === 3) {
    // Require Q16–20 (digital need); Q21–25 are optional (personnel only)
    for (let q = 16; q <= 20; q++) {
      if (!document.querySelector(`input[name="dgt_q${q}"]:checked`)) {
        err.classList.add('show');
        return;
      }
    }
  }

  goTo(toStep);
}

/* ── Submit ── */

async function submitSurvey() {
  const btn = document.getElementById('submit-btn');
  const err = document.getElementById('err-submit');
  err.classList.remove('show');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  // Profile
  const offices   = [...document.querySelectorAll('input[name="office"]:checked')].map(el => el.value);
  const role      = document.querySelector('input[name="role"]:checked')?.value || '';
  const frequency = document.querySelector('input[name="frequency"]:checked')?.value || '';

  // Part II — Current Queueing Experience (Q1–15)
  const current_experience = {};
  for (let q = 1; q <= 15; q++) {
    current_experience[`q${q}`] = parseInt(document.querySelector(`input[name="cur_q${q}"]:checked`)?.value || 0);
  }

  // Part III — Digital System Need (Q16–25)
  const digital_need = {};
  for (let q = 16; q <= 25; q++) {
    digital_need[`q${q}`] = parseInt(document.querySelector(`input[name="dgt_q${q}"]:checked`)?.value || 0);
  }

  const payload = {
    profile: { offices, role, frequency },
    current_experience,
    digital_need,
    open_ended: {
      q26: document.getElementById('oe1').value.trim(),
      q27: document.getElementById('oe2').value.trim(),
      q28: document.getElementById('oe3').value.trim(),
    }
  };

  try {
    const res = await fetch('/.netlify/functions/submit-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Server error');
    goTo(5);
  } catch (e) {
    err.classList.add('show');
    btn.disabled = false;
    btn.textContent = 'Submit Survey ✓';
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  buildAllLikert();
});