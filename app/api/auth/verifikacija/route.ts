import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token nije prosleđen." }, { status: 400 });
  }
  const korisnik = await prisma.korisnik.findUnique({ where: { emailVerifikacijaToken: token } });
  if (!korisnik) {
    return NextResponse.json({ error: "Nevažeći token." }, { status: 400 });
  }
  if (!korisnik.emailVerifikacijaIstice || korisnik.emailVerifikacijaIstice < new Date()) {
    return NextResponse.json({ error: "Token je istekao." }, { status: 400 });
  }
  await prisma.korisnik.update({
    where: { id: korisnik.id },
    data: {
      emailVerifikovan: true,
      emailVerifikacijaToken: null,
      emailVerifikacijaIstice: null,
    },
  });
  return NextResponse.json({ success: "Email je uspešno verifikovan." });
}
