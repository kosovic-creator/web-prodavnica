/*
  Warnings:

  - You are about to drop the column `adresa` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `drzava` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifikacijaIstice` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifikacijaToken` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifikovan` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `grad` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `postanskiBroj` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `slika` on the `Korisnik` table. All the data in the column will be lost.
  - You are about to drop the column `telefon` on the `Korisnik` table. All the data in the column will be lost.
  - Made the column `lozinka` on table `Korisnik` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ime` on table `Korisnik` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prezime` on table `Korisnik` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "public"."Korisnik_emailVerifikacijaToken_key";

-- AlterTable
ALTER TABLE "Korisnik" DROP COLUMN "adresa",
DROP COLUMN "drzava",
DROP COLUMN "emailVerifikacijaIstice",
DROP COLUMN "emailVerifikacijaToken",
DROP COLUMN "emailVerifikovan",
DROP COLUMN "grad",
DROP COLUMN "postanskiBroj",
DROP COLUMN "slika",
DROP COLUMN "telefon",
ALTER COLUMN "lozinka" SET NOT NULL,
ALTER COLUMN "ime" SET NOT NULL,
ALTER COLUMN "prezime" SET NOT NULL;

-- CreateTable
CREATE TABLE "PodaciPreuzimanja" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "adresa" TEXT NOT NULL,
    "drzava" TEXT NOT NULL,
    "grad" TEXT NOT NULL,
    "postanskiBroj" INTEGER NOT NULL,
    "telefon" TEXT NOT NULL,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PodaciPreuzimanja_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PodaciPreuzimanja" ADD CONSTRAINT "PodaciPreuzimanja_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;
