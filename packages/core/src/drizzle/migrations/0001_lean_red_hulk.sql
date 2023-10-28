CREATE TABLE `links` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`group` text NOT NULL,
	`type` text NOT NULL,
	`url` text NOT NULL,
	`active` integer DEFAULT false NOT NULL,
	`protected` text NOT NULL
);
