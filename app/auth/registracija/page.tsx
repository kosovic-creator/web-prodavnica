'use client'

import { useState } from "react";
import { z } from "zod";
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaGlobe, FaCity, FaMapMarkerAlt, FaHashtag } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
export default function RegistracijaPage() {
  const { t } = useTranslation('register');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [telefon, setTelefon] = useState("");
  const [drzava, setDrzava] = useState("");
  const [grad, setGrad] = useState("");
  const [postanskiBroj, setPostanskiBroj] = useState("");
  const [adresa, setAdresa] = useState("");



  // Zod šema sa lokalizovanim porukama
  const schema = z.object({
    email: z.string().email({ message: t('email_invalid') }),
    lozinka: z.string().min(6, { message: t('lozinka_min') }),
    ime: z.string().min(3, { message: t('ime_min') }),
    prezime: z.string().min(3, { message: t('prezime_min') }),
    telefon: z.string().min(6, { message: t('telefon_min') }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validacija na frontendu
    const result = schema.safeParse({ email, lozinka, ime, prezime, telefon });
    if (!result.success) {
      // Prikaz prve greške
      toast.error(result.error.issues[0].message);
      return;
    }
    // ...dalje slanje na backend
    try {
      // Backend poziv
      const res = await fetch("/api/auth/registracija", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lozinka, ime, prezime, telefon, drzava, grad, postanskiBroj: Number(postanskiBroj), adresa }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || t('greska_registracija'));
      } else {
        toast.success(t('uspjesna_registracija'));
        router.push('/auth/prijava');
      }
    } catch {
      toast.error(t('error_occurred'));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaUserPlus className="text-violet-600" />
          {t('title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
            <FaEnvelope className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="email"
            placeholder={t('email')}
              className="flex-1 outline-none bg-transparent text-base"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaUser className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('name') || "Ime"}
                className="flex-1 outline-none bg-transparent text-base"
                value={ime}
                onChange={e => setIme(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaUser className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('surname') || "Prezime"}
                className="flex-1 outline-none bg-transparent text-base"
                value={prezime}
                onChange={e => setPrezime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
            <FaPhone className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="text"
            placeholder={t('phone') || "Telefon"}
              className="flex-1 outline-none bg-transparent text-base"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
          />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaGlobe className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('country') || "Država"}
                className="flex-1 outline-none bg-transparent text-base"
                value={drzava}
                onChange={e => setDrzava(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaCity className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('city') || "Grad"}
                className="flex-1 outline-none bg-transparent text-base"
                value={grad}
                onChange={e => setGrad(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaHashtag className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="number"
                placeholder={t('postal_code') || "Poštanski broj"}
                className="flex-1 outline-none bg-transparent text-base"
                value={postanskiBroj}
                onChange={e => setPostanskiBroj(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
              <FaMapMarkerAlt className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('address') || "Adresa"}
                className="flex-1 outline-none bg-transparent text-base"
                value={adresa}
                onChange={e => setAdresa(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-200 transition-all">
            <FaLock className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="password"
            placeholder={t('password')}
              className="flex-1 outline-none bg-transparent text-base"
            value={lozinka}
            onChange={e => setLozinka(e.target.value)}
            required
          />
        </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 transition-colors text-base font-medium">
          <FaUserPlus />
          {t('register')}
        </button>
      </form>
      </div>
    </div>
  );
}