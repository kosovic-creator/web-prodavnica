import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
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
  adapter: PrismaAdapter(prisma),
  providers: [
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
    async jwt({ token, user }) {
      if (user) {
        const u = user as CustomUser;
        (token as CustomToken).id = u.id;
        (token as CustomToken).uloga = u.uloga;
        (token as CustomToken).ime = u.ime;
        (token as CustomToken).slika = u.slika;
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
