# OAuth Setu```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIEN### Google greške
- Proverite da li su redirect URI-jevi tačno unešeni
- Uverite se da je Google+ API omogućen
#
### Opšte greškeour-google-client-secret
```## Pregled

Vaš NextAuth sistem sada podržava dva načina prijave:
1. **Email/Lozinka** (Credentials Provider)
2. **Google OAuth**

## Potrebne Environment Variables

Dodajte sledeće varijable u svoj `.env.local` fajl:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple OAuth
APPLE_ID=your-apple-id
APPLE_SECRET=your-apple-secret
```

## Google OAuth Setup

### 1. Kreiranje Google Cloud Console projekta

1. Idite na [Google Cloud Console](https://console.cloud.google.com/)
2. Kreirajte novi projekat ili odaberite postojeći
3. Omogućite **Google+ API** u API Library

### 2. Konfiguracija OAuth 2.0

1. Idite na **Credentials** u meniju
2. Kliknite **Create Credentials** → **OAuth 2.0 Client IDs**
3. Konfiguriši **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://web-prodavnica.vercel.app/api/auth/callback/google`

### 3. Dobijanje Client ID i Secret

- **Client ID**: Kopirajte iz Google Cloud Console
- **Client Secret**: Kopirajte iz Google Cloud Console

## Kako radi

### 1. Novi OAuth korisnici

Kada se korisnik prvi put prijavi preko Google-a:
- Automatski se kreira novi korisnik u bazi
- `emailVerifikovan` se postavlja na `true`
- Opciona polja ostaju prazna (mogu se popuniti kasnije u profilu)

### 2. Postojeći korisnici

Ako korisnik već postoji sa istim email-om:
- Ažuriraju se ime i slika iz Google-a
- `emailVerifikovan` se postavlja na `true`

### 3. Session management

Svi korisnici (bez obzira na način prijave) imaju istu strukturu session-a sa:
- `id`: Jedinstveni identifikator
- `email`: Email adresa
- `uloga`: Korisničke dozvole
- `ime`: Ime korisnika
- `slika`: URL slike profila

## Testiranje

1. Pokrenite aplikaciju: `npm run dev`
2. Idite na `/auth/prijava`
3. Videćete dve opcije:
   - Email/Lozinka forma
   - "Prijavite se sa Google" dugme

## Bezbednost

- OAuth korisnici nemaju lozinku u bazi (polje je `null`)
- Automatski su verifikovani preko OAuth provider-a
- Mogu dodati lozinku kasnije ako žele da koriste credentials prijavu

## Troubleshooting

### Google greške
- Proverite da li su redirect URI-jevi tačno unešeni
- Uverite se da je Google+ API omogućen

### Apple greške
- Proverite validnost JWT tokena
- Uverite se da su svi ID-jevi tačno unešeni
- Apple zahteva HTTPS u produkciji

### Opšte greške
- Proverite environment variables
- Restartujte development server nakon izmene `.env.local`

## Production Deployment (Vercel)

### 1. Environment Variables u Vercelu

U Vercel Dashboard → Project Settings → Environment Variables, dodajte:

```bash
NEXTAUTH_SECRET=your-production-secret-here
NEXTAUTH_URL=https://web-prodavnica.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-production-database-url
```

### 2. Google Console Redirect URIs

Uverite se da u Google Cloud Console imate oba redirect URI-ja:
- Development: `http://localhost:3000/api/auth/callback/google`
- Production: `https://web-prodavnica.vercel.app/api/auth/callback/google`

### 3. Database Migration

Ako koristite novu production bazu, pokrenite migracije:
```bash
npx prisma migrate deploy
```
