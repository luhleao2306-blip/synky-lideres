CREATE TABLE `mirror_action_checkins` (
	`id` text PRIMARY KEY NOT NULL,
	`cycle_id` text NOT NULL,
	`action` text NOT NULL,
	`note` text NOT NULL,
	`entry_date` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `mirror_cycles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mirror_checkin_day` ON `mirror_action_checkins` (`cycle_id`,`entry_date`);