'use client';
import { useSession } from 'next-auth/react';
import Image from "next/image";
import { useTranslation } from 'react-i18next';
import { FaUser } from "react-icons/fa";
import '@/i18n/config';
import { useState, useEffect } from 'react';

export default function ProfilPage() {
  const { t } = useTranslation('profil');
  const { data: session, status } = useSession();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    drzava: '',
    grad: '',
    postanskiBroj: '',
    adresa: '',
    uloga: 'korisnik',
    slika: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetch(`/api/korisnici/${session.user.id}`)
        .then(res => res.json())
        .then(data => {
          setForm({
            ime: data.ime || '',
            prezime: data.prezime || '',
            email: data.email || '',
            telefon: data.telefon || '',
            drzava: data.drzava || '',
            grad: data.grad || '',
            postanskiBroj: data.postanskiBroj?.toString() || '',
            adresa: data.adresa || '',
            uloga: data.uloga || 'korisnik',
            slika: data.slika || '',
          });
          setUserLoaded(true);
        })
        .catch(() => setUserLoaded(true));
    }
  }, [session?.user?.id]);

  if (status === "loading" || !userLoaded) {
    return (
      <div className="flex flex-col items-center gap-2 text-gray-500 mt-8">
        <FaUser className="animate-pulse" />
        <span>{t('loading')}</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center gap-2 text-red-600 mt-8">
        <div className="flex items-center gap-2">
          <FaUser />
          <span>{t('must_login')}</span>
        </div>
        <a href="/auth/prijava" className="text-blue-600 underline mt-2">Prijavi se</a>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/korisnici', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('greska_pri_cuvanju'));
      } else {
        setSuccess(t('korisnik_izmjenjen'));
        setEditMode(false);
      }
    } catch {
      setError(t('greska_pri_cuvanju'));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm(t('potvrdi_obrisi'))) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/korisnici', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.user.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t('greska_pri_cuvanju'));
      } else {
        setSuccess(t('korisnik_obrisan'));
        window.location.href = '/';
      }
    } catch {
      setError(t('greska_pri_cuvanju'));
    }
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FaUser className="text-violet-600" />
        {t('title')}
      </h1>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {editMode ? (
        <form onSubmit={handleUpdate} className="flex flex-col gap-2">
          <input name="ime" value={form.ime} onChange={handleChange} placeholder={t('name')} className="border p-2 rounded" />
          <input name="prezime" value={form.prezime} onChange={handleChange} placeholder={t('surname')} className="border p-2 rounded" />
          <input name="email" value={form.email} onChange={handleChange} placeholder={t('email')} className="border p-2 rounded" />
          <input name="telefon" value={form.telefon} onChange={handleChange} placeholder={t('phone')} className="border p-2 rounded" />
          <input name="drzava" value={form.drzava} onChange={handleChange} placeholder={t('country')} className="border p-2 rounded" />
          <input name="grad" value={form.grad} onChange={handleChange} placeholder={t('city')} className="border p-2 rounded" />
          <input name="postanskiBroj" value={form.postanskiBroj} onChange={handleChange} placeholder={t('postal_code')} className="border p-2 rounded" />
          <input name="adresa" value={form.adresa} onChange={handleChange} placeholder={t('address')} className="border p-2 rounded" />
          <input name="slika" value={form.slika} onChange={handleChange} placeholder={t('profile_image')} className="border p-2 rounded" />
          <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition" disabled={loading}>{t('sacuvaj_izmjene')}</button>
          <button type="button" className="bg-gray-300 px-4 py-2 rounded mt-2" onClick={() => setEditMode(false)}>{t('odkazivanje')}</button>
        </form>
      ) : (
          <div className="flex flex-col gap-2">
            <p><span className="font-semibold">{t('email')}:</span> {form.email}</p>
            <p><span className="font-semibold">{t('name')}:</span> {form.ime}</p>
            <p><span className="font-semibold">{t('surname')}:</span> {form.prezime}</p>
            <p><span className="font-semibold">{t('phone')}:</span> {form.telefon}</p>
            <p><span className="font-semibold">{t('country')}:</span> {form.drzava}</p>
            <p><span className="font-semibold">{t('city')}:</span> {form.grad}</p>
            <p><span className="font-semibold">{t('postal_code')}:</span> {form.postanskiBroj}</p>
            <p><span className="font-semibold">{t('address')}:</span> {form.adresa}</p>
            <p><span className="font-semibold">{t('role')}:</span> {form.uloga}</p>
            {form.slika && (
              <Image src={form.slika} alt={t('profile_image') || "Profil"} width={100} height={100} className="rounded-full mt-2" />
            )}
            <button className="bg-violet-600 text-white px-4 py-2 rounded shadow hover:bg-violet-700 transition mt-4" onClick={() => setEditMode(true)}>{t('izmjeni_profil')}</button>
            <button className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition mt-2" onClick={handleDelete}>{t('obrisi_korisnika')}</button>
          </div>
      )}
    </div>
  );
}