import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  let pageSize = Number(searchParams.get('pageSize')) || 10;
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;
  const [porudzbine, total] = await Promise.all([
    prisma.porudzbina.findMany({
      skip,
      take: pageSize,
      orderBy: { kreiran: 'desc' },
    }),
    prisma.porudzbina.count(),
  ]);
  return NextResponse.json({ porudzbine, total });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { korisnikId, ukupno, status, email, idPlacanja, stavke } = body;
  if (!korisnikId || !ukupno || !status) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 });
  }
  const porudzbina = await prisma.porudzbina.create({
    data: {
      korisnikId,
      ukupno,
      status,
      email,
      idPlacanja,
    },
  });

  // Smanji količinu proizvoda za svaku stavku
  if (stavke && Array.isArray(stavke)) {
    for (const s of stavke) {
      await prisma.proizvod.update({
        where: { id: s.proizvodId },
        data: { kolicina: { decrement: s.kolicina } },
      });
    }
  }

  // Slanje emaila korisniku
  if (email) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // postavite u .env
        pass: process.env.EMAIL_PASS, // postavite u .env
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Porudžbina prihvaćena',
      text: 'Vaša porudžbina je uspešno prihvaćena. Hvala na kupovini!',
    });
  }

  return NextResponse.json(porudzbina);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id, ...data } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  const porudzbina = await prisma.porudzbina.update({
    where: { id },
    data,
  });
  return NextResponse.json(porudzbina);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  await prisma.porudzbina.delete({ where: { id } });
  return NextResponse.json({ uspjesno_placanje: true });
}
