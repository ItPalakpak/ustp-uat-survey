--
-- PostgreSQL database dump
--

\restrict d0yBLEzrzrQbdSScReHc81SAV6ESV3PsTH6CWDKS8HntJmPaW2Mz6XDtOQnduaO

-- Dumped from database version 18.2 (ead15cf)
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: survey_responses; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.survey_responses (
    id integer NOT NULL,
    role text,
    offices text,
    visit_frequency text,
    cur_q1 smallint,
    cur_q2 smallint,
    cur_q3 smallint,
    cur_q4 smallint,
    cur_q5 smallint,
    cur_q6 smallint,
    cur_q7 smallint,
    cur_q8 smallint,
    cur_q9 smallint,
    cur_q10 smallint,
    cur_q11 smallint,
    cur_q12 smallint,
    cur_q13 smallint,
    cur_q14 smallint,
    cur_q15 smallint,
    dgt_q16 smallint,
    dgt_q17 smallint,
    dgt_q18 smallint,
    dgt_q19 smallint,
    dgt_q20 smallint,
    dgt_q21 smallint,
    dgt_q22 smallint,
    dgt_q23 smallint,
    dgt_q24 smallint,
    dgt_q25 smallint,
    oe_q26 text,
    oe_q27 text,
    oe_q28 text,
    consent_given boolean NOT NULL DEFAULT false,
    consent_at timestamp with time zone,
    submitted_at timestamp with time zone DEFAULT now(),
    CONSTRAINT survey_responses_cur_q10_check CHECK (((cur_q10 >= 1) AND (cur_q10 <= 5))),
    CONSTRAINT survey_responses_cur_q11_check CHECK (((cur_q11 >= 1) AND (cur_q11 <= 5))),
    CONSTRAINT survey_responses_cur_q12_check CHECK (((cur_q12 >= 1) AND (cur_q12 <= 5))),
    CONSTRAINT survey_responses_cur_q13_check CHECK (((cur_q13 >= 1) AND (cur_q13 <= 5))),
    CONSTRAINT survey_responses_cur_q14_check CHECK (((cur_q14 >= 1) AND (cur_q14 <= 5))),
    CONSTRAINT survey_responses_cur_q15_check CHECK (((cur_q15 >= 1) AND (cur_q15 <= 5))),
    CONSTRAINT survey_responses_cur_q1_check CHECK (((cur_q1 >= 1) AND (cur_q1 <= 5))),
    CONSTRAINT survey_responses_cur_q2_check CHECK (((cur_q2 >= 1) AND (cur_q2 <= 5))),
    CONSTRAINT survey_responses_cur_q3_check CHECK (((cur_q3 >= 1) AND (cur_q3 <= 5))),
    CONSTRAINT survey_responses_cur_q4_check CHECK (((cur_q4 >= 1) AND (cur_q4 <= 5))),
    CONSTRAINT survey_responses_cur_q5_check CHECK (((cur_q5 >= 1) AND (cur_q5 <= 5))),
    CONSTRAINT survey_responses_cur_q6_check CHECK (((cur_q6 >= 1) AND (cur_q6 <= 5))),
    CONSTRAINT survey_responses_cur_q7_check CHECK (((cur_q7 >= 1) AND (cur_q7 <= 5))),
    CONSTRAINT survey_responses_cur_q8_check CHECK (((cur_q8 >= 1) AND (cur_q8 <= 5))),
    CONSTRAINT survey_responses_cur_q9_check CHECK (((cur_q9 >= 1) AND (cur_q9 <= 5))),
    CONSTRAINT survey_responses_dgt_q16_check CHECK (((dgt_q16 >= 1) AND (dgt_q16 <= 5))),
    CONSTRAINT survey_responses_dgt_q17_check CHECK (((dgt_q17 >= 1) AND (dgt_q17 <= 5))),
    CONSTRAINT survey_responses_dgt_q18_check CHECK (((dgt_q18 >= 1) AND (dgt_q18 <= 5))),
    CONSTRAINT survey_responses_dgt_q19_check CHECK (((dgt_q19 >= 1) AND (dgt_q19 <= 5))),
    CONSTRAINT survey_responses_dgt_q20_check CHECK (((dgt_q20 >= 1) AND (dgt_q20 <= 5))),
    CONSTRAINT survey_responses_dgt_q21_check CHECK (((dgt_q21 >= 1) AND (dgt_q21 <= 5))),
    CONSTRAINT survey_responses_dgt_q22_check CHECK (((dgt_q22 >= 1) AND (dgt_q22 <= 5))),
    CONSTRAINT survey_responses_dgt_q23_check CHECK (((dgt_q23 >= 1) AND (dgt_q23 <= 5))),
    CONSTRAINT survey_responses_dgt_q24_check CHECK (((dgt_q24 >= 1) AND (dgt_q24 <= 5))),
    CONSTRAINT survey_responses_dgt_q25_check CHECK (((dgt_q25 >= 1) AND (dgt_q25 <= 5)))
);


