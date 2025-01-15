/*
  Warnings:

  - You are about to drop the column `avgRating` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `carColor` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `carModel` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `carYear` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `driverLicense` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalRatings` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "avgRating",
DROP COLUMN "bio",
DROP COLUMN "carColor",
DROP COLUMN "carModel",
DROP COLUMN "carYear",
DROP COLUMN "driverLicense",
DROP COLUMN "languages",
DROP COLUMN "location",
DROP COLUMN "totalRatings";
