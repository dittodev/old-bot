-- AlterTable
ALTER TABLE `Infraction` MODIFY `type` ENUM('WARN', 'TIMEOUT', 'BAN') NOT NULL;
