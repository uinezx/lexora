CREATE TABLE `telegram_exchanges` (
	`signature` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `telegram_exchanges_expiry` ON `telegram_exchanges` (`expires`);--> statement-breakpoint
CREATE TABLE `telegram_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `telegram_sessions_expiry` ON `telegram_sessions` (`expires`);