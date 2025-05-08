/*
  Warnings:

  - A unique constraint covering the columns `[alias]` on the table `Team` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[alias]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "alias" TEXT;

-- AlterTable
-- First add the column as nullable
ALTER TABLE "User" ADD COLUMN "alias" TEXT;
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- Update existing records with default value
UPDATE "User" SET "image" = '' WHERE "image" IS NULL;

-- Alter column to be NOT NULL with default empty string
ALTER TABLE "User" ALTER COLUMN "image" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "image" SET DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Team_alias_key" ON "Team"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");
