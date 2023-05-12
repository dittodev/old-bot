/*
  Warnings:

  - Added the required column `type` to the `Infraction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Infraction` ADD COLUMN `type` ENUM('WARN', 'TIMEOUT') NOT NULL;
