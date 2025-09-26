'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import Image from 'next/image';
import { Korisnik } from '@/types';
import { Porudzbina } from '@/types';
import { Proizvod } from '@/types';
import { z } from 'zod';
import { useRouter } from 'next/navigation';


// Zod šeme
const korisnikSchema = (t: (key: string) => string) => z.object({
  ime: z.string().min(2, { message: t('ime_error') }),
  prezime: z.string().min(2, { message: t('prezime_error') }),
  email: z.string().email({ message: t('email_error') }),
  telefon: z.string().min(5, { message: t('telefon_error') }).max(15).regex(/^\+?[0-9\s]*$/, { message: t('telefon_error') }).optional(),
  drzava: z.string().min(2, { message: t('drzava_error') }),
  grad: z.string().min(2, { message: t('grad_error') }).optional(),
  postanskiBroj: z.string().min(2, { message: t('postanskiBroj_error') }).optional(),
  adresa: z.string().min(2, { message: t('adresa_error') }).optional(),
  uloga: z.enum(['korisnik', 'admin'], { message: t('uloga_error') }),
  lozinka: z.string().min(6, { message: t('lozinka_error') }),
});

const proizvodSchema = (t: (key: string) => string) => z.object({
  naziv: z.string().min(2, { message: t('naziv_error') }),
  cena: z.number().min(0, { message: t('cena_error') }),
  slika: z.string().optional(),
  opis: z.string().optional(),
  karakteristike: z.string().optional(),
  kategorija: z.string().optional(),
  kolicina: z.number().min(1, { message: t('kolicina_error') }),
});


