-- CreateTable
CREATE TABLE `Infraction` (
    `infractionId` VARCHAR(191) NOT NULL,
    `guildId` VARCHAR(191) NOT NULL,
    `userDiscord_id` VARCHAR(191) NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NOT NULL,
    `moderaton` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`infractionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Infraction` ADD CONSTRAINT `Infraction_userDiscord_id_fkey` FOREIGN KEY (`userDiscord_id`) REFERENCES `User`(`discord_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
