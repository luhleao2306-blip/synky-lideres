CREATE TABLE `career_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`member_id` text NOT NULL,
	`choices` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_career_member` ON `career_runs` (`company_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `energy_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`member_id` text NOT NULL,
	`entry_date` text NOT NULL,
	`activity_type` text NOT NULL,
	`activity` text NOT NULL,
	`energy` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_energy_member_date` ON `energy_entries` (`company_id`,`member_id`,`entry_date`);--> statement-breakpoint
CREATE TABLE `energy_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`member_id` text NOT NULL,
	`leader_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`leader_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_energy_share_unique` ON `energy_shares` (`member_id`,`leader_id`);--> statement-breakpoint
CREATE TABLE `thermometer_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`round_id` text NOT NULL,
	`respondent_id` text NOT NULL,
	`scores` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`round_id`) REFERENCES `thermometer_rounds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`respondent_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_thermometer_response_unique` ON `thermometer_responses` (`round_id`,`respondent_id`);--> statement-breakpoint
CREATE TABLE `thermometer_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`track_id` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`closed_at` text,
	FOREIGN KEY (`track_id`) REFERENCES `thermometer_tracks`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_thermometer_round_track` ON `thermometer_rounds` (`track_id`);--> statement-breakpoint
CREATE TABLE `thermometer_tracks` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`leader_id` text NOT NULL,
	`cycle_id` text NOT NULL,
	`dimensions` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`leader_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`cycle_id`) REFERENCES `mirror_cycles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_thermometer_cycle` ON `thermometer_tracks` (`cycle_id`);