export default function AdminHome() {
  const router = useRouter();
  const { t } = useTranslation(['korisnici', 'proizvodi', 'porudzbine']);
  const [tab, setTab] = useState<'korisnici' | 'proizvodi' | 'porudzbine'>('korisnici');
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
  const [editPorudzbinaId, setEditPorudzbinaId] = useState<string | null>(null);
  const [proizvodForm, setProizvodForm] = useState({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 });
  const [proizvodi, setProizvodi] = React.useState<Proizvod[]>([]);
  const [korisnici, setKorisnici] = useState<Korisnik[]>([]);
  const [korisnikForm, setKorisnikForm] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    drzava: '',
    grad: '',
    postanskiBroj: '',
    adresa: '',
    uloga: 'korisnik',
    lozinka: ''
  });
  const [editKorisnikId, setEditKorisnikId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  }, []);

  useEffect(() => {
    fetch('/api/porudzbine?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine || []);
      });
  }, []);

  useEffect(() => {
    fetch('/api/proizvodi?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi || []);
      });
  }, []);



  const handleProizvodSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parse = proizvodSchema((key) => t(key, { ns: 'proizvodi' })).safeParse(proizvodForm);
    if (!parse.success) {
      const fieldErrors: { [key: string]: string } = {};
      parse.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    let slikaUrl = '';
    if (file) {
      const formDataSlika = new FormData();
      formDataSlika.append('slika', file);
      formDataSlika.append('id', proizvodForm.naziv); // ili drugi jedinstveni id

      const resSlika = await fetch('/api/proizvodi/slika', {
        method: 'POST',
        body: formDataSlika,
      });
      const dataSlika = await resSlika.json();
      slikaUrl = dataSlika.slika || '';
    }

    const formData = {
      naziv: proizvodForm.naziv,
      cena: proizvodForm.cena,
      opis: proizvodForm.opis,
      karakteristike: proizvodForm.karakteristike,
      kategorija: proizvodForm.kategorija,
      kolicina: proizvodForm.kolicina,
      slika: slikaUrl,
    };

    await fetch('/api/proizvodi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setProizvodForm({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 });
    setFile(null);

    fetch('/api/proizvodi?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi);
      });
  };

  const handleProizvodEdit = async (id: string) => {
    // Primer: otvori formu za edit, ili direktno izmeni
    // Ovde možeš dodati logiku za editovanje proizvoda
    // npr. setProizvodForm sa podacima proizvoda za edit
    const proizvod = proizvodi.find(p => p.id === id);
    if (proizvod) {
      setProizvodForm({
        naziv: proizvod.naziv,
        cena: proizvod.cena || 0,
        slika: proizvod.slika || '',
        opis: proizvod.opis || '',
        karakteristike: proizvod.karakteristike || '',
        kategorija: proizvod.kategorija || '',
        kolicina: proizvod.kolicina,
      });
      setEditPorudzbinaId(id);
    }
  };

  const handleProizvodUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editPorudzbinaId) return;

    let slikaUrl = proizvodForm.slika || '';
    if (file) {
      const formDataSlika = new FormData();
      formDataSlika.append('slika', file);
      formDataSlika.append('id', proizvodForm.naziv); // ili drugi jedinstveni id

      const resSlika = await fetch('/api/proizvodi/slika', {
        method: 'PUT',
        body: formDataSlika,
      });
      const dataSlika = await resSlika.json();
      slikaUrl = dataSlika.slika || '';
    }

    const formData = {
      id: editPorudzbinaId,
      naziv: proizvodForm.naziv,
      cena: proizvodForm.cena,
      opis: proizvodForm.opis,
      karakteristike: proizvodForm.karakteristike,
      kategorija: proizvodForm.kategorija,
      kolicina: proizvodForm.kolicina,
      slika: slikaUrl,
    };

    await fetch('/api/proizvodi', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setProizvodForm({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 });
    setFile(null);
    setEditPorudzbinaId(null);

    fetch('/api/proizvodi?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setProizvodi(data.proizvodi || []));
  };

  interface HandleProizvodDeleteParams {
    id: string;
  }

  const handleProizvodDelete = async (id: HandleProizvodDeleteParams['id']): Promise<void> => {
    await fetch('/api/proizvodi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    // Ponovo učitaj proizvode
    fetch('/api/proizvodi?page=1&pageSize=10')
      .then((res: Response) => res.json())
      .then((data: { proizvodi: Proizvod[] }) => setProizvodi(data.proizvodi || []));
  };

  // Dodavanje korisnika
  const handleKorisnikSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const parse = korisnikSchema((key) => t(key, { ns: 'korisnici' })).safeParse(korisnikForm);
    if (!parse.success) {
      // Mapiraj greške po polju
      const fieldErrors: { [key: string]: string } = {};
      parse.error.issues.forEach(issue => {
        if (issue.path[0]) fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    await fetch('/api/korisnici', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(korisnikForm),
    });
    setKorisnikForm({ ime: '', prezime: '', email: '', telefon: '', drzava: '', grad: '', postanskiBroj: '', adresa: '', uloga: 'korisnik', lozinka: '' });
    // Ponovo učitaj korisnike
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  };

  // Edit korisnika
  const handleKorisnikEdit = (k: Korisnik) => {
    setKorisnikForm({ ime: k.ime ?? '', prezime: k.prezime ?? '', email: k.email ?? '', telefon: k.telefon ?? '', drzava: k.drzava ?? '', grad: k.grad ?? '', postanskiBroj: k.postanskiBroj !== undefined && k.postanskiBroj !== null ? String(k.postanskiBroj) : '', adresa: k.adresa ?? '', uloga: k.uloga ?? '', lozinka: '' });
    setEditKorisnikId(k.id);
  };

  // Update korisnika
  const handleKorisnikUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editKorisnikId) return;
    const res = await fetch('/api/korisnici', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editKorisnikId, ...korisnikForm }),
    });
    const result = await res.json();
    if (!res.ok) {
      alert(result.error || 'Greška!');
      return;
    }
    setKorisnikForm({ ime: '', prezime: '', email: '', telefon: '', drzava: '', grad: '', postanskiBroj: '', adresa: '', uloga: 'korisnik', lozinka: '' });
    setEditKorisnikId(null);
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  };

  // Delete korisnika
  const handleKorisnikDelete = async (id: string) => {
    await fetch('/api/korisnici', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    // Ponovo učitaj korisnike
    fetch('/api/korisnici?page=1&pageSize=10')
      .then(res => res.json())
      .then(data => setKorisnici(data.korisnici || []));
  };

  return (
    <div className="admin-container w-full max-w-screen-2xl mx-auto">
      <div className="px-2 bg-gray-50 min-h-screen w-full">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setTab('korisnici')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'korisnici'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('korisnici', { ns: 'korisnici' })}
          </button>
          <button
            onClick={() => setTab('proizvodi')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'proizvodi'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('proizvodi', { ns: 'proizvodi' })}
          </button>
          <button
            onClick={() => setTab('porudzbine')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm ${tab === 'porudzbine'
              ? 'bg-violet-600 text-white'
              : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
              }`}
          >
            {t('porudzbine', { ns: 'porudzbine' })}
          </button>
        </div>
        {tab === 'korisnici' && (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 w-full">
              <button
                onClick={() => router.push('/admin/korisnici/dodaj')}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg mb-4"
              >
                {t('dodaj_korisnika', { ns: 'korisnici' })}
              </button>

              <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="min-w-[600px] w-full border border-violet-200 rounded-lg  text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="px-8 py-3 text-left align-middle">{t('ime', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('prezime', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('email', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('telefon', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('drzava', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('grad', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('postanskiBroj', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('adresa', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('uloga', { ns: 'korisnici' })}</th>
                        <th className="px-8 py-3 text-left align-middle"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {korisnici.map((k) => (
                        <tr key={k.id} className="hover:bg-violet-50 transition">
                          <td className="px-8 py-3 text-left align-middle">{k.ime}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.prezime}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.email}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.telefon}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.drzava}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.grad}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.postanskiBroj}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.adresa}</td>
                          <td className="px-8 py-3 text-left align-middle">{k.uloga}</td>
                          <td className="px-8 py-3 text-left align-middle flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => router.push(`/admin/korisnici/${k.id}`)}
                              className="text-blue-600 hover:underline"
                            >
                              {t('izmjeni', { ns: 'korisnici' })}
                            </button>
                            <button
                              onClick={() => handleKorisnikDelete(k.id)}
                              className="text-red-600 hover:underline"
                            >
                              {t('obrisi', { ns: 'korisnici' })}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'proizvodi' && (
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8 w-full">
              <button
                onClick={() => router.push('/admin/proizvodi/dodaj')}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg mb-4"
              >
                {t('dodaj_artikal', { ns: 'proizvodi' })}
              </button>
              {/* Filterirani prikaz proizvoda u tabeli */}
              <div className="overflow-x-auto w-full">
                <div className="table-responsive">
                  <table className="w-full border border-violet-200 rounded-lg shadow-md text-sm">
                    <thead>
                      <tr className="bg-violet-100 text-violet-700">
                        <th className="px-8 py-3 text-left align-middle">{t('image')}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('product_name')}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('price')}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('karakteristike') || 'Karakteristike'}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('kategorija') || 'Kategorija'}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('quantity')}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('created')}</th>
                        <th className="px-8 py-3 text-left align-middle">{t('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proizvodi.filter(p => p.naziv.toLowerCase().includes(search?.toLowerCase() || ""))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-violet-50 transition">
                            <td className="px-8 py-3 text-left align-middle">{p.slika ? <Image src={p.slika} alt={p.naziv} width={48} height={48} className="object-cover rounded-lg" /> : '-'}</td>
                            <td className="px-8 py-3 text-left align-middle">{p.naziv}</td>
                            <td className="px-8 py-3 text-left align-middle">{p.cena} EUR</td>
                            <td className="px-8 py-3 text-left align-middle">{p.karakteristike}</td>
                            <td className="px-8 py-3 text-left align-middle">{p.kategorija}</td>
                            <td className="px-8 py-3 text-left align-middle">{p.kolicina}</td>
                            <td className="px-8 py-3 text-left align-middle">{p.kreiran ? new Date(p.kreiran).toLocaleDateString() : '-'}</td>
                            <td className="px-8 py-3 text-left align-middle flex gap-2">
                              <button className="text-blue-600 hover:underline" onClick={() => router.push(`/admin/proizvodi/${p.id}`)}>{t('edit')}</button>
                              <button className="text-red-600 hover:underline" onClick={() => handleProizvodDelete(p.id)}>{t('delete')}</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === 'porudzbine' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="font-semibold mb-6 text-xl text-violet-700">{t('order_list')}</h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-violet-200 rounded-lg shadow-md text-sm">
                <thead>
                  <tr className="bg-violet-100 text-violet-700">
                    <th className="px-8 py-3 text-left align-middle">{t('id')}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('user')}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('total')}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('status')}</th>
                    <th className="px-8 py-3 text-left align-middle">{t('created')}</th>
                  </tr>
                </thead>
                <tbody>
                  {porudzbine.map((p) => (
                    <tr key={p.id} className="hover:bg-violet-50 transition">
                      <td className="px-8 py-3 text-left align-middle">{p.id}</td>
                      <td className="px-8 py-3 text-left align-middle">{p.korisnikId}</td>
                      <td className="px-8 py-3 text-left align-middle">{p.ukupno} EUR</td>
                      <td className="px-8 py-3 text-left align-middle">{p.status}</td>
                      <td className="px-8 py-3 text-left align-middle">{new Date(p.kreiran).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
