import { NextResponse } from 'next/server';
// Slanje emaila korisniku - non-blocking
import prisma from '@/lib/prisma';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  let pageSize = Number(searchParams.get('pageSize')) || 10;
  const korisnikId = searchParams.get('korisnikId'); // Filtriranje po korisniku
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;

  // Kreiraj where uslov za filtriranje
  const whereClause = korisnikId ? { korisnikId } : {};
  const [porudzbine, total] = await Promise.all([
    prisma.porudzbina.findMany({
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { kreiran: 'desc' },
      include: {
        stavkePorudzbine: {
          include: {
            proizvod: {
              select: {
                id: true,
                cena: true,
                slika: true,
                kolicina: true
              }
            }
          }
        },
        korisnik: {
          select: {
            id: true,
            ime: true,
            prezime: true,
            email: true
          }
        }
      }
    }),
    prisma.porudzbina.count({ where: whereClause }),
  ]);
  return NextResponse.json({ porudzbine, total });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { korisnikId, ukupno, status, email, idPlacanja, stavke } = body;
  if (!korisnikId || !ukupno || !status) {
    return NextResponse.json({ error: 'Nedostaju obavezna polja.' }, { status: 400 });
  }

  // Koristimo transakciju da se sve izvršava atomski
  const porudzbina = await prisma.$transaction(async (tx) => {
    // Kreiraj porudžbinu
    const novaPorudzbina = await tx.porudzbina.create({
      data: {
        korisnikId,
        ukupno,
        status,
        email,
        idPlacanja,
      },
    });

    // Kreiraj stavke porudžbine i smanji količinu proizvoda
    if (stavke && Array.isArray(stavke)) {
      for (const s of stavke) {
        // Dohvati proizvod da bi dobio trenutnu cenu i sliku
        const proizvod = await tx.proizvod.findUnique({
          where: { id: s.proizvodId }
        });

        if (proizvod) {
          // Kreiraj stavku porudžbine sa podacima iz vremena kupovine
          const stavkaData = {
            porudzbinaId: novaPorudzbina.id,
            proizvodId: s.proizvodId,
            kolicina: s.kolicina,
            cena: proizvod.cena, // Cena u vreme kupovine
            slika: proizvod.slika || null, // Slika u vreme kupovine
            opis: `Proizvod kupljen ${new Date().toLocaleDateString()}`, // Opciono
          };

          await tx.stavkaPorudzbine.create({
            data: stavkaData,
          });

          // Smanji količinu proizvoda
          await tx.proizvod.update({
            where: { id: s.proizvodId },
            data: { kolicina: { decrement: s.kolicina } },
          });
        }
      }
    }

    return novaPorudzbina;
  });

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
