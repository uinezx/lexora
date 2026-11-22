CREATE TABLE `telegram_onboarding` (
	`user_id` text PRIMARY KEY NOT NULL,
	`step` text NOT NULL,
	`role` text NOT NULL,
	`name` text NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `telegram_phones` (
	`user_id` text PRIMARY KEY NOT NULL,
	`phone_hash` text NOT NULL,
	`verified` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `telegram_phones_phone_hash_unique` ON `telegram_phones` (`phone_hash`);--> statement-breakpoint
CREATE TABLE `telegram_updates` (
	`id` integer PRIMARY KEY NOT NULL,
	`reply` text NOT NULL,
	`created` integer NOT NULL
);
