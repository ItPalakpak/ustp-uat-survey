// netlify/functions/submit-survey.js
// This runs as a serverless function on Netlify's servers.
// It receives the survey data from the frontend and saves it to your Neon PostgreSQL database.

const { Client } = require('pg');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const { profile, functionality, func_comments, usability, usab_comments, open_ended } = body;

  // Basic validation
  if (!profile || !functionality || !usability) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  // Connect to the database using the DATABASE_URL environment variable
  // You will set this in Netlify's dashboard (see setup guide)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Neon
  });

  try {
    await client.connect();

    const query = `
      INSERT INTO survey_responses (
        offices,
        role,
        duration,
        func_q1, func_q2, func_q3, func_q4, func_q5,
        func_q6, func_q7, func_q8, func_q9, func_q10,
        func_comments,
        usab_q1, usab_q2, usab_q3, usab_q4, usab_q5,
        usab_q6, usab_q7, usab_q8, usab_q9, usab_q10,
        usab_comments,
        oe_q1, oe_q2, oe_q3, oe_q4,
        submitted_at
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14,
        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24,
        $25,
        $26, $27, $28, $29,
        NOW()
      )
      RETURNING id;
    `;

    const values = [
      profile.offices.join(', '),        // $1  offices (comma-separated string)
      profile.role,                       // $2  role
      profile.duration,                   // $3  duration

      functionality.q1,  functionality.q2,  functionality.q3,  functionality.q4,  functionality.q5,
      functionality.q6,  functionality.q7,  functionality.q8,  functionality.q9,  functionality.q10,

      func_comments || null,              // $14

      usability.q1,  usability.q2,  usability.q3,  usability.q4,  usability.q5,
      usability.q6,  usability.q7,  usability.q8,  usability.q9,  usability.q10,

      usab_comments || null,              // $25

      open_ended?.q1 || null,
      open_ended?.q2 || null,
      open_ended?.q3 || null,
      open_ended?.q4 || null,
    ];

    const result = await client.query(query, values);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, id: result.rows[0].id })
    };

  } catch (err) {
    console.error('Database error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Database error', detail: err.message })
    };
  } finally {
    await client.end();
  }
};
