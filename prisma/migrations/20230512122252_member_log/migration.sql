/*
  Warnings:

  - You are about to drop the `MemberLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE `Infraction` MODIFY `type` ENUM('WARN', 'TIMEOUT', 'BAN') NOT NULL;

-- DropTable
DROP TABLE `MemberLog`;
