import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';




export async function GET(req: Request) {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();
  const lang = url.searchParams.get('lang') || 'sr'; // Default to Serbian

  if (!id) {
    return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
  }

  const proizvod = await prisma.proizvod.findUnique({
    where: { id },
    include: {
      prevodi: {
        where: { jezik: lang }
      }
    }
  });

  if (!proizvod) {
    return NextResponse.json({ error: 'Proizvod nije pronađen.' }, { status: 404 });
  }

  // Merge translation with product metadata
  const prevod = proizvod.prevodi[0];
  if (!prevod) {
    console.warn(`No translation found for product ${proizvod.id} in language ${lang}`);
    // Return product with empty translation fields for editing
    return NextResponse.json({
      id: proizvod.id,
      cena: proizvod.cena,
      slika: proizvod.slika,
      kolicina: proizvod.kolicina,
      kreiran: proizvod.kreiran,
      azuriran: proizvod.azuriran,
      // Empty translation fields that can be filled
      naziv: '',
      opis: '',
      karakteristike: '',
      kategorija: '',
    });
  }

  return NextResponse.json({
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
  });
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'ID je obavezan.' }, { status: 400 });
    }

    // First check if product exists
    const existingProizvod = await prisma.proizvod.findUnique({
      where: { id }
    });

    if (!existingProizvod) {
      return NextResponse.json({ error: 'Proizvod nije pronađen' }, { status: 404 });
    }

    // Delete translations first (due to foreign key constraints)
    await prisma.proizvodTranslation.deleteMany({
      where: { proizvodId: id }
    });

    // Then delete the product
    await prisma.proizvod.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Proizvod je uspešno obrisan',
      id
    });
  } catch (error) {
    console.error('Error deleting proizvod:', error);
    return NextResponse.json({
      error: 'Greška pri brisanju proizvoda',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}
