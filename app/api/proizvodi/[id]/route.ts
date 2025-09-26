import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';




export async function GET(req: Request) {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  const proizvod = await prisma.proizvod.findUnique({ where: { id } });
  if (!proizvod) {
    return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 });
  }
  return NextResponse.json(proizvod);
}
