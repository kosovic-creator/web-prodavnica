# Cloudinary Setup Instructions
#h
## 1. Kreiranje Cloudinary naloga

1. Idite na https://cloudinary.com/
2. Registrujte se za besplatan nalog
3. U Dashboard-u će vam biti prikazane credentials

## 2. Environment varijable

Kopirajte `.env.local.example` u `.env.local` i popunite:

```bash
# Cloudinary konfiguracija
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 3. Vercel Environment Variables

Na Vercel dashboard-u:

1. Idite u Settings > Environment Variables
2. Dodajte iste varijable kao u `.env.local`
3. Redeploy aplikaciju

## 4. Testiranje

- Slike će se sada čuvati na Cloudinary-ju umesto lokalno
- URL slike će biti u formatu: https://res.cloudinary.com/dykz9ack1
- Slike će biti organizovane u folder `web-trgovina`
treba se ulogovati na drasko.kosovic@gmail.com. Media
## Napomene

- Cloudinary besplatan plan ima limit od 25,000 transformacija mesečno
- Slike se automatski optimizuju i kompresuju
- Podržava automatsko skaliranje i različite formate
