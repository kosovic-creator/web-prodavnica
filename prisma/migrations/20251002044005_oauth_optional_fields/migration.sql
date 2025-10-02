/*
  Warnings:

  - You are about to drop the column `karakteristike` on the `Proizvod` table. All the data in the column will be lost.
  - You are about to drop the column `kategorija` on the `Proizvod` table. All the data in the column will be lost.
  - You are about to drop the column `naziv` on the `Proizvod` table. All the data in the column will be lost.
  - You are about to drop the column `opis` on the `Proizvod` table. All the data in the column will be lost.
  - Made the column `naziv` on table `ProizvodTranslation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Korisnik" ALTER COLUMN "lozinka" DROP NOT NULL,
ALTER COLUMN "adresa" DROP NOT NULL,
ALTER COLUMN "grad" DROP NOT NULL,
ALTER COLUMN "postanskiBroj" DROP NOT NULL,
ALTER COLUMN "prezime" DROP NOT NULL,
ALTER COLUMN "telefon" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Proizvod" DROP COLUMN "karakteristike",
DROP COLUMN "kategorija",
DROP COLUMN "naziv",
DROP COLUMN "opis";

-- AlterTable
ALTER TABLE "public"."ProizvodTranslation" ALTER COLUMN "naziv" SET NOT NULL;