ALTER TABLE public.survey_responses OWNER TO neondb_owner;

--
-- Name: current_experience_composite; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.current_experience_composite AS
 SELECT round(avg(((((((cur_q1 + cur_q2) + cur_q3) + cur_q4) + cur_q5))::numeric / (5)::numeric)), 2) AS "Section A – Waiting Time",
    round(avg(((((((cur_q6 + cur_q7) + cur_q8) + cur_q9) + cur_q10))::numeric / (5)::numeric)), 2) AS "Section B – Transparency",
    round(avg(((((((cur_q11 + cur_q12) + cur_q13) + cur_q14) + cur_q15))::numeric / (5)::numeric)), 2) AS "Section C – Satisfaction",
    round(avg(((((((((((((((((cur_q1 + cur_q2) + cur_q3) + cur_q4) + cur_q5) + cur_q6) + cur_q7) + cur_q8) + cur_q9) + cur_q10) + cur_q11) + cur_q12) + cur_q13) + cur_q14) + cur_q15))::numeric / (15)::numeric)), 2) AS "Part II Overall Avg"
   FROM public.survey_responses;


ALTER VIEW public.current_experience_composite OWNER TO neondb_owner;

--
-- Name: digital_need_averages; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.digital_need_averages AS
 SELECT round(avg(dgt_q16), 2) AS "Q16 – Would Reduce Waiting Time",
    round(avg(dgt_q17), 2) AS "Q17 – Would Use Kiosk",
    round(avg(dgt_q18), 2) AS "Q18 – Useful via Mobile App",
    round(avg(dgt_q19), 2) AS "Q19 – Real-Time Display Helps",
    round(avg(dgt_q20), 2) AS "Q20 – Digital System Necessary",
    round(avg(((((((dgt_q16 + dgt_q17) + dgt_q18) + dgt_q19) + dgt_q20))::numeric / (5)::numeric)), 2) AS "Section D Avg"
   FROM public.survey_responses;


ALTER VIEW public.digital_need_averages OWNER TO neondb_owner;

--
-- Name: digital_need_composite; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.digital_need_composite AS
 SELECT round(avg(((((((dgt_q16 + dgt_q17) + dgt_q18) + dgt_q19) + dgt_q20))::numeric / (5)::numeric)), 2) AS "Section D – Digital Need",
    round(avg(((((((dgt_q21 + dgt_q22) + dgt_q23) + dgt_q24) + dgt_q25))::numeric / (5)::numeric)), 2) AS "Section E – Personnel Benefits",
    round(avg(((((((dgt_q16 + dgt_q17) + dgt_q18) + dgt_q19) + dgt_q20))::numeric / (5)::numeric)), 2) AS "Part III Overall Avg (D only)"
   FROM public.survey_responses;


ALTER VIEW public.digital_need_composite OWNER TO neondb_owner;

--
-- Name: office_visit_counts; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.office_visit_counts AS
 SELECT TRIM(BOTH FROM office_name.office_name) AS office,
    count(*) AS visit_count
   FROM public.survey_responses,
    LATERAL unnest(string_to_array(survey_responses.offices, ','::text)) office_name(office_name)
  GROUP BY (TRIM(BOTH FROM office_name.office_name))
  ORDER BY (count(*)) DESC;


ALTER VIEW public.office_visit_counts OWNER TO neondb_owner;

--
-- Name: personnel_benefits_averages; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.personnel_benefits_averages AS
 SELECT count(*) AS responses_count,
    round(avg(dgt_q21), 2) AS "Q21 – Manual Queue Takes Too Much Time",
    round(avg(dgt_q22), 2) AS "Q22 – Digital Easier to Manage",
    round(avg(dgt_q23), 2) AS "Q23 – Dashboard Helps Monitor Flow",
    round(avg(dgt_q24), 2) AS "Q24 – Role-Based Access Improves Accountability",
    round(avg(dgt_q25), 2) AS "Q25 – Centralized System Reduces Problems",
    round(avg(((((((dgt_q21 + dgt_q22) + dgt_q23) + dgt_q24) + dgt_q25))::numeric / (5)::numeric)), 2) AS "Section E Avg"
   FROM public.survey_responses
  WHERE (dgt_q21 IS NOT NULL);


