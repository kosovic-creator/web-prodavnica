export type Proizvod = {
  id: string;
  naziv: string;
  cena: number;
  slika?: string | null;
  opis?: string | null;
  karakteristike?: string | null;
  kategorija: string;
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
};

export type Korisnik = {
  id: string;
  email: string;
  lozinka: string;
  uloga: string;
  ime?: string | null;
  prezime: string;
  telefon: string;
  drzava?: string | null;
  grad: string;
  postanskiBroj: number;
  adresa: string;
  slika?: string | null;
  emailVerifikovan: boolean;
  emailVerifikacijaToken?: string | null;
  emailVerifikacijaIstice?: Date | null;
  kreiran: Date;
  azuriran: Date;
};

export type StavkaKorpe = {
  id: string;
  korisnikId: string;
  proizvodId: string;
  kolicina: number;
  kreiran: Date;
  azuriran: Date;
  proizvod?: Proizvod;
};

export type Porudzbina = {
  id: string;
  korisnikId: string;
  ukupno: number;
  status: string;
  email?: string | null;
  kreiran: Date;
  azuriran: Date;
  idPlacanja?: string | null;
  stavkePorudzbine?: StavkaPorudzbine[];
};

export type StavkaPorudzbine = {
  id: string;
  porudzbinaId: string;
  proizvodId: string;
  kolicina: number;
  cena: number;
  opis?: string | null;
  kreiran: Date;
  azuriran: Date;
  proizvod?: Proizvod;
};