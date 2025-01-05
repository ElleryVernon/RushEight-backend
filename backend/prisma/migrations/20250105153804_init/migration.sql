/*
  Warnings:

  - You are about to drop the column `mass` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "mass",
ADD COLUMN     "maso" INTEGER;
