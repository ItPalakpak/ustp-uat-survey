# 📋 Step-by-Step Deployment Guide
## USTP UAT Survey — Netlify + Neon PostgreSQL (100% Free)

---

## What You'll End Up With

```
Your respondents
      │
      ▼
 index.html  ◄─── hosted FREE on Netlify
      │
      │  POST request
      ▼
Netlify Function  ◄─── submit-survey.js (serverless, runs on Netlify)
      │
      │  SQL INSERT
      ▼
 Neon PostgreSQL  ◄─── free cloud database (no local DB needed!)
```

---

## STEP 1 — Create a Free Neon Database

**Neon** is a free cloud PostgreSQL service. Think of it as your database hosted in the cloud for free.

1. Go to **https://neon.tech** and click **Sign Up** (use your Google or GitHub account).
2. After signing in, click **"New Project"**.
3. Give it a name (e.g., `ustp-uat-survey`) and click **Create Project**.
4. Once created, you'll see a **Connection String** that looks like this:
   ```
   postgresql://username:password@ep-something.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Copy this entire string** — you will need it in Step 3. Keep it private!

---

## STEP 2 — Create the Database Table

1. In your Neon dashboard, click the **"SQL Editor"** tab on the left sidebar.
2. Open the file **`schema.sql`** from this project folder.
3. Copy the entire contents of `schema.sql`.
4. Paste it into the Neon SQL Editor.
5. Click **"Run"** (or press Ctrl+Enter).
6. You should see a success message. Your table `survey_responses` is now ready.

---

## STEP 3 — Push the Project to GitHub

Netlify deploys directly from GitHub, so you need to upload the project there first.

1. Go to **https://github.com** and log in (create a free account if needed).
2. Click the **"+"** icon → **"New repository"**.
3. Name it `ustp-uat-survey`, set it to **Public** or **Private**, click **Create**.
4. On your computer, install **Git** if you haven't: https://git-scm.com
5. Open a terminal / command prompt in the `ustp-survey` folder and run:

```bash
git init
git add .
git commit -m "Initial survey project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ustp-uat-survey.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

> 💡 **Tip:** If you're not comfortable with Git commands, you can also drag-and-drop the entire folder into the GitHub website when creating a new repository.

---

## STEP 4 — Deploy to Netlify

1. Go to **https://www.netlify.com** and sign up for free (use your GitHub account — easiest!).
2. Click **"Add new site"** → **"Import an existing project"**.
3. Choose **GitHub** and authorize Netlify to access your repositories.
4. Select your `ustp-uat-survey` repository.
5. Netlify will auto-detect the settings from `netlify.toml`. You should see:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
6. Click **"Deploy site"**.
7. Wait ~1-2 minutes. Netlify will give you a URL like `https://random-name-12345.netlify.app`.

---

## STEP 5 — Add the Database URL to Netlify

This is the most important step. You need to tell Netlify how to connect to your Neon database.

1. In your Netlify dashboard, go to your site → **"Site configuration"** → **"Environment variables"**.
2. Click **"Add a variable"**.
3. Set:
   - **Key:** `DATABASE_URL`
   - **Value:** *(paste the full Neon connection string you copied in Step 1)*
4. Click **Save**.
5. Go back to **"Deploys"** and click **"Trigger deploy"** → **"Deploy site"** to rebuild with the new variable.

---

## STEP 6 — Test Your Survey

1. Visit your Netlify URL (e.g., `https://random-name-12345.netlify.app`).
2. Fill out the entire survey and click **Submit**.
3. Go to your Neon SQL Editor and run:
   ```sql
   SELECT * FROM survey_responses;
   ```
4. You should see your test response in the table! 🎉

---

## STEP 7 — Share with Respondents

Simply share your Netlify URL with your UAT respondents. That's it!

Example: `https://ustp-uat-survey.netlify.app`

> 💡 **Custom URL tip:** In Netlify, go to **"Site configuration"** → **"Domain management"** → **"Options"** → **"Edit site name"** to change the random name to something like `ustp-uat-survey`.

---

## Viewing Your Results

After responses come in, go to your **Neon SQL Editor** and run these queries:

**See all responses:**
```sql
SELECT * FROM survey_responses ORDER BY submitted_at DESC;
```

**See functionality averages:**
```sql
SELECT * FROM functionality_averages;
```

**See usability averages:**
```sql
SELECT * FROM usability_averages;
```

**Count responses by role:**
```sql
SELECT role, COUNT(*) as count FROM survey_responses GROUP BY role ORDER BY count DESC;
```

**Export to CSV** (for Excel/SPSS analysis):
In the Neon SQL Editor, run `SELECT * FROM survey_responses;` then click the **"Export"** button to download as CSV.

---

## Data Retention & Privacy Policy

This survey complies with the **Data Privacy Act of 2012 (Republic Act No. 10173)** and the regulations of the **National Privacy Commission (NPC)**.

### What data is collected
- **Profile**: role (Student / Personnel / Others), offices visited, visit frequency — these are categorical and **cannot be used to identify individual respondents**.
- **Likert-scale responses** (Q1–25): numeric ratings from 1–5.
- **Open-ended responses** (Q26–28): free-text answers, automatically scanned and stripped of accidental PII (email addresses, phone numbers, credit-card-like number sequences) before storage.
- **Consent record**: a boolean (`consent_given`) and timestamp (`consent_at`) confirming the respondent agreed to participate.

### What is **NOT** collected
- No IP addresses, browser fingerprints, cookies, or any other tracking identifiers are stored.
- No names, student IDs, or contact details are collected.

### Retention period
- Survey responses are retained for **1 (one) year** from the date of submission (`submitted_at`), or until the research study is concluded — whichever comes first.
- After the retention period, all response rows are **permanently deleted** from the Neon PostgreSQL database.

### To purge expired data
Run this query in the Neon SQL Editor after the retention period:
```sql
DELETE FROM survey_responses
WHERE submitted_at < NOW() - INTERVAL '1 year';
```

### Right to withdraw
Respondents may **withdraw at any time** before submitting the survey by simply closing the browser tab. No data is saved until the respondent clicks **"Submit Survey"**. Partial/incomplete responses are **never** stored.

### Data access
Only the **named researchers** and their faculty adviser have access to the raw data in the Neon database. Aggregated results (averages, counts) may be shared in the research output.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Survey submits but shows error | Check Netlify → Functions → Logs for error details |
| "Database error" on submit | Double-check your DATABASE_URL in Netlify environment variables |
| Page not loading | Make sure `publish = "public"` is in `netlify.toml` |
| Function not found | Make sure `functions = "netlify/functions"` is in `netlify.toml` |

---

## Summary of All Accounts You Need (All Free)

| Service | Purpose | URL |
|---|---|---|
| **GitHub** | Store your code | https://github.com |
| **Netlify** | Host the website + run functions | https://netlify.com |
| **Neon** | Cloud PostgreSQL database | https://neon.tech |

---

*Good luck with your capstone, mga kapwa USTP! 🎓*
