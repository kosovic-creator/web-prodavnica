/*
  Warnings:

  - Added the required column `adresa` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grad` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postanskiBroj` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prezime` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefon` to the `Korisnik` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategorija` to the `Proizvod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Korisnik" ADD COLUMN     "adresa" TEXT NOT NULL,
ADD COLUMN     "drzava" TEXT,
ADD COLUMN     "grad" TEXT NOT NULL,
ADD COLUMN     "postanskiBroj" INTEGER NOT NULL,
ADD COLUMN     "prezime" TEXT NOT NULL,
ADD COLUMN     "telefon" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Proizvod" ADD COLUMN     "karakteristike" TEXT,
ADD COLUMN     "kategorija" TEXT NOT NULL;
