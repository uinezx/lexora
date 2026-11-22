CREATE TABLE `accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`student_id` text NOT NULL,
	`correct` integer NOT NULL,
	`total` integer NOT NULL,
	`passed` integer NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `class_lessons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_attendance` (
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`date` text NOT NULL,
	`status` text NOT NULL,
	PRIMARY KEY(`group_id`, `student_id`, `date`),
	FOREIGN KEY (`group_id`) REFERENCES `class_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_decks` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`name` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `class_groups`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `deck_group_name` ON `class_decks` (`group_id`,`name`);--> statement-breakpoint
CREATE TABLE `class_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`teacher_id` text NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`teacher_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `class_groups_code_unique` ON `class_groups` (`code`);--> statement-breakpoint
CREATE TABLE `class_lessons` (
	`id` text PRIMARY KEY NOT NULL,
	`group_id` text NOT NULL,
	`deck_id` text NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`created` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `class_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deck_id`) REFERENCES `class_decks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_rate_limits` (
	`id` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `class_members` (
	`group_id` text NOT NULL,
	`student_id` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`group_id`, `student_id`),
	FOREIGN KEY (`group_id`) REFERENCES `class_groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_passes` (
	`lesson_id` text NOT NULL,
	`student_id` text NOT NULL,
	`attempt_id` text NOT NULL,
	`created` integer NOT NULL,
	PRIMARY KEY(`lesson_id`, `student_id`),
	FOREIGN KEY (`lesson_id`) REFERENCES `class_lessons`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`student_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`attempt_id`) REFERENCES `class_attempts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_words` (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`word` text NOT NULL,
	`translation` text NOT NULL,
	`example` text DEFAULT '' NOT NULL,
	FOREIGN KEY (`lesson_id`) REFERENCES `class_lessons`(`id`) ON UPDATE no action ON DELETE no action
);
