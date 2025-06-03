/*
  Warnings:

  - You are about to drop the `GolfTip` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `greensInReg` to the `GolfRound` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ClubType" AS ENUM ('DRIVER', 'THREE_WOOD', 'FOUR_HYBRID', 'FIVE_HYBRID', 'TWO_IRON', 'THREE_IRON', 'FOUR_IRON', 'FIVE_IRON', 'SIX_IRON', 'SEVEN_IRON', 'EIGHT_IRON', 'NINE_IRON', 'PITCHING_WEDGE', 'GAP_WEDGE', 'SAND_WEDGE', 'LOB_WEDGE', 'PUTTER');

-- CreateEnum
CREATE TYPE "ShotType" AS ENUM ('DRIVE', 'FAIRWAY', 'APPROACH', 'CHIP', 'PITCH', 'BUNKER', 'PUTT', 'RECOVERY');

-- DropForeignKey
ALTER TABLE "GolfRound" DROP CONSTRAINT "GolfRound_userId_fkey";

-- DropForeignKey
ALTER TABLE "GolfTip" DROP CONSTRAINT "GolfTip_userId_fkey";

-- AlterTable
ALTER TABLE "GolfRound" ADD COLUMN     "courseId" TEXT,
ADD COLUMN     "greensInReg" INTEGER NOT NULL,
ADD COLUMN     "weather" JSONB;

-- DropTable
DROP TABLE "GolfTip";

-- CreateTable
CREATE TABLE "GolfShot" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "holeId" TEXT NOT NULL,
    "club" "ClubType" NOT NULL,
    "shotType" "ShotType" NOT NULL,
    "distance" INTEGER NOT NULL,
    "result" TEXT,
    "elevation" INTEGER,
    "windSpeed" INTEGER,
    "windDirection" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GolfShot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GolfCourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GolfCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GolfHoleTemplate" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "yards" INTEGER NOT NULL,
    "handicap" INTEGER NOT NULL,

    CONSTRAINT "GolfHoleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GolfShot_roundId_idx" ON "GolfShot"("roundId");

-- CreateIndex
CREATE INDEX "GolfShot_holeId_idx" ON "GolfShot"("holeId");

-- CreateIndex
CREATE INDEX "GolfHoleTemplate_courseId_idx" ON "GolfHoleTemplate"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "GolfHoleTemplate_courseId_holeNumber_key" ON "GolfHoleTemplate"("courseId", "holeNumber");

-- CreateIndex
CREATE INDEX "GolfHole_roundId_idx" ON "GolfHole"("roundId");

-- CreateIndex
CREATE INDEX "GolfRound_userId_idx" ON "GolfRound"("userId");

-- CreateIndex
CREATE INDEX "GolfRound_courseId_idx" ON "GolfRound"("courseId");

-- AddForeignKey
ALTER TABLE "GolfRound" ADD CONSTRAINT "GolfRound_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GolfCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfRound" ADD CONSTRAINT "GolfRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfShot" ADD CONSTRAINT "GolfShot_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "GolfRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfShot" ADD CONSTRAINT "GolfShot_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "GolfHole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GolfHoleTemplate" ADD CONSTRAINT "GolfHoleTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GolfCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
