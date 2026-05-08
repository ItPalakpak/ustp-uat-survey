-- ============================================================
--  USTP UAT Survey — Database Schema
--  Run this SQL in your Neon dashboard SQL editor
-- ============================================================

CREATE TABLE IF NOT EXISTS survey_responses (
  id               SERIAL PRIMARY KEY,

  -- Part I: Profile
  offices          TEXT,           -- comma-separated offices
  role             TEXT,
  duration         TEXT,

  -- Part II: Functionality (1–10 Likert scale, 1=Strongly Disagree, 5=Strongly Agree)
  func_q1          SMALLINT CHECK (func_q1  BETWEEN 1 AND 5),
  func_q2          SMALLINT CHECK (func_q2  BETWEEN 1 AND 5),
  func_q3          SMALLINT CHECK (func_q3  BETWEEN 1 AND 5),
  func_q4          SMALLINT CHECK (func_q4  BETWEEN 1 AND 5),
  func_q5          SMALLINT CHECK (func_q5  BETWEEN 1 AND 5),
  func_q6          SMALLINT CHECK (func_q6  BETWEEN 1 AND 5),
  func_q7          SMALLINT CHECK (func_q7  BETWEEN 1 AND 5),
  func_q8          SMALLINT CHECK (func_q8  BETWEEN 1 AND 5),
  func_q9          SMALLINT CHECK (func_q9  BETWEEN 1 AND 5),
  func_q10         SMALLINT CHECK (func_q10 BETWEEN 1 AND 5),
  func_comments    TEXT,

  -- Part III: Usability (1–10 Likert scale)
  usab_q1          SMALLINT CHECK (usab_q1  BETWEEN 1 AND 5),
  usab_q2          SMALLINT CHECK (usab_q2  BETWEEN 1 AND 5),
  usab_q3          SMALLINT CHECK (usab_q3  BETWEEN 1 AND 5),
  usab_q4          SMALLINT CHECK (usab_q4  BETWEEN 1 AND 5),
  usab_q5          SMALLINT CHECK (usab_q5  BETWEEN 1 AND 5),
  usab_q6          SMALLINT CHECK (usab_q6  BETWEEN 1 AND 5),
  usab_q7          SMALLINT CHECK (usab_q7  BETWEEN 1 AND 5),
  usab_q8          SMALLINT CHECK (usab_q8  BETWEEN 1 AND 5),
  usab_q9          SMALLINT CHECK (usab_q9  BETWEEN 1 AND 5),
  usab_q10         SMALLINT CHECK (usab_q10 BETWEEN 1 AND 5),
  usab_comments    TEXT,

  -- Part IV: Open-ended
  oe_q1            TEXT,  -- most useful feature
  oe_q2            TEXT,  -- needs most improvement
  oe_q3            TEXT,  -- technical problems encountered
  oe_q4            TEXT,  -- other comments

  -- Metadata
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Useful views for analysis
CREATE VIEW functionality_averages AS
SELECT
  ROUND(AVG(func_q1)::numeric,  2) AS "Q1 – Queue Number Generation",
  ROUND(AVG(func_q2)::numeric,  2) AS "Q2 – Queue Status Display",
  ROUND(AVG(func_q3)::numeric,  2) AS "Q3 – Routing Accuracy",
  ROUND(AVG(func_q4)::numeric,  2) AS "Q4 – Notifications",
  ROUND(AVG(func_q5)::numeric,  2) AS "Q5 – Transaction Recording",
  ROUND(AVG(func_q6)::numeric,  2) AS "Q6 – Peak Performance",
  ROUND(AVG(func_q7)::numeric,  2) AS "Q7 – Teller Panel Updates",
  ROUND(AVG(func_q8)::numeric,  2) AS "Q8 – Dashboard Accuracy",
  ROUND(AVG(func_q9)::numeric,  2) AS "Q9 – Role-Based Access",
  ROUND(AVG(func_q10)::numeric, 2) AS "Q10 – Overall Functionality",
  ROUND(AVG((func_q1+func_q2+func_q3+func_q4+func_q5+
             func_q6+func_q7+func_q8+func_q9+func_q10)::numeric / 10), 2) AS "Overall Avg"
FROM survey_responses;

CREATE VIEW usability_averages AS
SELECT
  ROUND(AVG(usab_q1)::numeric,  2) AS "Q1 – Ease of Navigation",
  ROUND(AVG(usab_q2)::numeric,  2) AS "Q2 – Clear Instructions",
  ROUND(AVG(usab_q3)::numeric,  2) AS "Q3 – Straightforward Steps",
  ROUND(AVG(usab_q4)::numeric,  2) AS "Q4 – System Responsiveness",
  ROUND(AVG(usab_q5)::numeric,  2) AS "Q5 – Display Readability",
  ROUND(AVG(usab_q6)::numeric,  2) AS "Q6 – Task Completion w/o Help",
  ROUND(AVG(usab_q7)::numeric,  2) AS "Q7 – Kiosk & Mobile Access",
  ROUND(AVG(usab_q8)::numeric,  2) AS "Q8 – Visual Layout",
  ROUND(AVG(usab_q9)::numeric,  2) AS "Q9 – Satisfaction vs Manual",
  ROUND(AVG(usab_q10)::numeric, 2) AS "Q10 – Would Recommend",
  ROUND(AVG((usab_q1+usab_q2+usab_q3+usab_q4+usab_q5+
             usab_q6+usab_q7+usab_q8+usab_q9+usab_q10)::numeric / 10), 2) AS "Overall Avg"
FROM survey_responses;
