CREATE TABLE `allowed_users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`email` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `sessions` DROP COLUMN `scope`;