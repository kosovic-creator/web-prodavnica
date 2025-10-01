import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || '1');
  let pageSize = Number(searchParams.get('pageSize') || '10');
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;
  const [korisnici, total] = await Promise.all([
    prisma.korisnik.findMany({ skip, take: pageSize, orderBy: { kreiran: 'desc' } }),
    prisma.korisnik.count()
  ]);
  return NextResponse.json({ korisnici, total });
}

export async function POST(request: Request) {
  const data = await request.json();
  const korisnik = await prisma.korisnik.create({ data });
  return NextResponse.json({ korisnik });
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, ...rest } = data;
  if (rest.postanskiBroj !== undefined && rest.postanskiBroj !== null) {
    const parsedBroj = parseInt(rest.postanskiBroj);
    rest.postanskiBroj = isNaN(parsedBroj) ? undefined : parsedBroj;
  }
  const korisnik = await prisma.korisnik.update({ where: { id }, data: rest });
  return NextResponse.json({ korisnik });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const korisnik = await prisma.korisnik.delete({ where: { id } });
  return NextResponse.json({ korisnik });
}
