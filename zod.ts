import { z } from 'zod';

// Zod šeme

export type TranslateFn = (key: string) => string;

// Static versions without i18n (for admin pages)
export const proizvodSchemaStatic = z.object({
    cena: z.number().positive({ message: 'Cena mora biti pozitivna' }),
    kolicina: z.number().min(0, { message: 'Količina ne može biti negativna' }),
    slika: z.string().url({ message: 'Slika mora biti validna URL adresa' }),
    translations: z.array(z.object({
        jezik: z.enum(['sr', 'en'], { message: 'Jezik mora biti sr ili en' }),
        naziv: z.string().min(1, { message: 'Naziv je obavezan' }),
        kategorija: z.string().min(1, { message: 'Kategorija je obavezna' }),
        opis: z.string().optional(),
        karakteristike: z.string().optional(),
    })).min(1, { message: 'Potreban je najmanje jedan prevod' }),
});

export const korisnikSchemaStatic = z.object({
    ime: z.string().min(2, { message: 'Ime mora imati najmanje 2 karaktera' }),
    prezime: z.string().min(2, { message: 'Prezime mora imati najmanje 2 karaktera' }),
    email: z.string().email({ message: 'Nevalidan email' }),
    telefon: z.string().min(5, { message: 'Telefon mora imati najmanje 5 cifara' }).max(15).regex(/^\+?[0-9\s]*$/, { message: 'Nevalidan format telefona' }).optional(),
    drzava: z.string().min(2, { message: 'Država je obavezna' }),
    grad: z.string().min(2, { message: 'Grad mora imati najmanje 2 karaktera' }).optional(),
    postanskiBroj: z.string().min(2, { message: 'Poštanski broj mora imati najmanje 2 karaktera' }).optional(),
    adresa: z.string().min(2, { message: 'Adresa mora imati najmanje 2 karaktera' }).optional(),
    uloga: z.enum(['korisnik', 'admin'], { message: 'Uloga mora biti korisnik ili admin' }),
    lozinka: z.string().min(6, { message: 'Lozinka mora imati najmanje 6 karaktera' }),
    slika: z.string().optional(),
});

// Original i18n versions (keep for non-admin pages)
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

export const registracijaSchema = (t: TranslateFn) => z.object({
    email: z.string().email({ message: t('email_error') }),
    lozinka: z.string().min(6, { message: t('lozinka_error') }),
    ime: z.string().min(2, { message: t('ime_error') }),
    prezime: z.string().min(2, { message: t('prezime_error') }),
    telefon: z.string().min(5, { message: t('telefon_error') }).max(15).regex(/^\+?[0-9\s]*$/, { message: t('telefon_error') }).optional(),
    drzava: z.string().min(2, { message: t('drzava_error') }),
    grad: z.string().min(2, { message: t('grad_error') }).optional(),
    postanskiBroj: z.string().min(2, { message: t('postanskiBroj_error') }).optional(),
    adresa: z.string().min(2, { message: t('adresa_error') }).optional(),
});
export const porudzbineSchema = (t: TranslateFn) => z.object({
    korisnikId: z.string().min(1, { message: t('required') }),
    ukupno: z.string().min(1, { message: t('required') }),
    status: z.string().min(1, { message: t('required') }),
    email: z.string().email({ message: t('invalid_email') }).optional().or(z.literal('')),
});

// Admin verzija bez i18n
export const adminPorudzbineSchema = z.object({
    korisnikId: z.string().min(1, { message: 'Korisnik je obavezan' }),
    ukupno: z.string().min(1, { message: 'Ukupan iznos je obavezan' }),
    status: z.string().min(1, { message: 'Status je obavezan' }),
    email: z.string().email({ message: 'Neispravna email adresa' }).optional().or(z.literal('')),
});