/*
  Warnings:

  - You are about to drop the column `moderaton` on the `Infraction` table. All the data in the column will be lost.
  - Added the required column `moderator` to the `Infraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Infraction` DROP COLUMN `moderaton`,
    ADD COLUMN `moderator` VARCHAR(191) NOT NULL;
