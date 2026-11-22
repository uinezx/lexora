CREATE TABLE `group_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`title` text NOT NULL,
	`instructions` text NOT NULL,
	`questions` text NOT NULL,
	`due` integer NOT NULL,
	`created` integer NOT NULL,
	`archived` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `assignment_group` ON `group_assignments` (`group_id`);--> statement-breakpoint
CREATE TABLE `word_review_events` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`word_id` text NOT NULL,
	`grade` text NOT NULL,
	`day` text NOT NULL,
	`was_new` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `review_day` ON `word_review_events` (`student_id`,`day`);--> statement-breakpoint
CREATE TABLE `word_review_state` (
	`student_id` text NOT NULL,
	`word_id` text NOT NULL,
	`phase` text NOT NULL,
	`step` integer NOT NULL,
	`interval` integer NOT NULL,
	`ease` text NOT NULL,
	`reps` integer NOT NULL,
	`lapses` integer NOT NULL,
	`due` integer NOT NULL,
	PRIMARY KEY(`student_id`, `word_id`)
);
--> statement-breakpoint
CREATE INDEX `review_due` ON `word_review_state` (`student_id`,`due`);--> statement-breakpoint
CREATE TABLE `group_study_policy` (
	`group_id` text PRIMARY KEY NOT NULL,
	`daily_limit` integer NOT NULL,
	`new_limit` integer NOT NULL,
	`inactive_days` integer NOT NULL,
	`deadline_hours` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assignment_submissions` (
	`assignment_id` text NOT NULL,
	`student_id` text NOT NULL,
	`answers` text NOT NULL,
	`status` text NOT NULL,
	`score` integer,
	`feedback` text NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	PRIMARY KEY(`assignment_id`, `student_id`)
);
--> statement-breakpoint
ALTER TABLE `class_lessons` ADD `archived` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `class_words` ADD `archived` integer DEFAULT 0 NOT NULL;