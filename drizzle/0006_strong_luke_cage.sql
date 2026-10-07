CREATE TABLE IF NOT EXISTS `synky_academy_legacy_snapshots` (
	`member_id` text NOT NULL,
	`company_id` text NOT NULL,
	`course_progress` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`member_id`, `company_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `synky_academy_records` (
	`member_id` text NOT NULL,
	`company_id` text NOT NULL,
	`progress` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`write_id` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`member_id`, `company_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `synky_course_certificates` (
	`id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`company_id` text NOT NULL,
	`course_id` text NOT NULL,
	`course_title` text NOT NULL,
	`recipient` text NOT NULL,
	`grade` real NOT NULL,
	`issued_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `idx_course_certificate_unique` ON `synky_course_certificates` (`member_id`,`company_id`,`course_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `synky_course_feedback` (
	`member_id` text NOT NULL,
	`company_id` text NOT NULL,
	`course_id` text NOT NULL,
	`rating` integer NOT NULL,
	`message` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`member_id`, `company_id`, `course_id`)
);
