/*
  Warnings:

  - You are about to drop the column `maso` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "maso",
ADD COLUMN     "meso" INTEGER;
