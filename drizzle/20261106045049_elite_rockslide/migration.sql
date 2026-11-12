CREATE TABLE `log` (
	`task` text NOT NULL,
	`amount` integer NOT NULL,
	`log_id` integer PRIMARY KEY AUTOINCREMENT,
	`createdAt` integer NOT NULL,
	CONSTRAINT `fk_log_task_task_name_fk` FOREIGN KEY (`task`) REFERENCES `task`(`name`) ON UPDATE CASCADE ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `task` (
	`name` text NOT NULL UNIQUE,
	`unit` text NOT NULL,
	`increment` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `day_record` (
	`task` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`total` integer NOT NULL,
	`date` integer NOT NULL,
	`createdAt` integer NOT NULL,
	CONSTRAINT `fk_day_record_task_task_name_fk` FOREIGN KEY (`task`) REFERENCES `task`(`name`) ON UPDATE CASCADE,
	CONSTRAINT `day_record_task_date_unique` UNIQUE(`task`,`date`)
);
