'use client'

import { useState } from "react";
import { z } from "zod";
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaGlobe, FaCity, FaMapMarkerAlt, FaHashtag } from "react-icons/fa";
import { useRouter } from "next/navigation";
import toast, { Toaster } from 'react-hot-toast';
import { registracijaSchema } from "@/zod";


export default function RegistracijaPage() {
  const { t } = useTranslation('auth');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validacija na frontendu
    const result = registracijaSchema(t).safeParse({ email, lozinka, ime, prezime, telefon });
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
        toast.error(data.error || t('register.error_occurred'));
      } else {
        toast.success(t('register.register_success'));
        router.push('/auth/prijava');
      }
    } catch {
      toast.error(t('register.error_occurred'));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Toaster position="top-right" />
        <h1 className="text-2xl md:text-3xl font-bold mb-6 flex items-center justify-center gap-2 text-center">
          <FaUserPlus className="text-violet-600" />
          {t('register.title')}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
            <FaEnvelope className="text-violet-600 text-lg flex-shrink-0" />
          <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-violet-400 hover:border-violet-400 transition-colors !focus:ring-0 !ring-0"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('register.email')}
            />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaUser className="text-violet-600 text-lg flex-shrink-0" />
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-violet-400 hover:border-violet-400 transition-colors !focus:ring-0 !ring-0"
                value={ime}
                onChange={e => setIme(e.target.value)}
                placeholder={t('register.name')}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaUser className="text-violet-600 text-lg flex-shrink-0" />
              <input
                id="surname"
                name="surname"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-violet-400 hover:border-violet-400 transition-colors !focus:ring-0 !ring-0"
                value={prezime}
                onChange={e => setPrezime(e.target.value)}
                placeholder={t('register.surname')}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
            <FaPhone className="text-violet-600 text-lg flex-shrink-0" />
          <input
            type="text"
              placeholder={t('register.phone')}
              className="flex-1 outline-none bg-transparent text-base focus:ring-0"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
          />
        </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaGlobe className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('register.country')}
                className="flex-1 outline-none bg-transparent text-base focus:ring-0"
                value={drzava}
                onChange={e => setDrzava(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaCity className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('register.city')}
                className="flex-1 outline-none bg-transparent text-base focus:ring-0"
                value={grad}
                onChange={e => setGrad(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaHashtag className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="number"
                placeholder={t('register.postal_code')}
                className="flex-1 outline-none bg-transparent text-base focus:ring-0"
                value={postanskiBroj}
                onChange={e => setPostanskiBroj(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
              <FaMapMarkerAlt className="text-violet-600 text-lg flex-shrink-0" />
              <input
                type="text"
                placeholder={t('register.address')}
                className="flex-1 outline-none bg-transparent text-base focus:ring-0"
                value={adresa}
                onChange={e => setAdresa(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 border border-gray-300 p-3 rounded-lg hover:border-violet-400 transition-colors">
            <FaLock className="text-violet-600 text-lg flex-shrink-0" />
          <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-violet-400 hover:border-violet-400 transition-colors !focus:ring-0 !ring-0"
              value={lozinka}
              onChange={e => setLozinka(e.target.value)}
              placeholder={t('register.password')}
            />
        </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-violet-700 transition-colors text-base font-medium">
          <FaUserPlus />
            {t('register.register')}
        </button>
      </form>

        {/* Login link */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-gray-600 text-sm">
            {t('register.have_account')}{' '}
            <button
              onClick={() => router.push('/auth/prijava')}
              className="text-violet-600 hover:text-violet-800 font-medium underline transition-colors"
            >
              {t('login.login')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}