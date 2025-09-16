/*
  Warnings:

  - Added the required column `owner` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "owner" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Sale" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
