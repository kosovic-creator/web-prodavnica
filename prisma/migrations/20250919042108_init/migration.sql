-- CreateTable
CREATE TABLE "public"."Korisnik" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lozinka" TEXT NOT NULL,
    "uloga" TEXT NOT NULL DEFAULT 'korisnik',
    "ime" TEXT,
    "slika" TEXT,
    "emailVerifikovan" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifikacijaToken" TEXT,
    "emailVerifikacijaIstice" TIMESTAMP(3),
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Korisnik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Proizvod" (
    "id" TEXT NOT NULL,
    "naziv" TEXT NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "slika" TEXT,
    "opis" TEXT,
    "kolicina" INTEGER NOT NULL DEFAULT 1,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proizvod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StavkaKorpe" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kolicina" INTEGER NOT NULL DEFAULT 1,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StavkaKorpe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Porudzbina" (
    "id" TEXT NOT NULL,
    "korisnikId" TEXT NOT NULL,
    "ukupno" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "email" TEXT,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,
    "idPlacanja" TEXT,

    CONSTRAINT "Porudzbina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StavkaPorudzbine" (
    "id" TEXT NOT NULL,
    "porudzbinaId" TEXT NOT NULL,
    "proizvodId" TEXT NOT NULL,
    "kolicina" INTEGER NOT NULL,
    "cena" DOUBLE PRECISION NOT NULL,
    "opis" TEXT,
    "kreiran" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "azuriran" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StavkaPorudzbine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_email_key" ON "public"."Korisnik"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Korisnik_emailVerifikacijaToken_key" ON "public"."Korisnik"("emailVerifikacijaToken");

-- CreateIndex
CREATE INDEX "StavkaKorpe_korisnikId_idx" ON "public"."StavkaKorpe"("korisnikId");

-- CreateIndex
CREATE UNIQUE INDEX "StavkaKorpe_korisnikId_proizvodId_key" ON "public"."StavkaKorpe"("korisnikId", "proizvodId");

-- CreateIndex
CREATE UNIQUE INDEX "Porudzbina_idPlacanja_key" ON "public"."Porudzbina"("idPlacanja");

-- CreateIndex
CREATE INDEX "Porudzbina_korisnikId_idx" ON "public"."Porudzbina"("korisnikId");

-- CreateIndex
CREATE INDEX "StavkaPorudzbine_porudzbinaId_idx" ON "public"."StavkaPorudzbine"("porudzbinaId");

-- AddForeignKey
ALTER TABLE "public"."StavkaKorpe" ADD CONSTRAINT "StavkaKorpe_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "public"."Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StavkaKorpe" ADD CONSTRAINT "StavkaKorpe_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "public"."Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Porudzbina" ADD CONSTRAINT "Porudzbina_korisnikId_fkey" FOREIGN KEY ("korisnikId") REFERENCES "public"."Korisnik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_porudzbinaId_fkey" FOREIGN KEY ("porudzbinaId") REFERENCES "public"."Porudzbina"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StavkaPorudzbine" ADD CONSTRAINT "StavkaPorudzbine_proizvodId_fkey" FOREIGN KEY ("proizvodId") REFERENCES "public"."Proizvod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
