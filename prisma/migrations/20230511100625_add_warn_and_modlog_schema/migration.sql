-- CreateTable
CREATE TABLE `Warn` (
    `guildId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `warnReason` VARCHAR(191) NOT NULL,
    `warnDate` VARCHAR(191) NOT NULL,
    `moderator` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`guildId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ModLogs` (
    `id` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