ALTER VIEW public.personnel_benefits_averages OWNER TO neondb_owner;

--
-- Name: respondents_by_frequency; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.respondents_by_frequency AS
 SELECT visit_frequency,
    count(*) AS count
   FROM public.survey_responses
  GROUP BY visit_frequency
  ORDER BY (count(*)) DESC;


ALTER VIEW public.respondents_by_frequency OWNER TO neondb_owner;

--
-- Name: respondents_by_role; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.respondents_by_role AS
 SELECT role,
    count(*) AS count
   FROM public.survey_responses
  GROUP BY role
  ORDER BY (count(*)) DESC;


ALTER VIEW public.respondents_by_role OWNER TO neondb_owner;

--
-- Name: satisfaction_averages; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.satisfaction_averages AS
 SELECT round(avg(cur_q11), 2) AS "Q11 – Manual System Efficient",
    round(avg(cur_q12), 2) AS "Q12 – Satisfied with Management",
    round(avg(cur_q13), 2) AS "Q13 – Fair and Correct Order",
    round(avg(cur_q14), 2) AS "Q14 – Personnel Manage Effectively",
    round(avg(cur_q15), 2) AS "Q15 – Needs Improvement",
    round(avg(((((((cur_q11 + cur_q12) + cur_q13) + cur_q14) + cur_q15))::numeric / (5)::numeric)), 2) AS "Section C Avg"
   FROM public.survey_responses;


ALTER VIEW public.satisfaction_averages OWNER TO neondb_owner;

--
-- Name: survey_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.survey_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.survey_responses_id_seq OWNER TO neondb_owner;

--
-- Name: survey_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.survey_responses_id_seq OWNED BY public.survey_responses.id;


--
-- Name: transparency_averages; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.transparency_averages AS
 SELECT round(avg(cur_q6), 2) AS "Q6 – No Visible Queue Display",
    round(avg(cur_q7), 2) AS "Q7 – Must Stay in Waiting Area",
    round(avg(cur_q8), 2) AS "Q8 – Not Informed of Position",
    round(avg(cur_q9), 2) AS "Q9 – Lack of Info Causes Stress",
    round(avg(cur_q10), 2) AS "Q10 – Left Queue Due to No Info",
    round(avg(((((((cur_q6 + cur_q7) + cur_q8) + cur_q9) + cur_q10))::numeric / (5)::numeric)), 2) AS "Section B Avg"
   FROM public.survey_responses;


ALTER VIEW public.transparency_averages OWNER TO neondb_owner;

--
-- Name: waiting_time_averages; Type: VIEW; Schema: public; Owner: neondb_owner
--

CREATE VIEW public.waiting_time_averages AS
 SELECT round(avg(cur_q1), 2) AS "Q1 – Long Waiting Times",
    round(avg(cur_q2), 2) AS "Q2 – Crowded / Disorganized",
    round(avg(cur_q3), 2) AS "Q3 – Unpredictable Wait",
    round(avg(cur_q4), 2) AS "Q4 – Affects Productivity",
    round(avg(cur_q5), 2) AS "Q5 – Worst During Peak Periods",
    round(avg(((((((cur_q1 + cur_q2) + cur_q3) + cur_q4) + cur_q5))::numeric / (5)::numeric)), 2) AS "Section A Avg"
   FROM public.survey_responses;


ALTER VIEW public.waiting_time_averages OWNER TO neondb_owner;

--
-- Name: survey_responses id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.survey_responses ALTER COLUMN id SET DEFAULT nextval('public.survey_responses_id_seq'::regclass);


--
-- Name: survey_responses survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.survey_responses
    ADD CONSTRAINT survey_responses_pkey PRIMARY KEY (id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- Rate limiting table: tracks per-IP submission counts
--

CREATE TABLE IF NOT EXISTS submission_rate_limits (
    id          serial PRIMARY KEY,
    ip_hash     varchar(64) NOT NULL,   -- SHA-256 of IP + secret (never stores raw IP)
    created_at  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_hash ON submission_rate_limits (ip_hash);
CREATE INDEX IF NOT EXISTS idx_rate_limits_created_at ON submission_rate_limits (created_at);


--
-- PostgreSQL database dump complete
--

\unrestrict d0yBLEzrzrQbdSScReHc81SAV6ESV3PsTH6CWDKS8HntJmPaW2Mz6XDtOQnduaO

