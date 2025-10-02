# OAuth Setup Guide

## Pregled

Vaš NextAuth sistem sada podržava tri načina prijave:
1. **Email/Lozinka** (Credentials Provider)
2. **Google OAuth**
3. **Apple OAuth**

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
   - Production: `https://yourdomain.com/api/auth/callback/google`

### 3. Dobijanje Client ID i Secret

- **Client ID**: Kopirajte iz Google Cloud Console
- **Client Secret**: Kopirajte iz Google Cloud Console

## Apple OAuth Setup

### 1. Apple Developer Account

1. Prijavite se na [Apple Developer](https://developer.apple.com/)
2. Idite na **Certificates, Identifiers & Profiles**

### 2. Kreiranje App ID

1. Kliknite **Identifiers** → **App IDs**
2. Registrujte novi App ID
3. Omogućite **Sign In with Apple** capability

### 3. Kreiranje Service ID

1. Kliknite **Identifiers** → **Services IDs**
2. Registrujte novi Service ID
3. Konfiguriši **Sign In with Apple**:
   - Return URLs:
     - Development: `http://localhost:3000/api/auth/callback/apple`
     - Production: `https://yourdomain.com/api/auth/callback/apple`

### 4. Kreiranje Private Key

1. Idite na **Keys**
2. Registrujte novi key sa **Sign In with Apple** capability
3. Skinite `.p8` fajl

### 5. Generiranje JWT Secret

Apple zahteva JWT token za autentifikaciju. Možete koristiti online tool ili Node.js script da generirate JWT.

**Primer Node.js script-a:**
```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('path/to/your/AuthKey_XXXXXXXXXX.p8');

const token = jwt.sign(
  {
    iss: 'YOUR_TEAM_ID',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 86400 * 180,
    aud: 'https://appleid.apple.com',
    sub: 'YOUR_SERVICE_ID',
  },
  privateKey,
  { algorithm: 'ES256', header: { kid: 'YOUR_KEY_ID' } }
);

console.log(token);
```

## Kako radi

### 1. Novi OAuth korisnici

Kada se korisnik prvi put prijavi preko Google-a ili Apple-a:
- Automatski se kreira novi korisnik u bazi
- `emailVerifikovan` se postavlja na `true`
- Opciona polja ostaju prazna (mogu se popuniti kasnije u profilu)

### 2. Postojeći korisnici

Ako korisnik već postoji sa istim email-om:
- Ažuriraju se ime i slika iz OAuth provider-a
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
3. Videćete tri opcije:
   - Email/Lozinka forma
   - "Prijavite se sa Google" dugme
   - "Prijavite se sa Apple" dugme

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
