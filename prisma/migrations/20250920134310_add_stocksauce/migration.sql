-- CreateEnum
CREATE TYPE "public"."SauceType" AS ENUM ('NONE', 'MILD', 'MEDIUM', 'HOT');

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "sauceType" "public"."SauceType" DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "public"."StockSauce" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "sauceType" "public"."SauceType" NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockSauce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockSauce_storeId_sauceType_key" ON "public"."StockSauce"("storeId", "sauceType");

-- AddForeignKey
ALTER TABLE "public"."StockSauce" ADD CONSTRAINT "StockSauce_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "public"."Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
