/*
  Warnings:

  - You are about to drop the column `slika` on the `Proizvod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Proizvod" DROP COLUMN "slika",
ADD COLUMN     "slike" TEXT[];
