/*
  Warnings:

  - You are about to drop the `ProizvodTranslation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kategorija_en` to the `Proizvod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategorija_sr` to the `Proizvod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `naziv_en` to the `Proizvod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `naziv_sr` to the `Proizvod` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ProizvodTranslation" DROP CONSTRAINT "ProizvodTranslation_proizvodId_fkey";

-- AlterTable
ALTER TABLE "Proizvod" ADD COLUMN     "karakteristike_en" TEXT,
ADD COLUMN     "karakteristike_sr" TEXT,
ADD COLUMN     "kategorija_en" TEXT NOT NULL,
ADD COLUMN     "kategorija_sr" TEXT NOT NULL,
ADD COLUMN     "naziv_en" TEXT NOT NULL,
ADD COLUMN     "naziv_sr" TEXT NOT NULL,
ADD COLUMN     "opis_en" TEXT,
ADD COLUMN     "opis_sr" TEXT;

-- DropTable
DROP TABLE "public"."ProizvodTranslation";
