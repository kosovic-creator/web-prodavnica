/*
  Warnings:

  - You are about to drop the column `uloga` on the `Korisnik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Korisnik" DROP COLUMN "uloga",
ADD COLUMN     "uloge" TEXT[] DEFAULT ARRAY['korisnik']::TEXT[];
