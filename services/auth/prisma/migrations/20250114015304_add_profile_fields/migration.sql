-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avgRating" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "carColor" TEXT,
ADD COLUMN     "carModel" TEXT,
ADD COLUMN     "carYear" INTEGER,
ADD COLUMN     "driverLicense" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "totalRatings" INTEGER NOT NULL DEFAULT 0;
