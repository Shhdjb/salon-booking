-- AlterEnum: Rename USER to CLIENT in Role enum (PostgreSQL 10+)
ALTER TYPE "Role" RENAME VALUE 'USER' TO 'CLIENT';
