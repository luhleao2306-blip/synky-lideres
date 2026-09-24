CREATE TABLE `communication_pairs` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`creator_id` text NOT NULL,
	`partner_email` text NOT NULL,
	`partner_id` text,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`creator_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_comm_company` ON `communication_pairs` (`company_id`);--> statement-breakpoint
CREATE TABLE `communication_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`pair_id` text NOT NULL,
	`member_id` text NOT NULL,
	`preferences` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`pair_id`) REFERENCES `communication_pairs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_comm_response_unique` ON `communication_responses` (`pair_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `companies` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `decision_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`member_id` text NOT NULL,
	`scenario_id` text NOT NULL,
	`choices` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_decision_member` ON `decision_runs` (`company_id`,`member_id`);--> statement-breakpoint
CREATE TABLE `invites` (
	`token` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`email` text NOT NULL,
	`type` text NOT NULL,
	`role` text,
	`reference_id` text,
	`expires_at` text NOT NULL,
	`used_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_invites_company` ON `invites` (`company_id`);--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`user_id` text NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_members_company_user` ON `members` (`company_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `idx_members_user` ON `members` (`user_id`);--> statement-breakpoint
CREATE TABLE `mirror_cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text NOT NULL,
	`leader_id` text NOT NULL,
	`status` text NOT NULL,
	`self_scores` text NOT NULL,
	`action` text,
	`created_at` text NOT NULL,
	`closed_at` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`leader_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_mirror_leader` ON `mirror_cycles` (`company_id`,`leader_id`);--> statement-breakpoint
CREATE TABLE `mirror_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`cycle_id` text NOT NULL,
	`respondent_id` text NOT NULL,
	`scores` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`cycle_id`) REFERENCES `mirror_cycles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`respondent_id`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_mirror_response_unique` ON `mirror_responses` (`cycle_id`,`respondent_id`);