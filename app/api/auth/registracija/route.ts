import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  const data = await request.json();
  const {
    email,
    lozinka,
    ime,
    prezime,
    telefon,
    drzava,
    grad,
    postanskiBroj,
    adresa,
  } = data;
  const postoji = await prisma.korisnik.findUnique({ where: { email } });
  if (postoji) {
    return NextResponse.json({ error: "Email već postoji." }, { status: 400 });
  }
  const hash = await bcrypt.hash(lozinka, 10);
  const token = crypto.randomBytes(32).toString("hex");
  const istice = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await prisma.korisnik.create({
    data: {
      email,
      lozinka: hash,
      ime,
      prezime,
      telefon,
      drzava,
      grad,
      postanskiBroj: postanskiBroj ? Number(postanskiBroj) : null,
      adresa,
      emailVerifikacijaToken: token,
      emailVerifikacijaIstice: istice,
      emailVerifikovan: false,
    },
  });
  // Slanje emaila sa verifikacionim linkom
  await fetch(process.env.NEXT_PUBLIC_BASE_URL + "/api/email/posalji", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      subject: "Verifikacija naloga",
      text: `Kliknite na link za verifikaciju: ${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verifikacija?token=${token}`,
    }),
  });
  return NextResponse.json({ uspjesno_placanje: true });
}
