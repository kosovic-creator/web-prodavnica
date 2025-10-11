-- CreateTable
CREATE TABLE "public"."ProizvodTranslation" (
    "id" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "jezik" TEXT NOT NULL,
    "naziv" TEXT,
    "opis" TEXT,
    "karakteristike" TEXT,

    CONSTRAINT "ProizvodTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProizvodTranslation_proizvodId_jezik_key" ON "public"."ProizvodTranslation"("proizvodId", "jezik");

-- AddForeignKey
ALTER TABLE "public"."ProizvodTranslation" ADD CONSTRAINT "ProizvodTranslation_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "public"."Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AlterTable
-- ALTER TABLE "public"."Proizvod" ADD COLUMN     "prevodi" ProizvodTranslation[];

