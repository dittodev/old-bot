-- CreateTable
CREATE TABLE `MemberLog` (
    `guildId` VARCHAR(191) NOT NULL,
    `memberRole` VARCHAR(191) NOT NULL,
    `channelId` VARCHAR(191) NOT NULL,
    `botRole` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`guildId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
