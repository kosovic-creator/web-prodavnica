import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const lang = req.query.lang || 'sr';

    const proizvodi = await prisma.proizvod.findMany({
      include: {
        prevodi: {
          where: { jezik: lang as string }
        }
      }
    });

    const rezultat = proizvodi.map(proizvod => {
      const prevod = proizvod.prevodi[0];

      if (!prevod) {
        console.warn(`No translation found for product ${proizvod.id} in language ${lang}`);
        return null;
      }

      return {
        id: proizvod.id,
        naziv: prevod.naziv,
        opis: prevod.opis,
        karakteristike: prevod.karakteristike,
        kategorija: prevod.kategorija,
        cena: proizvod.cena,
        slika: proizvod.slika,
        kolicina: proizvod.kolicina,
        kreiran: proizvod.kreiran,
        azuriran: proizvod.azuriran,
      };
    }).filter(Boolean); // Remove null entries

    return res.status(200).json(rezultat);
  } catch (error) {
    console.error(error);
    const errorMessage = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message: string }).message
      : 'Unknown error';
    return res.status(500).json({ error: errorMessage });
  }
}