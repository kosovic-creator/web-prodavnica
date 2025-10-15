/*
  Warnings:

  - A unique constraint covering the columns `[korisnikId]` on the table `PodaciPreuzimanja` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PodaciPreuzimanja_korisnikId_key" ON "PodaciPreuzimanja"("korisnikId");
