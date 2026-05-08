// netlify/functions/submit-survey.js
// Receives survey data from the frontend and saves it to Neon PostgreSQL.
// Updated for: Needs Assessment Survey (Queueing Experience at USTP Claveria)

const { Client } = require('pg');
const crypto = require('crypto');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  // ── CSRF: Require X-Requested-With header ──
  if (!event.headers['x-requested-with']) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Missing required header' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { profile, current_experience, digital_need, open_ended, consent_given } = body;

  // Reject submissions without explicit consent
  if (!consent_given) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Consent is required to submit this survey' }) };
  }

  // Basic validation — require profile and current_experience (Q1–15)
  if (!profile || !current_experience || !digital_need) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // ── XSS sanitization: strip all HTML tags from text inputs ──
  const SANITIZE_RE = /<[^>]*>/g;
  const sanitize = (str) => (str && typeof str === 'string') ? str.replace(SANITIZE_RE, '').trim() : str;

  // Strip accidental PII from open-ended text fields
  const PII_PATTERN = /(\b\d{4}\s?\d{4}\s?\d{4}\b|\b\d{2}-\d{2}-\d{4}\b|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\b09\d{9}\b|\b\+63\d{10}\b)/g;
  const stripPII = (str) => (str && typeof str === 'string') ? str.replace(PII_PATTERN, '[REDACTED]') : str;

  // ── Rate limiting: hash the IP, allow max 5 per IP in 24h ──
  const MAX_PER_RESPONDENT = 5;
  const RATE_WINDOW_HOURS = 24;
  const rawIp = event.headers['x-nf-client-connection-ip']
    || event.headers['x-forwarded-for']?.split(',')[0]
    || event.headers['client-ip']
    || 'unknown';
  const ipHash = crypto.createHash('sha256').update(rawIp + process.env.DATABASE_URL).digest('hex');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });

  const MAX_RESPONSES = 400;

  try {
    await client.connect();

    // Check current response count before accepting
    const countResult = await client.query('SELECT COUNT(*) AS cnt FROM survey_responses');
    if (parseInt(countResult.rows[0].cnt) >= MAX_RESPONSES) {
      await client.end();
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Survey is closed', detail: 'We have reached the maximum number of responses. Thank you for your interest!' })
      };
    }

    // ── Rate limit: check submission count for this IP hash ──
    const rateResult = await client.query(
      'SELECT COUNT(*) AS cnt FROM submission_rate_limits WHERE ip_hash = $1 AND created_at > NOW() - $2::interval',
      [ipHash, `${RATE_WINDOW_HOURS} hours`]
    );
    if (parseInt(rateResult.rows[0].cnt) >= MAX_PER_RESPONDENT) {
      await client.end();
      return {
        statusCode: 429,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Rate limit exceeded', detail: 'You have reached the maximum number of submissions. Thank you for your participation!' })
      };
    }

    const query = `
      INSERT INTO survey_responses (
        -- Part I: Profile
        role,
        offices,
        visit_frequency,

        -- Part II-A: Waiting Time and Queue Length (Q1–5)
        cur_q1, cur_q2, cur_q3, cur_q4, cur_q5,

        -- Part II-B: Queue Transparency (Q6–10)
        cur_q6, cur_q7, cur_q8, cur_q9, cur_q10,

        -- Part II-C: Overall Satisfaction (Q11–15)
        cur_q11, cur_q12, cur_q13, cur_q14, cur_q15,

        -- Part III-D: Perceived Need for Digital System (Q16–20)
        dgt_q16, dgt_q17, dgt_q18, dgt_q19, dgt_q20,

        -- Part III-E: Expected Benefits / Personnel Only (Q21–25, nullable)
        dgt_q21, dgt_q22, dgt_q23, dgt_q24, dgt_q25,

        -- Part IV: Open-Ended (Q26–28)
        oe_q26, oe_q27, oe_q28,

        -- Consent tracking
        consent_given, consent_at,

        submitted_at
      ) VALUES (
        $1,  $2,  $3,
        $4,  $5,  $6,  $7,  $8,
        $9,  $10, $11, $12, $13,
        $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23,
        $24, $25, $26, $27, $28,
        $29, $30, $31,
        $32, NOW(),
        NOW()
      )
      RETURNING id;
    `;

    const values = [
      // Part I — Profile (sanitized)
      sanitize(profile.role),                // $1
      profile.offices.map(o => sanitize(o)).join(', '),  // $2
      sanitize(profile.frequency),           // $3

      // Part II-A — Waiting Time (Q1–5)
      current_experience.q1,                 // $4
      current_experience.q2,                 // $5
      current_experience.q3,                 // $6
      current_experience.q4,                 // $7
      current_experience.q5,                 // $8

      // Part II-B — Transparency (Q6–10)
      current_experience.q6,                 // $9
      current_experience.q7,                 // $10
      current_experience.q8,                 // $11
      current_experience.q9,                 // $12
      current_experience.q10,                // $13

      // Part II-C — Satisfaction (Q11–15)
      current_experience.q11,                // $14
      current_experience.q12,                // $15
      current_experience.q13,                // $16
      current_experience.q14,                // $17
      current_experience.q15,                // $18

      // Part III-D — Digital Need (Q16–20)
      digital_need.q16,                      // $19
      digital_need.q17,                      // $20
      digital_need.q18,                      // $21
      digital_need.q19,                      // $22
      digital_need.q20,                      // $23

      // Part III-E — Personnel Benefits (Q21–25, nullable)
      digital_need.q21 || null,              // $24
      digital_need.q22 || null,              // $25
      digital_need.q23 || null,              // $26
      digital_need.q24 || null,              // $27
      digital_need.q25 || null,              // $28

      // Part IV — Open-Ended (sanitized + PII stripped)
      stripPII(sanitize(open_ended?.q26)) || null,    // $29
      stripPII(sanitize(open_ended?.q27)) || null,    // $30
      stripPII(sanitize(open_ended?.q28)) || null,    // $31

      // Consent
      true,                                   // $32  consent_given
    ];

    const result = await client.query(query, values);

    // ── Log this submission for rate limiting ──
    await client.query(
      'INSERT INTO submission_rate_limits (ip_hash) VALUES ($1)',
      [ipHash]
    );

    // ── Clean up expired rate limit rows (housekeeping) ──
    await client.query('DELETE FROM submission_rate_limits WHERE created_at < NOW() - $1::interval', [`${RATE_WINDOW_HOURS} hours`]);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, id: result.rows[0].id })
    };

  } catch (err) {
    console.error('Database error:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database error', detail: err.message })
    };
  } finally {
    await client.end();
  }
};