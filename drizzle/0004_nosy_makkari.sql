ALTER TABLE `companies` ADD `kind` text DEFAULT 'organization' NOT NULL;--> statement-breakpoint
UPDATE `companies` SET `kind` = 'personal' WHERE `id` IN (
  SELECT `company_id` FROM `members` WHERE `user_id` LIKE 'visitor:%' AND `role` = 'admin'
);
