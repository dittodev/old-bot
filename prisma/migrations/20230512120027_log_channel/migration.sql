/*
  Warnings:

  - Added the required column `logChannel` to the `MemberLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `MemberLog` ADD COLUMN `logChannel` VARCHAR(191) NOT NULL;
