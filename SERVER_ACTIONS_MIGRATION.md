# Migracija sa API Endpointova na Server Actions

Ovaj dokument objašnjava kako da migrirate vašu Next.js aplikaciju sa API endpointova na Server Actions.

## Što su Server Actions?

Server Actions su funkcije koje se izvršavaju na serveru i mogu se pozvati direktno iz komponenti bez potrebe za API pozivima. Oni omogućavaju:

- **Bolje performanse** - nema potrebe za dodatnim HTTP zahtevima
- **Automatska revalidacija** - cache se automatski ažurira
- **Bolja sigurnost** - funkcije se izvršavaju na serveru
- **Jednostavniju implementaciju** - manje koda za pisanje

## Struktura Server Actions

Kreirao sam Server Actions u `lib/actions/` direktorijumu:

```
lib/actions/
├── index.ts                 # Glavna export datoteka
├── korisnici.ts            # Actions za korisnike
├── proizvodi.ts            # Actions za proizvode
├── korpa.ts               # Actions za korpu
├── omiljeni.ts            # Actions za omiljene proizvode
├── porudzbine.ts          # Actions za porudžbine
└── podaci-preuzimanja.ts  # Actions za podatke preuzimanja
```

## Primeri migracije

### 1. Migracija API poziva u komponenti

**Staro (API poziv):**
```typescript
// Client komponenta
const [proizvodi, setProizvodi] = useState([]);

useEffect(() => {
  fetch('/api/proizvodi')
    .then(res => res.json())
    .then(data => setProizvodi(data.proizvodi));
}, []);
```

**Novo (Server Action):**
```typescript
// Server komponenta
import { getProizvodi } from '@/lib/actions';

export default async function ProizvodiPage() {
  const result = await getProizvodi();

  if (!result.success) {
    return <div>Greška: {result.error}</div>;
  }

  const { proizvodi } = result.data;

  return (
    <div>
      {proizvodi.map(proizvod => (
        <div key={proizvod.id}>{proizvod.naziv_sr}</div>
      ))}
    </div>
  );
}
```

### 2. Migracija forma

**Staro (API poziv):**
```typescript
const handleSubmit = async (data) => {
  const response = await fetch('/api/proizvodi', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await response.json();
};
```

**Novo (Server Action):**
```typescript
import { createProizvod } from '@/lib/actions';

const handleSubmit = async (data) => {
  const result = await createProizvod(data);

  if (result.success) {
    // Uspeh
  } else {
    // Greška
  }
};
```

### 3. Migracija sa useTransition

**Za akcije koje se pozivaju iz client komponenti:**
```typescript
'use client';

import { useTransition } from 'react';
import { dodajUKorpu } from '@/lib/actions';

export default function DodajUKorpuButton({ korisnikId, proizvodId }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await dodajUKorpu({ korisnikId, proizvodId });
      // Handle result
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Dodaje se...' : 'Dodaj u korpu'}
    </button>
  );
}
```

## Dostupne Server Actions

### Korisnici (`korisnici.ts`)
- `getKorisnici(page, pageSize)` - Učitava korisnike sa paginacijom
- `createKorisnik(data)` - Kreira novog korisnika
- `updateKorisnik(data)` - Ažurira korisnika
- `deleteKorisnik(id)` - Briše korisnika

### Proizvodi (`proizvodi.ts`)
- `getProizvodi(page, pageSize)` - Učitava proizvode sa paginacijom
- `getProizvodById(id)` - Učitava proizvod po ID-u
- `createProizvod(data)` - Kreira novi proizvod
- `updateProizvod(data)` - Ažurira proizvod
- `deleteProizvod(id)` - Briše proizvod
- `updateProizvodStanje(id, kolicina)` - Ažurira stanje proizvoda

### Korpa (`korpa.ts`)
- `dodajUKorpu(data)` - Dodaje proizvod u korpu
- `getKorpa(korisnikId)` - Učitava stavke korpe
- `updateStavkuKorpe(id, kolicina)` - Ažurira količinu u korpi
- `ukloniStavkuKorpe(id)` - Uklanja stavku iz korpe
- `ocistiKorpu(korisnikId)` - Čisti celu korpu

### Omiljeni (`omiljeni.ts`)
- `getOmiljeni(korisnikId)` - Učitava omiljene proizvode
- `dodajUOmiljene(korisnikId, proizvodId)` - Dodaje u omiljene
- `ukloniIzOmiljenih(korisnikId, proizvodId)` - Uklanja iz omiljenih
- `provjeriDaLiJeOmiljenj(korisnikId, proizvodId)` - Proverava status

### Porudžbine (`porudzbine.ts`)
- `getPorudzbine(page, pageSize)` - Učitava sve porudžbine
- `getPorudzbineKorisnika(korisnikId, page, pageSize)` - Korisničke porudžbine
- `getPorudzbinuById(id)` - Učitava porudžbinu po ID-u
- `kreirajPorudzbinu(data)` - Kreira novu porudžbinu
- `updateStatusPorudzbine(id, status)` - Ažurira status
- `deletePorudzbinu(id)` - Briše porudžbinu

### Podaci preuzimanja (`podaci-preuzimanja.ts`)
- `getPodaciPreuzimanja(korisnikId)` - Učitava podatke
- `createPodaciPreuzimanja(korisnikId, data)` - Kreira podatke
- `updatePodaciPreuzimanja(korisnikId, data)` - Ažurira podatke
- `deletePodaciPreuzimanja(korisnikId)` - Briše podatke

## Koraci migracije

### 1. Identifikujte API endpointove
Prođite kroz `app/api/` direktorijum i identifikujte sve endpointove koji trebaju biti migrirani.

### 2. Testirajte Server Actions
Počnite testiranje sa jednostavnijim operacijama kao što su čitanje podataka.

### 3. Migrirajte komponente postepeno
- Prvo migrirajte server komponente (lakše)
- Zatim migrirajte client komponente (koristite useTransition)

### 4. Ažurirajte navigaciju
Koristite `revalidatePath()` za ažuriranje cache-a nakon akcija.

### 5. Testirajte funkcionalnost
Testirajte sve migrirane funkcionalnosti pre brisanja API endpointova.

### 6. Uklonite stare API endpointove
Nakon što ste sigurni da sve radi, možete obrisati stare API datoteke.

## Prednosti Server Actions

1. **Performanse**: Nema dodatnih HTTP zahteva
2. **Caching**: Automatska revalidacija
3. **Type safety**: Bolja TypeScript podrška
4. **Sigurnost**: Izvršavanje na serveru
5. **Jednostavnost**: Manje koda za održavanje

## Napomene

- Server Actions se oznčavaju sa `'use server'` direktivom
- Vraćaju standardizovane rezultate: `{ success: boolean, data?: any, error?: string }`
- Automatski pozivaju `revalidatePath()` za ažuriranje cache-a
- Koriste Prisma transakcije gde je potrebno
- Imaju detaljno error handling