
/*
  Warnings:

  - You are about to drop the `Activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `City` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ItineraryActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TripStop` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalBudget` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('TRAIN', 'FLIGHT', 'BUS');

-- CreateEnum
CREATE TYPE "AccommodationTier" AS ENUM ('BUDGET', 'MID_RANGE', 'LUXURY');

-- CreateEnum
CREATE TYPE "IndoorOutdoor" AS ENUM ('INDOOR', 'OUTDOOR', 'BOTH');

-- DropForeignKey
ALTER TABLE "ItineraryActivity" DROP CONSTRAINT "ItineraryActivity_activityId_fkey";

-- DropForeignKey
ALTER TABLE "ItineraryActivity" DROP CONSTRAINT "ItineraryActivity_stopId_fkey";

-- DropForeignKey
ALTER TABLE "TripStop" DROP CONSTRAINT "TripStop_cityId_fkey";

-- DropForeignKey
ALTER TABLE "TripStop" DROP CONSTRAINT "TripStop_tripId_fkey";

-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN     "numberOfTravelers" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "totalBudget" DOUBLE PRECISION NOT NULL;

-- DropTable
DROP TABLE "Activity";

-- DropTable
DROP TABLE "City";

-- DropTable
DROP TABLE "ItineraryActivity";

-- DropTable
DROP TABLE "TripStop";

-- CreateTable
CREATE TABLE "Destination" (
    "id" TEXT NOT NULL,
    "cityName" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "description" TEXT,
    "averageDailyCost" DOUBLE PRECISION,
    "budgetDailyCost" DOUBLE PRECISION,
    "midRangeDailyCost" DOUBLE PRECISION,
    "luxuryDailyCost" DOUBLE PRECISION,
    "recommendedDays" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TripDestination" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "visitOrder" INTEGER NOT NULL,
    "plannedStartDate" TIMESTAMP(3),
    "plannedEndDate" TIMESTAMP(3),
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TripDestination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attraction" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "estimatedVisitHours" DOUBLE PRECISION,
    "entranceFee" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "averageRating" DOUBLE PRECISION,
    "popularityScore" INTEGER,
    "indoorOutdoor" "IndoorOutdoor" NOT NULL DEFAULT 'BOTH',
    "recommended" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccommodationCost" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "budgetPerNight" DOUBLE PRECISION NOT NULL,
    "midRangePerNight" DOUBLE PRECISION NOT NULL,
    "luxuryPerNight" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccommodationCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoodCost" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "budgetPerDay" DOUBLE PRECISION NOT NULL,
    "midRangePerDay" DOUBLE PRECISION NOT NULL,
    "luxuryPerDay" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FoodCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportationOption" (
    "id" TEXT NOT NULL,
    "originDestinationId" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "transportType" "TransportType" NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "estimatedDurationHours" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportationOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeasonalInfo" (
    "id" TEXT NOT NULL,
    "destinationId" TEXT NOT NULL,
    "bestTravelMonths" TEXT,
    "peakSeason" TEXT,
    "offSeason" TEXT,
    "weatherCategory" TEXT,
    "seasonalMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Destination_cityName_idx" ON "Destination"("cityName");

-- CreateIndex
CREATE INDEX "Destination_country_idx" ON "Destination"("country");

-- CreateIndex
CREATE INDEX "Destination_region_idx" ON "Destination"("region");

-- CreateIndex
CREATE UNIQUE INDEX "Destination_cityName_country_key" ON "Destination"("cityName", "country");

-- CreateIndex
CREATE INDEX "TripDestination_tripId_idx" ON "TripDestination"("tripId");

-- CreateIndex
CREATE INDEX "TripDestination_destinationId_idx" ON "TripDestination"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "TripDestination_tripId_destinationId_key" ON "TripDestination"("tripId", "destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "TripDestination_tripId_visitOrder_key" ON "TripDestination"("tripId", "visitOrder");

-- CreateIndex
CREATE INDEX "Attraction_destinationId_idx" ON "Attraction"("destinationId");

-- CreateIndex
CREATE INDEX "Attraction_category_idx" ON "Attraction"("category");

-- CreateIndex
CREATE INDEX "Attraction_popularityScore_idx" ON "Attraction"("popularityScore");

-- CreateIndex
CREATE INDEX "Attraction_averageRating_idx" ON "Attraction"("averageRating");

-- CreateIndex
CREATE UNIQUE INDEX "AccommodationCost_destinationId_key" ON "AccommodationCost"("destinationId");

-- CreateIndex
CREATE UNIQUE INDEX "FoodCost_destinationId_key" ON "FoodCost"("destinationId");

-- CreateIndex
CREATE INDEX "TransportationOption_originDestinationId_idx" ON "TransportationOption"("originDestinationId");

-- CreateIndex
CREATE INDEX "TransportationOption_destinationId_idx" ON "TransportationOption"("destinationId");

-- CreateIndex
CREATE INDEX "TransportationOption_transportType_idx" ON "TransportationOption"("transportType");

-- CreateIndex
CREATE UNIQUE INDEX "TransportationOption_originDestinationId_destinationId_tran_key" ON "TransportationOption"("originDestinationId", "destinationId", "transportType");

-- CreateIndex
CREATE UNIQUE INDEX "SeasonalInfo_destinationId_key" ON "SeasonalInfo"("destinationId");

-- AddForeignKey
ALTER TABLE "TripDestination" ADD CONSTRAINT "TripDestination_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TripDestination" ADD CONSTRAINT "TripDestination_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attraction" ADD CONSTRAINT "Attraction_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccommodationCost" ADD CONSTRAINT "AccommodationCost_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoodCost" ADD CONSTRAINT "FoodCost_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationOption" ADD CONSTRAINT "TransportationOption_originDestinationId_fkey" FOREIGN KEY ("originDestinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportationOption" ADD CONSTRAINT "TransportationOption_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonalInfo" ADD CONSTRAINT "SeasonalInfo_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE CASCADE ON UPDATE CASCADE;
