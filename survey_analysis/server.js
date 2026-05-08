/* ============================================================
   USTP Claveria – Local Analysis Server
   server.js  —  Serves static files + provides /api/analysis
                endpoint that queries Neon PostgreSQL directly.
   ============================================================ */

require('dotenv').config();
const express = require('express');
const { Client } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set.');
  console.error('Copy .env.example to .env and paste your Neon connection string.');
  process.exit(1);
}

/* ── Serve static files (analysis.html, analysis.css, analysis.js) ── */
app.use(express.static(__dirname));

/* ── Root route → analysis.html ── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'analysis.html'));
});

/* ── API: Aggregated analysis data ── */
app.get('/api/analysis', async (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    /* ── 1. Total respondents & personnel count ── */
    const totalResult = await client.query('SELECT COUNT(*) AS cnt FROM survey_responses');
    const total = parseInt(totalResult.rows[0].cnt);

    const personnelResult = await client.query(
      "SELECT COUNT(*) AS cnt FROM survey_responses WHERE dgt_q21 IS NOT NULL"
    );
    const personnelCount = parseInt(personnelResult.rows[0].cnt);

    /* ── 2. Profile distributions ── */
    const rolesResult = await client.query(
      'SELECT role AS label, COUNT(*)::int AS count FROM survey_responses GROUP BY role ORDER BY count DESC'
    );

    const freqResult = await client.query(
      'SELECT visit_frequency AS label, COUNT(*)::int AS count FROM survey_responses GROUP BY visit_frequency ORDER BY count DESC'
    );

    const officeResult = await client.query(
      `SELECT TRIM(BOTH FROM office_name) AS label, COUNT(*)::int AS count
       FROM survey_responses,
       LATERAL unnest(string_to_array(offices, ',')) AS office_name
       GROUP BY (TRIM(BOTH FROM office_name))
       ORDER BY count DESC`
    );

    /* ── 3. Likert section WM & SD ── */
    // Helper: compute WM and SD for a set of columns from raw rows
    async function computeSection(columns) {
      const colList = columns.join(', ');
      const result = await client.query(`SELECT ${colList} FROM survey_responses`);
      return columns.map(col => {
        const values = result.rows
          .map(r => r[col])
          .filter(v => v !== null && v !== undefined);
        const n = values.length;
        if (n === 0) return { wm: 0, sd: 0 };
        const sum = values.reduce((a, b) => a + b, 0);
        const wm = sum / n;
        const variance = values.reduce((s, v) => s + Math.pow(v - wm, 2), 0) / (n > 1 ? n - 1 : 1);
        const sd = Math.sqrt(variance);
        return { wm: +wm.toFixed(2), sd: +sd.toFixed(2) };
      });
    }

    const sectionA = await computeSection(['cur_q1','cur_q2','cur_q3','cur_q4','cur_q5']);
    const sectionB = await computeSection(['cur_q6','cur_q7','cur_q8','cur_q9','cur_q10']);
    const sectionC = await computeSection(['cur_q11','cur_q12','cur_q13','cur_q14','cur_q15']);
    const sectionD = await computeSection(['dgt_q16','dgt_q17','dgt_q18','dgt_q19','dgt_q20']);
    const sectionE = await computeSection(['dgt_q21','dgt_q22','dgt_q23','dgt_q24','dgt_q25']);

    /* ── 4. Open-ended responses ── */
    const oeResult = await client.query('SELECT oe_q26, oe_q27, oe_q28 FROM survey_responses');

    function analyzeOpenEnded(texts) {
      const nonEmpty = texts.filter(t => t && t.trim().length > 0);
      const summary = nonEmpty.length === 0
        ? 'No responses provided for this question.'
        : `${nonEmpty.length} response${nonEmpty.length > 1 ? 's' : ''} recorded. ` +
          'Review individual responses below for thematic analysis.';

      // Simple keyword frequency for theme hints
      const STOP = new Set([
        'the','a','an','and','or','but','is','are','was','were','in','on','at','to','for',
        'of','with','by','from','it','its','i','me','my','we','our','you','your','they',
        'their','this','that','these','those','be','been','being','have','has','had','do',
        'does','did','will','would','could','should','may','might','can','not','no','so',
        'if','than','then','there','here','all','each','every','both','few','more','most',
        'other','some','such','only','own','same','also','just','very','often','when',
        'what','which','who','whom','how','about','up','out','into','over','after','before',
        'between','through','during','without','because','until','while','although','since',
        'am','he','she','him','her','his','them','too','any','many','much','now','well',
        'like','get','got','make','made','take','took','come','came','go','went','one','two',
        'really','even','still','already','yet','never','always','something','anything',
        'everything','nothing','way','need','want','think','know','see','say','said','tell'
      ]);

      const wordCounts = {};
      nonEmpty.forEach(text => {
        text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).forEach(word => {
          if (word.length > 2 && !STOP.has(word)) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
          }
        });
      });

      const themes = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([label, count]) => ({ label, count }));

      return { summary, themes, responses: nonEmpty };
    }

    const openEnded = {
      q26: analyzeOpenEnded(oeResult.rows.map(r => r.oe_q26)),
      q27: analyzeOpenEnded(oeResult.rows.map(r => r.oe_q27)),
      q28: analyzeOpenEnded(oeResult.rows.map(r => r.oe_q28))
    };

    /* ── 5. Assemble and return ── */
    res.json({
      total,
      personnelCount,
      roles: rolesResult.rows,
      frequencies: freqResult.rows,
      offices: officeResult.rows,
      sectionA,
      sectionB,
      sectionC,
      sectionD,
      sectionE,
      openEnded
    });

  } catch (err) {
    console.error('Database query error:', err.message);
    res.status(500).json({ error: 'Database query failed', detail: err.message });
  } finally {
    await client.end();
  }
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`\n  ✅ Analysis server running at http://localhost:${PORT}`);
  console.log(`     Open that URL in your browser to view the dashboard.\n`);
});
