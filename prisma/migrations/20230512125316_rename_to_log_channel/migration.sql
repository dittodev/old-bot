/*
  Warnings:

  - You are about to drop the column `channelId` on the `MemberLog` table. All the data in the column will be lost.
  - Added the required column `logChannel` to the `MemberLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MemberLog` DROP COLUMN `channelId`,
    ADD COLUMN `logChannel` VARCHAR(191) NOT NULL;
