/*
  Warnings:

  - Added the required column `kategorija` to the `ProizvodTranslation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add column with default value first
ALTER TABLE "public"."ProizvodTranslation" ADD COLUMN "kategorija" TEXT NOT NULL DEFAULT '';

-- Update existing records with kategorija from the parent Proizvod
UPDATE "public"."ProizvodTranslation"
SET "kategorija" = "public"."Proizvod"."kategorija"
FROM "public"."Proizvod"
WHERE "public"."ProizvodTranslation"."proizvodId" = "public"."Proizvod"."id";
