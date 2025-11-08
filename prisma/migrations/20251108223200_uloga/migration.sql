/*
  Warnings:

  - You are about to drop the column `uloge` on the `Korisnik` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Korisnik" DROP COLUMN "uloge",
ADD COLUMN     "uloga" TEXT NOT NULL DEFAULT 'korisnik';
