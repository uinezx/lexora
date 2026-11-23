CREATE TABLE `telegram_browser_links` (
	`id` text PRIMARY KEY NOT NULL,
	`browser_hash` text NOT NULL,
	`user_id` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires` integer NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `telegram_browser_links_user` ON `telegram_browser_links` (`user_id`,`expires`);