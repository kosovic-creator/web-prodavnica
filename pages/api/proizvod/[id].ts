import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const lang = req.query.lang || 'sr';

  const proizvod = await prisma.proizvod.findUnique({
    where: { id: id as string },
    include: {
      prevodi: {
        where: { jezik: lang as string }
      }
    }
  });

  if (!proizvod) {
    return res.status(404).json({ error: 'Proizvod nije pronađen' });
  }

  const prevod = proizvod.prevodi[0];
  return res.status(200).json({
    id: proizvod.id,
    naziv: prevod?.naziv || proizvod.naziv,
    opis: prevod?.opis || proizvod.opis,
    karakteristike: prevod?.karakteristike || proizvod.karakteristike,
    cena: proizvod.cena,
    slika: proizvod.slika,
    kategorija: proizvod.kategorija,
    kolicina: proizvod.kolicina,
  });
}