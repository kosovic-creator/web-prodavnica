import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  lozinka: z.string().min(6),
});

interface CustomUser {
  id: string;
  email: string;
  uloga?: string;
  ime?: string;
  slika?: string;
}

interface CustomToken {
  id?: string;
  email?: string;
  uloga?: string;
  ime?: string;
  slika?: string;
  [key: string]: unknown;
}

interface CustomSessionUser {
  id?: string;
  email?: string;
  uloga?: string;
  ime?: string;
  slika?: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Email i Lozinka",
      credentials: {
        email: { label: "Email", type: "text" },
        lozinka: { label: "Lozinka", type: "password" },
      },
      async authorize(credentials) {
        const result = loginSchema.safeParse(credentials);
        if (!result.success) return null;
        const { email, lozinka } = result.data;
        const korisnik = await prisma.korisnik.findUnique({
          where: { email },
        });
        if (!korisnik || !korisnik.lozinka) return null;
        const valid = await bcrypt.compare(lozinka, korisnik.lozinka);
        if (!valid) return null;
        return {
          id: korisnik.id,
          email: korisnik.email,
          uloga: korisnik.uloga,
          ime: korisnik.ime,
          slika: korisnik.slika,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Za OAuth provider-e (Google)
      if (account?.provider === "google") {
        try {
          // Proveravamo da li korisnik već postoji u bazi
          const postojeciKorisnik = await prisma.korisnik.findUnique({
            where: { email: user.email! },
          });

          // Ako ne postoji, kreiramo novog korisnika sa minimalnim podacima
          if (!postojeciKorisnik) {
            await prisma.korisnik.create({
              data: {
                email: user.email!,
                ime: user.name || "",
                prezime: "", // default value
                slika: user.image || "",
                uloga: "korisnik",
                lozinka: "", // OAuth users may not have a password
                telefon: "", // default value
                grad: "", // default value
                adresa: "", // default value
                emailVerifikovan: true, // OAuth korisnici su automatski verifikovani
              },
            });
          } else {
            // Ažuriramo postojećeg korisnika sa novim podacima
            await prisma.korisnik.update({
              where: { email: user.email! },
              data: {
                ime: user.name || postojeciKorisnik.ime,
                slika: user.image || postojeciKorisnik.slika,
                emailVerifikovan: true,
              },
            });
          }
        } catch (error) {
          console.error("Greška pri čuvanju OAuth korisnika:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Za credentials provider
        if (account?.provider === "credentials") {
          const u = user as CustomUser;
          (token as CustomToken).id = u.id;
          (token as CustomToken).uloga = u.uloga;
          (token as CustomToken).ime = u.ime;
          (token as CustomToken).slika = u.slika;
        } else {
          // Za OAuth provider-e, dobijamo podatke iz baze
          const korisnikIzBaze = await prisma.korisnik.findUnique({
            where: { email: user.email! },
          });
          if (korisnikIzBaze) {
            (token as CustomToken).id = korisnikIzBaze.id;
            (token as CustomToken).uloga = korisnikIzBaze.uloga;
            (token as CustomToken).ime = korisnikIzBaze.ime || undefined;
            (token as CustomToken).slika = korisnikIzBaze.slika || undefined;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Dodajemo polje uloga iz tokena u session.user
      if (token && session.user) {
        (session.user as CustomSessionUser).uloga = (token as CustomToken).uloga;
        (session.user as CustomSessionUser).ime = (token as CustomToken).ime;
        (session.user as CustomSessionUser).slika = (token as CustomToken).slika;
        (session.user as CustomSessionUser).id = (token as CustomToken).id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/prijava",
    error: "/auth/prijava",
  },
};
