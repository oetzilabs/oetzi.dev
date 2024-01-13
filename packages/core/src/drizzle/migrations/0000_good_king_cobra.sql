CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`owner_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`visibility` text NOT NULL,
	`remote` text,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`user_id` text NOT NULL,
	`image` text NOT NULL,
	`preferred_username` text,
	`locale` text DEFAULT 'en',
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`expires_at` integer,
	`expires_in` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `techs` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `stack_used_by_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer,
	`deleted_at` integer,
	`project_id` text NOT NULL,
	`tech_id` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tech_id`) REFERENCES `techs`(`id`) ON UPDATE no action ON DELETE cascade
);
