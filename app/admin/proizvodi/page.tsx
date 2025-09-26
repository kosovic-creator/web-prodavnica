'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Proizvod } from '@/types';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';
import { FaCartPlus } from "react-icons/fa";

export default function AdminProizvodiPage() {
  const { t } = useTranslation('proizvodi');
  const [proizvodi, setProizvodi] = useState<Proizvod[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [form, setForm] = useState({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 });
  const [editId, setEditId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetch(`/api/proizvodi?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi);
        setTotal(data.total);
      });
  }, [page, pageSize]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let res;
    if (editId) {
      res = await fetch('/api/proizvodi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Greška: ' + (err.error || 'Neuspješan update'));
      }
      setEditId(null);
    } else {
      const formData = new FormData();
      formData.append('naziv', form.naziv);
      formData.append('cena', String(form.cena));
      formData.append('opis', form.opis);
      formData.append('karakteristike', form.karakteristike);
      formData.append('kategorija', form.kategorija);
      formData.append('kolicina', String(form.kolicina));
      if (file) formData.append('slika', file);

      res = await fetch('/api/proizvodi', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Greška: ' + (err.error || 'Neuspješan unos'));
      }
    }
    setForm({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 });
    setFile(null);
    fetch(`/api/proizvodi?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi);
        setTotal(data.total);
      });
  };

  const handleEdit = (p: Proizvod) => {
    setForm({ naziv: p.naziv, cena: p.cena, slika: p.slika || '', opis: p.opis || '', karakteristike: p.karakteristike || '', kategorija: p.kategorija || '', kolicina: p.kolicina });
    setEditId(p.id);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch('/api/proizvodi', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Greška: ' + (err.error || 'Neuspješno brisanje'));
    }
    fetch(`/api/proizvodi?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setProizvodi(data.proizvodi);
        setTotal(data.total);
      });
  };

  const handleDodajUKorpu = async (proizvod: Proizvod) => {
    // Ovdje dodaj logiku za dodavanje u korpu
    // npr. korisnikId možeš uzeti iz localStorage/session
    const korisnikId = localStorage.getItem('korisnikId') || '';
    if (!korisnikId) {
      alert('Morate biti prijavljeni za dodavanje u korpu!');
      return;
    }
    await fetch('/api/korpa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ korisnikId, proizvodId: proizvod.id, kolicina: 1 })
    });
    // Po želji: update broja stavki u korpi
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 max-w-md">
        <input type="text" placeholder={t('naziv')} value={form.naziv} onChange={e => setForm(f => ({ ...f, naziv: e.target.value }))} required className="border p-2 rounded" />
        <input type="number" placeholder={t('cena')} value={form.cena} onChange={e => setForm(f => ({ ...f, cena: Number(e.target.value) }))} required className="border p-2 rounded" />
        <input type="text" placeholder={t('slika')} value={form.slika} onChange={e => setForm(f => ({ ...f, slika: e.target.value }))} className="border p-2 rounded" />
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="border p-2 rounded" />
        <input type="text" placeholder={t('opis')} value={form.opis} onChange={e => setForm(f => ({ ...f, opis: e.target.value }))} className="border p-2 rounded" />
        <input type="text" placeholder={t('karakteristike') || 'Karakteristike'} value={form.karakteristike} onChange={e => setForm(f => ({ ...f, karakteristike: e.target.value }))} className="border p-2 rounded" />
        <input type="text" placeholder={t('kategorija') || 'Kategorija'} value={form.kategorija} onChange={e => setForm(f => ({ ...f, kategorija: e.target.value }))} required className="border p-2 rounded" />
        <input type="number" placeholder={t('kolicina')} value={form.kolicina} onChange={e => setForm(f => ({ ...f, kolicina: Number(e.target.value) }))} required className="border p-2 rounded" />
        <button type="submit" className="btn">{editId ? t('spremi') : t('dodaj')}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ naziv: '', cena: 0, slika: '', opis: '', karakteristike: '', kategorija: '', kolicina: 1 }); setFile(null); }} className="btn">{t('odustani')}</button>}
      </form>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">{t('naziv')}</th>
            <th className="p-2">{t('cena')}</th>
            <th className="p-2">{t('slika')}</th>
            <th className="p-2">{t('opis')}</th>
            <th className="p-2">{t('karakteristike') }</th>
            <th className="p-2">{t('kategorija')}</th>
            <th className="p-2">{t('kolicina')}</th>
            <th className="p-2">{t('akcije')}</th>
          </tr>
        </thead>
        <tbody>
          {proizvodi.map((p: Proizvod) => (
            <tr key={p.id}>
              <td className="p-2">{p.naziv}</td>
              <td className="p-2">{p.cena}</td>
              <td className="p-2">{p.slika ? <Image src={p.slika} alt={p.naziv} width={48} height={48} className="object-cover" /> : '-'}</td>
              <td className="p-2">{p.opis}</td>
              <td className="p-2">{p.karakteristike}</td>
              <td className="p-2">{p.kategorija}</td>
              <td className="p-2">{p.kolicina}</td>
              <td className="p-2">
                <button className="btn mr-2" onClick={() => handleEdit(p)}>{t('uredi')}</button>
                <button className="btn" onClick={() => handleDelete(p.id)}>{t('obrisi')}</button>
                <button className="btn flex items-center gap-1" onClick={() => handleDodajUKorpu(p)}>
                  <FaCartPlus />
                  {t('dodaj_u_korpu')}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Paginacija prikaz samo ako ima više od 10 stavki */}
      {total > 10 && (
        <div className="flex justify-center items-center gap-2">
          <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('prethodna')}</button>
          <span>{t('stranica')} {page}</span>
        </div>
      )}
    </div>
  );
}
