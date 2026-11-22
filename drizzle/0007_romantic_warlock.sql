CREATE TABLE `student_study_plan` (
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`freeze_until` integer NOT NULL,
	`daily_limit` integer,
	`warning_reset` integer NOT NULL,
	`catchup_days` integer NOT NULL,
	`catchup_start` integer NOT NULL,
	`catchup_cutoff` integer NOT NULL,
	PRIMARY KEY(`group_id`, `student_id`)
);
--> statement-breakpoint
CREATE TABLE `word_passes` (
	`word_id` text NOT NULL,
	`student_id` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`word_id`, `student_id`)
);
