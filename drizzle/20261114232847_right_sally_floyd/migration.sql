CREATE TABLE `expenses` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`amount` integer NOT NULL,
	`category` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`spentAt` integer NOT NULL
);
