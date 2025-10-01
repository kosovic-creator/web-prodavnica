import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page')) || 1;
  let pageSize = Number(searchParams.get('pageSize')) || 10;
  const lang = searchParams.get('lang') || 'sr'; // Default to Serbian
  pageSize = Math.max(pageSize, 10);
  const skip = (page - 1) * pageSize;

  const [proizvodi, total] = await Promise.all([
    prisma.proizvod.findMany({
      skip,
      take: pageSize,
      orderBy: { kreiran: 'desc' },
      include: {
        prevodi: {
          where: { jezik: lang }
        }
      }
    }),
    prisma.proizvod.count(),
  ]);

  // Merge translations with product metadata
  const proizvodiSaPrevod = proizvodi.map(proizvod => {
    const prevod = proizvod.prevodi[0];
    if (!prevod) {
      // If no translation found, skip this product or return with default values
      console.warn(`No translation found for product ${proizvod.id} in language ${lang}`);
      return null;
    }

    return {
      id: proizvod.id,
      cena: proizvod.cena,
      slika: proizvod.slika,
      kolicina: proizvod.kolicina,
      kreiran: proizvod.kreiran,
      azuriran: proizvod.azuriran,
      // Translation fields
      naziv: prevod.naziv,
      opis: prevod.opis,
      karakteristike: prevod.karakteristike,
      kategorija: prevod.kategorija,
    };
  }).filter(Boolean); // Remove null entries

  return NextResponse.json({ proizvodi: proizvodiSaPrevod, total });
}

export async function POST(request: Request) {
  const data = await request.json();
  const { naziv, opis, karakteristike, kategorija, jezik = 'sr', ...proizvodData } = data;

  try {
    // Create product and translation in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the product (metadata only)
      const proizvod = await tx.proizvod.create({
        data: proizvodData // cena, slika, kolicina
      });

      // Create the translation
      const prevod = await tx.proizvodTranslation.create({
        data: {
          proizvodId: proizvod.id,
          jezik: jezik,
          naziv: naziv,
          opis: opis,
          karakteristike: karakteristike,
          kategorija: kategorija
        }
      });

      return { proizvod, prevod };
    });

    return NextResponse.json({
      proizvod: {
        ...result.proizvod,
        naziv: result.prevod.naziv,
        opis: result.prevod.opis,
        karakteristike: result.prevod.karakteristike,
        kategorija: result.prevod.kategorija
      }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const data = await request.json();
  const { id, naziv, opis, karakteristike, kategorija, jezik = 'sr', ...proizvodData } = data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Update product metadata
      const proizvod = await tx.proizvod.update({
        where: { id },
        data: proizvodData // cena, slika, kolicina
      });

      // Update or create translation
      const prevod = await tx.proizvodTranslation.upsert({
        where: {
          proizvodId_jezik: {
            proizvodId: id,
            jezik: jezik
          }
        },
        update: {
          naziv: naziv,
          opis: opis,
          karakteristike: karakteristike,
          kategorija: kategorija
        },
        create: {
          proizvodId: id,
          jezik: jezik,
          naziv: naziv,
          opis: opis,
          karakteristike: karakteristike,
          kategorija: kategorija
        }
      });

      return { proizvod, prevod };
    });

    return NextResponse.json({
      proizvod: {
        ...result.proizvod,
        naziv: result.prevod.naziv,
        opis: result.prevod.opis,
        karakteristike: result.prevod.karakteristike,
        kategorija: result.prevod.kategorija
      }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { id } = body;
  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }
  const postoji = await prisma.proizvod.findUnique({ where: { id } });
  if (!postoji) {
    return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 });
  }
  await prisma.proizvod.delete({ where: { id } });
  return NextResponse.json({ uspjesno_placanje: true });
}
