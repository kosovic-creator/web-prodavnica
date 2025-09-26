'use client';
import { useState, useEffect } from 'react';
import { Porudzbina } from '@/types';
import { useTranslation } from 'react-i18next';
import '@/i18n/config';

export default function AdminPorudzbinePage() {
  const { t } = useTranslation('porudzbine');
  const [porudzbine, setPorudzbine] = useState<Porudzbina[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [form, setForm] = useState({ korisnikId: '', ukupno: 0, status: '', email: '', idPlacanja: '' });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/porudzbine?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine);
        setTotal(data.total);
      });
  }, [page, pageSize]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editId) {
      await fetch('/api/porudzbine', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form })
      });
      setEditId(null);
    } else {
      await fetch('/api/porudzbine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    }
    setForm({ korisnikId: '', ukupno: 0, status: '', email: '', idPlacanja: '' });
    fetch(`/api/porudzbine?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine);
        setTotal(data.total);
      });
  };

  const handleEdit = (p: Porudzbina) => {
    setForm({ korisnikId: p.korisnikId, ukupno: p.ukupno, status: p.status, email: p.email || '', idPlacanja: p.idPlacanja || '' });
    setEditId(p.id);
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/porudzbine', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetch(`/api/porudzbine?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(data => {
        setPorudzbine(data.porudzbine);
        setTotal(data.total);
      });
  };

  return (
    <div className="admin-container">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2 max-w-md">
          <input type="text" placeholder={t('korisnikId')} value={form.korisnikId} onChange={e => setForm(f => ({ ...f, korisnikId: e.target.value }))} required className="border p-2 rounded" />
          <input type="number" placeholder={t('ukupno')} value={form.ukupno} onChange={e => setForm(f => ({ ...f, ukupno: Number(e.target.value) }))} required className="border p-2 rounded" />
          <input type="text" placeholder={t('status')} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} required className="border p-2 rounded" />
          <input type="email" placeholder={t('email')} value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="border p-2 rounded" />
          <input type="text" placeholder={t('idPlacanja')} value={form.idPlacanja} onChange={e => setForm(f => ({ ...f, idPlacanja: e.target.value }))} className="border p-2 rounded" />
          <button type="submit" className="btn">{editId ? t('spremi') : t('dodaj')}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ korisnikId: '', ukupno: 0, status: '', email: '', idPlacanja: '' }); }} className="btn">{t('odustani')}</button>}
        </form>
        <table className="w-full border mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">ID</th>
              <th className="p-2">{t('korisnikId')}</th>
              <th className="p-2">{t('status')}</th>
              <th className="p-2">{t('ukupno')}</th>
              <th className="p-2">{t('date')}</th>
              <th className="p-2">{t('akcije')}</th>
            </tr>
          </thead>
          <tbody>
            {porudzbine.map((p: Porudzbina) => (
              <tr key={p.id}>
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.korisnikId}</td>
                <td className="p-2">{p.status}</td>
                <td className="p-2">{p.ukupno} €</td>
                <td className="p-2">{new Date(p.kreiran).toLocaleDateString()}</td>
                <td className="p-2">
                  <button className="btn mr-2" onClick={() => handleEdit(p)}>{t('uredi')}</button>
                  <button className="btn" onClick={() => handleDelete(p.id)}>{t('obrisi')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-2">
          <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('prethodna')}</button>
          <span>{t('stranica')} {page}</span>
          <button className="btn" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>{t('sljedeća')}</button>
        </div>
      </div>
    </div>
  );
}
