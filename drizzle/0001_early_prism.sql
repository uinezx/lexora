CREATE INDEX `attempts_lesson_student` ON `class_attempts` (`lesson_id`,`student_id`);--> statement-breakpoint
CREATE INDEX `groups_teacher` ON `class_groups` (`teacher_id`);--> statement-breakpoint
CREATE INDEX `lessons_group` ON `class_lessons` (`group_id`);--> statement-breakpoint
CREATE INDEX `lessons_deck` ON `class_lessons` (`deck_id`);--> statement-breakpoint
CREATE INDEX `limits_expiry` ON `class_rate_limits` (`expires`);--> statement-breakpoint
CREATE INDEX `members_student` ON `class_members` (`student_id`);--> statement-breakpoint
CREATE INDEX `words_lesson` ON `class_words` (`lesson_id`);