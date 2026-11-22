-- Proposed server schema; NOT applied to the current static deployment.
-- Apply through the chosen database's migration runner, never on requests.
CREATE TABLE users (
 id TEXT PRIMARY KEY,
 telegram_id TEXT UNIQUE,
 google_subject TEXT UNIQUE,
 display_name TEXT NOT NULL,
 role TEXT NOT NULL CHECK(role IN ('student','teacher','admin')),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','suspended'))
);
CREATE TABLE groups (
 id TEXT PRIMARY KEY,
 teacher_id TEXT NOT NULL REFERENCES users(id),
 name TEXT NOT NULL,
 join_code TEXT NOT NULL UNIQUE,
 archived INTEGER NOT NULL DEFAULT 0,
 created_at INTEGER NOT NULL
);
CREATE TABLE memberships (
 group_id TEXT NOT NULL REFERENCES groups(id),
 student_id TEXT NOT NULL REFERENCES users(id),
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('pending','active','removed')),
 joined_at INTEGER NOT NULL,
 PRIMARY KEY(group_id,student_id)
);
CREATE TABLE tasks (
 id TEXT PRIMARY KEY,
 group_id TEXT NOT NULL REFERENCES groups(id),
 type TEXT NOT NULL CHECK(type IN ('vocabulary','spelling','grammar','reading','listening','writing','speaking')),
 title TEXT NOT NULL,
 difficulty TEXT NOT NULL CHECK(difficulty IN ('foundation','standard','challenge')),
 instructions TEXT NOT NULL,
 payload_json TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','closed')),
 deadline INTEGER
);
CREATE TABLE words (
 id TEXT PRIMARY KEY,
 group_id TEXT NOT NULL REFERENCES groups(id),
 created_by TEXT NOT NULL REFERENCES users(id),
 english TEXT NOT NULL,
 uzbek TEXT NOT NULL,
 details_json TEXT NOT NULL
);
CREATE TABLE submissions (
 id TEXT PRIMARY KEY,
 task_id TEXT NOT NULL REFERENCES tasks(id),
 student_id TEXT NOT NULL REFERENCES users(id),
 answer_json TEXT NOT NULL,
 review_status TEXT NOT NULL DEFAULT 'pending' CHECK(review_status IN ('pending','approved','changes_requested')),
 score_percent REAL CHECK(score_percent BETWEEN 0 AND 100),
 teacher_feedback TEXT,
 submitted_at INTEGER NOT NULL
);
CREATE TABLE xp_awards (
 task_id TEXT NOT NULL REFERENCES tasks(id),
 student_id TEXT NOT NULL REFERENCES users(id),
 awarded_xp INTEGER NOT NULL DEFAULT 0 CHECK(awarded_xp>=0),
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(task_id,student_id)
);
CREATE INDEX submissions_task_idx ON submissions(task_id,student_id);
CREATE INDEX memberships_student_idx ON memberships(student_id,status);
-- Award updates and any ledger entry must be one transaction.
-- Replays/retries update the best earned total; they never append full XP again.
