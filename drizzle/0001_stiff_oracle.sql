CREATE TABLE `marvel_content` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`saga` varchar(255) NOT NULL,
	`synopsis` text,
	`imageUrl` text,
	`contentType` varchar(64) NOT NULL,
	`universe` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marvel_content_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentId` varchar(64) NOT NULL,
	`watched` boolean NOT NULL DEFAULT false,
	`rating` decimal(2,1) DEFAULT '0',
	`comment` text,
	`scheduledDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_progress_id` PRIMARY KEY(`id`)
);
