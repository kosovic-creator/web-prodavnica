import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const data = await request.json();
  const { email, lozinka, ime, prezime } = data;
  const postoji = await prisma.korisnik.findUnique({ where: { email } });
  if (postoji) {
    return NextResponse.json({ error: "Email već postoji." }, { status: 400 });
  }
  const hash = await bcrypt.hash(lozinka, 10);
  await prisma.korisnik.create({
    data: {
      email,
      lozinka: hash,
      ime,
      prezime,
    },
  });
  return NextResponse.json({ success: true });
}
