import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    return {
      id: proizvod.id,
      naziv: prevod?.naziv || proizvod.naziv,
      opis: prevod?.opis || proizvod.opis,
      karakteristike: prevod?.karakteristike || proizvod.karakteristike,
      cena: proizvod.cena,
      slika: proizvod.slika,
      kategorija: proizvod.kategorija,
      kolicina: proizvod.kolicina,
    };
  });

  return res.status(200).json(rezultat);
}