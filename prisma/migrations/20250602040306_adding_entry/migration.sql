/*
  Warnings:

  - A unique constraint covering the columns `[guid]` on the table `Entry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[microsoftTokenId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "guid" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "microsoftTokenId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Entry_guid_key" ON "Entry"("guid");

-- CreateIndex
CREATE UNIQUE INDEX "User_microsoftTokenId_key" ON "User"("microsoftTokenId");
