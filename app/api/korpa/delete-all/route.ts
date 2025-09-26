import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { korisnikId } = await request.json();
  if (!korisnikId) return NextResponse.json({ error: 'Neispravan korisnikId' }, { status: 400 });
  await prisma.stavkaKorpe.deleteMany({ where: { korisnikId } });
  return NextResponse.json({ uspjesno_placanje: true });
}