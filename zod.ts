import { z } from 'zod';

// Zod šeme
export interface Korisnik {
    ime: string;
    prezime: string;
    email: string;
    telefon?: string;
    drzava: string;
    grad?: string;
    postanskiBroj?: string;
    adresa?: string;
    uloga: 'korisnik' | 'admin';
    lozinka: string;
}

export type TranslateFn = (key: string) => string;

export const korisnikSchema = (t: TranslateFn) => z.object({
    ime: z.string().min(2, { message: t('ime_error') }),
    prezime: z.string().min(2, { message: t('prezime_error') }),
    email: z.string().email({ message: t('email_error') }),
    telefon: z.string().min(5, { message: t('telefon_error') }).max(15).regex(/^\+?[0-9\s]*$/, { message: t('telefon_error') }).optional(),
    drzava: z.string().min(2, { message: t('drzava_error') }),
    grad: z.string().min(2, { message: t('grad_error') }).optional(),
    postanskiBroj: z.string().min(2, { message: t('postanskiBroj_error') }).optional(),
    adresa: z.string().min(2, { message: t('adresa_error') }).optional(),
    uloga: z.enum(['korisnik', 'admin'], { message: t('uloga_error') }),
    lozinka: z.string().min(6, { message: t('lozinka_error') }),
    slika: z.string().optional(), // Dodaj ovo!
});
export const proizvodSchema = (t: TranslateFn) => z.object({
  naziv: z.string().min(2, { message: t('naziv_error') }),
  cena: z.number().min(0, { message: t('cena_error') }),
  slika: z.string().optional(),
  opis: z.string().min(10, { message: t('opis_error') }),
  karakteristike: z.string().min(10, { message: t('karakteristike_error') }).optional(),
  kategorija: z.string().min(2, { message: t('kategorija_error') }).optional(),
  kolicina: z.number().min(1, { message: t('kolicina_error') }),
});
