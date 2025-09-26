'use client'

import { useState } from "react";
import { z } from "zod";
import '@/i18n/config';
import { useTranslation } from 'react-i18next';
import { FaUserPlus, FaEnvelope, FaLock, FaUser, FaPhone, FaGlobe, FaCity, FaMapMarkerAlt, FaHashtag } from "react-icons/fa";
import '@/i18n/config';

export default function RegistracijaPage() {
  const { t } = useTranslation('register');
  const [email, setEmail] = useState("");
  const [lozinka, setLozinka] = useState("");
  const [ime, setIme] = useState("");
  const [prezime, setPrezime] = useState("");
  const [telefon, setTelefon] = useState("");
  const [drzava, setDrzava] = useState("");
  const [grad, setGrad] = useState("");
  const [postanskiBroj, setPostanskiBroj] = useState("");
  const [adresa, setAdresa] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
    setError("");
    // Validacija na frontendu
    const result = schema.safeParse({ email, lozinka, ime, prezime, telefon });
    if (!result.success) {
      // Prikaz prve greške
      setError(result.error.issues[0].message);
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
        setError(data.error || t('greska_registracija'));
      } else {
        setSuccess(true);
      }
    } catch {
      setError(t('error_occurred'));
    }
  };

  if (success) {
    return (
      <div className="p-4 max-w-md mx-auto text-center">
        <h2 className="text-xl font-bold mb-4 text-green-600">{t('register_success')}</h2>
        <p className="mb-4">{t('check_email')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaUserPlus className="text-violet-600" />
        {t('title')}
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaEnvelope className="text-violet-600" />
          <input
            type="email"
            placeholder={t('email')}
            className="flex-1 outline-none bg-transparent"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaUser className="text-violet-600" />
          <input
            type="text"
            placeholder={t('name') || "Ime"}
            className="flex-1 outline-none bg-transparent"
            value={ime}
            onChange={e => setIme(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaUser className="text-violet-600" />
          <input
            type="text"
            placeholder={t('surname') || "Prezime"}
            className="flex-1 outline-none bg-transparent"
            value={prezime}
            onChange={e => setPrezime(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaPhone className="text-violet-600" />
          <input
            type="text"
            placeholder={t('phone') || "Telefon"}
            className="flex-1 outline-none bg-transparent"
            value={telefon}
            onChange={e => setTelefon(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaGlobe className="text-violet-600" />
          <input
            type="text"
            placeholder={t('country') || "Država"}
            className="flex-1 outline-none bg-transparent"
            value={drzava}
            onChange={e => setDrzava(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaCity className="text-violet-600" />
          <input
            type="text"
            placeholder={t('city') || "Grad"}
            className="flex-1 outline-none bg-transparent"
            value={grad}
            onChange={e => setGrad(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaHashtag className="text-violet-600" />
          <input
            type="number"
            placeholder={t('postal_code') || "Poštanski broj"}
            className="flex-1 outline-none bg-transparent"
            value={postanskiBroj}
            onChange={e => setPostanskiBroj(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaMapMarkerAlt className="text-violet-600" />
          <input
            type="text"
            placeholder={t('address') || "Adresa"}
            className="flex-1 outline-none bg-transparent"
            value={adresa}
            onChange={e => setAdresa(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 border p-2 rounded">
          <FaLock className="text-violet-600" />
          <input
            type="password"
            placeholder={t('password')}
            className="flex-1 outline-none bg-transparent"
            value={lozinka}
            onChange={e => setLozinka(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition">
          <FaUserPlus />
          {t('register')}
        </button>
      </form>
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}