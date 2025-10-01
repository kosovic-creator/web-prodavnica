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

  if (!prevod) {
    return res.status(404).json({
      error: `Prevod za proizvod ${id} nije pronađen za jezik ${lang}`
    });
  }

  return res.status(200).json({
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
  });
}