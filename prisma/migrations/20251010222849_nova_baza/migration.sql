/*
  Warnings:

  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."favorites" DROP CONSTRAINT "favorites_productId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropTable
DROP TABLE "public"."favorites";

-- CreateTable
CREATE TABLE "omiljeni" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "omiljeni_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "omiljeni_korisnikId_idx" ON "omiljeni"("korisnikId");

-- CreateIndex
CREATE UNIQUE INDEX "omiljeni_korisnikId_proizvodId_key" ON "omiljeni"("korisnikId", "proizvodId");

-- AddForeignKey
ALTER TABLE "omiljeni" ADD CONSTRAINT "omiljeni_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "omiljeni" ADD CONSTRAINT "omiljeni_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
