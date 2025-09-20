/*
  Warnings:

  - You are about to drop the column `storeId` on the `StockSauce` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sauceType]` on the table `StockSauce` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."StockSauce" DROP CONSTRAINT "StockSauce_storeId_fkey";

-- DropIndex
DROP INDEX "public"."StockSauce_storeId_sauceType_key";

-- AlterTable
ALTER TABLE "public"."StockSauce" DROP COLUMN "storeId";

-- CreateIndex
CREATE UNIQUE INDEX "StockSauce_sauceType_key" ON "public"."StockSauce"("sauceType");
