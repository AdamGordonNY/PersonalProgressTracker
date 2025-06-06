-- AlterTable
ALTER TABLE "User" ADD COLUMN     "features" JSONB,
ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
